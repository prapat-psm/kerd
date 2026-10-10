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

# Research round 1 (checked 2026-10-08, 20 brands)

Found 6 of 20 on official pages. All are seeded as draft and need a human check in Studio.

| brand | source | verify_method | confidence | issue |
|---|---|---|---|---|
| Bar B Q Plaza | barbqplaza.com/gonmemberbirthday | auto | high | special-price set (799 THB), not free; ends 31 Dec 2569; window_days_after=30 is an estimate for "the following month" |
| The Pizza Company | 1112.com homepage (tier config) | manual | medium | perk text only in embedded config; homepage changes often so not auto |
| Pizza Hut TH | pizzahut.co.th article | auto | high | Diamond tier only (6,000 THB spend) |
| S&P | snp1344.com/th/card | auto | medium | page is on S&P Delivery, not snpfood.com |
| Inthanin | bangchakgreenmiles.com (parent Bangchak) | auto | medium | source is the parent company's domain; confirm it counts as official; ends 31 Dec 2026 |
| Oriental Princess | orientalprincess.com blog | manual | medium | details only in images; URL still says 2022 but page is the 2026 package |

Not found (skip): Bonchon (bonchonthailand.com 404), Sukishi (member site needs login), Fuji, Santa Fe' (real site santafesteak.com), Sushiro, Black Canyon, ChaTraMue, UOB.
Could not check (still todo): ZEN (site down), Punthai and SF Cinema (robots.txt behind Cloudflare 403), SCB (bot block; a PRIME lead may be expired), Boots (JS-only site), EVEANDBOY (perk exists but details are behind a robots-disallowed path).

Do not use blackcanyonthai.com: it now redirects to a gambling site.

# Research round 2 (checked 2026-10-08, 24 brands)

Found 4 of 24. 3 go into the seed as draft; True is low confidence so the seed skips it.

| brand | source | verify_method | confidence | issue |
|---|---|---|---|---|
| Cute Press | cutepress.com/member-benefits.html | auto | medium | 30–50% by tier (spend in the 12 months before birth month); no end date; channels not stated |
| Dream World | dreamworld.co.th/promotion/25 | auto | medium | free ticket only on the exact birthday, birth-month price otherwise; register 1 day ahead; full terms load via JS |
| AEON (M GEN VISA) | aeon.co.th card page | auto | high | birth week (Sun–Sat) only, not the month |
| True Card | privilege.trueid.net | manual | low | no dates or redeem steps on the page; not seeded |

Skip (checked, no perk or brand gone): Hachiban, Texas Chicken (left Thailand 2024), The Body Shop (Thai stores closed Jan 2025), Krispy Kreme TH (placeholder site), Mo-Mo-Paradise (no Thai site), Gyu-Kaku (domain dead), True Coffee, KTC (only store-anniversary sales).
Still todo (site down, bot-blocked, JS-only, or research cut short): Oishi, CoCo Ichibanya, Pepper Lunch, Burger King, Dunkin', Tim Hortons, Sephora, Tsuruha, Tops, Zoo Thailand, Beautrium, Siam Amazing Park (news says members get birth-month entry, not confirmed on the official site).

Round 1 + 2 hit rate is about 23% (10 of 44). Brands with a clear member program on a static page do best; JS apps and bot walls are the main blockers.

# Research round 3 (checked 2026-10-09, 24 brands)

Found 3 of 24. 2 go into the seed as draft; Krungsri is low confidence so the seed skips it.

| brand | source | verify_method | confidence | issue |
|---|---|---|---|---|
| McDonald's TH | mcdonalds.co.th/birthdayService | auto | medium | Party@McD set 299 THB with birthday extras; a party package at participating branches, not a personal freebie; no end date |
| King Power | kingpower.com FAQ birthday celebration | auto | medium | 25% cashback on 2 full-price items, usable 3 months from birth month; not on King Power Online; no end date |
| Krungsri Exclusive Signature | krungsri.com privileges | manual | low | hotel 2-for-1 nights in birth month; site behind bot wall so details came from a summary; not seeded |

Skip: Chester's, Daidomon (closed 2024), Greyhound Cafe, KOI Thé (no Thai site), Kamu Tea, Lotus's, AIS, SEA LIFE Bangkok.
Still todo (site down, TLS errors, robots 403): Jeffer, Hot Pot, Shinkanzen, Yoshinoya, Ootoya, Chao Doi (rebranded CD), Kiehl's, Lancôme, Clinique, MAC, Konvy (robots blocks ClaudeBot), Robinson (502), HarborLand.

# Research round 4 (checked 2026-10-09, 25 brands)

Found 3 of 25. Uniqlo is high confidence and approved for publishing; ttb is low confidence so the seed skips it.

| brand | source | verify_method | confidence | issue |
|---|---|---|---|---|
| Uniqlo TH | faq-th.uniqlo.com app coupon FAQ | auto | high | THB 100 birth-month coupon in the app; Online Store only; minimum spend changed on 22 Sep 2026 |
| ONESIAM | onesiam.com member privilege 2026 | manual | medium | perks differ by tier and store; details only in an image table; likely ends with 2026 |
| ttb | ttbbank.com/th/ttbprivilege | manual | low | "birthday gift" card with no details; Superior status and above per news; not seeded |

Strong leads to check by hand (official page exists but bot-blocked): KBank PLUSTINUM card (birth-month cashback up to 25%), Bangkok Bank M Legend (birth-month coupons).
Skip: Madame Tussauds, Fitness First, Virgin Active, Fine Arts museums, Grab, foodpanda (now redirects to Robinhood), Shopee, Lazada, Robinhood, Krungthai, CIMB Thai, Coca, HomePro, B2S.
Still todo (bot walls): Big C, Power Buy, Jetts, NSM, TrueMoney, KBank, Bangkok Bank, KKP.

## Round 5 (2026-10-09): 24 new brands

Found (added to poc-brands.json):
| Brand | Perk | Confidence | Seed |
|-------|------|------------|------|
| Laneige Thailand | Store member: 20% off, x2 points and a Birthday Kit with any purchase in birth month | high | published |
| Charles & Keith Thailand | Birth-month email code: ฿200 off (member) or ฿500 off (VIP) on ฿2,000 full-price online | medium | draft (which amount goes with which tier is inferred) |
| Hard Rock Cafe Bangkok | Free birthday brownie and framed photo when you book in birth month, show ID | medium | draft (source PDF also holds a 2019 promo, so it may be stale: confirm by phone) |
| Innisfree Thailand | VIP birth-month benefit mentioned in FAQ heading only | low | seed skips |

Skip (no perk on official site): Wine Connection, Dairy Queen, Matsumoto Kiyoshi, Lush, IKEA, Decathlon, Pomelo, Centara.
Todo (could not check): Mister Donut (503), Sukiya (403), KidZania (robots 500), Thai Airways ROP (bot wall), Bangkok Airways FlyerBonus (robots 403), PTT Blue Card (domain redirects elsewhere), PT Max Card (403), Shiseido (JS-only), Pandora (403), The Mall M Card (403), Siam Takashimaya (perk only in an image banner).
Au Bon Pain: no official Thai site found (only social pages), so it is not in brand-candidates.csv.

Leads to check by hand: Bangkok Airways FlyerBonus (yearly birth-month points with registration), Siam Takashimaya (Members Birthday banner), The Mall M Card (birth-month perk in the app).

## Round 6 (2026-10-10): re-verify drafts + 12 new brands

Re-checked all 16 drafts on their official pages. 9 now have a clear, current official page (high) and are published:
S&P (20% once in birth month), Inthanin via Bangchak Green Miles 2026 (20 baht drink coupon, campaign ends 31 Dec 2026), Oriental Princess (2026 package: free gift + 35% off, read from official images), Cute Press (30–50% by tier), Dream World (free Visa ticket on your birthday), McDonald's (paid 299 baht Party@McD set with birthday freebies, not a free personal perk), King Power (25% cashback, 3-month window), ONESIAM (2026 store privileges by tier, from an official image), Charles & Keith (table confirms ฿200 member / ฿500 VIP).

Still draft (medium): Café Amazon (no menu or tier stated), MK (coupon value not stated), Major Cineplex (only a 2018 announcement), Sizzler (undated FAQ, ฿399 value may be stale), 7-Eleven (no items or steps), The Pizza Company (perk only in homepage config), Hard Rock Bangkok (only a 2019 PDF: call the branch).

New brands: The Coffee Club (birth-month privilege in the app, value not stated: draft). Skip: Somboon Seafood, Yayoi (MK ONE discounts only), Srichand, Cathy Doll, Sanrio Gift Gate (no official Thai site). Todo: Kyochon (no Thai site), Supersports (JS-only), Big Camera (robots blocks ClaudeBot), Mistine (Cloudflare), Jaspal and CPS (JPS Club benefits page is JS-only; worth a manual browser check).
