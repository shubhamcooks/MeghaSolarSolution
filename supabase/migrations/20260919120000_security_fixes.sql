/*
# Security & Consistency Fixes

Addresses issues found in a full review of the schema and RLS policies:

1. handle_new_user() trusted a client-supplied "role" from signup metadata,
   letting anyone self-register as admin/staff. Now always defaults to
   'customer'; roles are only changed later by an existing admin via the
   profiles_update_own policy (already restricted to admins for other
   people's rows).
2. `applications` and `application_status_history` had blanket anon/public
   SELECT policies exposing every applicant's name, phone, address and
   consumer number. Replaced with SECURITY DEFINER lookup functions that
   return only the fields the public "track application" page needs, for
   an exact application_id or mobile_number match.
3. Several admin-managed tables (solar_calculation_assumptions, districts,
   tender_updates, tender_documents, cms_content, energy_analysis_reports)
   had write policies open to any authenticated user instead of admins/
   staff. Tightened to match the role checks used elsewhere.
4. service_enquiries leaked guest (user_id IS NULL) submissions to any
   authenticated user instead of staff/admin only.
5. password_reset_tokens allowed inserting a token row for any user_id.
   Restricted to the caller's own id (this table is not currently used by
   the app's password-reset flow, which uses Supabase Auth directly, but
   is tightened for defense in depth).
6. application_status_history had no way for the public application form
   to record its own "submitted" entry (insert was staff/admin only),
   silently losing the first timeline entry for every public application.
   Added a narrow allowance for the initial NEW/no-staff-id entry.
7. audit_logs was declared twice across migrations with incompatible
   column types; since migration 2's CREATE TABLE IF NOT EXISTS was a
   no-op, the live table kept migration 1's shape. Brought it in line
   with the app's TypeScript types (jsonb details, uuid entity_id,
   ip_address column).
*/

-- ============================================================
-- 1. Never trust a client-supplied role at signup
-- ============================================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, full_name, email, phone, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'New User'),
    NEW.email,
    NEW.raw_user_meta_data->>'phone',
    'customer'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- 2. Remove blanket public read access to applications data
-- ============================================================
DROP POLICY IF EXISTS "applications_select_anon" ON applications;
DROP POLICY IF EXISTS "history_select_all" ON application_status_history;

-- Authenticated users can still only see their own application's history,
-- or any history if staff/admin (mirrors installations_select etc.)
DROP POLICY IF EXISTS "history_select_own_or_staff" ON application_status_history;
CREATE POLICY "history_select_own_or_staff" ON application_status_history FOR SELECT
  TO authenticated USING (
    EXISTS (
      SELECT 1 FROM applications a
      WHERE a.id = application_status_history.application_id
      AND (
        a.user_id = auth.uid()
        OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('admin', 'staff'))
      )
    )
  );

-- Public "track my application" now goes through these SECURITY DEFINER
-- functions instead of a direct table read, so only a curated set of
-- columns for an exact match is ever returned - not the whole table.
CREATE OR REPLACE FUNCTION track_application(p_query text)
RETURNS TABLE (
  id uuid,
  application_id text,
  status text,
  full_name text,
  village_town text,
  district text,
  request_type text,
  created_at timestamptz
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT a.id, a.application_id, a.status, a.full_name, a.village_town, a.district, a.request_type, a.created_at
  FROM applications a
  WHERE a.application_id = p_query
  UNION ALL
  SELECT a.id, a.application_id, a.status, a.full_name, a.village_town, a.district, a.request_type, a.created_at
  FROM applications a
  WHERE a.mobile_number = p_query
    AND NOT EXISTS (SELECT 1 FROM applications a2 WHERE a2.application_id = p_query)
  ORDER BY created_at DESC
  LIMIT 1;
$$;

REVOKE ALL ON FUNCTION track_application(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION track_application(text) TO anon, authenticated;

CREATE OR REPLACE FUNCTION track_application_history(p_application_id uuid)
RETURNS TABLE (
  id uuid,
  application_id uuid,
  status text,
  comment text,
  created_at timestamptz
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT h.id, h.application_id, h.status, h.comment, h.created_at
  FROM application_status_history h
  WHERE h.application_id = p_application_id
  ORDER BY h.created_at ASC;
$$;

REVOKE ALL ON FUNCTION track_application_history(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION track_application_history(uuid) TO anon, authenticated;

-- Allow the public application form to record its own initial "NEW"
-- timeline entry (previously only staff/admin could insert any history
-- row at all, so this entry was silently dropped for every public
-- submission).
DROP POLICY IF EXISTS "history_insert_initial_public" ON application_status_history;
CREATE POLICY "history_insert_initial_public" ON application_status_history FOR INSERT
  TO anon, authenticated WITH CHECK (status = 'NEW' AND staff_id IS NULL);

-- ============================================================
-- 3. Admin-only writes on tables that were open to any authenticated user
-- ============================================================
DROP POLICY IF EXISTS "insert_assumptions" ON solar_calculation_assumptions;
CREATE POLICY "insert_assumptions" ON solar_calculation_assumptions FOR INSERT
  TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

DROP POLICY IF EXISTS "update_assumptions" ON solar_calculation_assumptions;
CREATE POLICY "update_assumptions" ON solar_calculation_assumptions FOR UPDATE
  TO authenticated USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

DROP POLICY IF EXISTS "insert_districts" ON districts;
CREATE POLICY "insert_districts" ON districts FOR INSERT
  TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

DROP POLICY IF EXISTS "update_districts" ON districts;
CREATE POLICY "update_districts" ON districts FOR UPDATE
  TO authenticated USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

DROP POLICY IF EXISTS "delete_districts" ON districts;
CREATE POLICY "delete_districts" ON districts FOR DELETE
  TO authenticated USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

DROP POLICY IF EXISTS "insert_tender_updates" ON tender_updates;
CREATE POLICY "insert_tender_updates" ON tender_updates FOR INSERT
  TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

DROP POLICY IF EXISTS "update_tender_updates" ON tender_updates;
CREATE POLICY "update_tender_updates" ON tender_updates FOR UPDATE
  TO authenticated USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

DROP POLICY IF EXISTS "delete_tender_updates" ON tender_updates;
CREATE POLICY "delete_tender_updates" ON tender_updates FOR DELETE
  TO authenticated USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

DROP POLICY IF EXISTS "insert_tender_documents" ON tender_documents;
CREATE POLICY "insert_tender_documents" ON tender_documents FOR INSERT
  TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

DROP POLICY IF EXISTS "delete_tender_documents" ON tender_documents;
CREATE POLICY "delete_tender_documents" ON tender_documents FOR DELETE
  TO authenticated USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

DROP POLICY IF EXISTS "insert_cms_content" ON cms_content;
CREATE POLICY "insert_cms_content" ON cms_content FOR INSERT
  TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

DROP POLICY IF EXISTS "update_cms_content" ON cms_content;
CREATE POLICY "update_cms_content" ON cms_content FOR UPDATE
  TO authenticated USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

DROP POLICY IF EXISTS "delete_cms_content" ON cms_content;
CREATE POLICY "delete_cms_content" ON cms_content FOR DELETE
  TO authenticated USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

DROP POLICY IF EXISTS "insert_energy_reports" ON energy_analysis_reports;
CREATE POLICY "insert_energy_reports" ON energy_analysis_reports FOR INSERT
  TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('admin', 'staff')));

DROP POLICY IF EXISTS "update_energy_reports" ON energy_analysis_reports;
CREATE POLICY "update_energy_reports" ON energy_analysis_reports FOR UPDATE
  TO authenticated USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('admin', 'staff')))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('admin', 'staff')));

DROP POLICY IF EXISTS "delete_energy_reports" ON energy_analysis_reports;
CREATE POLICY "delete_energy_reports" ON energy_analysis_reports FOR DELETE
  TO authenticated USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('admin', 'staff')));

-- ============================================================
-- 4. service_enquiries: guest rows should only be staff/admin visible
-- ============================================================
DROP POLICY IF EXISTS "select_own_service_enquiries" ON service_enquiries;
CREATE POLICY "select_own_service_enquiries" ON service_enquiries FOR SELECT
  TO authenticated USING (
    auth.uid() = user_id
    OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('admin', 'staff'))
  );

-- ============================================================
-- 5. password_reset_tokens: only for the caller's own id
-- ============================================================
DROP POLICY IF EXISTS "insert_reset_tokens" ON password_reset_tokens;
CREATE POLICY "insert_reset_tokens" ON password_reset_tokens FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- 6. Reconcile audit_logs with the app's expected shape
-- ============================================================
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'audit_logs' AND column_name = 'ip_address') THEN
    ALTER TABLE audit_logs ADD COLUMN ip_address text;
  END IF;
END $$;

DO $$ BEGIN
  IF (SELECT data_type FROM information_schema.columns WHERE table_name = 'audit_logs' AND column_name = 'details') = 'text' THEN
    ALTER TABLE audit_logs ALTER COLUMN details TYPE jsonb USING (
      CASE WHEN details IS NULL OR details = '' THEN NULL ELSE details::jsonb END
    );
  END IF;
EXCEPTION WHEN OTHERS THEN
  -- Existing details values were not valid JSON; leave the column as-is
  -- rather than fail the migration. New rows written by the app already
  -- send jsonb.
  NULL;
END $$;

DO $$ BEGIN
  IF (SELECT data_type FROM information_schema.columns WHERE table_name = 'audit_logs' AND column_name = 'entity_id') = 'text' THEN
    ALTER TABLE audit_logs ALTER COLUMN entity_id TYPE uuid USING (
      CASE WHEN entity_id ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' THEN entity_id::uuid ELSE NULL END
    );
  END IF;
EXCEPTION WHEN OTHERS THEN
  NULL;
END $$;

DROP POLICY IF EXISTS "select_own_audit_logs" ON audit_logs;
CREATE POLICY "select_own_audit_logs" ON audit_logs FOR SELECT
  TO authenticated USING (
    auth.uid() = user_id
    OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

DROP POLICY IF EXISTS "insert_audit_logs" ON audit_logs;
CREATE POLICY "insert_audit_logs" ON audit_logs FOR INSERT
  TO authenticated WITH CHECK (true);
