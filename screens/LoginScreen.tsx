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
import { NativeStackNavigationProp } from '@react-navigation/native-stack'; 
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Types
import { RootStackParamList } from '../types';
type LoginScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Login'>;

// Services
import { login, resetPassword } from '../services/auth';

// Utils
import { createShadowStyle } from '../utils/shadowStyles';

const LoginScreen: React.FC = () => {
  const navigation = useNavigation<LoginScreenNavigationProp>();
  
  const [email, setEmail] = useState<string>(''); // This will hold email or student_id
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [rememberMe, setRememberMe] = useState<boolean>(false);
  const [loginType, setLoginType] = useState<'email' | 'student'>('student');

  useEffect(() => {
    checkStoredCredentials();
  }, []);

  const checkStoredCredentials = async () => {
    try {
      const storedIdentifier = await AsyncStorage.getItem('remembered_identifier');
      if (storedIdentifier) {
        setEmail(storedIdentifier);
        setRememberMe(true);
      }
    } catch (error) {
      console.log('Error loading stored credentials:', error);
    }
  };

  const handleLogin = async () => {
    setError('');

    const identifier = email.trim();
    const pass = password.trim();

    if (!identifier) {
      setError(loginType === 'student' ? 'กรุณากรอกรหัสนักศึกษา' : 'กรุณากรอกอีเมล');
      return;
    }

    if (!pass) {
      setError('กรุณากรอกรหัสผ่าน');
      return;
    }

    if (loginType === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(identifier)) {
        setError('รูปแบบอีเมลไม่ถูกต้อง');
        return;
      }
    }

    setLoading(true);

    try {
      const result = await login(identifier, pass, loginType);

      if (!result.success) {
        setError(result.message || 'ล็อกอินไม่สำเร็จ');
      } else {
        // On success, AppNavigator's onAuthStateChange will handle navigation.
        if (rememberMe) {
          await AsyncStorage.setItem('remembered_identifier', identifier);
        } else {
          await AsyncStorage.removeItem('remembered_identifier');
        }
      }
    } catch (err: any) {
      console.log('Login error:', err);
      setError('เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (loginType !== 'email' || !email) {
      Alert.alert('ลืมรหัสผ่าน', 'กรุณากรอกอีเมลของคุณในช่องอีเมล แล้วกด "ลืมรหัสผ่าน" อีกครั้ง');
      return;
    }
    
    setLoading(true);
    const result = await resetPassword(email);
    setLoading(false);

    if (result.success) {
      Alert.alert('ตรวจสอบอีเมลของคุณ', result.message);
    } else {
      Alert.alert('เกิดข้อผิดพลาด', result.message);
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
        {/* Header with Logo */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Text style={styles.logoText}>🏫</Text>
          </View>
          <Text style={styles.title}>ระบบจัดการกิจกรรม</Text>
          <Text style={styles.subtitle}>โรงเรียนตัวอย่าง</Text>
        </View>

        {/* Login Form */}
        <View style={styles.formContainer}>
          <Text style={styles.formTitle}>เข้าสู่ระบบ</Text>
          
          {/* Login Type Selection */}
          <View style={styles.loginTypeContainer}>
            <TouchableOpacity
              style={[
                styles.loginTypeButton,
                loginType === 'student' && styles.loginTypeButtonActive
              ]}
              onPress={() => setLoginType('student')}
            >
              <Text style={[
                styles.loginTypeText,
                loginType === 'student' && styles.loginTypeTextActive
              ]}>
                นักเรียน
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.loginTypeButton,
                loginType === 'email' && styles.loginTypeButtonActive
              ]}
              onPress={() => setLoginType('email')}
            >
              <Text style={[
                styles.loginTypeText,
                loginType === 'email' && styles.loginTypeTextActive
              ]}>
                อีเมล
              </Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.inputContainer}>
            <Text style={styles.label}>
              {loginType === 'student' ? 'รหัสนักศึกษา' : 'อีเมล'}
            </Text>
            <TextInput
              style={styles.input}
              placeholder={loginType === 'student' ? 'กรอกรหัสนักศึกษา' : 'กรอกอีเมลของคุณ'}
              placeholderTextColor="#999"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType={loginType === 'student' ? 'numeric' : 'email-address'}
              autoComplete={loginType === 'student' ? 'username' : 'email'}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>รหัสผ่าน</Text>
            <TextInput
              style={styles.input}
              placeholder={'กรอกรหัสผ่าน'}
              placeholderTextColor="#999"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoComplete="password"
            />
          </View>

          {/* Remember Me & Forgot Password */}
          <View style={styles.optionsContainer}>
            <TouchableOpacity 
              style={styles.rememberContainer}
              onPress={() => setRememberMe(!rememberMe)}
            >
              <View style={[
                styles.checkbox,
                rememberMe && styles.checkboxChecked
              ]}>
                {rememberMe && <Text style={styles.checkmark}>✓</Text>}
              </View>
              <Text style={styles.rememberText}>จำฉันไว้ในระบบ</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={handleForgotPassword}>
              <Text style={styles.forgotText}>ลืมรหัสผ่าน?</Text>
            </TouchableOpacity>
          </View>

          {/* Error Message */}
          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          {/* Login Button */}
          <TouchableOpacity 
            style={[
              styles.loginButton,
              (loading || !email || !password) && styles.loginButtonDisabled
            ]}
            onPress={handleLogin}
            disabled={loading || !email.trim() || !password.trim()}
          >
            {loading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.loginButtonText}>เข้าสู่ระบบ</Text>
            )}
          </TouchableOpacity>

          {/* Register Button */}
          <TouchableOpacity 
            style={styles.registerButton}
            onPress={() => navigation.navigate('Register')}
          >
            <Text style={styles.registerButtonText}>ยังไม่มีบัญชี? ลงทะเบียนที่นี่</Text>
          </TouchableOpacity>

          {/* Role Info */}
          <View style={styles.roleInfo}>
            <Text style={styles.roleInfoText}>
              • นักเรียน: ใช้สำหรับเช็คชื่อและดูกิจกรรม{'\n'}
              • ครู/เจ้าหน้าที่: ใช้สำหรับจัดการระบบ{'\n'}
              • แอดมิน: ใช้สำหรับจัดการทั้งหมด
            </Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            หากมีปัญหาในการเข้าสู่ระบบ{'\n'}
            กรุณาติดต่อเจ้าหน้าที่ไอที
          </Text>
          <Text style={styles.versionText}>เวอร์ชัน 1.0.0</Text>
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
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  header: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 40,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#007bff',
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
  },
  formContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    ...createShadowStyle('#000', { width: 0, height: 2 }, 0.1, 3.84, 5),
  },
  formTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 24,
    textAlign: 'center',
  },
  loginTypeContainer: {
    flexDirection: 'row',
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 4,
    marginBottom: 20,
  },
  loginTypeButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignItems: 'center',
  },
  loginTypeButtonActive: {
    backgroundColor: '#007bff',
  },
  loginTypeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  loginTypeTextActive: {
    color: '#fff',
  },
  inputContainer: {
    marginBottom: 20,
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
  optionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  rememberContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 1,
    borderColor: '#007bff',
    borderRadius: 4,
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#007bff',
  },
  checkmark: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  rememberText: {
    fontSize: 14,
    color: '#333',
  },
  forgotText: {
    fontSize: 14,
    color: '#007bff',
    fontWeight: '600',
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
  loginButton: {
    backgroundColor: '#007bff',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginBottom: 20,
  },
  loginButtonDisabled: {
    backgroundColor: '#6c757d',
    opacity: 0.6,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  registerButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#007bff',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginBottom: 20,
  },
  registerButtonText: {
    color: '#007bff',
    fontSize: 14,
    fontWeight: '600',
  },
  roleInfo: {
    backgroundColor: '#e7f3ff',
    padding: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#007bff',
  },
  roleInfoText: {
    fontSize: 12,
    color: '#0066cc',
    lineHeight: 18,
  },
  footer: {
    alignItems: 'center',
    marginTop: 20,
  },
  footerText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 8,
  },
  versionText: {
    fontSize: 11,
    color: '#999',
  },
});

export default LoginScreen;