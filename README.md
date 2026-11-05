# Little by Little · Pixel Habit Tracker

A cozy habit garden for iOS and Android. Small actions, room to grow.

## Status

**Phase 1 is implemented and verified locally:** architecture, tooling, and an interactive local mobile foundation. It is not a released or production-complete service. The mobile preview stores data on this device; it does not sign in, sync to the API, or schedule notifications. The API exposes health endpoints only. See [DEVELOPMENT_PLAN.md](DEVELOPMENT_PLAN.md) for acceptance gates and remaining work.

## Çalıştırma — Windows / PowerShell

Gerekenler: **Node.js 24 LTS (24.15 veya üzeri)** ve **npm 10.9 veya üzeri**. `.nvmrc` ve `.node-version` Node 24 sürümünü belirtir; bu dosyalar tek başına bilgisayarındaki Node sürümünü değiştirmez. Node kurduktan veya güncelledikten sonra terminali yeniden aç.

### 1. İlk kurulum

PowerShell'de proje klasörüne gir, sürümleri kontrol et ve bağımlılıkları yükle:

```powershell
Set-Location 'C:\Users\Lenovo\Desktop\pixel_habbit_tracker'
node --version
npm --version
npm ci
```

`npm ci` ilk kurulumda ve `package-lock.json` değiştiğinde gerekir; her açılışta tekrar çalıştırman gerekmez. Tüm komutları proje kökünde çalıştır. Bir komut hata verirse sonraki adıma geçmeden hatayı çöz.

### 2. Tarayıcıda geliştirme — önerilen

```powershell
npm run dev:web
```

Terminal açık kalsın. Tarayıcıda [http://localhost:8081](http://localhost:8081) adresini aç; farklı bir port seçildiyse terminalde gösterilen adresi kullan. Kaynak dosyaları kaydedince geliştirme sunucusu değişiklikleri tarayıcıya yansıtır. Bu yerel uygulamayı kullanmak için API, Docker veya `.env` kurulumu gerekmez.

Sonraki açılışlarda yalnızca şu iki komut yeterli:

```powershell
Set-Location 'C:\Users\Lenovo\Desktop\pixel_habbit_tracker'
npm run dev:web
```

Durdurmak için sunucunun çalıştığı terminalde **Ctrl+C** tuşlarına bas.

### 3. Derlenmiş tarayıcı önizlemesi — alternatif

Geliştirme sunucusunu durdurduktan sonra, komutları sırayla çalıştır:

```powershell
npm run build:web
npm run preview:web
```

[http://localhost:8081](http://localhost:8081) adresini aç. Bu modda kaynak değişiklikleri kendiliğinden görünmez: yeniden `npm run build:web` çalıştır ve sayfayı yenile. Önizleme sunucusu zaten çalışıyorsa tekrar başlatman gerekmez.

`8081` portu doluysa aynı portta ikinci sunucu başlatma. Mevcut sunucuyu kullan veya onu başlattığın terminalde **Ctrl+C** ile durdur. Ayrı bir önizleme portu kullanmak istersen:

```powershell
$env:PREVIEW_PORT = '8082'
npm run preview:web
```

Bu durumda adres [http://localhost:8082](http://localhost:8082) olur. Varsayılan porta dönmek için sunucuyu durdurup `Remove-Item Env:PREVIEW_PORT -ErrorAction SilentlyContinue` çalıştır. `PREVIEW_PORT` yalnızca derlenmiş önizleme sunucusunu etkiler.

Kayıtlar tarayıcıda adrese göre tutulur: `localhost`, `127.0.0.1` ve farklı portlar ayrı kayıt alanlarıdır. Aynı kayıtları görmek için her seferinde aynı adresi kullan.

### 4. Mobil geliştirme — isteğe bağlı

```powershell
npm run dev:mobile
```

Expo terminalindeki yönergeleri izle. **a** Android emülatörünü, **w** tarayıcıyı açar. Android için Android Studio/emülatör kurulumu gerekir; iOS simülatörü için macOS gerekir. Tarayıcı ve mobil komutları alternatif başlangıç yollarıdır; ikisini aynı anda çalıştırman gerekmez.

## Workspace

```
apps/mobile          Expo Router, React Native, original SVG pixel artwork
apps/api             NestJS modular-monolith foundation
packages/shared-types  Contracts and framework-independent domain calculations
docs/architecture    Architecture decision records
docs/design-system   Art and accessibility guidance
docs/api             HTTP examples
infra                PostgreSQL, API container, load-test scenario
```

## Daily titles and activity lists

Choose **Add daily details** on any habit card. Save book/film titles, project names or individual tasks as separate items, alongside the day's quantity or completion check-in. **Add another item** adds a row; the minus button removes one. Press **Save progress** to save the whole daily entry, or **Cancel** to discard the draft.

Saved items appear directly on the card. In **Garden**, select a past day to see or edit that day's own list; the habit-detail history works the same way. Up to 20 items of 160 characters fit in one daily record. Notes alone do not complete a habit. Quick check/undo and quantity changes preserve its saved details. Existing local preview records remain compatible; no reset is required. These details currently stay in local preview storage, like the other habit data.

## Overall and per-habit green calendars

In **Today**, tap a square in the overall progress map to see that day's completed, in-progress and uncompleted habits immediately below it. The summary includes quantities, original daily targets and saved book/film/project details.

In **Garden**, **All habits** combines the habits scheduled for each day. Choose a habit's name to show only its own progress. Each habit also has a separate miniature map under **A garden for every habit**; open one for its interactive history. Green intensity follows progress toward that day's target, so individual and overall maps can have different shades on the same date. Rest days do not count as failures.

Select **Edit this day** to edit the selected date's existing entries, or **Open monthly calendar** for month/year navigation. Existing local data remains compatible without migration or reset. For browser QA with separate local storage, set `PREVIEW_PORT` before `npm run preview:web` (for example, `8082`); the default remains `8081`.

## API ve PostgreSQL — isteğe bağlı

Yerel alışkanlık ekranları API'ye henüz bağlanmaz. Backend üzerinde çalışacaksan Docker Desktop'ı aç ve proje kökünde, mevcut `.env` dosyasını koruyarak örnek yapılandırmayı oluştur:

```powershell
if (!(Test-Path -LiteralPath '.env')) {
    Copy-Item -LiteralPath '.env.example' -Destination '.env'
}
```

`.env` dosyasındaki `POSTGRES_PASSWORD` alanına kendi yerel parolanı yaz. `DATABASE_URL` aynı kullanıcı, parola ve veritabanını kullanmalı: `postgresql://pixel:URL_ENCODED_PASSWORD@localhost:55432/pixel`. Adresteki parola bölümünü URL kodlamalı biçimde yaz; `URL_ENCODED_PASSWORD` bir yer tutucudur. Varsayılan kullanıcı/veritabanı `pixel`, host portu `55432` olur.

Ardından:

```powershell
docker compose -f infra/compose.yml --env-file .env up -d --wait db
npm run db:generate
npm run db:migrate
npm run dev:api
```

API terminali açık kalsın. Tarayıcı uygulamasını da açacaksan başka bir terminalde proje kökünden `npm run dev:web` çalıştır.

The API listens on port 3000. `GET /v1/health/live` checks the process. `GET /v1/health/ready` checks PostgreSQL and returns 503 if unconfigured or unavailable. Development OpenAPI: [http://localhost:3000/docs](http://localhost:3000/docs). It is disabled in production.

Never commit `.env` or service-account credentials. A Docker daemon must be running. Database integration tests require a disposable PostgreSQL database and `TEST_DATABASE_URL`; their script applies migrations to that database.

PostgreSQL binds to loopback port 55432 by default (`POSTGRES_PORT` can override it); use that port in your host `DATABASE_URL`. Containers use `db:5432`. To run the optional API container, set `DOCKER_DATABASE_URL`, apply migrations first, then use `docker compose -f infra/compose.yml --env-file .env --profile api up -d --build`.

## Development checks

```sh
npm run check       # strict TypeScript, ESLint, formatting, unit/API/component tests
npm run test:integration
npm run build:api
npm run build:web
```

See [ARCHITECTURE.md](ARCHITECTURE.md), [DATABASE_DESIGN.md](DATABASE_DESIGN.md), [API_DESIGN.md](API_DESIGN.md), [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md), [SCALING_STRATEGY.md](SCALING_STRATEGY.md), and [DECISIONS.md](DECISIONS.md). Exact validation results and limitations are recorded in [docs/VALIDATION.md](docs/VALIDATION.md).
