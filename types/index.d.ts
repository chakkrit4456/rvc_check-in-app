// types/index.d.ts

export type UserRole = 'student' | 'staff' | 'admin';
export type AttendanceStatus = 'present' | 'absent' | 'late';
export type ActivityStatus = 'active' | 'inactive' | 'completed' | 'cancelled';
export type AnnouncementType = 'general' | 'activity' | 'emergency';
export type AnnouncementPriority = 'low' | 'normal' | 'high' | 'urgent';

export interface Department {
  id: string;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface Classroom {
  id: string;
  name: string;
  department_id: string;
  year_level: number;
  created_at: string;
  updated_at: string;
  department?: Department;
}

export interface Profile {
  id: string;
  student_id?: string;
  national_id?: string;
  first_name: string;
  last_name: string;
  gender?: 'male' | 'female' | 'other';
  email: string;
  phone?: string;
  classroom_id?: string;
  department_id?: string;
  year_level?: number;
  role: UserRole;
  profile_picture_url?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  classroom?: Classroom;
  department?: Department;
}

export interface Activity {
  id: string;
  title: string;
  description?: string;
  activity_type: string;
  location?: string;
  start_time: string;
  end_time: string;
  status: ActivityStatus;
  requires_photo: boolean;
  target_classrooms: string[];
  target_departments: string[];
  target_year_levels: number[];
  created_by?: string;
  created_at: string;
  updated_at: string;
  creator?: Profile;
}

export interface AttendanceRecord {
  id: string;
  student_id: string;
  activity_id: string;
  status: AttendanceStatus;
  check_in_time: string;
  photo_url?: string;
  photo_metadata?: any;
  notes?: string;
  verified_by?: string;
  verified_at?: string;
  created_at: string;
  updated_at: string;
  student?: Profile;
  activity?: Activity;
  verifier?: Profile;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  announcement_type: AnnouncementType;
  priority: AnnouncementPriority;
  target_audience: string;
  target_classrooms: string[];
  target_departments: string[];
  target_year_levels: number[];
  is_published: boolean;
  published_at?: string;
  expires_at?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
  creator?: Profile;
}

export interface AdminUser {
  id: string;
  profile_id: string;
  admin_level: 'standard' | 'super';
  permissions: any;
  last_login?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  profile?: Profile;
}

// Navigation types
export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  Dashboard: undefined;
  Checkin: undefined;
  News: undefined;
  Profile: undefined;
};

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface LoginResponse {
  success: boolean;
  user?: Profile;
  session?: any;
  message?: string;
}

export interface RegisterResponse {
  success: boolean;
  user?: Profile;
  message?: string;
}

// Form types
export interface LoginForm {
  email: string;
  password: string;
}

export interface RegisterForm {
  student_id: string;
  national_id: string;
  first_name: string;
  last_name: string;
  gender: 'male' | 'female' | 'other';
  email: string;
  phone?: string;
  department_id: string;
  classroom_id: string;
  year_level: number;
  password: string;
  confirm_password: string;
}

export interface ProfileUpdateForm {
  first_name: string;
  last_name: string;
  phone?: string;
  profile_picture?: string;
}

// Dashboard types
export interface DashboardStats {
  total_activities: number;
  active_activities: number;
  attendance_count: number;
  attendance_rate: number;
  recent_activities: Activity[];
  upcoming_activities: Activity[];
}

export interface AttendanceStats {
  total_days: number;
  present_days: number;
  absent_days: number;
  late_days: number;
  attendance_rate: number;
  recent_records: AttendanceRecord[];
}

// Camera types
export interface CameraPhoto {
  uri: string;
  width: number;
  height: number;
  type?: string;
  base64?: string;
}

export interface PhotoMetadata {
  timestamp: string;
  location?: {
    latitude: number;
    longitude: number;
  };
  device_info?: {
    model: string;
    os: string;
  };
}

// Realtime types
export interface RealtimeSubscription {
  unsubscribe: () => void;
}

// Storage types
export interface StorageFile {
  name: string;
  url: string;
  size: number;
  type: string;
}

// Error types
export interface AppError {
  code: string;
  message: string;
  details?: any;
}

// Notification types
export interface NotificationData {
  title: string;
  body: string;
  data?: any;
  type?: 'announcement' | 'activity' | 'reminder';
}

// Filter types for admin panel
export interface ActivityFilter {
  status?: ActivityStatus;
  activity_type?: string;
  date_from?: string;
  date_to?: string;
  classroom_id?: string;
  department_id?: string;
}

export interface AttendanceFilter {
  student_id?: string;
  activity_id?: string;
  status?: AttendanceStatus;
  date_from?: string;
  date_to?: string;
  classroom_id?: string;
  department_id?: string;
}

// Chart data types
export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string[];
    borderColor?: string[];
  }[];
}

export interface AttendanceChartData {
  daily: ChartData;
  weekly: ChartData;
  monthly: ChartData;
  by_classroom: ChartData;
  by_department: ChartData;
}