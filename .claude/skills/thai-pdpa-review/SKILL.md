---
name: thai-pdpa-review
description: Review a Kerd feature, data flow, or data-sourcing plan for Thai PDPA, Computer Crime Act and copyright risk; use when collecting user data, sending marketing messages, or collecting third-party content.
---

# Thai PDPA & data-legal review

Act as a privacy-minded reviewer (not a lawyer). Output a short risk checklist in Thai: risk level (สูง/กลาง/ต่ำ), what triggers it, concrete fix (code / data model / UX). Always end with: "ไม่ใช่คำปรึกษาทางกฎหมาย ก่อนเปิดเชิงพาณิชย์ควรให้นักกฎหมายตรวจ".

When a fact matters (section numbers, fines, PDPC notifications), verify with a web search against official or major-law-firm sources (pdpc.or.th, ratchakitcha.soc.go.th, large law firms) and cite the URL. Laws and PDPC sub-regulations change; never rely on memory alone.

## 1. PDPA (พ.ร.บ.คุ้มครองข้อมูลส่วนบุคคล พ.ศ. 2562)
For every personal-data field (name, email, phone, LINE userId, birth date, IP, cookie IDs):
- **Lawful basis**: contract / legitimate interest / consent. Marketing messages (birthday reminders) need separate, unbundled, opt-in consent, not pre-ticked, with easy withdrawal (unsubscribe / block OA).
- **Minimization**: only what the feature needs (birth month + day, never year).
- **Privacy notice**: purpose, retention, recipients, rights, controller contact, shown at collection.
- **Sensitive data** (health, religion, biometrics...): explicit consent; flag any feature touching it.
- **Data subject rights**: access, correction, deletion, portability, objection, withdraw consent; check UI/process + response time.
- **Cross-border transfer** (s.28-29, PDPC notifications effective 24 Mar 2024): vendors outside Thailand (Vercel, Supabase, Resend, LINE, LLM APIs) need adequacy or safeguards (Thai/Overseas model SCC, BCR); keep a vendor list with countries. Prefer Singapore region.
- **Processors**: each vendor handling personal data needs a DPA.
- **Security & breach**: access control, encryption, logging; notify PDPC within 72 hours unless low risk, notify users when high risk.
- **Retention**: define deletion of inactive accounts.
- **DPO / ROPA**: assess if a DPO is required; keep a record of processing activities.
- **Cookies/analytics**: consent banner for non-essential cookies.
- **Penalties** (verify current): administrative fines up to 5M THB, criminal penalties, punitive damages up to 2x.

## 2. LINE OA / LINE Login
- LINE userId and profile are personal data; request minimal scopes.
- Follow LINE terms and messaging policy; treat block/unfollow as consent withdrawal.
- Check current OA plan quota/cost before promising notification volume.

## 3. Collecting third-party content
- **Computer Crime Act**: no bypassing login, paywalls, rate limits, captchas or access controls.
- **Platform ToS**: no scraping Facebook/Instagram/LINE/TikTok/Lemon8; use them only as leads for manual checks.
- **Copyright Act 2537**: facts are free, expression is not; rewrite descriptions, no copied images/logos without permission; link to source.
- **Trademarks**: nominative use of brand names only; no implied endorsement unless brand-verified.
- Respect robots.txt, low request rate, identifiable bot User-Agent.
- Evidence screenshots: internal only, not republished.

## 4. Accuracy / consumer protection
- Show source link + last-verified date; disclaimer that brand terms prevail.
- Label sponsored/featured/affiliate listings clearly.

## Output format
```
## สรุปความเสี่ยง: <feature>
| ระดับ | ประเด็น | ทำไม | แก้ยังไง |
### ต้องทำก่อน launch
- [ ] ...
### แหล่งอ้างอิง
- <url>
```
Keep it short; lead with high-risk items.
