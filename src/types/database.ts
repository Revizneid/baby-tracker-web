export type Profile = {
  id: string;
  full_name: string;
  avatar_url: string;
  created_at?: string;
  updated_at?: string;
};

export type Baby = {
  id: string;
  name: string;
  birth_date: string;
  gender: 'male' | 'female' | '';
  user_id: string;
  created_at?: string;
  updated_at?: string;
};

export type FamilyMember = {
  id: string;
  baby_id: string;
  user_id: string;
  role: 'owner' | 'member';
  created_at?: string;
};

export type FamilyInvite = {
  id: string;
  baby_id: string;
  token: string;
  expires_at: string;
  used_at: string | null;
  created_at?: string;
};

export type FeedLog = {
  id: string;
  baby_id: string;
  time: string; // "HH:MM"
  timestamp: number; // millisecond timestamp
  type: 'breast-left' | 'breast-right' | 'breast-both' | 'formula' | 'pumped';
  amount: string;
  note: string;
  date: string; // "YYYY-MM-DD"
  user_id: string;
  created_at?: string;
  updated_at?: string;
};

export type SleepLog = {
  id: string;
  baby_id: string;
  start_time: string;
  end_time: string;
  start_timestamp: number;
  type: 'night' | 'nap';
  duration_minutes: number;
  date: string;
  user_id: string;
  created_at?: string;
  updated_at?: string;
};

export type DiaperLog = {
  id: string;
  baby_id: string;
  time: string;
  timestamp: number;
  type: 'wet' | 'dirty' | 'both' | 'clean';
  color: string;
  note: string;
  date: string;
  user_id: string;
  created_at?: string;
  updated_at?: string;
};

export type GrowthLog = {
  id: string;
  baby_id: string;
  date: string;
  age_weeks: number;
  weight_kg: number;
  height_cm: number;
  head_cm: number;
  note: string;
  user_id: string;
  created_at?: string;
  updated_at?: string;
};

export type PumpingLog = {
  id: string;
  baby_id?: string;
  date: string;
  time: string;
  timestamp: number;
  start_time: string;
  end_time: string;
  duration_minutes: number;
  left_ml: number;
  right_ml: number;
  total_ml: number;
  stored_as: 'fridge' | 'freezer' | 'fed' | 'discarded' | '';
  note: string;
  user_id: string;
  created_at?: string;
  updated_at?: string;
};

export type MilkStorage = {
  id: string;
  baby_id?: string;
  date: string;
  timestamp: number;
  amount_ml: number;
  stored_at: 'fridge' | 'freezer';
  expires_at: string;
  note: string;
  used: boolean;
  user_id: string;
  created_at?: string;
  updated_at?: string;
};

export type VaccineRecord = {
  id: string;
  baby_id: string;
  user_id: string;
  vaccine_id: string;
  vacc_date: string | null;
  brand: string | null;
  note: string | null;
  created_at?: string;
  updated_at?: string;
};

export type Reminder = {
  id: string;
  baby_id: string;
  user_id: string;
  title: string;
  type: 'vitamin' | 'medicine' | 'other';
  doses_per_day: number;
  time_schedule: string[];
  enabled: boolean;
  created_at?: string;
  updated_at?: string;
};

export type WaterLog = {
  id: string;
  user_id: string;
  amount_ml: number;
  logged_at?: string;
  created_at?: string;
};
