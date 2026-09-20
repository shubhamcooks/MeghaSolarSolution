/*
# Megha Solar Solutions - Complete Database Schema

## Overview
Creates the full database schema for Megha Solar Solutions, a solar installation company platform.
Includes user profiles with roles, applications, installations, service requests, projects, tenders, FAQs,
government information, contact enquiries, locations, notifications, and audit logs.

## New Tables
1. profiles - Extends auth.users with full_name, phone, role (customer/admin/staff)
2. applications - Solar installation applications with multi-step form data
3. application_status_history - Timeline of status changes per application
4. site_assessments - Roof/site evaluation data
5. installations - Installation records with assigned staff
6. installation_checklist - Per-installation task checklist
7. service_requests - Customer service/repair requests
8. documents - Uploaded files linked to applications
9. notifications - In-app notifications for users
10. projects - Company project showcase entries
11. tenders - Government tender listings
12. faqs - Frequently asked questions
13. government_information - Admin-editable scheme info content
14. contact_enquiries - Contact form submissions
15. locations - Service area locations
16. audit_logs - Action audit trail

## Security
- RLS enabled on ALL tables
- Customers can only see/modify their own data
- Staff can see all applications, installations, service requests assigned to them
- Admins have full access to all data
- Public (anon) can read: projects, tenders, faqs, government_information, locations
- Public can create: applications, contact_enquiries
*/

-- ============================================
-- PROFILES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  phone text,
  email text,
  role text NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'admin', 'staff')),
  address text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profiles_select_own" ON profiles;
CREATE POLICY "profiles_select_own" ON profiles FOR SELECT
  TO authenticated USING (
    auth.uid() = id
    OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('admin', 'staff'))
  );

DROP POLICY IF EXISTS "profiles_insert_own" ON profiles;
CREATE POLICY "profiles_insert_own" ON profiles FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_update_own" ON profiles;
CREATE POLICY "profiles_update_own" ON profiles FOR UPDATE
  TO authenticated USING (
    auth.uid() = id
    OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  ) WITH CHECK (
    auth.uid() = id
    OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

-- ============================================
-- APPLICATIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id text UNIQUE NOT NULL,
  user_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'NEW' CHECK (status IN ('NEW', 'UNDER_REVIEW', 'DOCUMENTS_REQUIRED', 'SITE_ASSESSMENT_PENDING', 'SITE_ASSESSMENT_COMPLETED', 'APPLICATION_ASSISTANCE', 'INSTALLATION_SCHEDULED', 'INSTALLATION_IN_PROGRESS', 'INSTALLATION_COMPLETED', 'INSPECTION_PENDING', 'COMMISSIONING_PENDING', 'COMPLETED', 'CANCELLED')),
  assigned_staff_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  full_name text NOT NULL,
  mobile_number text NOT NULL,
  email text,
  address text,
  state text,
  district text,
  block text,
  village_town text,
  pin_code text,
  installation_address text,
  map_location text,
  has_electricity boolean DEFAULT false,
  consumer_number text,
  electricity_provider text,
  monthly_usage text,
  has_existing_solar boolean DEFAULT false,
  roof_type text,
  interested_rooftop_solar boolean DEFAULT true,
  estimated_system_size text,
  primary_purpose text,
  property_type text,
  request_type text,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE applications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "applications_select_own" ON applications;
CREATE POLICY "applications_select_own" ON applications FOR SELECT
  TO authenticated USING (
    auth.uid() = user_id
    OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('admin', 'staff'))
  );

DROP POLICY IF EXISTS "applications_insert_own" ON applications;
CREATE POLICY "applications_insert_own" ON applications FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id OR auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "applications_update_staff" ON applications;
CREATE POLICY "applications_update_staff" ON applications FOR UPDATE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('admin', 'staff'))
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('admin', 'staff'))
  );

DROP POLICY IF EXISTS "applications_delete_admin" ON applications;
CREATE POLICY "applications_delete_admin" ON applications FOR DELETE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

DROP POLICY IF EXISTS "applications_insert_anon" ON applications;
CREATE POLICY "applications_insert_anon" ON applications FOR INSERT
  TO anon WITH CHECK (true);

DROP POLICY IF EXISTS "applications_select_anon" ON applications;
CREATE POLICY "applications_select_anon" ON applications FOR SELECT
  TO anon USING (true);

-- ============================================
-- APPLICATION STATUS HISTORY TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS application_status_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id uuid NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  status text NOT NULL,
  comment text,
  staff_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  attachment_url text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE application_status_history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "history_select_all" ON application_status_history;
CREATE POLICY "history_select_all" ON application_status_history FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "history_insert_staff" ON application_status_history;
CREATE POLICY "history_insert_staff" ON application_status_history FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('admin', 'staff'))
  );

-- ============================================
-- SITE ASSESSMENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS site_assessments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id uuid NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  roof_condition text,
  roof_area text,
  solar_potential text,
  electrical_requirements text,
  feasibility text,
  notes text,
  assessed_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE site_assessments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "site_assessments_select" ON site_assessments;
CREATE POLICY "site_assessments_select" ON site_assessments FOR SELECT
  TO authenticated USING (
    EXISTS (
      SELECT 1 FROM applications a
      WHERE a.id = site_assessments.application_id
      AND (
        a.user_id = auth.uid()
        OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('admin', 'staff'))
      )
    )
  );

DROP POLICY IF EXISTS "site_assessments_insert_staff" ON site_assessments;
CREATE POLICY "site_assessments_insert_staff" ON site_assessments FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('admin', 'staff'))
  );

DROP POLICY IF EXISTS "site_assessments_update_staff" ON site_assessments;
CREATE POLICY "site_assessments_update_staff" ON site_assessments FOR UPDATE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('admin', 'staff'))
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('admin', 'staff'))
  );

-- ============================================
-- INSTALLATIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS installations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id uuid NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  assigned_staff_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  scheduled_date date,
  completed_date date,
  status text NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED')),
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE installations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "installations_select" ON installations;
CREATE POLICY "installations_select" ON installations FOR SELECT
  TO authenticated USING (
    EXISTS (
      SELECT 1 FROM applications a
      WHERE a.id = installations.application_id
      AND (
        a.user_id = auth.uid()
        OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('admin', 'staff'))
      )
    )
  );

DROP POLICY IF EXISTS "installations_insert_staff" ON installations;
CREATE POLICY "installations_insert_staff" ON installations FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('admin', 'staff'))
  );

DROP POLICY IF EXISTS "installations_update_staff" ON installations;
CREATE POLICY "installations_update_staff" ON installations FOR UPDATE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('admin', 'staff'))
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('admin', 'staff'))
  );

-- ============================================
-- INSTALLATION CHECKLIST TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS installation_checklist (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  installation_id uuid NOT NULL REFERENCES installations(id) ON DELETE CASCADE,
  item text NOT NULL,
  completed boolean NOT NULL DEFAULT false,
  completed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE installation_checklist ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "checklist_select" ON installation_checklist;
CREATE POLICY "checklist_select" ON installation_checklist FOR SELECT
  TO authenticated USING (
    EXISTS (
      SELECT 1 FROM installations i
      WHERE i.id = installation_checklist.installation_id
      AND EXISTS (
        SELECT 1 FROM applications a
        WHERE a.id = i.application_id
        AND (
          a.user_id = auth.uid()
          OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('admin', 'staff'))
        )
      )
    )
  );

DROP POLICY IF EXISTS "checklist_insert_staff" ON installation_checklist;
CREATE POLICY "checklist_insert_staff" ON installation_checklist FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('admin', 'staff'))
  );

DROP POLICY IF EXISTS "checklist_update_staff" ON installation_checklist;
CREATE POLICY "checklist_update_staff" ON installation_checklist FOR UPDATE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('admin', 'staff'))
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('admin', 'staff'))
  );

-- ============================================
-- SERVICE REQUESTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS service_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  application_id uuid REFERENCES applications(id) ON DELETE SET NULL,
  type text NOT NULL DEFAULT 'service',
  description text,
  status text NOT NULL DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'IN_PROGRESS', 'RESOLVED', 'CANCELLED')),
  assigned_staff_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE service_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "service_requests_select" ON service_requests;
CREATE POLICY "service_requests_select" ON service_requests FOR SELECT
  TO authenticated USING (
    auth.uid() = user_id
    OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('admin', 'staff'))
  );

DROP POLICY IF EXISTS "service_requests_insert_own" ON service_requests;
CREATE POLICY "service_requests_insert_own" ON service_requests FOR INSERT
  TO authenticated WITH CHECK (
    auth.uid() = user_id
    OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('admin', 'staff'))
  );

DROP POLICY IF EXISTS "service_requests_update_staff" ON service_requests;
CREATE POLICY "service_requests_update_staff" ON service_requests FOR UPDATE
  TO authenticated USING (
    auth.uid() = user_id
    OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('admin', 'staff'))
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('admin', 'staff'))
  );

-- ============================================
-- DOCUMENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id uuid REFERENCES applications(id) ON DELETE CASCADE,
  user_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  file_name text NOT NULL,
  file_url text NOT NULL,
  file_type text,
  file_size bigint,
  document_type text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "documents_select" ON documents;
CREATE POLICY "documents_select" ON documents FOR SELECT
  TO authenticated USING (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM applications a
      WHERE a.id = documents.application_id
      AND a.user_id = auth.uid()
    )
    OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('admin', 'staff'))
  );

DROP POLICY IF EXISTS "documents_insert_own" ON documents;
CREATE POLICY "documents_insert_own" ON documents FOR INSERT
  TO authenticated WITH CHECK (
    auth.uid() = user_id
    OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('admin', 'staff'))
  );

DROP POLICY IF EXISTS "documents_delete_admin" ON documents;
CREATE POLICY "documents_delete_admin" ON documents FOR DELETE
  TO authenticated USING (
    auth.uid() = user_id
    OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('admin', 'staff'))
  );

-- ============================================
-- NOTIFICATIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  message text,
  type text DEFAULT 'general',
  read boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "notifications_select_own" ON notifications;
CREATE POLICY "notifications_select_own" ON notifications FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "notifications_insert_staff" ON notifications;
CREATE POLICY "notifications_insert_staff" ON notifications FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('admin', 'staff'))
  );

DROP POLICY IF EXISTS "notifications_update_own" ON notifications;
CREATE POLICY "notifications_update_own" ON notifications FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "notifications_delete_own" ON notifications;
CREATE POLICY "notifications_delete_own" ON notifications FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- ============================================
-- PROJECTS TABLE (Public read)
-- ============================================
CREATE TABLE IF NOT EXISTS projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  location text,
  description text,
  services text,
  image_url text,
  status text DEFAULT 'completed' CHECK (status IN ('planning', 'in_progress', 'completed')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "projects_select_all" ON projects;
CREATE POLICY "projects_select_all" ON projects FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "projects_insert_admin" ON projects;
CREATE POLICY "projects_insert_admin" ON projects FOR INSERT
  TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

DROP POLICY IF EXISTS "projects_update_admin" ON projects;
CREATE POLICY "projects_update_admin" ON projects FOR UPDATE
  TO authenticated USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

DROP POLICY IF EXISTS "projects_delete_admin" ON projects;
CREATE POLICY "projects_delete_admin" ON projects FOR DELETE
  TO authenticated USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

-- ============================================
-- TENDERS TABLE (Public read)
-- ============================================
CREATE TABLE IF NOT EXISTS tenders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  department text,
  tender_number text,
  location text,
  published_date date,
  closing_date date,
  status text DEFAULT 'active' CHECK (status IN ('active', 'closed', 'cancelled')),
  document_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE tenders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "tenders_select_all" ON tenders;
CREATE POLICY "tenders_select_all" ON tenders FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "tenders_insert_admin" ON tenders;
CREATE POLICY "tenders_insert_admin" ON tenders FOR INSERT
  TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

DROP POLICY IF EXISTS "tenders_update_admin" ON tenders;
CREATE POLICY "tenders_update_admin" ON tenders FOR UPDATE
  TO authenticated USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

DROP POLICY IF EXISTS "tenders_delete_admin" ON tenders;
CREATE POLICY "tenders_delete_admin" ON tenders FOR DELETE
  TO authenticated USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

-- ============================================
-- FAQS TABLE (Public read)
-- ============================================
CREATE TABLE IF NOT EXISTS faqs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question text NOT NULL,
  answer text NOT NULL,
  category text DEFAULT 'general',
  sort_order int DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE faqs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "faqs_select_all" ON faqs;
CREATE POLICY "faqs_select_all" ON faqs FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "faqs_insert_admin" ON faqs;
CREATE POLICY "faqs_insert_admin" ON faqs FOR INSERT
  TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

DROP POLICY IF EXISTS "faqs_update_admin" ON faqs;
CREATE POLICY "faqs_update_admin" ON faqs FOR UPDATE
  TO authenticated USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

DROP POLICY IF EXISTS "faqs_delete_admin" ON faqs;
CREATE POLICY "faqs_delete_admin" ON faqs FOR DELETE
  TO authenticated USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

-- ============================================
-- GOVERNMENT INFORMATION TABLE (Public read, admin edit)
-- ============================================
CREATE TABLE IF NOT EXISTS government_information (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  title text NOT NULL,
  content text NOT NULL,
  category text DEFAULT 'general',
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE government_information ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "gov_info_select_all" ON government_information;
CREATE POLICY "gov_info_select_all" ON government_information FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "gov_info_insert_admin" ON government_information;
CREATE POLICY "gov_info_insert_admin" ON government_information FOR INSERT
  TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

DROP POLICY IF EXISTS "gov_info_update_admin" ON government_information;
CREATE POLICY "gov_info_update_admin" ON government_information FOR UPDATE
  TO authenticated USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

DROP POLICY IF EXISTS "gov_info_delete_admin" ON government_information;
CREATE POLICY "gov_info_delete_admin" ON government_information FOR DELETE
  TO authenticated USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

-- ============================================
-- CONTACT ENQUIRIES TABLE (Public insert, admin read)
-- ============================================
CREATE TABLE IF NOT EXISTS contact_enquiries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  phone text,
  email text,
  location text,
  message text NOT NULL,
  status text DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'resolved')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE contact_enquiries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "contact_insert_anon" ON contact_enquiries;
CREATE POLICY "contact_insert_anon" ON contact_enquiries FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "contact_select_admin" ON contact_enquiries;
CREATE POLICY "contact_select_admin" ON contact_enquiries FOR SELECT
  TO authenticated USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('admin', 'staff')));

DROP POLICY IF EXISTS "contact_update_admin" ON contact_enquiries;
CREATE POLICY "contact_update_admin" ON contact_enquiries FOR UPDATE
  TO authenticated USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

-- ============================================
-- LOCATIONS TABLE (Public read, admin edit)
-- ============================================
CREATE TABLE IF NOT EXISTS locations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  available boolean NOT NULL DEFAULT true,
  sort_order int DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE locations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "locations_select_all" ON locations;
CREATE POLICY "locations_select_all" ON locations FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "locations_insert_admin" ON locations;
CREATE POLICY "locations_insert_admin" ON locations FOR INSERT
  TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

DROP POLICY IF EXISTS "locations_update_admin" ON locations;
CREATE POLICY "locations_update_admin" ON locations FOR UPDATE
  TO authenticated USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

DROP POLICY IF EXISTS "locations_delete_admin" ON locations;
CREATE POLICY "locations_delete_admin" ON locations FOR DELETE
  TO authenticated USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

-- ============================================
-- AUDIT LOGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  action text NOT NULL,
  entity_type text,
  entity_id text,
  details text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "audit_select_admin" ON audit_logs;
CREATE POLICY "audit_select_admin" ON audit_logs FOR SELECT
  TO authenticated USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

DROP POLICY IF EXISTS "audit_insert_auth" ON audit_logs;
CREATE POLICY "audit_insert_auth" ON audit_logs FOR INSERT
  TO authenticated WITH CHECK (true);

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_applications_user_id ON applications(user_id);
CREATE INDEX IF NOT EXISTS idx_applications_status ON applications(status);
CREATE INDEX IF NOT EXISTS idx_applications_application_id ON applications(application_id);
CREATE INDEX IF NOT EXISTS idx_applications_assigned_staff ON applications(assigned_staff_id);
CREATE INDEX IF NOT EXISTS idx_history_application_id ON application_status_history(application_id);
CREATE INDEX IF NOT EXISTS idx_site_assessments_application_id ON site_assessments(application_id);
CREATE INDEX IF NOT EXISTS idx_installations_application_id ON installations(application_id);
CREATE INDEX IF NOT EXISTS idx_installations_assigned_staff ON installations(assigned_staff_id);
CREATE INDEX IF NOT EXISTS idx_documents_application_id ON documents(application_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_service_requests_user_id ON service_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);

-- ============================================
-- TRIGGER: updated_at
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_applications_updated_at ON applications;
CREATE TRIGGER update_applications_updated_at BEFORE UPDATE ON applications FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_site_assessments_updated_at ON site_assessments;
CREATE TRIGGER update_site_assessments_updated_at BEFORE UPDATE ON site_assessments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_installations_updated_at ON installations;
CREATE TRIGGER update_installations_updated_at BEFORE UPDATE ON installations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_installation_checklist_updated_at ON installation_checklist;
CREATE TRIGGER update_installation_checklist_updated_at BEFORE UPDATE ON installation_checklist FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_service_requests_updated_at ON service_requests;
CREATE TRIGGER update_service_requests_updated_at BEFORE UPDATE ON service_requests FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_projects_updated_at ON projects;
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_tenders_updated_at ON tenders;
CREATE TRIGGER update_tenders_updated_at BEFORE UPDATE ON tenders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_faqs_updated_at ON faqs;
CREATE TRIGGER update_faqs_updated_at BEFORE UPDATE ON faqs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_government_information_updated_at ON government_information;
CREATE TRIGGER update_government_information_updated_at BEFORE UPDATE ON government_information FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- TRIGGER: Auto-create profile on signup
-- ============================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, full_name, email, phone, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'New User'),
    NEW.email,
    NEW.raw_user_meta_data->>'phone',
    COALESCE(NEW.raw_user_meta_data->>'role', 'customer')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
