import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '../services/supabaseClient';
import { register } from '../services/auth';
import { RootStackParamList, RegisterForm, Department, Classroom } from '../types';

type RegisterScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Register'>;

const RegisterScreen: React.FC = () => {
  const navigation = useNavigation<RegisterScreenNavigationProp>();
  
  const [formData, setFormData] = useState<RegisterForm>({
    student_id: '',
    national_id: '',
    first_name: '',
    last_name: '',
    gender: 'male',
    email: '',
    phone: '',
    department_id: '',
    classroom_id: '',
    year_level: 5,
    password: '',
    confirm_password: '',
  });
  
  const [departments, setDepartments] = useState<Department[]>([]);
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    loadDepartments();
    requestPermissions();
  }, []);

  useEffect(() => {
    if (formData.department_id && formData.year_level) {
      loadClassrooms(formData.department_id, formData.year_level);
    } else {
      setClassrooms([]);
    }
  }, [formData.department_id, formData.year_level]);

  const requestPermissions = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('ขออนุญาตเข้าถึง', 'จำเป็นต้องเข้าถึงแกลเลอรี่เพื่อเลือกรูปภาพ');
    }
  };

  const loadDepartments = async () => {
    try {
      console.log('Loading departments...');
      const { data, error } = await supabase
        .from('departments')
        .select('*')
        .order('name');

      if (error) {
        console.error('Error loading departments:', error);
        setDepartments([]);
        return;
      }
      
      console.log('Departments loaded:', data);
      setDepartments(data || []);
    } catch (error) {
      console.error('Error loading departments:', error);
      setDepartments([]);
    }
  };

  const loadClassrooms = async (departmentId: string, yearLevel?: number) => {
    try {
      console.log('Loading classrooms for department:', departmentId, 'year:', yearLevel);
      
      if (!departmentId || !yearLevel) {
        console.log('Department or year not selected');
        setClassrooms([]);
        return;
      }

      // Fetch classrooms from the database using the new 'year_level' column
      const { data, error } = await supabase
        .from('classrooms')
        .select('*')
        .eq('department_id', departmentId)
        .eq('year_level', yearLevel); // Exact match on the year level number

      if (error) {
        console.error('Error loading classrooms:', error);
        setClassrooms([]);
        return;
      }

      console.log('Classrooms loaded:', data);
      setClassrooms(data || []);
    } catch (error) {
      console.error('Error loading classrooms:', error);
      setClassrooms([]);
    }
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled) {
        setProfileImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('ข้อผิดพลาด', 'ไม่สามารถเลือกรูปภาพได้');
    }
  };

  const uploadProfileImage = async (uri: string): Promise<string | null> => {
    try {
      const response = await fetch(uri);
      const blob = await response.blob();
      
      const fileName = `profile_${Date.now()}.jpg`;
      const { data, error } = await supabase.storage
        .from('profile-pictures')
        .upload(fileName, blob, {
          contentType: 'image/jpeg',
        });

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('profile-pictures')
        .getPublicUrl(fileName);

      return publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      return null;
    }
  };

  const validateForm = (): boolean => {
    if (!formData.student_id.trim()) {
      setError('กรุณากรอกรหัสนักศึกษา');
      return false;
    }

    if (!formData.national_id.trim()) {
      setError('กรุณากรอกเลขบัตรประชาชน');
      return false;
    }

    if (formData.national_id.length !== 13) {
      setError('เลขบัตรประชาชนต้องมี 13 หลัก');
      return false;
    }

    if (!formData.first_name.trim()) {
      setError('กรุณากรอกชื่อ');
      return false;
    }

    if (!formData.last_name.trim()) {
      setError('กรุณากรอกนามสกุล');
      return false;
    }

    if (!formData.email.trim()) {
      setError('กรุณากรอกอีเมล');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('รูปแบบอีเมลไม่ถูกต้อง');
      return false;
    }

    if (!formData.classroom_id) {
      setError('กรุณาเลือกห้องเรียน');
      return false;
    }

    if (!formData.password.trim()) {
      setError('กรุณากรอกรหัสผ่าน');
      return false;
    }

    if (formData.password.length < 6) {
      setError('รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร');
      return false;
    }

    if (formData.password !== formData.confirm_password) {
      setError('รหัสผ่านไม่ตรงกัน');
      return false;
    }

    return true;
  };

  const handleRegister = async () => {
    setError('');

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      let profileImageUrl = null;
      
      // Upload profile image if selected
      if (profileImage) {
        profileImageUrl = await uploadProfileImage(profileImage);
      }

      // Register user
      const result = await register({
        ...formData,
        profile_picture_url: profileImageUrl,
      });

      if (result.success) {
        // The service function already shows an alert to the user.
        // We just navigate back to Login.
        navigation.navigate('Login');
      } else {
        setError(result.message || 'การลงทะเบียนไม่สำเร็จ');
      }
    } catch (err: any) {
      console.error('Register error:', err);
      setError('เกิดข้อผิดพลาดในการลงทะเบียน');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Text style={styles.logoText}>🏫</Text>
          </View>
          <Text style={styles.title}>ลงทะเบียนนักเรียน</Text>
          <Text style={styles.subtitle}>กรอกข้อมูลเพื่อสร้างบัญชีใหม่</Text>
        </View>

        {/* Registration Form */}
        <View style={styles.formContainer}>
          {/* Profile Image */}
          <View style={styles.imageContainer}>
            <TouchableOpacity style={styles.imageButton} onPress={pickImage}>
              {profileImage ? (
                <Image source={{ uri: profileImage }} style={styles.profileImage} />
              ) : (
                <View style={styles.imagePlaceholder}>
                  <Text style={styles.imagePlaceholderText}>📷</Text>
                  <Text style={styles.imagePlaceholderLabel}>เลือกรูปภาพ</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          {/* Student ID */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>รหัสนักศึกษา *</Text>
            <TextInput
              style={styles.input}
              placeholder="กรอกรหัสนักศึกษา"
              value={formData.student_id}
              onChangeText={(text) => setFormData({ ...formData, student_id: text })}
              autoCapitalize="none"
            />
          </View>

          {/* National ID */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>เลขบัตรประชาชน *</Text>
            <TextInput
              style={styles.input}
              placeholder="กรอกเลขบัตรประชาชน 13 หลัก"
              value={formData.national_id}
              onChangeText={(text) => setFormData({ ...formData, national_id: text })}
              keyboardType="numeric"
              maxLength={13}
            />
          </View>

          {/* Name */}
          <View style={styles.rowContainer}>
            <View style={[styles.inputContainer, styles.halfWidth]}>
              <Text style={styles.label}>ชื่อ *</Text>
              <TextInput
                style={styles.input}
                placeholder="ชื่อ"
                value={formData.first_name}
                onChangeText={(text) => setFormData({ ...formData, first_name: text })}
              />
            </View>
            <View style={[styles.inputContainer, styles.halfWidth]}>
              <Text style={styles.label}>นามสกุล *</Text>
              <TextInput
                style={styles.input}
                placeholder="นามสกุล"
                value={formData.last_name}
                onChangeText={(text) => setFormData({ ...formData, last_name: text })}
              />
            </View>
          </View>

          {/* Gender */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>เพศ *</Text>
            <View style={styles.genderContainer}>
              {['male', 'female', 'other'].map((gender) => (
                <TouchableOpacity
                  key={gender}
                  style={[
                    styles.genderOption,
                    formData.gender === gender && styles.genderOptionSelected
                  ]}
                  onPress={() => setFormData({ ...formData, gender: gender as any })}
                >
                  <Text style={[
                    styles.genderText,
                    formData.gender === gender && styles.genderTextSelected
                  ]}>
                    {gender === 'male' ? 'ชาย' : gender === 'female' ? 'หญิง' : 'อื่นๆ'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Email */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>อีเมล *</Text>
            <TextInput
              style={styles.input}
              placeholder="กรอกอีเมล"
              value={formData.email}
              onChangeText={(text) => setFormData({ ...formData, email: text })}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          {/* Phone */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>เบอร์โทรศัพท์</Text>
            <TextInput
              style={styles.input}
              placeholder="กรอกเบอร์โทรศัพท์"
              value={formData.phone}
              onChangeText={(text) => setFormData({ ...formData, phone: text })}
              keyboardType="phone-pad"
            />
          </View>

          {/* Department */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>แผนกวิชา *</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={formData.department_id}
                onValueChange={(value) => {
                  console.log('Department changed to:', value);
                  setFormData({ ...formData, department_id: value, classroom_id: '' });
                }}
                style={styles.picker}
              >
                <Picker.Item label="เลือกแผนกวิชา" value="" />
                {departments.map((department) => (
                  <Picker.Item
                    key={department.id}
                    label={department.name}
                    value={department.id}
                  />
                ))}
              </Picker>
            </View>
          </View>

          {/* Year Level */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>ชั้นปี *</Text>
            <View style={styles.yearContainer}>
              {[
                { value: 1, label: 'ปวช.1' },
                { value: 2, label: 'ปวช.2' },
                { value: 3, label: 'ปวช.3' },
                { value: 4, label: 'ปวส.1' },
                { value: 5, label: 'ปวส.2' }
              ].map((year) => (
                <TouchableOpacity
                  key={year.value}
                  style={[
                    styles.yearOption,
                    formData.year_level === year.value && styles.yearOptionSelected
                  ]}
                  onPress={() => {
                    console.log('Year level changed to:', year.value);
                    setFormData({ ...formData, year_level: year.value, classroom_id: '' });
                  }}
                >
                  <Text style={[
                    styles.yearText,
                    formData.year_level === year.value && styles.yearTextSelected
                  ]}>
                    {year.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Classroom */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>ห้องเรียน *</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={formData.classroom_id}
                onValueChange={(value) => setFormData({ ...formData, classroom_id: value })}
                style={styles.picker}
                enabled={!!formData.department_id && !!formData.year_level}
              >
                <Picker.Item label="เลือกห้องเรียน" value="" />
                {classrooms.length > 0 ? (
                  classrooms.map((classroom) => (
                    <Picker.Item
                      key={classroom.id}
                      label={classroom.name}
                      value={classroom.id}
                    />
                  ))
                ) : (
                  <Picker.Item label="ไม่มีห้องเรียน" value="" />
                )}
              </Picker>
            </View>
          </View>

          {/* Password */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>รหัสผ่าน *</Text>
            <TextInput
              style={styles.input}
              placeholder="กรอกรหัสผ่าน (อย่างน้อย 6 ตัวอักษร)"
              value={formData.password}
              onChangeText={(text) => setFormData({ ...formData, password: text })}
              secureTextEntry
            />
          </View>

          {/* Confirm Password */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>ยืนยันรหัสผ่าน *</Text>
            <TextInput
              style={styles.input}
              placeholder="กรอกรหัสผ่านอีกครั้ง"
              value={formData.confirm_password}
              onChangeText={(text) => setFormData({ ...formData, confirm_password: text })}
              secureTextEntry
            />
          </View>

          {/* Error Message */}
          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          {/* Register Button */}
          <TouchableOpacity 
            style={[
              styles.registerButton,
              loading && styles.registerButtonDisabled
            ]}
            onPress={handleRegister}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.registerButtonText}>ลงทะเบียน</Text>
            )}
          </TouchableOpacity>

          {/* Back to Login */}
          <TouchableOpacity 
            style={styles.loginLink}
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={styles.loginLinkText}>มีบัญชีแล้ว? เข้าสู่ระบบ</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#28a745',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  logoText: {
    fontSize: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  formContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  imageContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  imageButton: {
    borderRadius: 50,
    overflow: 'hidden',
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  imagePlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#e9ecef',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#dee2e6',
    borderStyle: 'dashed',
  },
  imagePlaceholderText: {
    fontSize: 24,
    marginBottom: 4,
  },
  imagePlaceholderLabel: {
    fontSize: 12,
    color: '#6c757d',
  },
  inputContainer: {
    marginBottom: 20,
  },
  rowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfWidth: {
    width: '48%',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fafafa',
  },
  genderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  genderOption: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
    marginHorizontal: 4,
  },
  genderOptionSelected: {
    backgroundColor: '#007bff',
    borderColor: '#007bff',
  },
  genderText: {
    fontSize: 14,
    color: '#333',
  },
  genderTextSelected: {
    color: '#fff',
    fontWeight: '600',
  },
  yearContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  yearOption: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
    marginHorizontal: 2,
    marginVertical: 4,
    width: '18%',
  },
  yearOptionSelected: {
    backgroundColor: '#007bff',
    borderColor: '#007bff',
  },
  yearText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '600',
  },
  yearTextSelected: {
    color: '#fff',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#fafafa',
  },
  picker: {
    height: 50,
  },
  errorText: {
    color: '#dc3545',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 16,
    backgroundColor: '#f8d7da',
    padding: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#f5c6cb',
  },
  registerButton: {
    backgroundColor: '#28a745',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  registerButtonDisabled: {
    backgroundColor: '#6c757d',
    opacity: 0.6,
  },
  registerButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loginLink: {
    alignItems: 'center',
  },
  loginLinkText: {
    color: '#007bff',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default RegisterScreen;