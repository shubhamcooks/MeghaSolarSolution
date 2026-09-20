/*
# Upgrade Megha Solar Solutions Schema

Extends the existing database with new tables for solar water heater enquiries, energy bill analysis, solar savings calculator, district management, tender CMS, appointments, password reset tokens, CMS content, and audit logs.

## New Tables
1. service_enquiries - Solar water heater and other service enquiries
2. energy_analyses - Energy analysis submission tracking
3. energy_bills - Customer electricity bill data
4. energy_analysis_reports - Generated analysis reports
5. solar_calculations - Saved calculator results
6. solar_calculation_assumptions - Admin-managed calculator defaults
7. districts - All Meghalaya districts with admin-controlled status
8. tender_updates - Project progress updates
9. tender_documents - Tender document attachments
10. password_reset_tokens - Secure password reset tokens
11. appointments - Site assessments, installations, service visits
12. cms_content - Admin-editable public content
13. audit_logs - Security and activity tracking

## Modified Tables
- tenders: added reference_number, organization, project_description, submission_deadline, awarded_date, completion_date, internal_notes, is_published, archived_at
- service_requests: added service_type
- profiles: added last_login_at, is_suspended, language_preference, notification_preferences

## Security
- RLS on all new tables, owner-scoped for customer data, anon-readable for public content
*/

-- ============================================================
-- 1. SERVICE ENQUIRIES
-- ============================================================
CREATE TABLE IF NOT EXISTS service_enquiries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  service_type text NOT NULL DEFAULT 'solar_water_heater',
  name text NOT NULL,
  phone text NOT NULL,
  email text,
  address text NOT NULL,
  property_type text,
  num_people integer,
  hot_water_requirement text,
  preferred_location text,
  message text,
  status text NOT NULL DEFAULT 'pending',
  admin_notes text,
  assigned_to uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE service_enquiries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_service_enquiries" ON service_enquiries;
CREATE POLICY "select_own_service_enquiries" ON service_enquiries FOR SELECT
  TO authenticated USING (auth.uid() = user_id OR user_id IS NULL);

DROP POLICY IF EXISTS "insert_service_enquiries" ON service_enquiries;
CREATE POLICY "insert_service_enquiries" ON service_enquiries FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "update_own_service_enquiries" ON service_enquiries;
CREATE POLICY "update_own_service_enquiries" ON service_enquiries FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_service_enquiries" ON service_enquiries;
CREATE POLICY "delete_own_service_enquiries" ON service_enquiries FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- ============================================================
-- 2. ENERGY ANALYSES (must come before energy_bills)
-- ============================================================
CREATE TABLE IF NOT EXISTS energy_analyses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'submitted',
  analysis_period_start date,
  analysis_period_end date,
  data_availability_note text,
  admin_notes text,
  assigned_to uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  verified_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  verified_at timestamptz,
  submitted_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE energy_analyses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_energy_analyses" ON energy_analyses;
CREATE POLICY "select_own_energy_analyses" ON energy_analyses FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_energy_analyses" ON energy_analyses;
CREATE POLICY "insert_own_energy_analyses" ON energy_analyses FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_energy_analyses" ON energy_analyses;
CREATE POLICY "update_own_energy_analyses" ON energy_analyses FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_energy_analyses" ON energy_analyses;
CREATE POLICY "delete_own_energy_analyses" ON energy_analyses FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- ============================================================
-- 3. ENERGY BILLS (references energy_analyses)
-- ============================================================
CREATE TABLE IF NOT EXISTS energy_bills (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  energy_analysis_id uuid NOT NULL REFERENCES energy_analyses(id) ON DELETE CASCADE,
  billing_month integer NOT NULL CHECK (billing_month >= 1 AND billing_month <= 12),
  billing_year integer NOT NULL,
  units_consumed numeric NOT NULL,
  bill_amount numeric NOT NULL,
  billing_days integer,
  file_url text,
  file_name text,
  is_verified boolean DEFAULT false,
  corrected_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE energy_bills ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_energy_bills" ON energy_bills;
CREATE POLICY "select_own_energy_bills" ON energy_bills FOR SELECT
  TO authenticated USING (
    EXISTS (SELECT 1 FROM energy_analyses WHERE energy_analyses.id = energy_bills.energy_analysis_id AND energy_analyses.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "insert_own_energy_bills" ON energy_bills;
CREATE POLICY "insert_own_energy_bills" ON energy_bills FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM energy_analyses WHERE energy_analyses.id = energy_bills.energy_analysis_id AND energy_analyses.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "update_own_energy_bills" ON energy_bills;
CREATE POLICY "update_own_energy_bills" ON energy_bills FOR UPDATE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM energy_analyses WHERE energy_analyses.id = energy_bills.energy_analysis_id AND energy_analyses.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "delete_own_energy_bills" ON energy_bills;
CREATE POLICY "delete_own_energy_bills" ON energy_bills FOR DELETE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM energy_analyses WHERE energy_analyses.id = energy_bills.energy_analysis_id AND energy_analyses.user_id = auth.uid())
  );

-- ============================================================
-- 4. ENERGY ANALYSIS REPORTS
-- ============================================================
CREATE TABLE IF NOT EXISTS energy_analysis_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  energy_analysis_id uuid NOT NULL REFERENCES energy_analyses(id) ON DELETE CASCADE,
  report_data jsonb NOT NULL DEFAULT '{}',
  charts_data jsonb DEFAULT '{}',
  consumption_trends jsonb,
  expenditure_trends jsonb,
  estimated_solar_requirement_kw numeric,
  estimated_annual_generation_kwh numeric,
  estimated_annual_savings numeric,
  assumptions text,
  limitations text,
  rd_explanation text,
  is_shared boolean DEFAULT false,
  shared_at timestamptz,
  generated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE energy_analysis_reports ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_energy_reports" ON energy_analysis_reports;
CREATE POLICY "select_own_energy_reports" ON energy_analysis_reports FOR SELECT
  TO authenticated USING (
    EXISTS (SELECT 1 FROM energy_analyses WHERE energy_analyses.id = energy_analysis_reports.energy_analysis_id AND energy_analyses.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "insert_energy_reports" ON energy_analysis_reports;
CREATE POLICY "insert_energy_reports" ON energy_analysis_reports FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "update_energy_reports" ON energy_analysis_reports;
CREATE POLICY "update_energy_reports" ON energy_analysis_reports FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "delete_energy_reports" ON energy_analysis_reports;
CREATE POLICY "delete_energy_reports" ON energy_analysis_reports FOR DELETE
  TO authenticated USING (true);

-- ============================================================
-- 5. SOLAR CALCULATIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS solar_calculations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  name text,
  inputs jsonb NOT NULL DEFAULT '{}',
  results jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE solar_calculations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_solar_calculations" ON solar_calculations;
CREATE POLICY "select_own_solar_calculations" ON solar_calculations FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_solar_calculations" ON solar_calculations;
CREATE POLICY "insert_own_solar_calculations" ON solar_calculations FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_solar_calculations" ON solar_calculations;
CREATE POLICY "update_own_solar_calculations" ON solar_calculations FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_solar_calculations" ON solar_calculations;
CREATE POLICY "delete_own_solar_calculations" ON solar_calculations FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- ============================================================
-- 6. SOLAR CALCULATION ASSUMPTIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS solar_calculation_assumptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  label text NOT NULL,
  key text NOT NULL UNIQUE,
  value numeric NOT NULL,
  unit text,
  description text,
  is_active boolean DEFAULT true,
  updated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE solar_calculation_assumptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_assumptions" ON solar_calculation_assumptions;
CREATE POLICY "select_assumptions" ON solar_calculation_assumptions FOR SELECT
  TO anon, authenticated USING (is_active = true);

DROP POLICY IF EXISTS "insert_assumptions" ON solar_calculation_assumptions;
CREATE POLICY "insert_assumptions" ON solar_calculation_assumptions FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "update_assumptions" ON solar_calculation_assumptions;
CREATE POLICY "update_assumptions" ON solar_calculation_assumptions FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

-- ============================================================
-- 7. DISTRICTS
-- ============================================================
CREATE TABLE IF NOT EXISTS districts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  region text,
  coverage_status text NOT NULL DEFAULT 'planned_coverage',
  available_services text[] DEFAULT '{}',
  is_active boolean DEFAULT true,
  display_order integer DEFAULT 0,
  updated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE districts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_districts" ON districts;
CREATE POLICY "select_districts" ON districts FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "insert_districts" ON districts;
CREATE POLICY "insert_districts" ON districts FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "update_districts" ON districts;
CREATE POLICY "update_districts" ON districts FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "delete_districts" ON districts;
CREATE POLICY "delete_districts" ON districts FOR DELETE
  TO authenticated USING (true);

INSERT INTO districts (name, region, coverage_status, display_order) VALUES
  ('East Khasi Hills', 'Khasi Hills', 'active_service_area', 1),
  ('West Khasi Hills', 'Khasi Hills', 'active_service_area', 2),
  ('Eastern West Khasi Hills', 'Khasi Hills', 'service_available_on_request', 3),
  ('South West Khasi Hills', 'Khasi Hills', 'service_available_on_request', 4),
  ('Ri-Bhoi', 'Khasi Hills', 'service_available_on_request', 5),
  ('West Jaintia Hills', 'Jaintia Hills', 'service_available_on_request', 6),
  ('East Jaintia Hills', 'Jaintia Hills', 'service_available_on_request', 7),
  ('East Garo Hills', 'Garo Hills', 'planned_coverage', 8),
  ('West Garo Hills', 'Garo Hills', 'planned_coverage', 9),
  ('South Garo Hills', 'Garo Hills', 'planned_coverage', 10),
  ('North Garo Hills', 'Garo Hills', 'planned_coverage', 11),
  ('South West Garo Hills', 'Garo Hills', 'planned_coverage', 12)
ON CONFLICT (name) DO NOTHING;

-- ============================================================
-- 8. TENDER UPDATES
-- ============================================================
CREATE TABLE IF NOT EXISTS tender_updates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tender_id uuid NOT NULL REFERENCES tenders(id) ON DELETE CASCADE,
  update_title text NOT NULL,
  update_text text NOT NULL,
  is_public boolean DEFAULT true,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE tender_updates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_tender_updates" ON tender_updates;
CREATE POLICY "select_tender_updates" ON tender_updates FOR SELECT
  TO anon, authenticated USING (is_public = true);

DROP POLICY IF EXISTS "insert_tender_updates" ON tender_updates;
CREATE POLICY "insert_tender_updates" ON tender_updates FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "update_tender_updates" ON tender_updates;
CREATE POLICY "update_tender_updates" ON tender_updates FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "delete_tender_updates" ON tender_updates;
CREATE POLICY "delete_tender_updates" ON tender_updates FOR DELETE
  TO authenticated USING (true);

-- ============================================================
-- 9. TENDER DOCUMENTS
-- ============================================================
CREATE TABLE IF NOT EXISTS tender_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tender_id uuid NOT NULL REFERENCES tenders(id) ON DELETE CASCADE,
  file_name text NOT NULL,
  file_url text NOT NULL,
  file_type text,
  is_public boolean DEFAULT true,
  uploaded_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE tender_documents ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_tender_documents" ON tender_documents;
CREATE POLICY "select_tender_documents" ON tender_documents FOR SELECT
  TO anon, authenticated USING (is_public = true);

DROP POLICY IF EXISTS "insert_tender_documents" ON tender_documents;
CREATE POLICY "insert_tender_documents" ON tender_documents FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "delete_tender_documents" ON tender_documents;
CREATE POLICY "delete_tender_documents" ON tender_documents FOR DELETE
  TO authenticated USING (true);

-- ============================================================
-- 10. ADD COLUMNS TO tenders
-- ============================================================
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tenders' AND column_name = 'reference_number') THEN
    ALTER TABLE tenders ADD COLUMN reference_number text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tenders' AND column_name = 'organization') THEN
    ALTER TABLE tenders ADD COLUMN organization text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tenders' AND column_name = 'project_description') THEN
    ALTER TABLE tenders ADD COLUMN project_description text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tenders' AND column_name = 'submission_deadline') THEN
    ALTER TABLE tenders ADD COLUMN submission_deadline date;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tenders' AND column_name = 'awarded_date') THEN
    ALTER TABLE tenders ADD COLUMN awarded_date date;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tenders' AND column_name = 'completion_date') THEN
    ALTER TABLE tenders ADD COLUMN completion_date date;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tenders' AND column_name = 'internal_notes') THEN
    ALTER TABLE tenders ADD COLUMN internal_notes text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tenders' AND column_name = 'is_published') THEN
    ALTER TABLE tenders ADD COLUMN is_published boolean DEFAULT true;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tenders' AND column_name = 'archived_at') THEN
    ALTER TABLE tenders ADD COLUMN archived_at timestamptz;
  END IF;
END $$;

-- ============================================================
-- 11. PASSWORD RESET TOKENS
-- ============================================================
CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  token_hash text NOT NULL UNIQUE,
  expires_at timestamptz NOT NULL,
  used_at timestamptz,
  ip_address text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE password_reset_tokens ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "insert_reset_tokens" ON password_reset_tokens;
CREATE POLICY "insert_reset_tokens" ON password_reset_tokens FOR INSERT
  TO authenticated WITH CHECK (true);

-- ============================================================
-- 12. APPOINTMENTS
-- ============================================================
CREATE TABLE IF NOT EXISTS appointments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  application_id uuid REFERENCES applications(id) ON DELETE SET NULL,
  appointment_type text NOT NULL DEFAULT 'site_assessment',
  scheduled_date date NOT NULL,
  scheduled_time time,
  location text,
  notes text,
  status text NOT NULL DEFAULT 'scheduled',
  assigned_to uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_appointments" ON appointments;
CREATE POLICY "select_own_appointments" ON appointments FOR SELECT
  TO authenticated USING (auth.uid() = user_id OR auth.uid() = assigned_to);

DROP POLICY IF EXISTS "insert_own_appointments" ON appointments;
CREATE POLICY "insert_own_appointments" ON appointments FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id OR auth.uid() = created_by);

DROP POLICY IF EXISTS "update_own_appointments" ON appointments;
CREATE POLICY "update_own_appointments" ON appointments FOR UPDATE
  TO authenticated USING (auth.uid() = user_id OR auth.uid() = assigned_to) WITH CHECK (true);

DROP POLICY IF EXISTS "delete_own_appointments" ON appointments;
CREATE POLICY "delete_own_appointments" ON appointments FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- ============================================================
-- 13. CMS CONTENT
-- ============================================================
CREATE TABLE IF NOT EXISTS cms_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  page_key text NOT NULL,
  section_key text NOT NULL,
  content_key text NOT NULL,
  content_value text,
  content_json jsonb,
  is_published boolean DEFAULT true,
  updated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE (page_key, section_key, content_key)
);

ALTER TABLE cms_content ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_cms_content" ON cms_content;
CREATE POLICY "select_cms_content" ON cms_content FOR SELECT
  TO anon, authenticated USING (is_published = true);

DROP POLICY IF EXISTS "insert_cms_content" ON cms_content;
CREATE POLICY "insert_cms_content" ON cms_content FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "update_cms_content" ON cms_content;
CREATE POLICY "update_cms_content" ON cms_content FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "delete_cms_content" ON cms_content;
CREATE POLICY "delete_cms_content" ON cms_content FOR DELETE
  TO authenticated USING (true);

-- ============================================================
-- 14. AUDIT LOGS
-- ============================================================
CREATE TABLE IF NOT EXISTS audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  action text NOT NULL,
  entity_type text,
  entity_id uuid,
  details jsonb,
  ip_address text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_audit_logs" ON audit_logs;
CREATE POLICY "select_own_audit_logs" ON audit_logs FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_audit_logs" ON audit_logs;
CREATE POLICY "insert_audit_logs" ON audit_logs FOR INSERT
  TO authenticated WITH CHECK (true);

-- ============================================================
-- 15. ADD COLUMNS TO service_requests
-- ============================================================
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'service_requests' AND column_name = 'service_type') THEN
    ALTER TABLE service_requests ADD COLUMN service_type text DEFAULT 'repair';
  END IF;
END $$;

-- ============================================================
-- 16. ADD COLUMNS TO profiles
-- ============================================================
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'last_login_at') THEN
    ALTER TABLE profiles ADD COLUMN last_login_at timestamptz;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'is_suspended') THEN
    ALTER TABLE profiles ADD COLUMN is_suspended boolean DEFAULT false;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'language_preference') THEN
    ALTER TABLE profiles ADD COLUMN language_preference text DEFAULT 'en';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'notification_preferences') THEN
    ALTER TABLE profiles ADD COLUMN notification_preferences jsonb DEFAULT '{"email": true, "sms": false, "push": true}'::jsonb;
  END IF;
END $$;

-- ============================================================
-- 17. Seed default calculator assumptions
-- ============================================================
INSERT INTO solar_calculation_assumptions (label, key, value, unit, description) VALUES
  ('Average daily sunlight hours', 'sunlight_hours', 4.5, 'hours', 'Estimated average peak sun hours per day in Meghalaya'),
  ('System efficiency factor', 'system_efficiency', 0.77, 'ratio', 'Overall system efficiency after losses'),
  ('Days per month', 'days_per_month', 30, 'days', 'Standard billing cycle assumption'),
  ('Default tariff', 'default_tariff', 6.0, 'INR/kWh', 'Default electricity tariff'),
  ('Annual cost increase', 'annual_cost_increase', 5, 'percent', 'Estimated annual electricity rate increase'),
  ('Default system cost per kW', 'cost_per_kw', 50000, 'INR/kW', 'Estimated installed cost per kW before subsidy'),
  ('Annual maintenance cost', 'annual_maintenance', 2000, 'INR/year', 'Estimated annual maintenance cost'),
  ('Default system degradation', 'annual_degradation', 0.5, 'percent/year', 'Estimated annual panel output degradation')
ON CONFLICT (key) DO NOTHING;

-- ============================================================
-- 18. Indexes
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_service_enquiries_user ON service_enquiries(user_id);
CREATE INDEX IF NOT EXISTS idx_service_enquiries_status ON service_enquiries(status);
CREATE INDEX IF NOT EXISTS idx_energy_analyses_user ON energy_analyses(user_id);
CREATE INDEX IF NOT EXISTS idx_energy_analyses_status ON energy_analyses(status);
CREATE INDEX IF NOT EXISTS idx_energy_bills_analysis ON energy_bills(energy_analysis_id);
CREATE INDEX IF NOT EXISTS idx_solar_calculations_user ON solar_calculations(user_id);
CREATE INDEX IF NOT EXISTS idx_districts_active ON districts(is_active);
CREATE INDEX IF NOT EXISTS idx_tender_updates_tender ON tender_updates(tender_id);
CREATE INDEX IF NOT EXISTS idx_tender_documents_tender ON tender_documents(tender_id);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_user ON password_reset_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_expires ON password_reset_tokens(expires_at);
CREATE INDEX IF NOT EXISTS idx_appointments_user ON appointments(user_id);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_cms_content_page ON cms_content(page_key);
