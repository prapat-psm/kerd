# PoC: official-source birthday promo acquisition (checked 2026-10-08)

| brand | found? | source type | verify_method | confidence | difficulty | issue |
|---|---|---|---|---|---|---|
| Starbucks TH | no | app store only | manual | low | hard | starbucks.co.th returns 403 (robots + pages); rewards site is a JS-only app |
| Café Amazon | partial | brand site | manual | medium | medium | site says "free birthday drink" only; no window, tier or redemption details |
| MK Restaurants | yes (partial) | brand site | auto | medium | medium | coupon value not stated; old URL moved (404); promo URL too long to fetch |
| Swensen's | partial | brand T&C | manual | medium | hard | T&C confirms birth-month perk for Silver/Gold only; content is in the app |
| After You | no | — | manual | low | hard | JS-rendered pages, nothing readable |
| Major Cineplex | yes | brand promo page | auto | medium | medium | page from 2018 (modified 2026); covers FIRST CLASS tier only |
| Sizzler TH | yes | brand FAQ | auto | medium | easy | FAQ undated; search also surfaces an expired 2018 campaign |
| GSB credit card | yes | bank promo page | auto | high | medium | replaced KTC/Krungsri; dated 1 Jan–31 Dec 2569 |
| Watsons | yes | brand T&C | auto | high | medium | elite tier clear; regular-member page has no readable details |
| 7-Eleven ALL member | partial | brand site | manual | medium | hard | dedicated pages return 500/404; monthly items probably app-only |

Swapped out / not found: KFC (FAQ has no birthday details), The 1 (membership pages have no birthday perk), KTC (only store-anniversary "birthday" sales; the hotel promo had expired), Krungsri (krungsricard.com TLS handshake failed, so robots.txt could not be checked and nothing was fetched).

Effort: about 75 tool calls for 14 brands checked, or roughly 5 per brand (easy: 3, medium: 5, hard: 6–8).

## Lessons
- 5 of 10 can be checked from a static official page (auto). Another 3 confirm only that a perk exists, and the details live in the app. 2 are app-only or blocked. Plan for about 50% manual in-app checks.
- "Birthday" searches pick up a lot of noise: store-anniversary sales (Watsons B-Day, King Power, Central App) and expired campaigns (Sizzler 2018, Major Inspire Hub 2018). Every record needs a validity date check.
- URLs are unstable. MK moved /card/ to /mkone/, several Major and 7-Eleven pages return 404/500, and GSB uses a new slug every month. A weekly link checker is needed.
- Perks are usually tier-gated (Swensen's Silver+, Sizzler Gold/Diamond, Watsons elite, Major FIRST CLASS). New members often get nothing at first, so the real "signup lead time" is time to earn the tier, not days. No source stated signup_lead_days.
- Brand pages almost never give a days-before/after window; "birth month" is the norm. Several sites block crawlers (Starbucks 403) or render only with JS (After You, Major M GEN, Starbucks Rewards).
