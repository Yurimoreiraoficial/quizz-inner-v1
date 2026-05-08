
-- Funnels
CREATE TABLE public.funnels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  status text NOT NULL DEFAULT 'draft',
  format text NOT NULL DEFAULT 'quiz',
  public_url text,
  checkout_url text,
  whatsapp_number text,
  whatsapp_message text,
  meta_pixel_id text,
  google_tag_id text,
  gtm_id text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.funnel_screens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  funnel_id uuid NOT NULL REFERENCES public.funnels(id) ON DELETE CASCADE,
  screen_key text NOT NULL,
  order_index integer NOT NULL DEFAULT 0,
  name text NOT NULL,
  type text NOT NULL,
  status text NOT NULL DEFAULT 'active',
  content jsonb NOT NULL DEFAULT '{}'::jsonb,
  cta jsonb NOT NULL DEFAULT '{}'::jsonb,
  events jsonb NOT NULL DEFAULT '{}'::jsonb,
  pixels jsonb NOT NULL DEFAULT '[]'::jsonb,
  rules jsonb NOT NULL DEFAULT '[]'::jsonb,
  next_screen_key text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (funnel_id, screen_key)
);

CREATE TABLE public.funnel_leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  funnel_id uuid NOT NULL REFERENCES public.funnels(id) ON DELETE CASCADE,
  session_id text NOT NULL,
  name text,
  phone text,
  email text,
  answers jsonb NOT NULL DEFAULT '{}'::jsonb,
  source text,
  medium text,
  campaign text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.ab_tests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  funnel_id uuid NOT NULL REFERENCES public.funnels(id) ON DELETE CASCADE,
  screen_key text NOT NULL,
  field_key text NOT NULL,
  name text NOT NULL,
  metric text NOT NULL DEFAULT 'cta_click',
  status text NOT NULL DEFAULT 'draft',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.ab_variants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ab_test_id uuid NOT NULL REFERENCES public.ab_tests(id) ON DELETE CASCADE,
  label text NOT NULL,
  value jsonb NOT NULL DEFAULT '{}'::jsonb,
  split_percentage numeric NOT NULL DEFAULT 50,
  status text NOT NULL DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.funnel_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  funnel_id uuid NOT NULL REFERENCES public.funnels(id) ON DELETE CASCADE,
  session_id text NOT NULL,
  lead_id uuid REFERENCES public.funnel_leads(id) ON DELETE SET NULL,
  screen_key text,
  event_name text NOT NULL,
  event_data jsonb NOT NULL DEFAULT '{}'::jsonb,
  ab_test_id uuid REFERENCES public.ab_tests(id) ON DELETE SET NULL,
  variant_id uuid REFERENCES public.ab_variants(id) ON DELETE SET NULL,
  source text,
  medium text,
  campaign text,
  device text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_funnel_events_funnel ON public.funnel_events(funnel_id);
CREATE INDEX idx_funnel_events_session ON public.funnel_events(session_id);
CREATE INDEX idx_funnel_events_event ON public.funnel_events(event_name);
CREATE INDEX idx_funnel_events_screen ON public.funnel_events(screen_key);
CREATE INDEX idx_funnel_events_created ON public.funnel_events(created_at);
CREATE INDEX idx_funnel_leads_funnel ON public.funnel_leads(funnel_id);
CREATE INDEX idx_funnel_leads_session ON public.funnel_leads(session_id);
CREATE INDEX idx_funnel_screens_funnel ON public.funnel_screens(funnel_id);
CREATE INDEX idx_ab_tests_funnel ON public.ab_tests(funnel_id);

-- updated_at trigger
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_funnels_updated BEFORE UPDATE ON public.funnels
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_funnel_screens_updated BEFORE UPDATE ON public.funnel_screens
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_ab_tests_updated BEFORE UPDATE ON public.ab_tests
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_ab_variants_updated BEFORE UPDATE ON public.ab_variants
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Enable RLS
ALTER TABLE public.funnels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.funnel_screens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.funnel_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.funnel_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ab_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ab_variants ENABLE ROW LEVEL SECURITY;

-- MVP policies (no auth yet): public funnel needs to read config and write events/leads.
-- Admin runs without auth in this MVP, so we allow full access. Tighten when auth is added.
CREATE POLICY "public read funnels" ON public.funnels FOR SELECT USING (true);
CREATE POLICY "public write funnels" ON public.funnels FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "public read screens" ON public.funnel_screens FOR SELECT USING (true);
CREATE POLICY "public write screens" ON public.funnel_screens FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "public insert leads" ON public.funnel_leads FOR INSERT WITH CHECK (true);
CREATE POLICY "public read leads" ON public.funnel_leads FOR SELECT USING (true);

CREATE POLICY "public insert events" ON public.funnel_events FOR INSERT WITH CHECK (true);
CREATE POLICY "public read events" ON public.funnel_events FOR SELECT USING (true);

CREATE POLICY "public read ab_tests" ON public.ab_tests FOR SELECT USING (true);
CREATE POLICY "public write ab_tests" ON public.ab_tests FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "public read ab_variants" ON public.ab_variants FOR SELECT USING (true);
CREATE POLICY "public write ab_variants" ON public.ab_variants FOR ALL USING (true) WITH CHECK (true);
