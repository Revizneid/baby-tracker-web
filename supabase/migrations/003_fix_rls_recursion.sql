-- supabase/migrations/003_fix_rls_recursion.sql
-- Fixes the infinite recursion timeout (Warp server error) by using a SECURITY DEFINER function for RLS checks.

-- 1. DROP POLICIES THAT CAUSE RECURSION
DROP POLICY IF EXISTS "Users can manage babies they own or share" ON public.babies;
DROP POLICY IF EXISTS "Family members can view lists" ON public.family_members;
DROP POLICY IF EXISTS "Baby owners can create/manage invites" ON public.family_invites;
DROP POLICY IF EXISTS "Baby owners can manage invites" ON public.family_invites;

DROP POLICY IF EXISTS "Users can view/manage baby feeds" ON public.feeds;
DROP POLICY IF EXISTS "Users can view/manage baby sleep logs" ON public.sleep_logs;
DROP POLICY IF EXISTS "Users can view/manage baby diaper logs" ON public.diaper_logs;
DROP POLICY IF EXISTS "Users can view/manage baby growth logs" ON public.growth_logs;
DROP POLICY IF EXISTS "Users can view/manage baby pumping logs" ON public.pumping_logs;
DROP POLICY IF EXISTS "Users can view/manage baby milk storage" ON public.milk_storage;
DROP POLICY IF EXISTS "Users can view/manage baby vaccine records" ON public.vaccine_records;
DROP POLICY IF EXISTS "Users can view/manage baby reminders" ON public.reminders;

-- 2. CREATE A SECURE AND RECURSION-FREE FUNCTION TO CHECK MEMBERSHIP
-- Using SECURITY DEFINER runs the queries bypassing RLS, thus preventing circular policy evaluation.
CREATE OR REPLACE FUNCTION public.check_is_baby_member(p_baby_id UUID, p_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.babies WHERE id = p_baby_id AND user_id = p_user_id
        UNION ALL
        SELECT 1 FROM public.family_members WHERE baby_id = p_baby_id AND user_id = p_user_id
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- 3. RE-CREATE POLICIES USING THE NEW FUNCTION
-- babies policy
CREATE POLICY "Users can manage babies they own or share"
    ON public.babies
    FOR ALL
    USING (public.check_is_baby_member(id, auth.uid()));

-- family_members policy
CREATE POLICY "Family members can view lists"
    ON public.family_members
    FOR ALL
    USING (public.check_is_baby_member(baby_id, auth.uid()));

-- family_invites policy
CREATE POLICY "Baby owners can create/manage invites"
    ON public.family_invites
    FOR ALL
    USING (public.check_is_baby_member(baby_id, auth.uid()));

-- feeds policy
CREATE POLICY "Users can view/manage baby feeds"
    ON public.feeds
    FOR ALL
    USING (public.check_is_baby_member(baby_id, auth.uid()))
    WITH CHECK (public.check_is_baby_member(baby_id, auth.uid()));

-- sleep_logs policy
CREATE POLICY "Users can view/manage baby sleep logs"
    ON public.sleep_logs
    FOR ALL
    USING (public.check_is_baby_member(baby_id, auth.uid()))
    WITH CHECK (public.check_is_baby_member(baby_id, auth.uid()));

-- diaper_logs policy
CREATE POLICY "Users can view/manage baby diaper logs"
    ON public.diaper_logs
    FOR ALL
    USING (public.check_is_baby_member(baby_id, auth.uid()))
    WITH CHECK (public.check_is_baby_member(baby_id, auth.uid()));

-- growth_logs policy
CREATE POLICY "Users can view/manage baby growth logs"
    ON public.growth_logs
    FOR ALL
    USING (public.check_is_baby_member(baby_id, auth.uid()))
    WITH CHECK (public.check_is_baby_member(baby_id, auth.uid()));

-- pumping_logs policy
CREATE POLICY "Users can view/manage baby pumping logs"
    ON public.pumping_logs
    FOR ALL
    USING (public.check_is_baby_member(baby_id, auth.uid()))
    WITH CHECK (public.check_is_baby_member(baby_id, auth.uid()));

-- milk_storage policy
CREATE POLICY "Users can view/manage baby milk storage"
    ON public.milk_storage
    FOR ALL
    USING (public.check_is_baby_member(baby_id, auth.uid()))
    WITH CHECK (public.check_is_baby_member(baby_id, auth.uid()));

-- vaccine_records policy
CREATE POLICY "Users can view/manage baby vaccine records"
    ON public.vaccine_records
    FOR ALL
    USING (public.check_is_baby_member(baby_id, auth.uid()))
    WITH CHECK (public.check_is_baby_member(baby_id, auth.uid()));

-- reminders policy
CREATE POLICY "Users can view/manage baby reminders"
    ON public.reminders
    FOR ALL
    USING (public.check_is_baby_member(baby_id, auth.uid()))
    WITH CHECK (public.check_is_baby_member(baby_id, auth.uid()));
