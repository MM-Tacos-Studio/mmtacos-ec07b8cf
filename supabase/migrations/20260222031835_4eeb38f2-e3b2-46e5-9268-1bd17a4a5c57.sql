
-- Create a trigger function to call the edge function on new client orders
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
END;
$$;

-- Create the trigger
CREATE TRIGGER on_new_client_order
  AFTER INSERT ON public.client_orders
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_new_client_order();
