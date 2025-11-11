// services/auth.ts
import { supabase } from './supabaseClient';
import { LoginResponse, RegisterResponse, Profile } from '../types';
import { Alert } from 'react-native';

export const login = async (loginIdentifier: string, password: string, loginType: 'email' | 'student' = 'email'): Promise<LoginResponse> => {
  try {
    let email = loginIdentifier;

    // If login is with student ID, we need to get the email first
    if (loginType === 'student') {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('email')
        .eq('student_id', loginIdentifier)
        .single();

      if (profileError || !profile) {
        console.error('Error finding student profile:', profileError);
        return { success: false, message: 'รหัสนักศึกษาไม่ถูกต้อง' };
      }
      email = profile.email;
    }

    // Now, sign in with Supabase Auth
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (error) {
      console.error('Supabase login error:', error.message);
      return { 
        success: false, 
        message: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' 
      };
    }
    
    // On successful login, onAuthStateChange in AppNavigator will handle the session.
    // We don't need to return user/session data here or manually store it.
    return { success: true };

  } catch (error: any) {
    console.error('Login error:', error);
    return {
      success: false,
      message: error.message || 'เกิดข้อผิดพลาดในการเชื่อมต่อ',
    };
  }
};

export const register = async (formData: any): Promise<RegisterResponse> => {
  try {
    // Check if student_id or email already exists
    const { data: existingProfile, error: existingError } = await supabase
      .from('profiles')
      .select('student_id, email')
      .or(`student_id.eq.${formData.student_id},email.eq.${formData.email}`)
      .single();

    if (existingProfile) {
      if (existingProfile.student_id === formData.student_id) {
        return { success: false, message: 'รหัสนักศึกษานี้ถูกใช้แล้ว' };
      }
      if (existingProfile.email === formData.email) {
        return { success: false, message: 'อีเมลนี้ถูกใช้แล้ว' };
      }
    }

    const { data, error } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
      options: {
        data: {
          first_name: formData.first_name,
          last_name: formData.last_name,
          role: 'student', // Default role for new sign-ups
        },
      },
    });

    if (error) {
      console.error('Supabase signup error:', error.message);
      return {
        success: false,
        message: error.message || 'การลงทะเบียนไม่สำเร็จ',
      };
    }

          if (data.user) {
          // Check if a profile with this ID already exists
          const { data: existingProfileById, error: checkError } = await supabase
            .from('profiles')
            .select('id')
            .eq('id', data.user.id)
            .single();
    
          if (checkError && checkError.code !== 'PGRST116') { // PGRST116 means no rows found
            console.error('Error checking for existing profile by ID:', checkError);
            return {
              success: false,
              message: 'เกิดข้อผิดพลาดในการตรวจสอบโปรไฟล์',
            };
          }
    
          if (existingProfileById) {
            console.error('Profile with this ID already exists:', data.user.id);
            return {
              success: false,
              message: 'มีโปรไฟล์สำหรับผู้ใช้นี้อยู่แล้ว กรุณาติดต่อผู้ดูแลระบบ',
            };
          }
    
          // Create profile in 'profiles' table
          const { error: profileError } = await supabase
            .from('profiles')
            .insert({
          id: data.user.id,
          student_id: formData.student_id,
          national_id: formData.national_id,
          first_name: formData.first_name,
          last_name: formData.last_name,
          gender: formData.gender,
          email: formData.email,
          phone: formData.phone,
          department_id: formData.department_id,
          classroom_id: formData.classroom_id,
          year_level: formData.year_level,
          role: 'student',
          profile_picture_url: formData.profile_picture_url,
        });

      if (profileError) {
        return {
          success: false,
          message: `ไม่สามารถสร้างโปรไฟล์ได้: ${profileError.message}`,
        };
      }

      Alert.alert(
        'ลงทะเบียนสำเร็จ',
        'กรุณาตรวจสอบอีเมลเพื่อยืนยันบัญชีของคุณก่อนเข้าสู่ระบบ'
      );
      return {
        success: true,
        message: 'ลงทะเบียนสำเร็จ กรุณาตรวจสอบอีเมลเพื่อยืนยันบัญชี',
      };
    }

    return {
      success: false,
      message: 'ไม่สามารถสร้างบัญชีผู้ใช้ได้',
    };
  } catch (error: any) {
    console.error('Register error:', error);
    return {
      success: false,
      message: error.message || 'เกิดข้อผิดพลาดในการเชื่อมต่อ',
    };
  }
};


export const logout = async (): Promise<void> => {
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.error('Logout error:', error.message);
  }
  // onAuthStateChange in AppNavigator will handle navigation.
  // No need to manually clear AsyncStorage.
};

export const getCurrentUserProfile = async (): Promise<Profile | null> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data: profile, error } = await supabase
      .from('profiles')
      .select(`
        *,
        classroom:classrooms(*),
        department:departments(*)
      `)
      .eq('id', user.id)
      .single();

    if (error) {
      console.error('Get profile error:', error);
      return null;
    }

    return profile as Profile;
  } catch (error) {
    console.error('Get current user profile error:', error);
    return null;
  }
};

// Alias for getCurrentUserProfile for backward compatibility
export const getCurrentUser = getCurrentUserProfile;

export const updateProfile = async (updates: Partial<Profile>): Promise<{ success: boolean; message?: string }> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, message: 'ไม่พบผู้ใช้' };
    }

    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id);

    if (error) {
      return { success: false, message: error.message };
    }

    return { success: true, message: 'อัปเดตโปรไฟล์สำเร็จ' };
  } catch (error: any) {
    console.error('Update profile error:', error);
    return { success: false, message: error.message || 'เกิดข้อผิดพลาดในการอัปเดต' };
  }
};

export const resetPassword = async (email: string): Promise<{ success: boolean; message?: string }> => {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email);

    if (error) {
      return { success: false, message: error.message };
    }

    return { success: true, message: 'หากอีเมลนี้มีอยู่ในระบบ เราได้ส่งลิงก์รีเซ็ตรหัสผ่านไปให้แล้ว' };
  } catch (error: any) {
    console.error('Reset password error:', error);
    return { success: false, message: error.message || 'เกิดข้อผิดพลาด' };
  }
};