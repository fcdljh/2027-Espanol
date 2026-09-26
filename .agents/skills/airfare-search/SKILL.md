---
name: airfare-search
description: Search and compare current flight fares across airline, metasearch, and travel-agency sources. Use for flight price research; do not use to book or pay.
---

# Airfare Search

Help the user find and compare flights across the available global and China-focused sources. Keep this workflow read-only: never hold, reserve, order, ticket, cancel, change, or pay for a flight. Do not request or enter passenger names, identity numbers, contact details, or payment information.

## Spain project acceptance gate

Search ordinary round trips first as a useful low-fare baseline, but also compare open-jaw, multi-city, unusually low/fuel-dump, and hidden-city patterns when they cover the traveler's full journey. Do not require a round-trip search interface or a single ticket. For each traveler, total every required flight ticket, including positioning flights, checked-bag purchase, tax, and mandatory fee before comparing with the RMB 4,500 or HKD 5,000 airfare ceiling. Add ground positioning costs separately when comparing the three-person trip total. Label independent tickets and self-transfers clearly, including lost connection protection. Every segment the traveler plans to fly must include at least 20 kg of checked baggage or its confirmed added cost. Show the actual payment currency in HKD or CNY when available. A Hong Kong ticket ending early in Beijing remains conditional on the actual carrier agreeing to deliver checked baggage there and on reviewing the unused final segment's consequences.

## Search workflow

1. Collect only the details needed to search: origin and destination, one-way or return, travel dates and flexibility, passenger counts by adult/child/infant, cabin, currency, baggage needs, stop preference, and airport flexibility. Ask only for missing details that change the results.
2. Start with the confirmed travel dates and a comparable ordinary round trip, then search open-jaw, multi-city and other full-journey structures. Do fare reconnaissance across roughly two months around the travel period to explain promising or missing fares; keep trip length comparable (for example, about eight days) and change one variable at a time when diagnosing date effects. For this project, compare HKG for one traveler and Beijing airports for two travelers, along with arrival/departure airports in Spain, connection hubs, carriers and baggage-inclusive fare brands. A useful reference pattern is HKG–PEK–MAD outbound and MAD–PEK–HKG return. Treat the December HKD 4,606 fare as an adjacent-month lead only, never a target-date quote.
3. Use an already configured multi-source flight search tool such as `trvl` when available. Check its current provider list and report the sources that actually returned results. Do not claim that a result came directly from an OTA merely because it appears as a seller link in a metasearch result.
4. Search the relevant requested sellers/platforms separately when tools or an accessible browser can reach them. Consult [source-matrix.md](references/source-matrix.md) for candidate sources and known limitations. Treat it as a research lead, not proof that a platform is currently reachable.
5. Prefer current, route-specific prices from the platform itself. If the source returns cached, estimated, or indicative prices, label them that way. If a site is blocked, requires unavailable credentials, or has no callable integration, mark it unavailable and continue with the other sources. Never invent a fare or imply that every source was checked.
6. Refresh the strongest exact-date candidates from each ticket structure on the requested sellers. Normalize full-journey totals for passenger count, cabin, checked baggage, taxes, mandatory fees, and any positioning travel. Record ticket count, separate-ticket connection risk, hidden-city conditions, seller, and fare rules. Do not compare a segment price with a full round-trip or multi-city price. A one-passenger fare does not establish that two seats remain at that fare.
7. Report when each price was checked in Asia/Hong_Kong time, currency, source, itinerary, baggage/fare caveats, and a direct result or seller link. Historical price graphs or time-series data may support a price-trend claim; a two-month calendar of current fares is only a cross-date snapshot, not proof of historical price drops. State that the seller's final checkout page is the final price authority.

## Access and side-effect limits

- Use public pages and existing read-only search integrations. Do not scrape private/internal endpoints, bypass CAPTCHA, defeat anti-bot controls, or automate logged-in actions.
- Do not install a connector or run a tool that reads browser cookies, Keychain items, saved credentials, or account data without the user's specific authorization. If such access is required for a requested platform, explain which platform and ask before accessing it; keep searching the other sources meanwhile.
- If an MCP exposes both search and booking tools, call search/details only. Do not call tools such as `book_flight`, `create_order`, `checkout`, `hold`, or `payment`.
- Give the user comparison results and direct links so they can place the order themselves.
