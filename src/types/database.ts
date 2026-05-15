export type Baby = {
  id: string;
  name: string;
  birth_date: string;
  gender: 'male' | 'female' | '';
  user_id: string;
  created_at?: string;
};

export type FeedLog = {
  id: string;
  baby_id: string;
  time: string;
  timestamp: number;
  type: 'breast-left' | 'breast-right' | 'breast-both' | 'formula' | 'pumped';
  amount: string;
  note: string;
  date: string;
  user_id: string;
  created_at?: string;
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
};

export type MilkStorage = {
  id: string;
  date: string;
  timestamp: number;
  amount_ml: number;
  stored_at: 'fridge' | 'freezer';
  expires_at: string;
  note: string;
  used: boolean;
  user_id: string;
  created_at?: string;
};
