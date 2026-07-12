# devpassport

Your GitHub identity, beautifully visualized.

devpassport generates an interactive developer passport and premium shareable cards from a GitHub profile. It turns public GitHub activity into a polished portfolio artifact: a passport-style booklet, stats cards, achievements, coding habits, language breakdowns, tech stack signals, and exportable images/PDFs.

## What It Does

- Generates a realistic interactive developer passport booklet.
- Creates premium shareable GitHub identity cards.
- Pulls public GitHub profile, repository, organization, language, event, commit, PR, and issue data.
- Estimates active days and contribution totals from the public GitHub contribution calendar.
- Builds derived developer signals such as level, DNA, achievements, scouting metrics, and playstyles.
- Exports cards as PNG.
- Exports passport spreads as PDF.
- Supports screenshots of the passport spread.
- Uses a feature-first code structure so UI, hooks, API logic, and server utilities stay separated.

## Demo

Production URL:

```txt
https://devpassport.vercel.app
```

## Tech Stack

- Next.js App Router
- React
- TypeScript
- Tailwind CSS
- TanStack Query
- react-pageflip
- embla-carousel-react
- html-to-image
- jsPDF
- canvas-confetti
- sonner
- lucide-react
- react-icons
- Vercel Analytics and Speed Insights
- PostHog product analytics

## Project Structure

```txt
src/
  app/
    api/github/[username]/route.ts     # Thin App Router API adapter
    developer-passport-app.tsx         # Thin app adapter
    layout.tsx                         # Metadata, fonts, analytics, providers
    page.tsx                           # Home route and JSON-LD
    query-provider.tsx                 # TanStack Query provider

  components/
    LoaderScreen.tsx                   # Loading experience
    PassportBook.tsx                   # Interactive passport booklet
    ShareableCardsSection.tsx          # Share card carousel and card designs

  features/developer-passport/
    developer-passport-app.tsx         # Main feature composition
    components/                        # Header, hero, form, footer, passport shell
    hooks/                             # Generate/export behavior
    services/                          # Client-side API fetcher
    server/                            # GitHub REST client, parsers, route handler
    types/                             # Client-facing passport data types
    utils/                             # Browser utility helpers
```

## How The GitHub Data Works

devpassport is REST-first.

The API route calls GitHub REST endpoints for:

- User profile
- Repositories
- Repository languages
- Public organizations
- Public events
- Commit search counts
- Pull request search counts
- Issue search counts

GitHub does not expose the full contribution calendar as a normal REST endpoint. For active days and public contribution totals, devpassport reads the public GitHub contribution calendar markup and falls back to public events when needed.

Some fields are intentionally derived, not native GitHub fields:

- Developer level
- Developer DNA
- Achievements
- Scouting scores
- Playstyles
- Coding habit summaries

These labels are computed from GitHub data and should be treated as product interpretation, not official GitHub fields.

## Authentication

The app can run without a token, but unauthenticated GitHub requests are more limited and rate-limited.

Create `.env.local` if you want better reliability:

```env
GITHUB_TOKEN=your_github_token_here
NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN=your_posthog_project_token
NEXT_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com
```

With a token, the server can make authenticated REST requests. If the token belongs to the same GitHub user being generated, private organization memberships may be visible through the authenticated `/user/orgs` endpoint, depending on token permissions and GitHub account visibility.

Do not expose `GITHUB_TOKEN` to the browser. This project only reads it on the server.

The PostHog variables are optional. When they are missing, the app runs normally and analytics calls become no-ops. Use the US or EU PostHog host from your PostHog project settings.

## Product Analytics

The app keeps Vercel Analytics for page-level traffic and adds PostHog for product behavior.

Tracked PostHog events:

- `passport_generate_started`
- `passport_generated`
- `passport_generate_failed`
- `passport_exported`

Use `passport_generated` to answer "how many passports have been generated?" The event includes aggregate GitHub-derived metrics such as repository count, stars, contributions, active days, developer level, primary language, organization count, and unlocked achievement count. It intentionally does not include the raw GitHub username by default.

## Getting Started

Install dependencies:

```bash
bun install
```

Run the development server:

```bash
bun run dev
```

Open:

```txt
http://localhost:3000
```

Build for production:

```bash
bun run build
```

Start the production build:

```bash
bun run start
```

Run lint:

```bash
bun run lint
```

Run TypeScript directly:

```bash
bun x tsc -p tsconfig.json --noEmit
```

## Scripts

```txt
bun run dev      Start the Next.js development server
bun run build    Create a production build
bun run start    Start the production server
bun run lint     Run ESLint
```

## Deployment

The project is ready for Vercel.

Recommended environment variable:

```env
GITHUB_TOKEN=your_github_token_here
NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN=your_posthog_project_token
NEXT_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com
```

The app includes:

- SEO metadata
- Open Graph metadata
- Twitter card metadata
- JSON-LD structured data
- `robots.txt`
- `sitemap.xml`
- Web app manifest
- Vercel Analytics
- Vercel Speed Insights
- PostHog product analytics

## Notes For Contributors

- Keep GitHub API secrets server-side.
- Keep the App Router API file thin. Put route implementation in `src/features/developer-passport/server`.
- Keep product UI in `src/features/developer-passport/components` where possible.
- Shared visual primitives can live in `src/components`.
- Avoid changing the API response shape unless the UI is updated at the same time.
- The passport and card files are still large and are good candidates for further component extraction.

## License

MIT License. See [LICENSE](./LICENSE).

You can clone it, modify it, ship it, and use it in your own work.
