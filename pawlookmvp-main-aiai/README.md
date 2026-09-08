# PawLook — MVP

„Zobacz swojego psa po groomingu, zanim go ostrzyżesz.”

## Wymagania

- Node.js 18+ (sprawdź: `node -v`)
- npm (dołączony do Node.js)
- Python 3 (do serwowania zbudowanej wersji — zwykle już jest w systemie) **albo** dowolny inny lokalny serwer statyczny

## Instalacja i uruchomienie

```bash
npm install
npm run build
npm run serve
```

Następnie otwórz w przeglądarce:

```
http://localhost:4173/index.html
```

Najlepiej oglądać w widoku mobilnym (np. tryb urządzenia mobilnego w DevTools przeglądarki), bo aplikacja jest mobile-first.

### Tryb developerski (przebudowa na żywo przy edycji kodu)

```bash
node build.mjs --watch
```

i w drugim terminalu:

```bash
npm run serve
```

## Konfiguracja backendu AI (wymagane do prawdziwego generowania)

1. Skopiuj `.env.example` i uzupełnij wartości (lokalnie, NIE commituj `.env`):
   ```bash
   cp .env.example .env
   ```
2. Wdróż `api/generate.ts` jako funkcję serverless (patrz sekcja "Deployment backendu" niżej) i ustaw tam `GEMINI_API_KEY`.
3. Zbuduj frontend, podając publiczny adres backendu:
   ```bash
   PAWLOOK_API_URL=https://twoj-projekt.vercel.app/api/generate npm run build
   ```
   Bez tej zmiennej aplikacja zbuduje się, ale generowanie AI nie będzie działać (zobaczysz czytelny komunikat błędu, nie fałszywy wynik).

## Deployment backendu (Vercel — zalecane dla MVP)

1. Załóż darmowe konto na [vercel.com](https://vercel.com) i zainstaluj `vercel` CLI: `npm i -g vercel`.
2. W katalogu projektu: `vercel` (pierwsze uruchomienie zapyta o konfigurację — zaakceptuj domyślne).
3. W panelu Vercel → Project → Settings → Environment Variables dodaj:
   - `GEMINI_API_KEY` — Twój klucz z [Google AI Studio](https://aistudio.google.com/app/apikey)
   - `ALLOWED_ORIGIN` — np. `https://stacha1337.github.io` (ogranicza CORS do Twojego frontendu)
4. `vercel --prod` — backend jest wdrożony pod adresem `https://<nazwa-projektu>.vercel.app/api/generate`.

## Deployment frontendu (GitHub Pages — bez zmian w stosunku do obecnego setupu)

GitHub Pages nadal może służyć jako frontend — to statyczny plik `dist/`, więc nic się tu
architektonicznie nie zmienia. Jedyna różnica: workflow budujący `dist/` musi mieć ustawioną
zmienną `PAWLOOK_API_URL` wskazującą na wdrożony backend. W `.github/workflows/deploy.yml`
dodaj do kroku `Build`:

```yaml
      - name: Build
        run: npm run build
        env:
          PAWLOOK_API_URL: https://twoj-projekt.vercel.app/api/generate
```

(Ta wartość to publiczny adres URL, nie sekret — bezpiecznie umieścić ją wprost w workflow.)

## Struktura projektu

```
src/
  components/   – wielokrotnego użytku komponenty UI (Button, TopBar, StyleCard, GroomerCard)
  screens/      – ekrany aplikacji (Home, Upload, StyleSelect, Generating, Result, Groomers)
  services/     – aiGroomingService.ts – realna integracja z AI (frontend), odseparowana od UI
  config.ts     – adres backendu wstrzykiwany w czasie builda (PAWLOOK_API_URL)
  mock/         – dane demo groomerów (styleId nadal używany jako identyfikator stylu)
  types/        – typy TypeScript
  utils/        – localStorage helper (zapisane looki) + preprocessing zdjęcia
api/
  generate.ts             – serverless endpoint (Vercel) — jedyne miejsce, gdzie używany jest GEMINI_API_KEY
  gemini.ts               – klient Gemini 3.1 Flash Image Preview (image-to-image)
  prompts.ts              – prompty per styl groomingu + zasady zachowania tożsamości psa
  handleGenerateRequest.ts– walidacja żądania (czysta funkcja, testowalna bez serwera)
  errors.ts, types.ts, global.d.ts – pomocnicze typy backendu
public/
  index.html    – punkt wejścia HTML
  styles.css    – wszystkie style aplikacji
build.mjs       – skrypt budujący (esbuild) — wstrzykuje PAWLOOK_API_URL do bundla
vercel.json     – konfiguracja funkcji serverless dla backendu
.env.example    – jakie zmienne środowiskowe są potrzebne i gdzie je ustawić
```

## Co jest zaimplementowane

- Pełny flow: Home → Dodaj zdjęcie → Wybór stylu → Generowanie → Wynik → Znajdź groomera
- 6 stylów groomingu (Teddy, Puppy Cut, Fluffy, Clean, Asian Fusion, Short)
- Upload zdjęcia z urządzenia (bez logowania, dane tylko lokalnie w przeglądarce)
- **Prawdziwa generacja AI**: zdjęcie psa jest wysyłane do backendu, który wywołuje model
  image-to-image (Gemini 3.1 Flash Image Preview) i zwraca fotorealistyczną wizualizację
  tego samego psa po wybranym groomingu — z zachowaniem rasy, umaszczenia, pyska i proporcji.
- Prawdziwa obsługa błędów generowania (brak zdjęcia, zły format, timeout, błąd API,
  rate limit, brak zwróconego obrazu) z możliwością ponowienia próby bez utraty kontekstu.
- Zapisywanie wybranego looka (localStorage)
- Ekran groomerów we Wrocławiu, filtrowany według wybranego stylu

## Architektura generowania AI

```
Frontend (GitHub Pages, statyczny)
   → POST /api/generate  { photo, styleId }
Backend (Vercel Serverless Function, api/generate.ts)
   → wywołuje Gemini 3.1 Flash Image Preview z GEMINI_API_KEY (tylko po stronie serwera)
   ← zwraca { image: "data:image/...;base64,..." }
Frontend
   → wyświetla wynik na ekranie Result
```

`GEMINI_API_KEY` istnieje wyłącznie jako zmienna środowiskowa backendu — nigdy nie trafia
do kodu frontendowego ani do repozytorium. Zobacz `.env.example`.

## Co jest nadal DEMO

- **Groomerzy** (`src/mock/groomers.ts`): wszystkie dane (nazwy, oceny, ceny) są fikcyjne i wyraźnie
  oznaczone jako DEMO w interfejsie — nie reprezentują prawdziwych firm.

## Czego celowo nie ma (zgodnie z zakresem MVP)

Płatności, konta użytkowników, system rezerwacji, czat, powiadomienia, panel administracyjny, system opinii, integracja z Booksy, mapy, subskrypcje.
