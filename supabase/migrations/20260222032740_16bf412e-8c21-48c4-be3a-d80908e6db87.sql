
-- Enable pg_net extension
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- Recreate the trigger function with error handling so it never blocks inserts
CREATE OR REPLACE FUNCTION public.notify_new_client_order()
  RETURNS trigger
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path = 'public'
AS $$
DECLARE
  edge_function_url TEXT;
  service_role_key TEXT;
BEGIN
  edge_function_url := 'https://lmhqueybhutopsnzytmz.supabase.co/functions/v1/notify-new-order';
  service_role_key := current_setting('app.settings.service_role_key', true);
  
  PERFORM net.http_post(
    url := edge_function_url,
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || COALESCE(service_role_key, '')
    ),
    body := jsonb_build_object('record', row_to_json(NEW))
  );
  
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'notify_new_client_order failed: %', SQLERRM;
  RETURN NEW;
END;
$$;

-- Recreate the trigger (drop first if exists)
DROP TRIGGER IF EXISTS on_new_client_order ON public.client_orders;
CREATE TRIGGER on_new_client_order
  AFTER INSERT ON public.client_orders
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_new_client_order();
