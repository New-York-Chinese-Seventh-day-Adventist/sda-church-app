# Service limits and costs

What every service the app depends on costs, what limits it publishes, what happens
when a limit is hit, and how much load the app actually puts on it. Free operation is
a hard constraint: the "Sustainable" tenet in [Project Tenets](../project-tenets.md)
rules out anything that could produce a surprise bill (see
[#261](https://github.com/New-York-Chinese-Seventh-day-Adventist/sda-church-app/issues/261)
for how that ruled out Cloudflare R2).

Numbers marked *measured* were taken on 2026-09-25/26 with single requests; published
limits link to the provider's page as checked on those dates. Review this page once a
year with the [upkeep calendar](../architecture.md#upkeep-calendar), and whenever a
provider changes its terms.

## Contents

- [Summary](#summary)
- [Load model](#load-model)
- [Deliberate architecture choices](#deliberate-architecture-choices)
- [Runtime services](#runtime-services)
- [Build, hosting, and admin services](#build-hosting-and-admin-services)
- [Link-only websites](#link-only-websites)
- [Known gaps](#known-gaps)

## Summary

"At the limit" says what happens if the app exceeds the provider's limit. **No
service in this table can bill the church for usage.** The only recurring cost in the
whole system is the domain.

| Service | Used for | Cost | Published limit | At the limit | Load concern |
| --- | --- | --- | --- | --- | --- |
| [Adventist Connect](#adventist-connect-media-library) | Photos, CUV Bible audio (primary) | Free (NAD platform) | None published; Cloudflare CDN terms apply to NAD's account | Unknown; no agreement | **Medium**: most of the app's bytes |
| [Audio Power](#audio-power) | CUV audio, 2nd source | Free (permission) | None published | Unknown | **High if Adventist Connect fails**: single small server |
| [Internet Archive](#internet-archive) | CUV audio, 3rd source | Free | None published | Throttling possible | Low (rarely reached) |
| [HelloAO](#helloao) | Bible text, English BSB audio | Free | "No usage limits" | n/a | Low: CDN |
| [fetch(bible)](#fetchbible) | Original-language, CUV, RV1909 text | Free | "No limits from us" | n/a | Low: CDN |
| [Bulletin API (Apps Script)](#bulletin-api-apps-script) | Digital bulletin | Free (Workspace for Nonprofits) | 30 simultaneous executions per user | Requests fail with an error | **Medium at scale**: one account's ceiling |
| [Adventech](#adventech-sabbath-school) | Children's Sabbath School catalog | Free | None published | Unknown | Low: CDN |
| [Chinese Union Mission library](#chinese-union-mission-library) | Chinese EGW catalog and books | Free | None published | Unknown | **Medium**: small uncached origin |
| [EGW Writings covers](#egw-writings-covers) | Library thumbnails | Free | None published | Unknown | Low: Cloudflare |
| [Sunrise-Sunset](#sunrise-sunset) | Sabbath sunset times | Free, **attribution required** | "Reasonable" volume; `429` + `Retry-After` | Throttled | Low, but uncached (see [Known gaps](#known-gaps)) |
| [GitHub Actions](#github-actions) | Tests, builds, deploys | Free (public repo) | Fair use, concurrency | Queued jobs | None |
| [GitHub Pages](#github-pages) | `app.nyccsda.org` | Free | 1 GB site, 100 GB/month soft | `429` or a GitHub email | None |
| [Google Workspace](#google-workspace-and-drive) | Roster, Drive, Apps Script | Free (nonprofit) | 100 TB pooled storage | Quota errors | None |
| [Cloudflare](#cloudflare) | Domain and DNS | **~$10/year** (domain only) | n/a | n/a | None |
| [App stores](#app-stores) | Distribution | Free (Apple nonprofit waiver; Play $25 paid once) | n/a | n/a | None |

## Load model

The church has no usage analytics, so these are scenarios, not measurements. The
congregation is about 250 people (from the original design discussion in
[#5](https://github.com/New-York-Chinese-Seventh-day-Adventist/sda-church-app/issues/5)).

| Scenario | Who | Bible listening | Sabbath-morning bulletin opens |
| --- | --- | --- | --- |
| Congregation | ~250 members | 200 people × 20 min/day | ~250 within an hour |
| Heavy use | ~1,000 users | 1,000 × 30 min/day | ~1,000 within 30 minutes |
| Wide adoption | ~10,000 users | 10,000 × 60 min/day | ~5,000 within 10 minutes |

Per-use costs, *measured*:

| Request | Size | Notes |
| --- | --- | --- |
| CUV audio, one hour | ~10.8 MB | 24 kbps mono; whole Bible 939 MB / ~87 hours |
| BSB English audio, one chapter | ~4.4 MB (John 3, Souer) | Much larger than the Chinese recordings |
| HelloAO chapter | ~3 KB (gzip) | One request per chapter viewed |
| HelloAO translation list | ~150 KB | Once per app session |
| fetch(bible) book | ~30 KB (CUV John) | One request per book, kept in memory for the session |
| Bulletin API | < 1 KB to a few KB | 5.7 s cold, 1.5 s warm |
| Chinese library catalog | ~40 KB | 1.1 s; every time the library opens |
| Adventech quarterly index | ~124 KB | CDN-cached |
| Sunrise-Sunset | ~0.2 KB | Two per home-screen load |

The conclusion: **text APIs are negligible at every scenario, and audio is the only
real load.** Adventist Connect carries it, and the fallback chain decides who carries
it when Adventist Connect can't. See [Audio Power](#audio-power).

## Deliberate architecture choices

These choices exist to keep the app free and within every provider's limits:

- **Bible text from static CDNs, not metered APIs.** HelloAO and fetch(bible) serve
  pre-built files from AWS CloudFront with no API key and no quota. Metered options
  were rejected: api.bible's free tier allows 5,000 calls a month, and
  bible-api.com throttles at 15 requests per 30 seconds
  ([Bible integration design](../feature_designs/bible_integration_design.md)).
  Choosing public-domain and openly licensed translations also means text can be
  cached and downloaded without login or licence limits.
- **No API keys in the app.** A shipped key can be extracted and abused, which could
  exhaust a quota or bill an account. Every runtime service the app calls works
  without a key, and the bulletin data goes through the church's own Apps Script
  instead of the Google Sheets API.
- **The church hosts its own copy of the CUV audio.** Audio Power's owner allowed
  self-hosting ([#134](https://github.com/New-York-Chinese-Seventh-day-Adventist/sda-church-app/issues/134#issuecomment-5274730608)),
  so the church's copy on Adventist Connect is tried first and Audio Power's small
  server only serves listeners when that fails. Audio is streamed on demand, with
  only the next chapter preloaded on web, instead of downloading whole books.
- **Caching at every layer of the bulletin.** The Apps Script caches each response
  for 2 minutes, the app caches each Sabbath's bulletin on the device, and manual
  refresh has a 5-minute cooldown. Most bulletin opens never reach Apps Script.
- **Nothing billable.** Cloudflare R2 and paid object storage were rejected because
  usage-based billing can't be ruled out
  ([#261](https://github.com/New-York-Chinese-Seventh-day-Adventist/sda-church-app/issues/261)).
- **The dependency monitor samples instead of crawling.** One sampled file per large
  collection per day, so monitoring adds almost no load
  ([External dependency monitor](external-dependency-monitor.md)).

## Runtime services

### Adventist Connect media library

Hosts the church's photos, hymnal lookup charts, and the primary copy of the CUV
Bible audio, behind NAD's Cloudflare CDN with Wasabi storage. Free to the church as
part of NAD's church-website platform, with no agreement or published limits. The
full hosting chain and scaling analysis are in
[Adventist Connect media hosting](adventist-connect-media.md): at congregation scale
it carries about 22 GB of audio a month, which is ordinary traffic for that platform;
at wide adoption, terabytes a month could draw attention under Cloudflare's CDN
terms.

### Audio Power

`theaudiopower.com`, the second source for CUV audio. A single nginx server with no
CDN (*measured*), run by a small ministry that gave the church permission to use and
self-host its recordings. It publishes no limits and nothing is cached in front of it.

**Load concern:** the app only reaches it when the Adventist Connect copy fails, but
then *all* listeners move to it at once. At congregation scale that is modest; at
heavy use or wide adoption it could cost the ministry real bandwidth or take its site
down. If Adventist Connect has a long outage, consider temporarily reordering the
sources so the Internet Archive is second. Fallback timing is tracked in
[#262](https://github.com/New-York-Chinese-Seventh-day-Adventist/sda-church-app/issues/262).

### Internet Archive

`archive.org`, the third source for CUV audio, redirecting to its storage servers
(*measured*). Free, nonprofit, and built for large public downloads, though it
publishes no guaranteed rate and can slow heavy users. Rarely reached, because two
sources come before it.

### HelloAO

`bible.helloao.org` (text) and `audio.bible.helloao.org` (English BSB audio). Static
files on AWS S3 behind CloudFront with a one-day cache (*measured*). Its
documentation says: "No usage limits, no API Keys required, and no copyright
restrictions whatsoever." The app requests one small JSON file per chapter.

English audio is the one heavy HelloAO load: about 4.4 MB per chapter, streamed
directly from HelloAO, with no church copy. That is fine at every scenario because it
is served from CloudFront, but it is the largest dependency with no fallback other
than choosing another narrator.

### fetch(bible)

`v1.fetch.bible`, static files on S3 and CloudFront (*measured*), used for the
original-language texts and the CUV and RV1909 reader text. Its
[access policy](https://fetch.bible/access/#no-limits-from-us) offers the CDN with
"no API key, usage fee, request quota, or provider-imposed caching limit." The app
loads a whole book once (about 30 KB) and keeps it in memory for the session.

### Bulletin API (Apps Script)

The church's own Apps Script web app. Free under Google Workspace for Nonprofits.
It runs as the deploying account (`executeAs: USER_DEPLOYING`), so **every anonymous
request from every phone counts against that one account's
[Apps Script quotas](https://developers.google.com/apps-script/guides/services/quotas)**:

- **30 simultaneous executions per user.** Requests beyond that fail with an error;
  there is no charge.
- 6 minutes per execution and 6 hours of trigger runtime a day, far above what the
  API uses.

*Measured* latency is about 1.5 s warm and 5.7 s cold, so the account can serve
roughly 20 requests a second before hitting the 30-execution ceiling. Caching keeps
real traffic far below that: the 2-minute server cache, the per-Sabbath device cache,
and the manual-refresh cooldown mean each phone asks about once per Sabbath. At
congregation and heavy-use scale this is well under 1 request a second. Wide
adoption, with thousands opening the bulletin in the same few minutes, is the one
case that could approach the ceiling. Phones with a cached copy keep showing it, and
the rest see a failed load until traffic drops.

Translation (`LanguageApp`) only runs on a cache miss, so its quota isn't a concern.

### Adventech Sabbath School

`sabbath-school.adventech.io`. The app downloads the quarterly index (about 124 KB)
when the children's Sabbath School screen opens, from S3 and CloudFront with a warm
cache (*measured*). Free, no key, no published limits.

### Chinese Union Mission library

`api.sdabible.org` (catalog) and `cms.sdabible.site` (book files). The catalog is
about 40 KB and took 1.1 s from a plain Apache server with no CDN or cache headers
(*measured*). Free, no key, no published limits.

**Load concern:** the app downloads the whole catalog every time the Chinese library
opens, with no device cache (see [Known gaps](#known-gaps)). This is the smallest
server the app talks to regularly, so it is the most likely to struggle if usage
grows.

### EGW Writings covers

`a.egwwritings.org`, small thumbnails loaded in the library, behind Cloudflare. Free,
no published limits. The platform image cache keeps repeat loads down. Reading
itself opens in the browser.

### Sunrise-Sunset

`api.sunrise-sunset.org`, used for the Sabbath start and end times on the home
screen and the sunset theme. [Free](https://sunrise-sunset.org/api) "for reasonable
request volumes", with throttling (`429` and a `Retry-After` header) for too many
requests. Its terms **require a visible link to sunrise-sunset.org** wherever the
data is shown, and ask users to cache results because "the times for a given date
never change". The app currently does neither; see [Known gaps](#known-gaps).

## Build, hosting, and admin services

### GitHub Actions

Free for public repositories on standard GitHub-hosted runners, including macOS, per
[GitHub's billing policy](https://docs.github.com/en/billing/concepts/product-billing/github-actions).
Concurrency and fair-use limits apply; hitting them queues jobs, it doesn't bill. The
private-repository estimates in [Native Builds](native-builds.md#github-actions-minutes-and-maintenance)
only matter if the repository ever becomes private.

### GitHub Pages

Serves `app.nyccsda.org`: the privacy policy, the download page, and the unsupported
PWA preview. [Limits](https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits):
1 GB per site, a soft 100 GB of bandwidth a month, and `429` responses when rate
limited. Going over the soft limit gets an email from GitHub, not a bill. The pages
that matter are tiny.

### Google Workspace and Drive

Free under Google Workspace for Nonprofits, with 100 TB of storage pooled across the
organization. It holds the roster, the bulletin files, the media backup copy, and the
preview APKs the Android PR workflow uploads. Those APKs accumulate over time, so
clear old ones out occasionally; this is housekeeping, not a cost risk. Exceeding an
API quota returns an error.

### Cloudflare

The domain is the **only recurring cost**: about $10 a year, paid through Cloudflare
Registrar, which can register up to 10 years at a time. The account has a card on
file for that, which is exactly why no usage-billed Cloudflare product may be added
to it ([#261](https://github.com/New-York-Chinese-Seventh-day-Adventist/sda-church-app/issues/261)).
DNS itself is free.

### App stores

- **Apple:** the $99 annual developer fee is waived through nonprofit status, which
  must be resubmitted yearly. No payment method is on file, so a lapse removes the
  app; it doesn't charge the church.
- **Google Play:** the one-time $25 registration was paid. No recurring cost.
- Both are nonprofit organization accounts, so the app must stay free and never
  earn money through the stores: no paid app, in-app purchases, subscriptions, or
  ads. External donation links opened in the browser are fine. See
  [App stores](../architecture.md#app-stores).

## Link-only websites

These only open in the browser, so the app puts no load on them and they have no
cost: YouTube, Spotify, Zoom, AdventistGiving, zgaxr (Chinese hymnals), Hymns for
Worship, the Adventech and Alive in Jesus lesson readers, EGW Writings reading,
Project Gutenberg, the Chinese Union Mission 506 hymnal store pages, and the
conference and union sites. Their availability risks, such as zgaxr's, are covered
in [Architecture](../architecture.md#third-party-apis-and-websites).

## Known gaps

Found while writing this page. None costs money, but each is worth fixing:

- **Sunrise-Sunset attribution is missing.** Its terms require a visible link to
  sunrise-sunset.org where the times are shown, and the app has none. This is a
  terms-of-use issue, not a load issue, and should be fixed first.
- **Sunrise-Sunset responses aren't cached.** The home screen fetches Friday's and
  Saturday's times on every load. Caching them per date, as the provider asks, would
  remove almost all of these requests.
- **The Chinese library catalog isn't cached.** It is fetched from a small server on
  every library open. A device cache with a daily refresh would cut this to about
  one request per phone per day.
- **Audio Power absorbs every listener if Adventist Connect fails.** See
  [Audio Power](#audio-power) and
  [#262](https://github.com/New-York-Chinese-Seventh-day-Adventist/sda-church-app/issues/262).
- **The bulletin API has one account's execution ceiling.** Fine today; revisit if
  the app reaches thousands of simultaneous Sabbath-morning users.
