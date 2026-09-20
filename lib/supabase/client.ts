'use client';

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

export type ApplicationStatus =
  | 'NEW'
  | 'UNDER_REVIEW'
  | 'DOCUMENTS_REQUIRED'
  | 'SITE_ASSESSMENT_PENDING'
  | 'SITE_ASSESSMENT_COMPLETED'
  | 'APPLICATION_ASSISTANCE'
  | 'INSTALLATION_SCHEDULED'
  | 'INSTALLATION_IN_PROGRESS'
  | 'INSTALLATION_COMPLETED'
  | 'INSPECTION_PENDING'
  | 'COMMISSIONING_PENDING'
  | 'COMPLETED'
  | 'CANCELLED';

export type UserRole = 'customer' | 'admin' | 'staff';

export interface Profile {
  id: string;
  full_name: string;
  phone: string | null;
  email: string | null;
  role: UserRole;
  address: string | null;
  last_login_at: string | null;
  is_suspended: boolean;
  language_preference: string | null;
  notification_preferences: Record<string, boolean> | null;
  created_at: string;
  updated_at: string;
}

export interface Application {
  id: string;
  application_id: string;
  user_id: string | null;
  status: ApplicationStatus;
  assigned_staff_id: string | null;
  full_name: string;
  mobile_number: string;
  email: string | null;
  address: string | null;
  state: string | null;
  district: string | null;
  block: string | null;
  village_town: string | null;
  pin_code: string | null;
  installation_address: string | null;
  map_location: string | null;
  has_electricity: boolean;
  consumer_number: string | null;
  electricity_provider: string | null;
  monthly_usage: string | null;
  has_existing_solar: boolean;
  roof_type: string | null;
  interested_rooftop_solar: boolean;
  estimated_system_size: string | null;
  primary_purpose: string | null;
  property_type: string | null;
  request_type: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface StatusHistory {
  id: string;
  application_id: string;
  status: string;
  comment: string | null;
  staff_id: string | null;
  attachment_url: string | null;
  created_at: string;
}

export interface Project {
  id: string;
  title: string;
  location: string | null;
  description: string | null;
  services: string | null;
  image_url: string | null;
  status: 'planning' | 'in_progress' | 'completed';
  created_at: string;
}

export interface Tender {
  id: string;
  title: string;
  department: string | null;
  tender_number: string | null;
  location: string | null;
  published_date: string | null;
  closing_date: string | null;
  status: 'draft' | 'published' | 'open' | 'closed' | 'awarded' | 'in_progress' | 'completed' | 'archived';
  document_url: string | null;
  reference_number: string | null;
  organization: string | null;
  project_description: string | null;
  submission_deadline: string | null;
  awarded_date: string | null;
  completion_date: string | null;
  internal_notes: string | null;
  is_published: boolean;
  archived_at: string | null;
  created_at?: string;
}

export interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
  sort_order: number;
}

export interface GovInfo {
  id: string;
  key: string;
  title: string;
  content: string;
  category: string;
}

export interface LocationItem {
  id: string;
  name: string;
  description: string | null;
  available: boolean;
  sort_order: number;
}

export interface ContactEnquiry {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  location: string | null;
  message: string;
  status: 'new' | 'contacted' | 'resolved';
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string | null;
  type: string;
  read: boolean;
  created_at: string;
}

export interface ServiceRequest {
  id: string;
  user_id: string | null;
  application_id: string | null;
  type: string;
  service_type: string | null;
  description: string | null;
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CANCELLED';
  assigned_staff_id: string | null;
  created_at: string;
}

export interface Installation {
  id: string;
  application_id: string;
  assigned_staff_id: string | null;
  scheduled_date: string | null;
  completed_date: string | null;
  status: 'PENDING' | 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  notes: string | null;
  created_at: string;
}

export interface ChecklistItem {
  id: string;
  installation_id: string;
  item: string;
  completed: boolean;
  completed_at: string | null;
}

export interface ServiceEnquiry {
  id: string;
  user_id: string | null;
  service_type: string;
  name: string;
  phone: string;
  email: string | null;
  address: string;
  property_type: string | null;
  num_people: number | null;
  hot_water_requirement: string | null;
  preferred_location: string | null;
  message: string | null;
  status: 'pending' | 'contacted' | 'in_progress' | 'completed' | 'cancelled';
  admin_notes: string | null;
  assigned_to: string | null;
  created_at: string;
  updated_at: string;
}

export interface EnergyAnalysis {
  id: string;
  user_id: string;
  status: 'submitted' | 'under_review' | 'verified' | 'report_generated' | 'shared' | 'completed';
  analysis_period_start: string | null;
  analysis_period_end: string | null;
  data_availability_note: string | null;
  admin_notes: string | null;
  assigned_to: string | null;
  verified_by: string | null;
  verified_at: string | null;
  submitted_at: string;
  created_at: string;
  updated_at: string;
}

export interface EnergyBill {
  id: string;
  energy_analysis_id: string;
  billing_month: number;
  billing_year: number;
  units_consumed: number;
  bill_amount: number;
  billing_days: number | null;
  file_url: string | null;
  file_name: string | null;
  is_verified: boolean;
  corrected_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface EnergyAnalysisReport {
  id: string;
  energy_analysis_id: string;
  report_data: Record<string, unknown>;
  charts_data: Record<string, unknown>;
  consumption_trends: Record<string, unknown> | null;
  expenditure_trends: Record<string, unknown> | null;
  estimated_solar_requirement_kw: number | null;
  estimated_annual_generation_kwh: number | null;
  estimated_annual_savings: number | null;
  assumptions: string | null;
  limitations: string | null;
  rd_explanation: string | null;
  is_shared: boolean;
  shared_at: string | null;
  generated_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface SolarCalculation {
  id: string;
  user_id: string;
  name: string | null;
  inputs: Record<string, number | string | boolean>;
  results: Record<string, number | string | boolean>;
  created_at: string;
  updated_at: string;
}

export interface SolarCalculationAssumption {
  id: string;
  label: string;
  key: string;
  value: number;
  unit: string | null;
  description: string | null;
  is_active: boolean;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface District {
  id: string;
  name: string;
  region: string | null;
  coverage_status: 'active_service_area' | 'service_available_on_request' | 'planned_coverage';
  available_services: string[];
  is_active: boolean;
  display_order: number;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface TenderUpdate {
  id: string;
  tender_id: string;
  update_title: string;
  update_text: string;
  is_public: boolean;
  created_by: string | null;
  created_at: string;
}

export interface TenderDocument {
  id: string;
  tender_id: string;
  file_name: string;
  file_url: string;
  file_type: string | null;
  is_public: boolean;
  uploaded_by: string | null;
  created_at: string;
}

export interface PasswordResetToken {
  id: string;
  user_id: string;
  token_hash: string;
  expires_at: string;
  used_at: string | null;
  ip_address: string | null;
  created_at: string;
}

export interface Appointment {
  id: string;
  user_id: string;
  application_id: string | null;
  appointment_type: 'site_assessment' | 'installation' | 'service_visit' | 'consultation';
  scheduled_date: string;
  scheduled_time: string | null;
  location: string | null;
  notes: string | null;
  status: 'scheduled' | 'completed' | 'cancelled' | 'rescheduled';
  assigned_to: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface CmsContent {
  id: string;
  page_key: string;
  section_key: string;
  content_key: string;
  content_value: string | null;
  content_json: Record<string, unknown> | null;
  is_published: boolean;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface AuditLog {
  id: string;
  user_id: string | null;
  action: string;
  entity_type: string | null;
  entity_id: string | null;
  details: Record<string, unknown> | null;
  ip_address: string | null;
  created_at: string;
}
