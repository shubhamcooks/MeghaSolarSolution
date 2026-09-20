# Fixes applied

## ⚠️ Action required before this is safe to use

The code fixes below are in this zip. But **the database fixes are not live
until you apply them to your actual Supabase project.** This repo's SQL
files are just source — Supabase doesn't watch a folder and auto-apply
migrations.

Do one of these:
- **Supabase CLI**: `supabase db push` (applies any migration not yet run
  against your linked project), or
- **Dashboard**: open your project's SQL Editor and run the full contents of
  `supabase/migrations/20260919120000_security_fixes.sql`.

Until you do this, your live database still has the privilege-escalation
trigger and the public data exposure described below.

## Critical security fixes (database)

All in the new migration `supabase/migrations/20260919120000_security_fixes.sql`:

1. **Anyone could register as admin.** The `handle_new_user()` trigger set a
   new profile's role from `raw_user_meta_data->>'role'`, which is
   client-supplied data. The public `/register` page itself only ever sent
   `'customer'`, but anyone with your public anon key could call the
   Supabase Auth signup API directly and pass `role: "admin"` to get full
   admin access instantly. The trigger now always sets `'customer'`;
   promoting someone to staff/admin only happens through an existing admin
   using the Admin → Users page.
2. **The full `applications` table was publicly readable** (`USING (true)`
   for `anon`), exposing every applicant's name, phone, address, and
   electricity consumer number to anyone with the public anon key — not
   just the one record the `/track` page intended to show. Same problem on
   `application_status_history`. Replaced with two `SECURITY DEFINER`
   database functions (`track_application`, `track_application_history`)
   that return only the handful of fields the tracker page displays, for an
   exact application ID or mobile number match. `app/track/page.tsx` now
   calls these instead of querying the tables directly.
3. **Six admin-only tables were writable by any logged-in customer**:
   `solar_calculation_assumptions`, `districts`, `tender_updates`,
   `tender_documents`, `cms_content`, `energy_analysis_reports`. Their
   insert/update/delete policies checked `TO authenticated WITH CHECK (true)`
   instead of checking `role = 'admin'` (or `'staff'` for energy reports).
   Fixed to match the role checks used correctly elsewhere in the schema.
4. **`service_enquiries`** leaked guest (not-logged-in) submissions to any
   authenticated customer instead of staff/admin only.
5. **`password_reset_tokens`** allowed inserting a token row for *any*
   `user_id`, with no ownership check. Restricted to the caller's own id.
   (Not currently exploitable through the app — your actual password reset
   flow correctly uses Supabase Auth's built-in `resetPasswordForEmail` /
   `updateUser`, not this table — but tightened for defense in depth.)
6. **The public application form's own "Submitted" timeline entry was being
   silently dropped.** `application_status_history` only allowed
   staff/admin to insert any row at all, so the very insert the apply form
   made right after submitting was rejected every time (the error wasn't
   surfaced, so it looked fine). Added a narrow policy allowing the initial
   `NEW` entry with no staff attribution.
7. **`audit_logs` was defined twice with incompatible column types** across
   the two original migrations (`details text` vs `jsonb`, `entity_id text`
   vs `uuid`, missing `ip_address`). Because the second migration used
   `CREATE TABLE IF NOT EXISTS`, it silently did nothing — the live table
   kept the first, incompatible-with-your-TypeScript-types version. Brought
   into line via `ALTER TABLE`. (Not yet used by any frontend code, so this
   was dormant rather than actively broken.)

## Functional bugs fixed (application code)

- **Staff accounts couldn't log in.** `app/login/page.tsx` always redirected
  to `/dashboard/customer` after any successful login. That page's access
  guard only allows `customer` and `admin` roles, so a staff member would
  log in successfully and immediately get bounced back to `/login`, with no
  way to reach `/dashboard/staff` except by typing the URL directly. Admins
  had a milder version of the same issue — they'd land on the customer
  dashboard instead of the admin panel. `signIn()` in
  `lib/auth/context.tsx` now returns the user's role, and the login page
  redirects to `/admin`, `/dashboard/staff`, or `/dashboard/customer`
  accordingly. The Navbar's "Dashboard" link had the same admin mix-up
  (linking to the smaller, unlinked `/dashboard/admin` page instead of the
  full `/admin` panel) and is fixed the same way.
- **`app/apply/page.tsx`** inserted the new application, then immediately
  re-queried it by `application_id` to get its `id` for the status-history
  insert. Beyond being an extra round trip, this would silently break for
  anonymous submitters once the public read-everything policy above was
  removed. Now generates the row's UUID client-side (`crypto.randomUUID()`)
  and reuses it directly for both inserts.
- **`app/government-tenders/page.tsx`** mutated the `updates` and
  `documents` state objects directly inside a loop instead of building
  local objects and calling `setUpdates`/`setDocuments`. It happened to
  work today only because the effect runs once against empty initial
  objects — fixed to use local variables.
- **`app/admin/cms/page.tsx`** had a stray
  `declare global { namespace JSX { interface IntrinsicElements { [x: string]: any } } }`
  block that disabled TypeScript's type checking for *every* JSX element in
  the *entire project*, not just this file. Removed; the project still
  compiles cleanly without it.
- Fixed an unescaped apostrophe in `app/about/page.tsx` (an actual ESLint
  error, not just a warning) and added `metadataBase` to
  `app/layout.tsx` so social-share image URLs resolve correctly instead of
  defaulting to `localhost:3000`. Set `NEXT_PUBLIC_SITE_URL` in `.env` to
  your real domain once you have one.

## Not a code bug, but will block your build/dev server

The `node_modules` folder in the original zip was installed on **Windows**
(only `@next/swc-win32-x64-msvc` was present, no Linux/Mac binary), which is
why this environment had to work around it to test the build. Don't ship
`node_modules` at all — it doesn't belong in a zip or in source control.
Delete it, then run:

```
npm install
npm run dev
```

on whatever machine you're actually developing/deploying on, and npm will
fetch the correct binaries for that platform automatically.

## Confirmed fine, not touched

- Every Supabase table name referenced in the code matches the schema
  exactly — no typos.
- TypeScript compiles with zero errors; `npm run build` completes
  successfully (35/35 routes).
- The password reset flow is genuinely secure (Supabase Auth's built-in
  mechanism), despite the unused custom table noted above.
- `lib/supabase/server.ts` (`supabaseAdmin`, the service-role client) isn't
  imported anywhere, so the missing `SUPABASE_SERVICE_ROLE_KEY` isn't
  currently an issue — it's just unused. A placeholder for it is now
  documented in `.env` in case you build a feature that needs it.

## Lower-priority items left as-is

- `app/dashboard/admin/page.tsx` still exists as a smaller, separate admin
  page that nothing links to anymore (the Navbar and login now send admins
  to `/admin`). It still works if visited directly and is still
  correctly role-gated to admins only — just redundant. Left in place
  rather than deleted, since removing pages felt out of scope for a bug-fix
  pass.
- The homepage (`app/page.tsx`) uses plain `<img>` tags rather than
  `next/image`; ESLint flags this as a performance suggestion, not an
  error. Left alone since your `next.config.js` has image optimization
  disabled anyway and changing it would require layout changes I can't
  visually verify here.
- Phone/WhatsApp numbers in `components/layout/FloatingHelp.tsx` and
  `app/contact/page.tsx` are still placeholder text (e.g.
  `[Number to be configured]`) — content for you to fill in, not something
  I could safely invent.
