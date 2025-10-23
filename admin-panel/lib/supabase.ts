import { createClient } from '@supabase/supabase-js'

// Local development configuration
const supabaseUrl = 'http://127.0.0.1:54321'
const supabaseAnonKey = 'sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH'

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false
  },
  global: {
    headers: {
      'apikey': supabaseAnonKey,
      'Authorization': `Bearer ${supabaseAnonKey}`
    }
  }
})

// Database types
export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          first_name: string
          last_name: string
          gender: string
          phone: string
          student_id: string
          national_id: string
          department_id: string
          classroom_id: string
          year_level: number
          profile_picture_url: string | null
          role: 'student' | 'staff' | 'admin'
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          first_name: string
          last_name: string
          gender: string
          phone: string
          student_id: string
          national_id: string
          department_id: string
          classroom_id: string
          year_level: number
          profile_picture_url?: string | null
          role?: 'student' | 'staff' | 'admin'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          first_name?: string
          last_name?: string
          gender?: string
          phone?: string
          student_id?: string
          national_id?: string
          department_id?: string
          classroom_id?: string
          year_level?: number
          profile_picture_url?: string | null
          role?: 'student' | 'staff' | 'admin'
          created_at?: string
          updated_at?: string
        }
      }
      activities: {
        Row: {
          id: string
          title: string
          description: string
          activity_type: string
          location: string
          start_time: string
          end_time: string
          status: 'active' | 'inactive' | 'cancelled'
          requires_photo: boolean
          target_classrooms: string[]
          target_departments: string[]
          target_year_levels: number[]
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description: string
          activity_type: string
          location: string
          start_time: string
          end_time: string
          status?: 'active' | 'inactive' | 'cancelled'
          requires_photo?: boolean
          target_classrooms?: string[]
          target_departments?: string[]
          target_year_levels?: number[]
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string
          activity_type?: string
          location?: string
          start_time?: string
          end_time?: string
          status?: 'active' | 'inactive' | 'cancelled'
          requires_photo?: boolean
          target_classrooms?: string[]
          target_departments?: string[]
          target_year_levels?: number[]
          created_at?: string
          updated_at?: string
        }
      }
      attendance_records: {
        Row: {
          id: string
          student_id: string
          activity_id: string
          check_in_time: string
          photo_url: string | null
          location: string | null
          status: 'present' | 'late' | 'absent'
          created_at: string
        }
        Insert: {
          id?: string
          student_id: string
          activity_id: string
          check_in_time: string
          photo_url?: string | null
          location?: string | null
          status?: 'present' | 'late' | 'absent'
          created_at?: string
        }
        Update: {
          id?: string
          student_id?: string
          activity_id?: string
          check_in_time?: string
          photo_url?: string | null
          location?: string | null
          status?: 'present' | 'late' | 'absent'
          created_at?: string
        }
      }
      classrooms: {
        Row: {
          id: string
          name: string
          department_id: string
          year_level: number
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          department_id: string
          year_level: number
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          department_id?: string
          year_level?: number
          created_at?: string
        }
      }
      departments: {
        Row: {
          id: string
          name: string
          description: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string
          created_at?: string
        }
      }
      announcements: {
        Row: {
          id: string
          title: string
          content: string
          announcement_type: string
          priority: string
          target_audience: string
          is_published: boolean
          published_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          content: string
          announcement_type: string
          priority: string
          target_audience: string
          is_published?: boolean
          published_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          title?: string
          content?: string
          announcement_type?: string
          priority?: string
          target_audience?: string
          is_published?: boolean
          published_at?: string | null
          created_at?: string
        }
      }
    }
  }
}