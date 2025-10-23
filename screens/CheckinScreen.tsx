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
  Modal,
} from 'react-native';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../services/supabaseClient';
import { getCurrentUser } from '../services/auth';
import { RootStackParamList, Activity, Profile } from '../types';

type CheckinScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Checkin'>;

const CheckinScreen: React.FC = () => {
  const navigation = useNavigation<CheckinScreenNavigationProp>();
  
  const [activities, setActivities] = useState<Activity[]>([]);
  const [user, setUser] = useState<Profile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [checkingIn, setCheckingIn] = useState<boolean>(false);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  
  // Camera states
  const [permission, requestPermission] = useCameraPermissions();
  const [showCamera, setShowCamera] = useState<boolean>(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [cameraType, setCameraType] = useState<CameraType>('back');

  useEffect(() => {
    loadUserData();
    loadActivities();
  }, []);

  const loadUserData = async () => {
    try {
      const userProfile = await AsyncStorage.getItem('user_profile');
      if (userProfile) {
        const userData = JSON.parse(userProfile);
        setUser(userData);
        console.log('User data loaded in CheckinScreen:', userData);
      } else {
        // Try to get current user from Supabase
        const currentUser = await getCurrentUser();
        if (currentUser) {
          setUser(currentUser);
        }
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const loadActivities = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('activities')
        .select(`
          *,
          creator:profiles(first_name, last_name)
        `)
        .eq('status', 'active')
        .order('start_time', { ascending: true });

      if (error) {
        console.error('Activities error:', error);
        console.log('Using fallback activities data');
        
        // Set fallback activities data
        const fallbackActivities = [
          {
            id: '1',
            title: 'เข้าแถวเช้า',
            description: 'การเข้าแถวประจำวัน',
            activity_type: 'morning_assembly',
            location: 'สนามโรงเรียน',
            start_time: new Date().toISOString(),
            end_time: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
            status: 'active',
            requires_photo: true,
            target_classrooms: [],
            target_departments: [],
            target_year_levels: [1, 2, 3, 4, 5],
            creator: { first_name: 'Admin', last_name: 'User' }
          },
          {
            id: '2',
            title: 'กิจกรรมกีฬาสี',
            description: 'การแข่งขันกีฬาสีประจำปี',
            activity_type: 'sports',
            location: 'สนามกีฬา',
            start_time: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
            end_time: new Date(Date.now() + 5 * 60 * 60 * 1000).toISOString(),
            status: 'active',
            requires_photo: true,
            target_classrooms: [],
            target_departments: [],
            target_year_levels: [1, 2, 3, 4, 5],
            creator: { first_name: 'Admin', last_name: 'User' }
          },
          {
            id: '3',
            title: 'ประชุมนักเรียน',
            description: 'การประชุมประจำสัปดาห์',
            activity_type: 'meeting',
            location: 'หอประชุม',
            start_time: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
            end_time: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString(),
            status: 'active',
            requires_photo: false,
            target_classrooms: [],
            target_departments: [],
            target_year_levels: [4, 5],
            creator: { first_name: 'Admin', last_name: 'User' }
          }
        ];
        
        setActivities(fallbackActivities);
      } else {
        setActivities(data || []);
      }
    } catch (error) {
      console.error('Error loading activities:', error);
      console.log('Activities loading failed, using empty array');
      setActivities([]);
    } finally {
      setLoading(false);
    }
  };

  const checkActivityEligibility = (activity: Activity): boolean => {
    if (!user) return false;

    // If no specific targets are set, allow all users
    if (activity.target_classrooms.length === 0 && 
        activity.target_departments.length === 0 && 
        activity.target_year_levels.length === 0) {
      return true;
    }

    // Check if user's classroom is targeted
    if (activity.target_classrooms.length > 0) {
      if (user.classroom_id && !activity.target_classrooms.includes(user.classroom_id)) {
        return false;
      }
    }

    // Check if user's department is targeted
    if (activity.target_departments.length > 0) {
      if (user.department_id && !activity.target_departments.includes(user.department_id)) {
        return false;
      }
    }

    // Check if user's year level is targeted
    if (activity.target_year_levels.length > 0) {
      if (user.year_level && !activity.target_year_levels.includes(user.year_level)) {
        return false;
      }
    }

    return true;
  };

  const handleCheckIn = async (activity: Activity) => {
    if (!user) {
      Alert.alert('ข้อผิดพลาด', 'ไม่พบข้อมูลผู้ใช้');
      return;
    }

    if (!checkActivityEligibility(activity)) {
      Alert.alert('ไม่สามารถเข้าร่วมได้', 'คุณไม่มีสิทธิ์เข้าร่วมกิจกรรมนี้');
      return;
    }

    // Check if already checked in
    const { data: existingRecord } = await supabase
      .from('attendance_records')
      .select('id')
      .eq('student_id', user.id)
      .eq('activity_id', activity.id)
      .single();

    if (existingRecord) {
      Alert.alert('เข้าร่วมแล้ว', 'คุณได้เข้าร่วมกิจกรรมนี้แล้ว');
      return;
    }

    setSelectedActivity(activity);
    
    if (activity.requires_photo) {
      if (!permission?.granted) {
        const result = await requestPermission();
        if (!result.granted) {
          Alert.alert('ขออนุญาต', 'จำเป็นต้องใช้กล้องเพื่อถ่ายภาพยืนยัน');
          return;
        }
      }
      setShowCamera(true);
    } else {
      await processCheckIn(activity, null);
    }
  };

  const takePicture = async () => {
    if (!selectedActivity) return;

    try {
      // This would be implemented with the actual camera capture
      // For now, we'll simulate it
      const mockImageUri = 'data:image/jpeg;base64,mock_image_data';
      setCapturedImage(mockImageUri);
      setShowCamera(false);
      
      await processCheckIn(selectedActivity, mockImageUri);
    } catch (error) {
      console.error('Error taking picture:', error);
      Alert.alert('ข้อผิดพลาด', 'ไม่สามารถถ่ายภาพได้');
    }
  };

  const uploadAttendancePhoto = async (imageUri: string): Promise<string | null> => {
    try {
      const response = await fetch(imageUri);
      const blob = await response.blob();
      
      const fileName = `attendance_${Date.now()}_${selectedActivity?.id}.jpg`;
      const { data, error } = await supabase.storage
        .from('attendance-photos')
        .upload(fileName, blob, {
          contentType: 'image/jpeg',
        });

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('attendance-photos')
        .getPublicUrl(fileName);

      return publicUrl;
    } catch (error) {
      console.error('Error uploading attendance photo:', error);
      return null;
    }
  };

  const processCheckIn = async (activity: Activity, photoUri: string | null) => {
    if (!user) return;

    try {
      setCheckingIn(true);

      let photoUrl = null;
      if (photoUri) {
        photoUrl = await uploadAttendancePhoto(photoUri);
      }

      const { error } = await supabase
        .from('attendance_records')
        .insert({
          student_id: user.id,
          activity_id: activity.id,
          status: 'present',
          photo_url: photoUrl,
          photo_metadata: {
            timestamp: new Date().toISOString(),
            device_info: {
              platform: 'mobile',
            },
          },
        });

      if (error) throw error;

      Alert.alert(
        'เช็คชื่อสำเร็จ',
        `คุณได้เข้าร่วมกิจกรรม "${activity.title}" เรียบร้อยแล้ว`,
        [
          {
            text: 'ตกลง',
            onPress: () => {
              setSelectedActivity(null);
              setCapturedImage(null);
              loadActivities(); // Refresh activities
            },
          },
        ]
      );
    } catch (error) {
      console.error('Error processing check-in:', error);
      Alert.alert('ข้อผิดพลาด', 'ไม่สามารถเช็คชื่อได้');
    } finally {
      setCheckingIn(false);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('th-TH', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('th-TH', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const getActivityStatus = (activity: Activity) => {
    const now = new Date();
    const startTime = new Date(activity.start_time);
    const endTime = new Date(activity.end_time);

    if (now < startTime) {
      return { status: 'upcoming', text: 'ยังไม่เริ่ม', color: '#ffc107' };
    } else if (now >= startTime && now <= endTime) {
      return { status: 'active', text: 'กำลังเปิด', color: '#28a745' };
    } else {
      return { status: 'ended', text: 'สิ้นสุดแล้ว', color: '#dc3545' };
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text style={styles.loadingText}>กำลังโหลดกิจกรรม...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollContainer}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>กิจกรรมที่เปิดให้เช็คชื่อ</Text>
          <Text style={styles.headerSubtitle}>
            เลือกกิจกรรมที่ต้องการเข้าร่วม
          </Text>
        </View>

        {/* Activities List */}
        {activities.length > 0 ? (
          activities.map((activity) => {
            const activityStatus = getActivityStatus(activity);
            const isEligible = checkActivityEligibility(activity);
            
            return (
              <TouchableOpacity
                key={activity.id}
                style={[
                  styles.activityCard,
                  !isEligible && styles.activityCardDisabled,
                  activityStatus.status === 'ended' && styles.activityCardEnded,
                ]}
                onPress={() => handleCheckIn(activity)}
                disabled={!isEligible || activityStatus.status === 'ended' || checkingIn}
              >
                <View style={styles.activityHeader}>
                  <Text style={styles.activityTitle}>{activity.title}</Text>
                  <View style={[styles.statusBadge, { backgroundColor: activityStatus.color }]}>
                    <Text style={styles.statusText}>{activityStatus.text}</Text>
                  </View>
                </View>

                <Text style={styles.activityDescription}>{activity.description}</Text>

                <View style={styles.activityDetails}>
                  <Text style={styles.activityTime}>
                    🕐 {formatTime(activity.start_time)} - {formatTime(activity.end_time)}
                  </Text>
                  <Text style={styles.activityDate}>
                    📅 {formatDate(activity.start_time)}
                  </Text>
                </View>

                {activity.location && (
                  <Text style={styles.activityLocation}>
                    📍 {activity.location}
                  </Text>
                )}

                <View style={styles.activityFooter}>
                  <Text style={styles.activityType}>
                    ประเภท: {activity.activity_type}
                  </Text>
                  {activity.requires_photo && (
                    <Text style={styles.photoRequired}>
                      📷 ต้องถ่ายภาพยืนยัน
                    </Text>
                  )}
                </View>

                {!isEligible && (
                  <View style={styles.notEligibleOverlay}>
                    <Text style={styles.notEligibleText}>
                      คุณไม่มีสิทธิ์เข้าร่วมกิจกรรมนี้
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateIcon}>📅</Text>
            <Text style={styles.emptyStateText}>ไม่มีกิจกรรมที่เปิดในขณะนี้</Text>
            <Text style={styles.emptyStateSubtext}>
              กรุณาตรวจสอบอีกครั้งในภายหลัง
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Camera Modal */}
      <Modal
        visible={showCamera}
        animationType="slide"
        onRequestClose={() => setShowCamera(false)}
      >
        <View style={styles.cameraContainer}>
          <CameraView
            style={styles.camera}
            facing={cameraType}
          >
            <View style={styles.cameraOverlay}>
              <View style={styles.cameraHeader}>
                <TouchableOpacity
                  style={styles.cameraButton}
                  onPress={() => setShowCamera(false)}
                >
                  <Text style={styles.cameraButtonText}>✕</Text>
                </TouchableOpacity>
                <Text style={styles.cameraTitle}>ถ่ายภาพยืนยัน</Text>
                <TouchableOpacity
                  style={styles.cameraButton}
                  onPress={() => setCameraType(cameraType === 'back' ? 'front' : 'back')}
                >
                  <Text style={styles.cameraButtonText}>🔄</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.cameraFooter}>
                <TouchableOpacity
                  style={styles.captureButton}
                  onPress={takePicture}
                >
                  <View style={styles.captureButtonInner} />
                </TouchableOpacity>
              </View>
            </View>
          </CameraView>
        </View>
      </Modal>

      {/* Loading Overlay */}
      {checkingIn && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#007bff" />
          <Text style={styles.loadingOverlayText}>กำลังประมวลผล...</Text>
        </View>
      )}
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
  activityCard: {
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
  activityCardDisabled: {
    opacity: 0.6,
  },
  activityCardEnded: {
    opacity: 0.5,
  },
  activityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  activityTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  activityDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
    lineHeight: 20,
  },
  activityDetails: {
    marginBottom: 12,
  },
  activityTime: {
    fontSize: 14,
    color: '#333',
    marginBottom: 4,
  },
  activityDate: {
    fontSize: 14,
    color: '#333',
  },
  activityLocation: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  activityFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  activityType: {
    fontSize: 12,
    color: '#666',
  },
  photoRequired: {
    fontSize: 12,
    color: '#007bff',
    fontWeight: '600',
  },
  notEligibleOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
  },
  notEligibleText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  emptyState: {
    alignItems: 'center',
    padding: 60,
  },
  emptyStateIcon: {
    fontSize: 64,
    marginBottom: 24,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  cameraContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  camera: {
    flex: 1,
  },
  cameraOverlay: {
    flex: 1,
    justifyContent: 'space-between',
  },
  cameraHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 40,
  },
  cameraButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  cameraTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  cameraFooter: {
    alignItems: 'center',
    padding: 40,
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#fff',
  },
  captureButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#fff',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingOverlayText: {
    color: '#fff',
    fontSize: 16,
    marginTop: 16,
  },
});

export default CheckinScreen;

