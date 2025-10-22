// types/index.d.ts

// ---------------------
// Supabase User Type
// ---------------------
export interface User {
  id: string;
  student_code: string;
  full_name: string;
  gender: 'male' | 'female' | 'other';
  email?: string;
  room?: string;
  department?: string;
  class_year?: number;
  password_hash: string;
  profile_photo?: string;
  role: 'student' | 'teacher' | 'admin';
  created_at: string;
}

// ---------------------
// Activity Type
// ---------------------
export interface Activity {
  id: string;
  title: string;
  description?: string;
  type: string; // daily_lineup | general_event
  date: string;
  start_time?: string;
  end_time?: string;
  location?: string;
  created_by: string;
  is_open_for_checkin: boolean;
  is_cancelled: boolean;
  created_at: string;
}

// ---------------------
// Attendance Type
// ---------------------
export interface Attendance {
  id: string;
  activity_id: string;
  user_id: string;
  checkin_time: string;
  class_year?: number;
  room?: string;
  department?: string;
  photo_path?: string;
}

// ---------------------
// News Type
// ---------------------
export interface News {
  id: string;
  title: string;
  body?: string;
  created_by: string;
  publish_at: string;
  is_pinned: boolean;
}

// ---------------------
// Navigation Types
// ---------------------
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

// Keep the route list aligned with the actual navigator
export type RootStackParamList = {
  Login: undefined;
  Home: undefined;
};

export type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
