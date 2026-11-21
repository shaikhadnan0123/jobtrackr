-- ==============================================================================
-- JobTrackr - Supabase PostgreSQL Schema
-- ==============================================================================
-- Run this in your Supabase SQL Editor (https://supabase.com/dashboard/project/_/sql)

-- 1. Create applications table
CREATE TABLE IF NOT EXISTS public.applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company TEXT NOT NULL,
    role TEXT NOT NULL,
    location TEXT NOT NULL DEFAULT 'Hyderabad', -- Hyderabad, Bengaluru, Gurgaon, Pune, Noida, Remote, etc.
    job_type TEXT NOT NULL DEFAULT 'ML',        -- ML, GenAI, Data, SDE, Full Stack, Other
    employment_type TEXT NOT NULL DEFAULT 'Intern', -- Intern, Full-time, Contract
    portal_name TEXT NOT NULL DEFAULT 'LinkedIn',   -- LinkedIn, Cutshort, Internshala, Company Career Page, Naukri, Other
    portal_link TEXT DEFAULT '',
    apply_link TEXT DEFAULT '',
    salary_text TEXT DEFAULT '',               -- e.g. "30k/mo stipend" or "12-15 LPA"
    date_applied DATE DEFAULT CURRENT_DATE,
    deadline DATE,
    follow_up_date DATE,
    status TEXT NOT NULL DEFAULT 'Applied',     -- Wishlist, Applied, OA/Test, Interview, Offer, Rejected, Ghosted
    response_status TEXT NOT NULL DEFAULT 'No Response', -- No Response, Replied, Shortlisted, Rejected
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    screenshot_jd_url TEXT DEFAULT '',
    screenshot_applied_url TEXT DEFAULT '',
    resume_version TEXT DEFAULT '',             -- e.g. "ML Intern CV v2"
    referral TEXT DEFAULT '',                   -- Referral name/contact if any
    notes TEXT DEFAULT '',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2. Create timeline table for status & event history
CREATE TABLE IF NOT EXISTS public.timeline (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id UUID NOT NULL REFERENCES public.applications(id) ON DELETE CASCADE,
    note TEXT NOT NULL,
    status_changed_to TEXT DEFAULT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 3. Indexes for fast dashboard and table queries
CREATE INDEX IF NOT EXISTS idx_applications_status ON public.applications(status);
CREATE INDEX IF NOT EXISTS idx_applications_is_active ON public.applications(is_active);
CREATE INDEX IF NOT EXISTS idx_applications_follow_up_date ON public.applications(follow_up_date);
CREATE INDEX IF NOT EXISTS idx_applications_date_applied ON public.applications(date_applied DESC);
CREATE INDEX IF NOT EXISTS idx_timeline_application_id ON public.timeline(application_id);

-- 4. Automatic updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS trigger_update_applications_updated_at ON public.applications;
CREATE TRIGGER trigger_update_applications_updated_at
    BEFORE UPDATE ON public.applications
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ==============================================================================
-- Storage Bucket Setup for Screenshots:
-- In Supabase Storage, create a public bucket named `screenshots`.
-- Policy: Allow authenticated / public read, and allow upload.
-- ==============================================================================
