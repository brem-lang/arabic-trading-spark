<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Rules
- Lead validation lives in `src/lib/lead-schema.ts` and is shared by the browser form and the server function, so client and server checks never drift.
- Leads are sent straight from the browser by `submitLead` (`src/lib/submit-lead.ts`) to the CRM endpoint in `VITE_BASE_ENDPOINT`, with `VITE_BASE_API_KEY` in the `x-api-key` header. The payload shape is built by `toCrmPayload` in `src/lib/lead-schema.ts`.
- The landing page is bilingual: `/` (Arabic, RTL) and `/en` (English, LTR) render one shared `LandingPage`/`LeadQuiz` with per-language copy objects, so both versions stay in sync.
