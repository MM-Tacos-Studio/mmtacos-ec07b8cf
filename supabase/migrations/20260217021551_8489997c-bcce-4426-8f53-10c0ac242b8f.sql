
CREATE OR REPLACE FUNCTION public.generate_ticket_code()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
DECLARE
  day_count INTEGER;
BEGIN
  SELECT COUNT(*) + 1 INTO day_count
  FROM public.orders
  WHERE order_date = NEW.order_date;
  
  NEW.ticket_code := 'MM-' || to_char(NEW.order_date, 'YYMMDD') || '-' || LPAD(day_count::text, 4, '0');
  RETURN NEW;
END;
$function$;
