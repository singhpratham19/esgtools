# esgastraa.com: Google Search Console analysis

*Source: the Search Console export "Performance on Search", downloaded 2 Oct 2026. The filter was set to the last 6 months of web search, but the data starts on 16 Jun 2026, so this covers 106 days (16 Jun to 29 Sep 2026). Companion to [`esg-astraa-whitepaper-plan.md`](./esg-astraa-whitepaper-plan.md).*

## Headline numbers

| Metric | Value |
|---|---|
| Clicks | **302** |
| Impressions | **9,671** |
| CTR | 3.1% |
| URLs with impressions | 162 (61 blog posts, 24 case studies, 13 white papers, 27 service pages, 20 industry pages) |
| Share of clicks from India | 90% (271 clicks; CTR 8.9%) |
| Clicks from brand queries | **165 of the 168 clicks** in the query table (98%) |
| Rich results (Search appearance) | **None** |

| Month | Clicks | Impressions | CTR | Avg. position |
|---|---|---|---|---|
| Jun (16-30) | 54 | 1,378 | 3.9% | 13.5 |
| Jul | 84 | 1,751 | 4.8% | 10.3 |
| Aug | 74 | 3,160 | 2.3% | 19.2 |
| Sep | 90 | 3,382 | 2.7% | 10.6 |

**Summary:** impressions roughly doubled from July to August, while clicks stayed flat at 70-90 a month. Google is showing the site for more non-brand queries, but almost nobody clicks. Nearly all clicks come from people who already know the name ("esg astraa": 144 clicks at 64% CTR; "esg astra": 20). The site has **no measurable non-brand organic traffic yet**.

## What works

- **Brand:** position ~1.1 for "esg astraa", which captures most brand demand.
- **News-led posts:** the best non-brand page is *India Net Zero Portal / NAPCC dashboard* (318 impressions, 9 clicks, position 5.3), from queries like "india net zero portal" (position 2-3.5). Being early on a new government launch works.
- **Comparison and "vs" posts:** *BRSR Core vs BRSR Lite* (position 5.3, 4.7% CTR). *Green Credit Programme vs carbon credits* (position 5.9) and *State of carbon disclosure in India 2026: the Scope 3 gap* (22% CTR) earn clicks on small volume.
- **White papers:** the aerospace & defence white paper has the best CTR of any content page (11.8%).
- **Mobile beats desktop:** position 7.2 vs 15.5, and CTR 4.5% vs 2.8%.

## Problems, by impact

### 1. Duplicate hosts split the homepage (technical, fix this week)

Google indexes three versions of the site: `https://esgastraa.com`, `http://esgastraa.com` and `https://www.esgastraa.com`.

| Homepage URL | Impressions | Clicks | CTR | Position |
|---|---|---|---|---|
| `https://esgastraa.com/` | 743 | 222 | 29.9% | 13.0 |
| `http://esgastraa.com/` | **1,625** | 24 | 1.5% | 5.8 |
| `https://www.esgastraa.com/` | 2 | 0 | 0% | 2.0 |

- 42 indexed URLs use `www.` and 119 do not.
- /about, /industries, /industries/chemical and /industries/information-technology each appear under both hosts.
- The insecure `http://` homepage gets **more impressions than the https one**.

**Fix:**
- Pick one canonical host (apex `https://esgastraa.com`, which already gets 92% of clicks).
- 301 every `http://` and `www.` URL to it.
- Add self-referencing `<link rel="canonical">` on every page and turn on HSTS.
- List only canonical URLs in the sitemap and resubmit it.
- Run the Change of Address and URL Inspection checks in Search Console.

### 2. CBAM page ranks on page 1 but gets no clicks (biggest quick win)

`/insights/blogs/eu-cbam-cost-indian-exporter-2026-53` has **698 impressions at position 8.8, with 0 clicks**. It is the site's most-seen content URL. The queries behind it are about 12 variants of **"eu cbam certificate price exporters (2026)"**, 449 impressions at positions 7.6-9.5.

Searchers want **the number**: the current CBAM certificate price and what it means per tonne. The title and snippet apparently don't show it.

**Fix (in 1-2 days):**
- Retitle to e.g. *"EU CBAM Certificate Price 2026: What Indian Exporters Pay per Tonne"*.
- Open with a 40-60 word answer giving the latest published price, its date and a worked per-tonne example for steel and aluminium.
- Add a "last updated" date, FAQ and Article schema, and links to the CBAM service pages.
- Refresh it every time the Commission publishes a price (quarterly in 2026, weekly from 2027).

This page is the natural seed for white papers **#2 (The Cost of Defaults)** and **#3 (CBAM for the CFO)**.

Some of these queries arrive with literal `+` and `%` prefixes, which suggests automated rank trackers or AI agents are also running them. The demand is real either way.

### 3. Third-party company files pull irrelevant traffic

| URL | Impressions | Clicks | What it ranks for |
|---|---|---|---|
| `/case-studies/H&M.pdf` | 1,594 | 5 | "filetype:pdf h and m", "h&m revenue" |
| `/case-studies/Bridgestone Corporation.pdf` (space in filename) | 363 | 0 | Bridgestone queries |
| `/Case Studies/Maersk.docx` | 18 | 0 | n/a |
| `/insights/case-studies/patagonia-climate-strategy-esg-growth-38` | 403 | 0 | "patagonia revenue 2026", "patagonia swot" (23 Patagonia queries) |

These desk-research studies of global brands account for about 25% of all page impressions. They inflate US, Vietnam and Philippines impressions with no clicks (the US has 2,682 impressions and 3 clicks), pull no buyers, and in AI summaries risk reading as client work.

**Fix:**
- Noindex the raw PDF and DOCX files, or 301 them to their HTML versions.
- Rename files without spaces or `&`.
- Label every global-brand study "Desk research — not a client engagement".
- Point internal links toward India and CBAM content instead.

### 4. Service pages don't rank

Commercial pages sit at positions 23-78 with almost no impressions:

| Service page | Avg. position |
|---|---|
| brsr-core-assurance | 74 |
| scope-3-supplier-carbon-readiness | 78 |
| cbam-embedded-emissions-calculation-data-pack | 70 |
| carbon-footprint-reduction | 58 |
| brsr-brsr-core-readiness ("brsr" query, 41 impr.) | 46 |
| ccts-target-achievement-carbon-credit-strategy | 36 |

Every one of them is on the `www.` host, so the duplicate-host problem (#1) splits their signals. They also seem to get few internal links from the blog posts that do rank.

**Fix:**
- Canonicalise the hosts (#1).
- Add 2-3 contextual links from each ranking post to the matching service page. For example: CBAM cost post → CBAM exposure assessment; BRSR Core vs Lite → BRSR Core readiness; CBAM verification posts → CBAM data pack.
- Give each service page an FAQ and answer-capsule section.

### 5. Legacy and listing URLs still indexed

`/insights/blogs/1`, `/2`, `/3` and `/4` are still indexed, with 185 and 96 impressions on `/3` and `/4`. `/insights/blogs/2` sits at position 31.5. 301 each to its keyword-slug equivalent.

### 6. No structured data

"Search appearance" is empty, so no FAQ, article or breadcrumb rich results are recognised.

**Fix:** add Organization (with sameAs links), Article/BlogPosting with author and dateModified, BreadcrumbList, and FAQPage where there is a real Q&A block.

### 7. Half the blog isn't visible

Post IDs run to about 120, but only 61 posts got any impressions in 106 days. Check *Indexing → Pages* in Search Console for "Crawled/Discovered – currently not indexed". Then merge thin or off-topic posts (just transition, Patagonia-type pieces) into India/CBAM/CCTS/BRSR pillars, or noindex them.

### 8. Outdated framing on an assurance post

`brsr-reasonable-assurance-india-esg-audit-58` ranks at position 6.4. Since SEBI's circular of 28 Mar 2025, the rule is *assessment **or** assurance*; check that this post isn't still describing a reasonable-assurance mandate. That error is exactly what white paper #12 plans to correct in competitors' content.

## AEO signal: AI agents are already querying the site

About 28 queries are long, prompt-shaped strings that people don't type into Google. For example:

- *"i work in the aerospace industry. my main motivations: verify technical specs… what sustainability reporting frameworks are most used in aviation?"*
- *"evaluate the biotechnology company sanofi on pharma firms integrating sustainability…"*
- *"regulatory mandates audit deficiencies enforcement cement manufacturing building materials last 90 days"* (275 impressions, position 8.2, the 3rd-largest query)
- Boolean strings like *("data center" OR "datacenter") AND ("water use" …)*

These look like AI-visibility tracking tools and AI search agents (ChatGPT/Gemini-style query fan-out) retrieving through Google. So esgastraa.com is **already a candidate source in AI answer pipelines**, especially through the industry pages (cement: 300 impressions at position 10.3) and the sector white papers. That supports the AEO recommendations in the plan:

- answer capsules
- dated statistics with the brand name in the sentence
- ungated HTML
- AI retrieval crawlers allowed in robots.txt

Make sure `/industries/cement`, the CBAM posts and the white papers each open with an extractable 40-60 word answer.

## How this changes the 20-paper plan

1. **Correction to the plan's brand recon.** The recon found only three indexed URLs. Search Console shows **162 URLs with impressions**, including about 120 blog posts, 13 sector white papers, 24 case studies, 27 service pages and 20 industry pages. The site has far more content than the recon could see; the problem is **conversion of impressions to clicks and ranking of commercial pages**, not a lack of pages.
2. **Build the P1 papers on pages that already rank** instead of starting new URLs:

   | Plan paper | Existing page to upgrade (current Search Console data) |
   |---|---|
   | #2 Cost of Defaults / #3 CBAM for the CFO | `eu-cbam-cost-indian-exporter-2026-53` (698 impr., position 8.8) |
   | #9 Default or Actual? CBAM verification | CBAM verification series, posts 111-119: `what-does-cbam-verification-actually-cost-118` (position 4.5), `why-cbam-verifier-access-opened-september-2026-112` (position 5.5), `cbam-registry-110`, `myth-vs-fact…verifier-113`, `cbam-verification-vs-eu-ets-115` |
   | #1 CCTS Atlas / #11 PAT to CCTS | `india-carbon-credit-trading-scheme-launch-listed-companies-65` (173 impr., position 11.5), `india-green-credit-programme-vs-carbon-credits-76` (position 5.9) |
   | #12 Ranks 501-1,000 / #6 BRSR Core tracker | `brsr-core-vs-brsr-lite-mid-cap-companies-2026-80` (position 5.3), `brsr-reasonable-assurance…-58` (position 6.4), `how-to-read-brsr-filing-practical-guide-67` |
   | #14 India Inc.'s Carbon Blind Spot | `state-of-carbon-disclosure-india-2026-scope-3-gap-93` (22% CTR) |
   | #17 Carbon Liabilities | `financed-emissions-esg-calculation-reshaping-indian-banking-57` |
   | #5 Steel's Double Deadline | `/industries/metals` (position 14.8) and the metals & mining white paper |

   Upgrade these in place, consolidate overlapping posts into each pillar with 301s, and keep the URL that already has impressions.
3. **The existing 13 white papers are global, sector-generic ESG overviews** (aerospace, automotive, chemicals, textiles, healthcare and others). They earn little: 188 impressions in total. Keep them as sector context, but the new India-compliance papers in the plan are the ones aligned with buyer intent.
4. **Wait for the fixes before measuring.** Re-pull this export about 4-6 weeks after the host canonicalisation and CBAM-page retitle. Then measure non-brand clicks, CTR on the CBAM price query cluster, and service-page positions.

## Data notes

- Search Console hides low-volume queries for privacy. The query table accounts for 168 of 302 clicks and 3,072 of 9,671 impressions, so ~44% of clicks came from hidden queries. Some of those are probably non-brand.
- Page-level totals (306 clicks, 11,620 impressions) differ from property totals because Search Console aggregates by page and by property differently.
- Average position is impression-weighted and blends very different queries. Treat it per query, not per site.
