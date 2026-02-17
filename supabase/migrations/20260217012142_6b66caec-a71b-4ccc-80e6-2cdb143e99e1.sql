
CREATE OR REPLACE FUNCTION public.get_next_daily_sequence()
 RETURNS integer
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $$
  SELECT COALESCE(MAX(o.daily_sequence), 0) + 1
  FROM public.orders o
  WHERE o.created_at >= (
    SELECT d.opened_at FROM public.operational_days d
    WHERE d.status = 'open'
    ORDER BY d.opened_at DESC
    LIMIT 1
  )
$$;
