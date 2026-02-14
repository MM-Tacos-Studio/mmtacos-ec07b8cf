
-- Add unique ticket code to orders
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS ticket_code text;

-- Generate unique ticket codes for existing orders
UPDATE public.orders SET ticket_code = 'MM-' || to_char(order_date, 'YYMMDD') || '-' || LPAD(daily_sequence::text, 4, '0') WHERE ticket_code IS NULL;

-- Create cash sessions table
CREATE TABLE public.cash_sessions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  opened_at timestamp with time zone NOT NULL DEFAULT now(),
  closed_at timestamp with time zone,
  opened_by uuid,
  session_code text NOT NULL,
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'closed')),
  total_sales integer DEFAULT 0,
  total_orders integer DEFAULT 0,
  notes text
);

ALTER TABLE public.cash_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage cash sessions"
ON public.cash_sessions FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Function to generate ticket code on order insert
CREATE OR REPLACE FUNCTION public.generate_ticket_code()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
  NEW.ticket_code := 'MM-' || to_char(NEW.order_date, 'YYMMDD') || '-' || LPAD(NEW.daily_sequence::text, 4, '0');
  RETURN NEW;
END;
$$;

CREATE TRIGGER set_ticket_code
BEFORE INSERT ON public.orders
FOR EACH ROW
EXECUTE FUNCTION public.generate_ticket_code();
