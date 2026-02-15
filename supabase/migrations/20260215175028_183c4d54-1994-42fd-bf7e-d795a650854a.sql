
-- Table for operational days (a full business day: 9h → 4h+)
CREATE TABLE public.operational_days (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  day_code text NOT NULL UNIQUE, -- e.g. "JO-2026-02-15"
  opened_at timestamptz NOT NULL DEFAULT now(),
  closed_at timestamptz,
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'closed')),
  total_sales integer DEFAULT 0,
  total_orders integer DEFAULT 0,
  opened_by uuid REFERENCES auth.users(id),
  closed_by uuid REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.operational_days ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage operational days"
ON public.operational_days
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Add operational_day_id to cash_sessions to link shifts to a day
ALTER TABLE public.cash_sessions 
  ADD COLUMN operational_day_id uuid REFERENCES public.operational_days(id),
  ADD COLUMN cashier_name text DEFAULT 'Caissier';
