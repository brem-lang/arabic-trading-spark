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
- Leads are inserted by a public server function using the publishable client under an insert-only anon policy; nobody can read leads from the browser.
- The landing page is bilingual: `/` (Arabic, RTL) and `/en` (English, LTR) render one shared `LandingPage`/`LeadQuiz` with per-language copy objects, so both versions stay in sync.
