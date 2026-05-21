// Backward compatibility: export the cookie-enabled client as `supabase`
import { supabaseClient } from './supabase/client';

export const supabase = supabaseClient;
