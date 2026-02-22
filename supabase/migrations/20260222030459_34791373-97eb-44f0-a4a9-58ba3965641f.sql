
-- Create client_orders table
CREATE TABLE public.client_orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_type TEXT NOT NULL DEFAULT 'tacos', -- tacos, family, enterprise
  order_details JSONB NOT NULL DEFAULT '{}',
  phone TEXT NOT NULL,
  delivery_type TEXT NOT NULL, -- livraison or emporter
  delivery_address TEXT,
  total INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'new', -- new, confirmed, completed, cancelled
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.client_orders ENABLE ROW LEVEL SECURITY;

-- Anyone can insert (public ordering)
CREATE POLICY "Anyone can create client orders"
  ON public.client_orders
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Only admins can view/update/delete
CREATE POLICY "Admins can manage client orders"
  ON public.client_orders
  FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.client_orders;
