-- 1. RLS policies for orders: restrict INSERT/UPDATE/DELETE to admins only
CREATE POLICY "Admins can insert orders"
ON public.orders
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update orders"
ON public.orders
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete orders"
ON public.orders
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- 2. Order validation trigger: recalculate total from items
CREATE OR REPLACE FUNCTION public.validate_order_totals()
RETURNS TRIGGER AS $$
DECLARE
  calculated_total INTEGER;
BEGIN
  SELECT COALESCE(SUM((item->>'price')::INTEGER * (item->>'qty')::INTEGER), 0)
  INTO calculated_total
  FROM jsonb_array_elements(NEW.items::jsonb) item;
  
  -- Override client values with server-calculated ones
  NEW.subtotal := calculated_total;
  NEW.total := calculated_total;
  NEW.change_amount := GREATEST(0, NEW.amount_paid - calculated_total);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER validate_order_before_insert
BEFORE INSERT ON public.orders
FOR EACH ROW
EXECUTE FUNCTION public.validate_order_totals();