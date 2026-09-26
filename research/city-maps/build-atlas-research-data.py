#!/usr/bin/env python3
"""Build the data layer consumed by the existing city-atlas viewer.

The viewer remains the presentation layer.  This script only turns the
canonical project sources into a browser-safe index so that the page can show
the complete Xiaohongshu reading set, the current plan, accommodation
comparisons, and dining notes without duplicating them by hand.
"""

from __future__ import annotations

import csv
import hashlib
import json
import re
from datetime import datetime
from pathlib import Path
from zoneinfo import ZoneInfo


ROOT = Path(__file__).resolve().parents[2]
OUT = Path(__file__).resolve().with_name("atlas-research-data.js")
XHS_DIR = ROOT / "research" / "xhs"
CITY_FILES = {
    "barcelona": "barcelona.md",
    "granada": "granada.md",
    "seville": "seville.md",
}
ALLOWED_HOTEL_SOURCES = {
    "Airbnb official listing",
    "Trip.com official",
    "Ctrip official",
}


def clean_markdown(value: str) -> str:
    value = re.sub(r"`([^`]*)`", r"\1", value or "")
    value = re.sub(r"\[([^]]+)\]\([^)]*\)", r"\1", value)
    return re.sub(r"\s+", " ", value).strip()


def slug_token(value: str) -> str:
    token = re.sub(r"[^a-zA-Z0-9]+", "-", value).strip("-").lower()
    return token or "item"


def stable_token(value: str) -> str:
    return hashlib.sha1(value.encode("utf-8")).hexdigest()[:10]


def parse_xhs_file(city_id: str, filename: str) -> list[dict]:
    text = (XHS_DIR / filename).read_text(encoding="utf-8")
    records: list[dict] = []
    chunks = re.split(r"^###\s+", text, flags=re.MULTILINE)[1:]
    field_pattern = re.compile(r"^-\s+\*\*(?P<key>[^*]+?)\*\*\s*(?P<value>.*)$")

    for chunk in chunks:
        lines = chunk.splitlines()
        if not lines:
            continue
        title = clean_markdown(re.sub(r"^\d+\.\s*", "", lines[0].strip()))
        fields: dict[str, str] = {}
        current_key = ""
        for raw_line in lines[1:]:
            line = raw_line.strip()
            match = field_pattern.match(line)
            if match:
                current_key = match.group("key").strip().rstrip("：:")
                fields[current_key] = clean_markdown(match.group("value"))
            elif current_key and line:
                fields[current_key] = clean_markdown(fields[current_key] + " " + line)

        record_id = fields.get("record_id", "")
        if not record_id:
            continue
        source_match = re.search(r"https?://www\.xiaohongshu\.com/[^)\s]+", chunk)
        source_url = source_match.group(0) if source_match else ""
        author_date = fields.get("作者/笔记显示日期", fields.get("作者", ""))
        author = author_date.split("；", 1)[0].strip() if author_date else ""
        note_date = author_date.split("；", 1)[1].strip() if "；" in author_date else ""
        category = fields.get("主分类", "未分类")
        tags = [tag.strip() for tag in re.split(r"[、，,/]", fields.get("标签", "")) if tag.strip()]
        review_notes = []
        for key in ("出发前复核", "待核实", "冲突与待核实", "部分已核实", "保留线索"):
            if fields.get(key):
                review_notes.append(f"{key}：{fields[key]}")
        records.append(
            {
                "record_id": record_id,
                "cityId": city_id,
                "title": title,
                "category": category,
                "tags": tags,
                "author": author,
                "noteDate": note_date,
                "readStatus": fields.get("阅读状态", ""),
                "readDate": fields.get("阅读日期", ""),
                "sourceUrl": source_url,
                "recordUrl": f"../xhs/{filename}",
                "summary": fields.get("内容摘要", ""),
                "takeaway": fields.get("可借鉴", ""),
                "review": "\n".join(review_notes),
                "isWinter": "-winter-" in record_id,
                "evidenceStatus": "source_checked",
                "displayStatus": "research_only",
                "rawFields": fields,
            }
        )
    return records


def city_id_from_name(value: str) -> str:
    value = (value or "").lower()
    if "barcelona" in value or "巴塞罗那" in value:
        return "barcelona"
    if "granada" in value or "格拉纳达" in value:
        return "granada"
    if "seville" in value or "sevilla" in value or "塞维利亚" in value:
        return "seville"
    return ""


def parse_lodging(checked_at: str) -> list[dict]:
    rows = []
    with (ROOT / "research" / "accommodation" / "rate-snapshots.csv").open(
        encoding="utf-8", newline=""
    ) as handle:
        for raw in csv.DictReader(handle):
            try:
                nights = int(raw.get("nights") or 0)
            except ValueError:
                nights = 0
            try:
                total = float(raw.get("total_price") or "")
            except ValueError:
                total = None
            per_night = round(total / nights, 2) if total is not None and nights else None
            source = raw.get("source_name", "")
            if source not in ALLOWED_HOTEL_SOURCES:
                budget_status = "out_of_scope_source"
            elif not raw.get("total_price"):
                budget_status = "price_missing"
            elif raw.get("free_cancellation", "").lower() != "yes":
                budget_status = "no_free_cancellation"
            elif per_night is not None and per_night > 1500:
                budget_status = "over_cap"
            elif raw.get("tax_status") != "included":
                budget_status = "tax_not_included_or_unknown"
            else:
                budget_status = "within_cap"
            platform = "Airbnb" if source.startswith("Airbnb") else ("携程" if source.startswith("Ctrip") else "Trip.com")
            rows.append(
                {
                    "record_id": raw.get("record_id", ""),
                    "cityId": city_id_from_name(raw.get("destination", "")),
                    "platform": platform,
                    "sourceName": source,
                    "sourceType": raw.get("source_type", ""),
                    "sourceUrl": raw.get("source_url", ""),
                    "propertyName": raw.get("property_name", ""),
                    "checkIn": raw.get("check_in_date", ""),
                    "nights": nights,
                    "guestCount": raw.get("guest_count", ""),
                    "roomType": raw.get("room_type", ""),
                    "beds": raw.get("beds", ""),
                    "freeCancellation": raw.get("free_cancellation", ""),
                    "cancellationDeadline": raw.get("cancellation_deadline_local", ""),
                    "totalPrice": total,
                    "currency": raw.get("currency", ""),
                    "perNight": per_night,
                    "taxStatus": raw.get("tax_status", ""),
                    "rateConditions": raw.get("rate_conditions", ""),
                    "evidenceStatus": raw.get("evidence_status", ""),
                    "decisionStatus": raw.get("decision_status", ""),
                    "notes": raw.get("notes", ""),
                    "budgetStatus": budget_status,
                    "checkedAt": raw.get("checked_at_hkt", checked_at),
                }
            )
    return rows


def parse_dining() -> list[dict]:
    text = (ROOT / "trip" / "dining.md").read_text(encoding="utf-8")
    sections = re.split(r"^##\s+", text, flags=re.MULTILINE)[1:]
    result = []
    for section in sections:
        lines = section.splitlines()
        if not lines:
            continue
        title = clean_markdown(lines[0])
        body = [clean_markdown(line[2:] if line.startswith("- ") else line) for line in lines[1:] if line.strip()]
        city_id = city_id_from_name(title)
        result.append({"id": slug_token(title), "cityId": city_id or "all", "title": title, "lines": body})
    return result


def evidence(record_id: str, checked_at: str) -> list[dict]:
    return [
        {
            "record_id": record_id,
            "record_url": "../../plan.geo.json",
            "source_name": "plan.geo.json",
            "source_type": "project_plan_snapshot",
            "source_url": "../../plan.geo.json",
            "checked_at_hkt": checked_at,
            "evidence_status": "source_checked",
        }
    ]


def plan_map_features(plan: dict, checked_at: str) -> dict[str, list[dict]]:
    city_features: dict[str, list[dict]] = {"barcelona": [], "granada": [], "seville": []}
    name_zh = {
        "Madrid airport transit": "马德里机场（仅转机）",
        "Seville base": "塞维利亚住宿基点",
        "Real Alcázar": "塞维利亚王宫",
        "Cathedral and Giralda": "塞维利亚主教座堂与吉拉尔达塔",
        "Santa Cruz": "Santa Cruz 圣克鲁斯街区",
        "Plaza de España": "西班牙广场",
        "Arenal": "Arenal 河岸区",
        "Triana Bridge": "Triana 伊莎贝尔二世桥",
        "Seville departure": "塞维利亚 Santa Justa 车站",
        "Granada base": "格拉纳达住宿基点",
        "Granada Cathedral": "格拉纳达主教座堂",
        "Alhambra": "阿尔罕布拉宫",
        "Nasrid Palaces": "纳塞瑞斯宫",
        "Granada departure": "格拉纳达火车站",
        "Barcelona base · Htop BCN City": "巴塞罗那住宿基点 · Htop BCN City",
        "Gothic Quarter": "哥特区",
        "Sagrada Família": "圣家堂",
        "Sant Pau": "圣保罗医院现代主义建筑群",
        "Casa Batlló": "巴特罗之家",
        "La Pedrera": "米拉之家（La Pedrera）",
        "Passeig de Gràcia": "格拉西亚大道",
        "Barcelona airport or Madrid airport node": "返程机场节点",
    }
    attraction_names = {
        "Real Alcázar",
        "Cathedral and Giralda",
        "Santa Cruz",
        "Plaza de España",
        "Arenal",
        "Triana Bridge",
        "Granada Cathedral",
        "Alhambra",
        "Nasrid Palaces",
        "Gothic Quarter",
        "Sagrada Família",
        "Sant Pau",
        "Casa Batlló",
        "La Pedrera",
        "Passeig de Gràcia",
    }
    for day in plan.get("days", []):
        stops = [stop for stop in day.get("stops", []) if stop.get("lat") is not None and stop.get("lon") is not None]
        resolved = []
        for index, stop in enumerate(stops):
            stop_text = " ".join([stop.get("name", ""), stop.get("query", "")])
            city_id = city_id_from_name(stop_text)
            # Madrid is an airport/connection-only node for this plan.  Do not
            # attach it to Seville or Barcelona merely because the day label
            # contains the next destination; the legs panel is the source for
            # that transfer detail.
            if not city_id and "madrid" in stop_text.lower():
                continue
            if not city_id:
                city_id = city_id_from_name(day.get("city", ""))
            if not city_id:
                continue
            original_name = stop.get("name", "未命名点位")
            mode = stop.get("mode", "sight")
            is_base = "base" in original_name.lower()
            layer = "stay" if is_base else ("sight" if original_name in attraction_names else ("transit" if mode in {"transit", "train"} else "sight"))
            record_id = f"plan-geo-{day.get('date', 'undated')}-{slug_token(original_name)}-{stable_token(day.get('date', '') + original_name)}"
            links = []
            if day.get("day_map"):
                links.append({"label": "当天路线导航", "url": day["day_map"]})
            feature = {
                "type": "Feature",
                "id": record_id,
                "geometry": {"type": "Point", "coordinates": [stop["lon"], stop["lat"]]},
                "properties": {
                    "cityId": city_id,
                    "layer": layer,
                    "nameZh": name_zh.get(original_name, original_name),
                    "nameLocal": stop.get("query", ""),
                    "description": f"{day.get('date', '')} · {day.get('label', '')}。{day.get('ribbon', '')}",
                    "display_status": "planned",
                    "display_scope": "itinerary_plan",
                    "status": "行程规划候选点位；营业、票价、库存和实际交通仍需按日期核验。",
                    "details": [
                        {"label": "当天", "value": day.get("date", "")},
                        {"label": "移动方式", "value": mode},
                        {"label": "雨天替代", "value": day.get("rain_alt", "")},
                    ],
                    "links": links,
                    "evidence": evidence(record_id, checked_at),
                },
            }
            city_features[city_id].append(feature)
            resolved.append((city_id, stop))

        route_cities = {city_id for city_id, _ in resolved}
        route_points = [stop for city_id, stop in resolved if city_id in route_cities and stop.get("lat") is not None and stop.get("lon") is not None]
        if len(route_points) >= 2 and len(route_cities) == 1:
            city_id = next(iter(route_cities))
            if len({(stop.get("lat"), stop.get("lon")) for stop in route_points}) >= 2:
                record_id = f"plan-geo-{day.get('date', 'undated')}-route-{stable_token(day.get('date', '') + day.get('label', ''))}"
                links = []
                if day.get("day_map"):
                    links.append({"label": "当天路线导航", "url": day["day_map"]})
                city_features[city_id].append(
                    {
                        "type": "Feature",
                        "id": record_id,
                        "geometry": {
                            "type": "LineString",
                            "coordinates": [[stop["lon"], stop["lat"]] for stop in route_points],
                        },
                        "properties": {
                            "cityId": city_id,
                            "layer": "route",
                            "nameZh": f"{day.get('date', '')} · {day.get('label', '')}",
                            "description": f"{day.get('ribbon', '')}。预计步行 {day.get('walking_km', {}).get('total', '—')} km；雨天方案：{day.get('rain_alt', '')}",
                            "display_status": "planned",
                            "display_scope": "itinerary_plan",
                            "status": "规划路线候选；作者经验和导航时长不替代当天导航。",
                            "links": links,
                            "evidence": evidence(record_id, checked_at),
                        },
                    }
                )
    return city_features


def main() -> None:
    checked_at = datetime.now(ZoneInfo("Asia/Hong_Kong")).isoformat(timespec="seconds")
    xhs_records = []
    for city_id, filename in CITY_FILES.items():
        xhs_records.extend(parse_xhs_file(city_id, filename))
    plan = json.loads((ROOT / "plan.geo.json").read_text(encoding="utf-8"))
    plan_view = {key: plan.get(key) for key in ("trip", "meta", "decisions", "legs", "days", "hotels", "budget", "checklist")}
    payload = {
        "schemaVersion": 1,
        "generatedAt": checked_at,
        "sourceFiles": [
            "../xhs/barcelona.md",
            "../xhs/granada.md",
            "../xhs/seville.md",
            "../accommodation/rate-snapshots.csv",
            "../../plan.geo.json",
            "../../trip/dining.md",
        ],
        "xhs": {
            "total": len(xhs_records),
            "records": xhs_records,
            "note": "小红书记录是已阅读的经验线索，不是官方事实；动态信息和安全结论仍需官方或运营方复核。",
        },
        "lodging": {
            "budgetCapPerNight": 1500,
            "allowedSources": sorted(ALLOWED_HOTEL_SOURCES),
            "records": parse_lodging(checked_at),
            "note": "酒店只保留 Trip.com/携程比价；Airbnb 记录为民宿/旅馆房源。TourMind 快照保留在原始 CSV，但不进入此推荐视图。",
        },
        "dining": parse_dining(),
        "plan": plan_view,
        "mapFeatures": plan_map_features(plan, checked_at),
    }
    encoded = json.dumps(payload, ensure_ascii=False, separators=(",", ":"))
    encoded = encoded.replace("</", "<\\/")
    OUT.write_text("/* Generated from canonical project research sources. Do not hand-edit. */\nwindow.CITY_ATLAS_RESEARCH = " + encoded + ";\n", encoding="utf-8")
    print(f"wrote {OUT} · XHS {len(xhs_records)} · lodging {len(payload['lodging']['records'])} · map features {sum(len(v) for v in payload['mapFeatures'].values())}")


if __name__ == "__main__":
    main()
