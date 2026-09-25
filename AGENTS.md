# Spain trip project

- Read `CONTEXT.md` before planning or researching this trip. Keep confirmed facts separate from assumptions and update the file when the traveler confirms a change.
- Maintain all user-facing reports and trip-planning/content documents in Chinese. Instruction and rule documents, including `AGENTS.md`, may be written in English.
- Use the project-local skills in `.agents/skills/` for trip planning and hotel research. The project MCP servers are configured in `.codex/config.toml`; do not copy them or these skills into user-level/global configuration.
- Use connected travel services for this Spain trip only. Treat search results, rates, availability, and ticket listings as leads until confirmed on the supplier's official booking page.
- Do not create or cancel a reservation, start a payment, sign up for a service, submit external feedback, or enter personal data without the user's explicit request for that specific action. For a booking, cancellation, or payment, present the exact details and obtain explicit confirmation immediately before the action.
- Do not store passport details, payment data, passwords, API keys, or user keys in project files or conversation context. If an integration requires a secret or paid account, stop before authentication or credit-consuming use unless the user has specifically authorized that step and a secure method is available.

## Agent workflow

- At the start of project work, read this file, CONTEXT.md, README.md, and research/README.md. Then read only the category pages needed for the task.
- Check the canonical page and data file before adding information. Update the existing record instead of creating a duplicate.
- Before finishing, update README.md when a material finding or decision changes. Summarize changed paths, evidence limits, and unresolved follow-up in the handoff.
- Keep user-facing reports, research summaries, and trip content in Chinese. Rule and instruction files, including AGENTS.md, may be in English. Product names, source titles, URLs, and machine-readable field names may retain their original form.
- Keep CONTEXT.md limited to stable traveler facts, labeled assumptions, open decisions, and links. Do not put live prices or raw research results there.

## Parallel work isolation

- When multiple agents or tasks work in this project, use a separate Git worktree and branch for each concurrent task. Do not have agents edit the same checkout concurrently.
- Assign one owner per canonical file. Research tasks own their category records; map integration owns `research/city-maps/city-data.js`; only the integration owner updates root `README.md`, `CONTEXT.md`, and cross-category indexes after merging.
- Send file-level findings or patches to the integration owner instead of editing another task's worktree. Keep each change scoped and merge through Git so conflicts and rollback points are visible.

## Canonical document ownership

- README.md is the status dashboard and navigation index. Update its status rows when a material research finding or trip decision changes.
- CONTEXT.md is the canonical traveler brief: confirmed facts, assumptions, constraints, and open decisions.
- trip/ contains comparison criteria, candidate summaries, decision reasons, and the working itinerary. Link to evidence records by record_id; do not copy raw search histories into these pages.
- research/ contains source evidence, dated search snapshots, and inspiration logs. Append new observations to time-series data; do not overwrite an earlier price or availability observation.
- destinations/ contains concise, traveler-facing city guidance. Distinguish verified operating facts from suggestions and link to evidence; raw Xiaohongshu notes belong in research/xhs/.
- research/city-maps/ contains the map interface, viewer, official map assets, and its data contract. research/archive/ contains immutable dated snapshots; never treat an archive as current guidance.
- visualizations/ contains generated charts and reports. Each artifact must name its input records/data, generation date, filters, and any currency conversion.

## Research evidence and status

- Record a direct source URL, source name/type, and checked_at_hkt timestamp for each price, availability, schedule, policy, or other changeable claim. Use ISO 8601 with the Asia/Hong_Kong offset. Prefer official/operating-provider sources for rules and operating facts; label aggregators and social posts as leads.
- Never invent a missing source URL, timestamp, price component, baggage allowance, room condition, or verification result. For legacy observations whose source link or exact check time was not preserved, leave the field blank, set evidence_status to unverified, and explain the gap in notes.
- Give every structured observation a stable unique record_id and cite that ID from the relevant trip page. Append new observations; do not overwrite history or reuse IDs.
- Keep evidence verification separate from decision progress. Use evidence_status values unverified, source_checked, officially_verified, or expired; use decision_status values idea, candidate, selected, booked, or rejected. A verified option is not necessarily selected; a candidate is not necessarily verified.
- For flight and accommodation snapshots, follow the schemas in research/README.md and the CSV headers in research/flights/ and research/accommodation/. Keep original currency and exact search conditions. Do not compare unlike passenger counts, dates, baggage, room occupancy, or cancellation terms as equivalent.
- For flights, record at least 20 kg checked baggage per traveler for any qualifying option. Include taxes and mandatory fees in displayed totals, and explicitly record Beijing baggage-release evidence for hidden-city candidates.
- Preserve uncertainty and missing values; never convert unknown values to zero or infer a source claim that was not observed.

## Maps and visualization integrity

- Treat structured research data as the source for charts. Do not draw a fare trend from unlike queries or from a single observation; show the query conditions and date range.
- research/city-maps/city-data.js is the persistent source for map features and notes; city-atlas.html reads it as a viewer. Put permanent map changes in city-data.js, not only in GeoJSON temporarily imported through the page.
- Map features should cite research through stable `evidence[].record_id` references and retain source name/type/URL, check time, and evidence status when those values exist. The viewer presents supplied fields; it must not invent neighborhood recommendations, safety classifications, or research conclusions.
- research/city-maps/three-cities-orientation.kml is an empty city-folder template. The map page exports KML from its current data; do not treat the template as populated map data or as the canonical source.
- Do not hand-edit generated visualization outputs without also updating their source data and regeneration instructions.

## Local scope and external actions

- Keep skills, MCP configuration, research data, and generated files inside this project unless the user explicitly asks otherwise. Do not copy project integrations into user-level/global configuration.
- Connected travel services are for this Spain trip only. Searching and reversible local edits are allowed within scope; booking, cancellation, payment, signup, external messaging, or personal-data entry require explicit authorization for that action. For a booking, cancellation, or payment, show the exact details and obtain confirmation immediately before acting.
