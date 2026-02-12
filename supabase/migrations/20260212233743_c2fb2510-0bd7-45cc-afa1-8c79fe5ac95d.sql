-- Add policy so non-admin authenticated users can only view their own orders
CREATE POLICY "Users can view own orders"
ON public.orders
FOR SELECT
TO authenticated
USING (auth.uid() = created_by);

-- Remove the INSERT policy on user_roles that's too permissive (anyone can make themselves admin)
DROP POLICY IF EXISTS "Users can insert their own role" ON public.user_roles;