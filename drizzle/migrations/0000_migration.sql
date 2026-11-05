CREATE TABLE public.trading_leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL CHECK (char_length(full_name) BETWEEN 2 AND 100),
  email text NOT NULL CHECK (char_length(email) BETWEEN 5 AND 255),
  phone text NOT NULL CHECK (phone ~ '^\+[0-9]{8,15}$'),
  experience text NOT NULL CHECK (char_length(experience) <= 60),
  goal text NOT NULL CHECK (char_length(goal) <= 60),
  budget text NOT NULL CHECK (char_length(budget) <= 60),
  ai_interest text NOT NULL CHECK (char_length(ai_interest) <= 60),
  best_time text NOT NULL CHECK (char_length(best_time) <= 60),
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT INSERT ON public.trading_leads TO anon;
GRANT ALL ON public.trading_leads TO service_role;

ALTER TABLE public.trading_leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Visitors can submit leads"
ON public.trading_leads FOR INSERT TO anon
WITH CHECK (true);