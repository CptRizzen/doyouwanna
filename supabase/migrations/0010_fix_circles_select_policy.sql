-- The AFTER INSERT trigger that enrols the owner as a circle_members row fires
-- AFTER the INSERT...RETURNING RLS check in PostgREST. This means a brand-new
-- circle owner fails the "is_circle_member" SELECT policy on the RETURNING pass
-- and PostgREST returns 403, even though the insert succeeded.
--
-- Fix: also allow the owner to read the row directly via owner_id so the
-- RETURNING succeeds before the trigger populates circle_members.

drop policy if exists "circles: members read" on public.circles;

create policy "circles: members read"
  on public.circles for select to authenticated
  using (
    owner_id = auth.uid()
    or public.is_circle_member(id, auth.uid())
  );
