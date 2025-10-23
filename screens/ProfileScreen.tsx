import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Image,
  TextInput,
  Modal,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '../services/supabaseClient';
import { updateProfile, logout } from '../services/auth';
import { RootStackParamList, Profile, ProfileUpdateForm } from '../types';

type ProfileScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Profile'>;

const ProfileScreen: React.FC = () => {
  const navigation = useNavigation<ProfileScreenNavigationProp>();
  
  const [user, setUser] = useState<Profile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [editing, setEditing] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [showImagePicker, setShowImagePicker] = useState<boolean>(false);
  
  const [editForm, setEditForm] = useState<ProfileUpdateForm>({
    first_name: '',
    last_name: '',
    phone: '',
  });

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const userProfile = await AsyncStorage.getItem('user_profile');
      if (userProfile) {
        const userData = JSON.parse(userProfile);
        setUser(userData);
        setEditForm({
          first_name: userData.first_name || '',
          last_name: userData.last_name || '',
          phone: userData.phone || '',
        });
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setEditing(true);
  };

  const handleCancel = () => {
    setEditing(false);
    if (user) {
      setEditForm({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        phone: user.phone || '',
      });
    }
  };

  const handleSave = async () => {
    if (!user) return;

    try {
      setSaving(true);

      const result = await updateProfile(editForm);
      
      if (result.success) {
        // Update local user data
        const updatedUser = { ...user, ...editForm };
        setUser(updatedUser);
        await AsyncStorage.setItem('user_profile', JSON.stringify(updatedUser));
        
        setEditing(false);
        Alert.alert('สำเร็จ', 'อัปเดตโปรไฟล์เรียบร้อยแล้ว');
      } else {
        Alert.alert('ข้อผิดพลาด', result.message || 'ไม่สามารถอัปเดตโปรไฟล์ได้');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('ข้อผิดพลาด', 'เกิดข้อผิดพลาดในการอัปเดต');
    } finally {
      setSaving(false);
    }
  };

  const handleImagePicker = () => {
    setShowImagePicker(true);
  };

  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('ขออนุญาต', 'จำเป็นต้องเข้าถึงแกลเลอรี่เพื่อเลือกรูปภาพ');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled) {
        await uploadProfileImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('ข้อผิดพลาด', 'ไม่สามารถเลือกรูปภาพได้');
    } finally {
      setShowImagePicker(false);
    }
  };

  const takePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('ขออนุญาต', 'จำเป็นต้องใช้กล้องเพื่อถ่ายภาพ');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled) {
        await uploadProfileImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('ข้อผิดพลาด', 'ไม่สามารถถ่ายภาพได้');
    } finally {
      setShowImagePicker(false);
    }
  };

  const uploadProfileImage = async (uri: string) => {
    if (!user) return;

    try {
      const response = await fetch(uri);
      const blob = await response.blob();
      
      const fileName = `profile_${user.id}_${Date.now()}.jpg`;
      const { data, error } = await supabase.storage
        .from('profile-pictures')
        .upload(fileName, blob, {
          contentType: 'image/jpeg',
        });

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('profile-pictures')
        .getPublicUrl(fileName);

      // Update profile with new image URL
      const result = await updateProfile({ profile_picture_url: publicUrl });
      
      if (result.success) {
        const updatedUser = { ...user, profile_picture_url: publicUrl };
        setUser(updatedUser);
        await AsyncStorage.setItem('user_profile', JSON.stringify(updatedUser));
        Alert.alert('สำเร็จ', 'อัปเดตรูปภาพเรียบร้อยแล้ว');
      } else {
        Alert.alert('ข้อผิดพลาด', 'ไม่สามารถอัปเดตรูปภาพได้');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      Alert.alert('ข้อผิดพลาด', 'ไม่สามารถอัปโหลดรูปภาพได้');
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      'ออกจากระบบ',
      'คุณต้องการออกจากระบบหรือไม่?',
      [
        { text: 'ยกเลิก', style: 'cancel' },
        {
          text: 'ออกจากระบบ',
          style: 'destructive',
          onPress: async () => {
            await logout();
            navigation.reset({
              index: 0,
              routes: [{ name: 'Login' }],
            });
          },
        },
      ]
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('th-TH', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text style={styles.loadingText}>กำลังโหลดข้อมูล...</Text>
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>ไม่พบข้อมูลผู้ใช้</Text>
        <TouchableOpacity style={styles.errorButton} onPress={handleLogout}>
          <Text style={styles.errorButtonText}>เข้าสู่ระบบใหม่</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollContainer}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>โปรไฟล์</Text>
          <Text style={styles.headerSubtitle}>
            ข้อมูลส่วนตัวของคุณ
          </Text>
        </View>

        {/* Profile Card */}
        <View style={styles.profileCard}>
          {/* Profile Image */}
          <View style={styles.imageContainer}>
            {user.profile_picture_url ? (
              <Image source={{ uri: user.profile_picture_url }} style={styles.profileImage} />
            ) : (
              <View style={styles.profilePlaceholder}>
                <Text style={styles.profilePlaceholderText}>
                  {user.first_name?.charAt(0)}{user.last_name?.charAt(0)}
                </Text>
              </View>
            )}
            <TouchableOpacity style={styles.imageEditButton} onPress={handleImagePicker}>
              <Text style={styles.imageEditIcon}>📷</Text>
            </TouchableOpacity>
          </View>

          {/* User Info */}
          <View style={styles.userInfo}>
            <Text style={styles.userName}>
              {user.first_name} {user.last_name}
            </Text>
            <Text style={styles.userRole}>
              {user.role === 'student' ? 'นักเรียน' : 
               user.role === 'staff' ? 'เจ้าหน้าที่' : 'ผู้ดูแลระบบ'}
            </Text>
            <Text style={styles.userClass}>
              {user.classroom?.name} - {user.department?.name}
            </Text>
          </View>
        </View>

        {/* Profile Details */}
        <View style={styles.detailsCard}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>ข้อมูลส่วนตัว</Text>
            {!editing && (
              <TouchableOpacity style={styles.editButton} onPress={handleEdit}>
                <Text style={styles.editButtonText}>แก้ไข</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Student ID */}
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>รหัสนักศึกษา</Text>
            <Text style={styles.detailValue}>{user.student_id || 'ไม่ระบุ'}</Text>
          </View>

          {/* National ID */}
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>เลขบัตรประชาชน</Text>
            <Text style={styles.detailValue}>
              {user.national_id ? 
                `${user.national_id.substring(0, 3)}-${user.national_id.substring(3, 6)}-${user.national_id.substring(6, 10)}-${user.national_id.substring(10, 13)}` : 
                'ไม่ระบุ'
              }
            </Text>
          </View>

          {/* Name Fields */}
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>ชื่อ</Text>
            {editing ? (
              <TextInput
                style={styles.detailInput}
                value={editForm.first_name}
                onChangeText={(text) => setEditForm({ ...editForm, first_name: text })}
                placeholder="กรอกชื่อ"
              />
            ) : (
              <Text style={styles.detailValue}>{user.first_name}</Text>
            )}
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>นามสกุล</Text>
            {editing ? (
              <TextInput
                style={styles.detailInput}
                value={editForm.last_name}
                onChangeText={(text) => setEditForm({ ...editForm, last_name: text })}
                placeholder="กรอกนามสกุล"
              />
            ) : (
              <Text style={styles.detailValue}>{user.last_name}</Text>
            )}
          </View>

          {/* Email */}
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>อีเมล</Text>
            <Text style={styles.detailValue}>{user.email}</Text>
          </View>

          {/* Phone */}
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>เบอร์โทรศัพท์</Text>
            {editing ? (
              <TextInput
                style={styles.detailInput}
                value={editForm.phone}
                onChangeText={(text) => setEditForm({ ...editForm, phone: text })}
                placeholder="กรอกเบอร์โทรศัพท์"
                keyboardType="phone-pad"
              />
            ) : (
              <Text style={styles.detailValue}>{user.phone || 'ไม่ระบุ'}</Text>
            )}
          </View>

          {/* Gender */}
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>เพศ</Text>
            <Text style={styles.detailValue}>
              {user.gender === 'male' ? 'ชาย' : 
               user.gender === 'female' ? 'หญิง' : 
               user.gender === 'other' ? 'อื่นๆ' : 'ไม่ระบุ'}
            </Text>
          </View>

          {/* Year Level */}
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>ชั้นปี</Text>
            <Text style={styles.detailValue}>
              {user.year_level ? `ม.${user.year_level}` : 'ไม่ระบุ'}
            </Text>
          </View>

          {/* Join Date */}
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>วันที่เข้าร่วม</Text>
            <Text style={styles.detailValue}>{formatDate(user.created_at)}</Text>
          </View>

          {/* Edit Actions */}
          {editing && (
            <View style={styles.editActions}>
              <TouchableOpacity 
                style={styles.cancelButton} 
                onPress={handleCancel}
                disabled={saving}
              >
                <Text style={styles.cancelButtonText}>ยกเลิก</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.saveButton} 
                onPress={handleSave}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.saveButtonText}>บันทึก</Text>
                )}
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Actions */}
        <View style={styles.actionsCard}>
          <Text style={styles.sectionTitle}>การดำเนินการ</Text>
          
          <TouchableOpacity style={styles.actionButton} onPress={handleLogout}>
            <Text style={styles.actionIcon}>🚪</Text>
            <Text style={styles.actionText}>ออกจากระบบ</Text>
            <Text style={styles.actionArrow}>›</Text>
          </TouchableOpacity>
        </View>

        {/* App Info */}
        <View style={styles.appInfoCard}>
          <Text style={styles.appInfoText}>
            ระบบจัดการกิจกรรมนักเรียน{'\n'}
            เวอร์ชัน 1.0.0{'\n'}
            พัฒนาโดยทีมพัฒนาโรงเรียน
          </Text>
        </View>
      </ScrollView>

      {/* Image Picker Modal */}
      <Modal
        visible={showImagePicker}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowImagePicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>เลือกรูปภาพ</Text>
            
            <TouchableOpacity style={styles.modalButton} onPress={pickImage}>
              <Text style={styles.modalButtonIcon}>📁</Text>
              <Text style={styles.modalButtonText}>เลือกจากแกลเลอรี่</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.modalButton} onPress={takePhoto}>
              <Text style={styles.modalButtonIcon}>📷</Text>
              <Text style={styles.modalButtonText}>ถ่ายภาพใหม่</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.modalCancelButton} 
              onPress={() => setShowImagePicker(false)}
            >
              <Text style={styles.modalCancelButtonText}>ยกเลิก</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: '#dc3545',
    marginBottom: 20,
    textAlign: 'center',
  },
  errorButton: {
    backgroundColor: '#007bff',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  errorButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  scrollContainer: {
    flex: 1,
  },
  header: {
    backgroundColor: '#007bff',
    padding: 20,
    paddingTop: 40,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.9,
  },
  profileCard: {
    backgroundColor: '#fff',
    margin: 16,
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
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
    position: 'relative',
    marginBottom: 16,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  profilePlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#e9ecef',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profilePlaceholderText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#6c757d',
  },
  imageEditButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#007bff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  imageEditIcon: {
    fontSize: 16,
  },
  userInfo: {
    alignItems: 'center',
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  userRole: {
    fontSize: 14,
    color: '#007bff',
    marginBottom: 4,
  },
  userClass: {
    fontSize: 14,
    color: '#666',
  },
  detailsCard: {
    backgroundColor: '#fff',
    margin: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  editButton: {
    backgroundColor: '#007bff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  editButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  detailValue: {
    fontSize: 14,
    color: '#333',
    flex: 2,
    textAlign: 'right',
  },
  detailInput: {
    fontSize: 14,
    color: '#333',
    flex: 2,
    textAlign: 'right',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  editActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#6c757d',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginRight: 8,
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#28a745',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginLeft: 8,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  actionsCard: {
    backgroundColor: '#fff',
    margin: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  actionIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  actionText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  actionArrow: {
    fontSize: 20,
    color: '#666',
  },
  appInfoCard: {
    backgroundColor: '#e7f3ff',
    margin: 16,
    padding: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#007bff',
  },
  appInfoText: {
    fontSize: 12,
    color: '#0066cc',
    textAlign: 'center',
    lineHeight: 18,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    width: '80%',
    maxWidth: 300,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 20,
  },
  modalButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 8,
    backgroundColor: '#f8f9fa',
    marginBottom: 12,
  },
  modalButtonIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  modalButtonText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  modalCancelButton: {
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  modalCancelButtonText: {
    fontSize: 16,
    color: '#666',
  },
});

export default ProfileScreen;






