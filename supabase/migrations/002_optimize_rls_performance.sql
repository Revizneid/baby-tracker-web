-- supabase/migrations/002_optimize_rls_performance.sql
-- Fixes timeout issue by optimizing RLS policies to avoid redundant function calls

-- =========================================================================
-- REPLACE INEFFICIENT is_baby_member FUNCTION WITH OPTIMIZED VERSION
-- =========================================================================

-- Drop existing policies that use the slow function
DROP POLICY IF EXISTS "Users can manage babies they own or share" ON public.babies;
DROP POLICY IF EXISTS "Family members can view lists" ON public.family_members;
DROP POLICY IF EXISTS "Baby owners can manage invites" ON public.family_invites;

-- Drop policies for logs that use the slow function
DO $$
DECLARE
    t text;
BEGIN
    FOR t IN 
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
          AND table_name IN ('feeds', 'sleep_logs', 'diaper_logs', 'growth_logs', 'pumping_logs', 'milk_storage', 'vaccine_records', 'reminders')
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', 'Manage ' || t || ' for shared baby', t);
    END LOOP;
END;
$$;

-- Replace with more efficient version using LEFT JOIN instead of EXISTS
CREATE OR REPLACE FUNCTION public.is_baby_member_fast(baby_id UUID, user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    v_is_member BOOLEAN;
BEGIN
    -- Check if user owns the baby OR is a family member (single query with OR)
    SELECT EXISTS(
        SELECT 1 FROM public.babies WHERE id = baby_id AND user_id = user_id
        UNION ALL
        SELECT 1 FROM public.family_members WHERE baby_id = baby_id AND user_id = user_id LIMIT 1
    ) INTO v_is_member;
    RETURN COALESCE(v_is_member, FALSE);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- =========================================================================
-- CREATE OPTIMIZED POLICIES USING DIRECT CONDITIONS (NO FUNCTION CALLS)
-- =========================================================================

-- 2. Babies policy - optimized with direct OR condition
CREATE POLICY "Users can manage babies they own or share"
    ON public.babies
    FOR ALL
    USING (
        auth.uid() = user_id OR 
        baby_id IN (SELECT baby_id FROM public.family_members WHERE user_id = auth.uid())
    );

-- 3. Family Members policy - simplified
CREATE POLICY "Family members can view lists"
    ON public.family_members
    FOR ALL
    USING (
        auth.uid() = user_id OR
        baby_id IN (SELECT id FROM public.babies WHERE user_id = auth.uid())
    );

-- 4. Family Invites policy - kept as is but optimized
CREATE POLICY "Baby owners can create/manage invites"
    ON public.family_invites
    FOR ALL
    USING (
        baby_id IN (
            SELECT id FROM public.babies WHERE user_id = auth.uid()
            UNION
            SELECT baby_id FROM public.family_members WHERE user_id = auth.uid()
        )
    );

-- =========================================================================
-- OPTIMIZED POLICIES FOR LOG TABLES (feeds, sleep_logs, diaper_logs, etc.)
-- =========================================================================
-- Use direct baby ownership check instead of function call

CREATE POLICY "Users can view/manage baby feeds"
    ON public.feeds
    FOR ALL
    USING (
        baby_id IN (
            SELECT id FROM public.babies WHERE user_id = auth.uid()
            UNION
            SELECT baby_id FROM public.family_members WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can view/manage baby sleep logs"
    ON public.sleep_logs
    FOR ALL
    USING (
        baby_id IN (
            SELECT id FROM public.babies WHERE user_id = auth.uid()
            UNION
            SELECT baby_id FROM public.family_members WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can view/manage baby diaper logs"
    ON public.diaper_logs
    FOR ALL
    USING (
        baby_id IN (
            SELECT id FROM public.babies WHERE user_id = auth.uid()
            UNION
            SELECT baby_id FROM public.family_members WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can view/manage baby growth logs"
    ON public.growth_logs
    FOR ALL
    USING (
        baby_id IN (
            SELECT id FROM public.babies WHERE user_id = auth.uid()
            UNION
            SELECT baby_id FROM public.family_members WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can view/manage baby pumping logs"
    ON public.pumping_logs
    FOR ALL
    USING (
        baby_id IN (
            SELECT id FROM public.babies WHERE user_id = auth.uid()
            UNION
            SELECT baby_id FROM public.family_members WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can view/manage baby milk storage"
    ON public.milk_storage
    FOR ALL
    USING (
        baby_id IN (
            SELECT id FROM public.babies WHERE user_id = auth.uid()
            UNION
            SELECT baby_id FROM public.family_members WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can view/manage baby vaccine records"
    ON public.vaccine_records
    FOR ALL
    USING (
        baby_id IN (
            SELECT id FROM public.babies WHERE user_id = auth.uid()
            UNION
            SELECT baby_id FROM public.family_members WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can view/manage baby reminders"
    ON public.reminders
    FOR ALL
    USING (
        baby_id IN (
            SELECT id FROM public.babies WHERE user_id = auth.uid()
            UNION
            SELECT baby_id FROM public.family_members WHERE user_id = auth.uid()
        )
    );

-- =========================================================================
-- ADD COMPOSITE INDEX FOR FAMILY_MEMBERS TO SPEED UP CHECKS
-- =========================================================================
CREATE INDEX IF NOT EXISTS idx_family_members_user_baby ON public.family_members (user_id, baby_id);

-- =========================================================================
-- ADD INDEX ON USER_ID FOR FASTER BABY LOOKUPS
-- =========================================================================
CREATE INDEX IF NOT EXISTS idx_babies_user_id ON public.babies (user_id);

-- =========================================================================
-- ANALYZE TABLES TO UPDATE QUERY PLANNER
-- =========================================================================
ANALYZE public.babies;
ANALYZE public.family_members;
ANALYZE public.feeds;
ANALYZE public.sleep_logs;
ANALYZE public.diaper_logs;
ANALYZE public.growth_logs;
ANALYZE public.pumping_logs;
ANALYZE public.milk_storage;
ANALYZE public.vaccine_records;
ANALYZE public.reminders;
