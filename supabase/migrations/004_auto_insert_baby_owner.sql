-- supabase/migrations/004_auto_insert_baby_owner.sql
-- Automate inserting the baby owner/creator into family_members on baby creation

-- 1. Create the trigger function to automatically insert the owner
CREATE OR REPLACE FUNCTION public.handle_new_baby()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.family_members (baby_id, user_id, role)
    VALUES (new.id, new.user_id, 'owner')
    ON CONFLICT (baby_id, user_id) DO NOTHING;
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Bind the trigger to public.babies
DROP TRIGGER IF EXISTS on_baby_created ON public.babies;
CREATE TRIGGER on_baby_created
    AFTER INSERT ON public.babies
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_baby();

-- 3. Backfill existing babies (insert their owners into family_members if missing)
INSERT INTO public.family_members (baby_id, user_id, role)
SELECT id, user_id, 'owner'
FROM public.babies
ON CONFLICT (baby_id, user_id) DO NOTHING;
