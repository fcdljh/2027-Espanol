---
name: airfare-search
description: Search and compare current flight fares across airline, metasearch, and travel-agency sources. Use for flight price research; do not use to book or pay.
---

# Airfare Search

Help the user find and compare flights across the available global and China-focused sources. Keep this workflow read-only: never hold, reserve, order, ticket, cancel, change, or pay for a flight. Do not request or enter passenger names, identity numbers, contact details, or payment information.

## Search workflow

1. Collect only the details needed to search: origin and destination, one-way or return, travel dates and flexibility, passenger counts by adult/child/infant, cabin, currency, baggage needs, stop preference, and airport flexibility. Ask only for missing details that change the results.
2. Before querying only the requested dates, do fare reconnaissance across roughly two months around the travel period. Keep trip length comparable (for example, about eight days); start with date-calendar/month-view searches, sample weekly departure dates if a source lacks a calendar, then search daily around promising lows. Also test materially different itinerary shapes: each traveler's origin, shared connection hubs, round trips, open jaws/multi-city, and any through-ticket routing suggested by results. For travelers starting in different cities, compare both the combined itinerary and the total cost for each traveler. A useful pattern to test here is HKG–PEK–MAD outbound and MAD–PEK–HKG return. Treat the reported December fare under 4,500 as a lead only; verify currency, passenger scope, ticketing, and baggage before comparing it.
3. Use an already configured multi-source flight search tool such as `trvl` when available. Check its current provider list and report the sources that actually returned results. Do not claim that a result came directly from an OTA merely because it appears as a seller link in a metasearch result.
4. Search the relevant requested sellers/platforms separately when tools or an accessible browser can reach them. Consult [source-matrix.md](references/source-matrix.md) for candidate sources and known limitations. Treat it as a research lead, not proof that a platform is currently reachable.
5. Prefer current, route-specific prices from the platform itself. If the source returns cached, estimated, or indicative prices, label them that way. If a site is blocked, requires unavailable credentials, or has no callable integration, mark it unavailable and continue with the other sources. Never invent a fare or imply that every source was checked.
6. After reconnaissance, search the exact requested dates and refresh the strongest candidates. For a given origin, destination, and date pair, price suitable round-trip options first; then compare split one-way or mixed-carrier tickets when they may better fit different origins/arrival cities or lower the total. Normalize comparisons for passenger count, cabin, at least the requested checked-baggage allowance, taxes, mandatory fees, and positioning flights. State baggage, seat, and fare-rule caveats. Do not present separate tickets as a protected round trip.
7. Report when each price was checked in Asia/Hong_Kong time, currency, source, itinerary, baggage/fare caveats, and a direct result or seller link. Historical price graphs or time-series data may support a price-trend claim; a two-month calendar of current fares is only a cross-date snapshot, not proof of historical price drops. State that the seller's final checkout page is the final price authority.

## Access and side-effect limits

- Use public pages and existing read-only search integrations. Do not scrape private/internal endpoints, bypass CAPTCHA, defeat anti-bot controls, or automate logged-in actions.
- Do not install a connector or run a tool that reads browser cookies, Keychain items, saved credentials, or account data without the user's specific authorization. If such access is required for a requested platform, explain which platform and ask before accessing it; keep searching the other sources meanwhile.
- If an MCP exposes both search and booking tools, call search/details only. Do not call tools such as `book_flight`, `create_order`, `checkout`, `hold`, or `payment`.
- Give the user comparison results and direct links so they can place the order themselves.
