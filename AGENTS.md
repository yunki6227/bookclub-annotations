# Agent Instructions

## Project Goal

We are building `bookclub-annotations`, a social PDF annotation MVP. The app should first prove that users can render a PDF, draw annotations on top of pages, save those annotations locally, and reload them accurately.

Do not build social infrastructure until the local PDF annotation loop works well.

## Stack

- Use Next.js App Router.
- Use TypeScript.
- Use React.
- Use strict TypeScript.
- Use browser-based PDF rendering for the MVP.
- Use a canvas-based annotation layer over the rendered PDF page.

## Architecture

- Use clean feature-based architecture.
- Keep business logic out of UI components.
- Keep components small and focused.
- Prefer focused modules with clear ownership over broad shared utilities.
- Avoid dumping unrelated helpers into generic `utils` files.
- Browser-only PDF/canvas code should live in client components or client-side hooks.
- Server/database/storage code should not be imported into client components.

## Suggested Folder Ownership

- `features/reader`: PDF page display, page navigation, reader layout, viewport state.
- `features/annotations`: stroke types, drawing tools, coordinate conversion, serialization, local persistence.
- `features/books`: book and PDF metadata.
- `features/clubs`: future club/group concepts.
- `server/db`: future database schema, repositories, and migrations.
- `server/storage`: future PDF and image storage logic.
- `lib`: small shared helpers that are truly app-wide.

## Annotation Rules

- Store annotation strokes as vector data.
- Do not use transparent PNG images as the source of truth.
- Transparent PNG exports may be added later only as cache, preview, thumbnail, or sharing output.
- Stroke points must use normalized `0` to `1` page coordinates.
- Coordinate conversion between screen pixels and normalized page coordinates should live in one focused module.
- Annotation rendering should map normalized points to the current PDF page viewport.
- Annotation data should be typed with TypeScript domain types.

## Implementation Approach

- Do not overbuild.
- Implement one phase at a time.
- Keep the app runnable after each milestone.
- Keep each milestone small enough to review and test.
- Show diffs clearly when making changes.
- Do not add extra libraries unless they directly support the current milestone.
- Do not add authentication, database, clubs, invites, or realtime collaboration until the local annotation experience works.

## MVP Phase Order

1. Initialize the Next.js app structure.
2. Render a sample PDF page in the browser.
3. Add page navigation.
4. Add a local annotation canvas over the PDF page.
5. Store strokes using normalized coordinates.
6. Save and reload annotations locally.
7. Add mock friend annotation layers.
8. Add Supabase/auth/database/clubs later.
9. Add page-level annotation summaries later.
10. Add realtime collaboration only if needed later.

## Data And Validation

- Validate server and API inputs later with Zod.
- Do not add Supabase until Phase 4 or later.
- Do not design the full production database until the local annotation model is proven.
- When database work begins, use repository-style modules instead of calling the database directly from UI components.

## Quality Bar

- Keep TypeScript strict.
- Prefer readable names over clever abstractions.
- Avoid large components.
- Avoid hidden global state.
- Run lint/build/typecheck commands when available after meaningful changes.
- Fix errors before moving to the next milestone.