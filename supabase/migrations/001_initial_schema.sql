-- supabase/migrations/001_initial_schema.sql

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES Table
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. BABIES Table
CREATE TABLE IF NOT EXISTS public.babies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    birth_date DATE NOT NULL,
    gender TEXT CHECK (gender IN ('male', 'female', '')),
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. FAMILY_MEMBERS Table
CREATE TABLE IF NOT EXISTS public.family_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    baby_id UUID REFERENCES public.babies(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    role TEXT CHECK (role IN ('owner', 'member')) DEFAULT 'member',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(baby_id, user_id)
);

-- 4. FAMILY_INVITES Table
CREATE TABLE IF NOT EXISTS public.family_invites (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    baby_id UUID REFERENCES public.babies(id) ON DELETE CASCADE,
    token UUID UNIQUE NOT NULL DEFAULT uuid_generate_v4(),
    expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '7 days'),
    used_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create ENUM types if not exist
DO $$ BEGIN
    CREATE TYPE feed_type_enum AS ENUM ('breast-left', 'breast-right', 'breast-both', 'formula', 'pumped');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE sleep_type_enum AS ENUM ('night', 'nap');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE diaper_type_enum AS ENUM ('wet', 'dirty', 'both', 'clean');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE storage_type_enum AS ENUM ('fridge', 'freezer');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 5. FEEDS Table (Keep old name feeds instead of feed_logs)
CREATE TABLE IF NOT EXISTS public.feeds (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    baby_id UUID REFERENCES public.babies(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    type feed_type_enum NOT NULL,
    amount VARCHAR(50) DEFAULT '0', -- Keep amount as string/ml representation from original
    note TEXT,
    time VARCHAR(50) NOT NULL, -- Original had time as string ("HH:MM")
    date DATE NOT NULL, -- Original had date as string/date ("YYYY-MM-DD")
    timestamp BIGINT NOT NULL, -- Original timestamp in milliseconds
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. SLEEP_LOGS Table
CREATE TABLE IF NOT EXISTS public.sleep_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    baby_id UUID REFERENCES public.babies(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    start_time VARCHAR(50) NOT NULL,
    end_time VARCHAR(50) NOT NULL,
    start_timestamp BIGINT NOT NULL,
    type sleep_type_enum NOT NULL,
    duration_minutes INTEGER NOT NULL,
    date DATE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. DIAPER_LOGS Table
CREATE TABLE IF NOT EXISTS public.diaper_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    baby_id UUID REFERENCES public.babies(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    type diaper_type_enum NOT NULL,
    color TEXT,
    note TEXT,
    time VARCHAR(50) NOT NULL,
    date DATE NOT NULL,
    timestamp BIGINT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. GROWTH_LOGS Table
CREATE TABLE IF NOT EXISTS public.growth_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    baby_id UUID REFERENCES public.babies(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    date DATE NOT NULL,
    age_weeks INTEGER NOT NULL,
    weight_kg DECIMAL(5,2),
    height_cm DECIMAL(5,1),
    head_cm DECIMAL(5,1),
    note TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. PUMPING_LOGS Table (Keep old name pumping_logs instead of pump_logs)
CREATE TABLE IF NOT EXISTS public.pumping_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    baby_id UUID REFERENCES public.babies(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    date DATE NOT NULL,
    time VARCHAR(50) NOT NULL,
    timestamp BIGINT NOT NULL,
    start_time VARCHAR(50),
    end_time VARCHAR(50),
    duration_minutes INTEGER DEFAULT 0,
    left_ml INTEGER DEFAULT 0,
    right_ml INTEGER DEFAULT 0,
    total_ml INTEGER DEFAULT 0,
    stored_as TEXT, -- 'fridge' | 'freezer' | 'fed' | 'discarded' | ''
    note TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. MILK_STORAGE Table
CREATE TABLE IF NOT EXISTS public.milk_storage (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    baby_id UUID REFERENCES public.babies(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    date DATE NOT NULL,
    timestamp BIGINT NOT NULL,
    amount_ml INTEGER NOT NULL,
    stored_at storage_type_enum NOT NULL, -- 'fridge' | 'freezer'
    expires_at DATE NOT NULL,
    note TEXT,
    used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. VACCINE_RECORDS Table
CREATE TABLE IF NOT EXISTS public.vaccine_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    baby_id UUID REFERENCES public.babies(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    vaccine_id VARCHAR(50) NOT NULL,
    vacc_date DATE,
    brand VARCHAR(100),
    note TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. REMINDERS Table
CREATE TABLE IF NOT EXISTS public.reminders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    baby_id UUID REFERENCES public.babies(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    type TEXT DEFAULT 'vitamin', -- 'vitamin' | 'medicine' | 'other'
    doses_per_day INTEGER DEFAULT 1,
    time_schedule TIME[], -- Array of alarm times, e.g. ['08:00', '20:00']
    enabled BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. WATER_LOGS Table (For Mother)
CREATE TABLE IF NOT EXISTS public.water_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    amount_ml INTEGER NOT NULL,
    logged_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =========================================================================
-- INDEXES FOR PERFORMANCE
-- =========================================================================
CREATE INDEX IF NOT EXISTS idx_feeds_baby_time ON public.feeds (baby_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_sleep_baby_time ON public.sleep_logs (baby_id, start_timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_diaper_baby_time ON public.diaper_logs (baby_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_pumping_baby_time ON public.pumping_logs (baby_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_growth_baby_date ON public.growth_logs (baby_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_vaccine_baby_date ON public.vaccine_records (baby_id, vacc_date DESC);
CREATE INDEX IF NOT EXISTS idx_water_user_time ON public.water_logs (user_id, logged_at DESC);
CREATE INDEX IF NOT EXISTS idx_family_members_composite ON public.family_members (baby_id, user_id);
CREATE INDEX IF NOT EXISTS idx_family_invites_token ON public.family_invites (token);

-- =========================================================================
-- AUTOMATIC PROFILE CREATION & UPDATED_AT TRIGGERS
-- =========================================================================

-- Trigger to create profile when auth.users inserts
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, avatar_url)
    VALUES (
        new.id,
        COALESCE(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', ''),
        COALESCE(new.raw_user_meta_data->>'avatar_url', '')
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Trigger to update updated_at timestamps
CREATE OR REPLACE FUNCTION public.handle_update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    new.updated_at = NOW();
    RETURN new;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to tables
DO $$
DECLARE
    t text;
BEGIN
    FOR t IN 
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
          AND table_name IN ('profiles', 'babies', 'feeds', 'sleep_logs', 'diaper_logs', 'growth_logs', 'pumping_logs', 'milk_storage', 'vaccine_records', 'reminders')
    LOOP
        EXECUTE format('DROP TRIGGER IF EXISTS set_updated_at ON public.%I;', t);
        EXECUTE format('CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.%I FOR EACH ROW EXECUTE FUNCTION public.handle_update_timestamp();', t);
    END LOOP;
END;
$$;

-- =========================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =========================================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.babies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.family_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.family_invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feeds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sleep_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.diaper_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.growth_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pumping_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.milk_storage ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vaccine_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.water_logs ENABLE ROW LEVEL SECURITY;

-- 1. Profiles policy (User can only read/update their own profile)
CREATE POLICY "Users can manage their own profiles" 
    ON public.profiles 
    FOR ALL 
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Helper functions for complex RLS checks
CREATE OR REPLACE FUNCTION public.is_baby_member(baby_id UUID, user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.babies b WHERE b.id = baby_id AND b.user_id = user_id
    ) OR EXISTS (
        SELECT 1 FROM public.family_members fm WHERE fm.baby_id = baby_id AND fm.user_id = user_id
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Babies policy
CREATE POLICY "Users can manage babies they own or share"
    ON public.babies
    FOR ALL
    USING (auth.uid() = user_id OR EXISTS (
        SELECT 1 FROM public.family_members fm WHERE fm.baby_id = id AND fm.user_id = auth.uid()
    ));

-- 3. Family Members policy
CREATE POLICY "Family members can view lists"
    ON public.family_members
    FOR ALL
    USING (public.is_baby_member(baby_id, auth.uid()));

-- 4. Family Invites policy
CREATE POLICY "Anyone can view invite by token"
    ON public.family_invites
    FOR SELECT
    USING (expires_at > NOW() AND used_at IS NULL);

CREATE POLICY "Baby owners can manage invites"
    ON public.family_invites
    FOR ALL
    USING (public.is_baby_member(baby_id, auth.uid()));

-- 5-12. Baby-related logs policies (feeds, sleep_logs, diaper_logs, growth_logs, pumping_logs, milk_storage, vaccine_records, reminders)
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
        IF EXISTS (
            SELECT 1
            FROM information_schema.columns
            WHERE table_schema = 'public'
              AND table_name = t
              AND column_name = 'baby_id'
        ) THEN
            EXECUTE format('
                CREATE POLICY %I ON public.%I
                    FOR ALL
                    USING (public.is_baby_member(baby_id, auth.uid()))
                    WITH CHECK (public.is_baby_member(baby_id, auth.uid()));
            ', 'Manage ' || t || ' for shared baby', t);
        END IF;
    END LOOP;
END;
$$;

-- 13. Water Logs policy (User only)
CREATE POLICY "Users can manage their own water logs"
    ON public.water_logs
    FOR ALL
    USING (auth.uid() = user_id);

-- =========================================================================
-- ENABLE REALTIME ON KEY LOG TABLES
-- =========================================================================
-- Note: Requires publication setup in Supabase, done by adding tables to supabase_realtime publication
alter publication supabase_realtime add table public.feeds;
alter publication supabase_realtime add table public.sleep_logs;
alter publication supabase_realtime add table public.diaper_logs;
alter publication supabase_realtime add table public.pumping_logs;
alter publication supabase_realtime add table public.milk_storage;
