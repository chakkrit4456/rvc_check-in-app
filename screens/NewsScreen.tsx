import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../services/supabaseClient';
import { RootStackParamList, Announcement, Profile } from '../types';

type NewsScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'News'>;

const NewsScreen: React.FC = () => {
  const navigation = useNavigation<NewsScreenNavigationProp>();
  
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [user, setUser] = useState<Profile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  useEffect(() => {
    loadUserData();
    loadAnnouncements();
  }, []);

  const loadUserData = async () => {
    try {
      const userProfile = await AsyncStorage.getItem('user_profile');
      if (userProfile) {
        setUser(JSON.parse(userProfile));
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const loadAnnouncements = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('announcements')
        .select(`
          *,
          creator:profiles(first_name, last_name)
        `)
        .eq('is_published', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading announcements:', error);
        console.log('Using fallback announcements data');
        
        // Set fallback announcements data
        const fallbackAnnouncements = [
          {
            id: '1',
            title: 'ประกาศหยุดเรียน',
            content: 'วันจันทร์ที่ 25 ตุลาคม 2567 โรงเรียนหยุดเรียนเนื่องจากการประชุมครู',
            announcement_type: 'general',
            priority: 'high',
            target_audience: 'all',
            target_classrooms: [],
            target_departments: [],
            target_year_levels: [],
            is_published: true,
            published_at: new Date().toISOString(),
            created_at: new Date().toISOString(),
            creator: { first_name: 'Admin', last_name: 'User' }
          },
          {
            id: '2',
            title: 'กิจกรรมใหม่',
            content: 'ขอเชิญนักเรียนเข้าร่วมกิจกรรมกีฬาสีที่จะจัดขึ้นในสัปดาห์หน้า',
            announcement_type: 'activity',
            priority: 'normal',
            target_audience: 'students',
            target_classrooms: [],
            target_departments: [],
            target_year_levels: [],
            is_published: true,
            published_at: new Date().toISOString(),
            created_at: new Date().toISOString(),
            creator: { first_name: 'Admin', last_name: 'User' }
          },
          {
            id: '3',
            title: 'การสอบกลางภาค',
            content: 'การสอบกลางภาคจะเริ่มในวันที่ 1 พฤศจิกายน 2567',
            announcement_type: 'general',
            priority: 'normal',
            target_audience: 'all',
            target_classrooms: [],
            target_departments: [],
            target_year_levels: [],
            is_published: true,
            published_at: new Date().toISOString(),
            created_at: new Date().toISOString(),
            creator: { first_name: 'Admin', last_name: 'User' }
          }
        ];
        
        setAnnouncements(fallbackAnnouncements);
      } else {
        setAnnouncements(data || []);
      }
    } catch (error) {
      console.error('Error loading announcements:', error);
      console.log('Using fallback announcements data');
      
      // Set fallback announcements data
      const fallbackAnnouncements = [
        {
          id: '1',
          title: 'ประกาศหยุดเรียน',
          content: 'วันจันทร์ที่ 25 ตุลาคม 2567 โรงเรียนหยุดเรียนเนื่องจากการประชุมครู',
          announcement_type: 'general',
          priority: 'high',
          target_audience: 'all',
          target_classrooms: [],
          target_departments: [],
          target_year_levels: [],
          is_published: true,
          published_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
          creator: { first_name: 'Admin', last_name: 'User' }
        },
        {
          id: '2',
          title: 'กิจกรรมใหม่',
          content: 'ขอเชิญนักเรียนเข้าร่วมกิจกรรมกีฬาสีที่จะจัดขึ้นในสัปดาห์หน้า',
          announcement_type: 'activity',
          priority: 'normal',
          target_audience: 'students',
          target_classrooms: [],
          target_departments: [],
          target_year_levels: [],
          is_published: true,
          published_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
          creator: { first_name: 'Admin', last_name: 'User' }
        },
        {
          id: '3',
          title: 'การสอบกลางภาค',
          content: 'การสอบกลางภาคจะเริ่มในวันที่ 1 พฤศจิกายน 2567',
          announcement_type: 'general',
          priority: 'normal',
          target_audience: 'all',
          target_classrooms: [],
          target_departments: [],
          target_year_levels: [],
          is_published: true,
          published_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
          creator: { first_name: 'Admin', last_name: 'User' }
        }
      ];
      
      setAnnouncements(fallbackAnnouncements);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadAnnouncements();
    setRefreshing(false);
  };

  const isAnnouncementRelevant = (announcement: Announcement): boolean => {
    if (!user) return false;

    // Check if announcement is for all users
    if (announcement.target_audience === 'all') {
      return true;
    }

    // Check if announcement is for students
    if (announcement.target_audience === 'students' && user.role === 'student') {
      return true;
    }

    // Check if announcement is for specific classroom
    if (announcement.target_classrooms.length > 0) {
      if (user.classroom_id && announcement.target_classrooms.includes(user.classroom_id)) {
        return true;
      }
    }

    // Check if announcement is for specific department
    if (announcement.target_departments.length > 0) {
      if (user.department_id && announcement.target_departments.includes(user.department_id)) {
        return true;
      }
    }

    // Check if announcement is for specific year level
    if (announcement.target_year_levels.length > 0) {
      if (user.year_level && announcement.target_year_levels.includes(user.year_level)) {
        return true;
      }
    }

    return false;
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return '#dc3545';
      case 'high':
        return '#fd7e14';
      case 'normal':
        return '#007bff';
      case 'low':
        return '#6c757d';
      default:
        return '#007bff';
    }
  };

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'ด่วนมาก';
      case 'high':
        return 'สำคัญ';
      case 'normal':
        return 'ปกติ';
      case 'low':
        return 'ต่ำ';
      default:
        return 'ปกติ';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'activity':
        return '🎯';
      case 'emergency':
        return '🚨';
      case 'general':
      default:
        return '📢';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('th-TH', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const isExpired = (announcement: Announcement): boolean => {
    if (!announcement.expires_at) return false;
    return new Date(announcement.expires_at) < new Date();
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text style={styles.loadingText}>กำลังโหลดข่าวสาร...</Text>
      </View>
    );
  }

  const relevantAnnouncements = announcements.filter(isAnnouncementRelevant);

  return (
    <View style={styles.container}>
      <ScrollView 
        style={styles.scrollContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>ข่าวสารและประกาศ</Text>
          <Text style={styles.headerSubtitle}>
            ข้อมูลล่าสุดจากโรงเรียน
          </Text>
        </View>

        {/* Announcements List */}
        {relevantAnnouncements.length > 0 ? (
          relevantAnnouncements.map((announcement) => {
            const expired = isExpired(announcement);
            const priorityColor = getPriorityColor(announcement.priority);
            
            return (
              <View
                key={announcement.id}
                style={[
                  styles.announcementCard,
                  expired && styles.announcementCardExpired,
                ]}
              >
                {/* Priority Badge */}
                <View style={styles.announcementHeader}>
                  <View style={styles.announcementTitleRow}>
                    <Text style={styles.announcementTypeIcon}>
                      {getTypeIcon(announcement.announcement_type)}
                    </Text>
                    <Text style={styles.announcementTitle} numberOfLines={2}>
                      {announcement.title}
                    </Text>
                  </View>
                  <View style={[styles.priorityBadge, { backgroundColor: priorityColor }]}>
                    <Text style={styles.priorityText}>
                      {getPriorityText(announcement.priority)}
                    </Text>
                  </View>
                </View>

                {/* Content */}
                <Text style={styles.announcementContent} numberOfLines={4}>
                  {announcement.content}
                </Text>

                {/* Footer */}
                <View style={styles.announcementFooter}>
                  <View style={styles.announcementMeta}>
                    <Text style={styles.announcementDate}>
                      📅 {formatDate(announcement.created_at)}
                    </Text>
                    {announcement.creator && (
                      <Text style={styles.announcementAuthor}>
                        โดย {announcement.creator.first_name} {announcement.creator.last_name}
                      </Text>
                    )}
                  </View>
                  
                  {announcement.expires_at && (
                    <View style={styles.expiryInfo}>
                      <Text style={[
                        styles.expiryText,
                        expired && styles.expiryTextExpired
                      ]}>
                        {expired ? 'หมดอายุ' : 'หมดอายุ'} {formatDate(announcement.expires_at)}
                      </Text>
                    </View>
                  )}
                </View>

                {/* Expired Overlay */}
                {expired && (
                  <View style={styles.expiredOverlay}>
                    <Text style={styles.expiredText}>หมดอายุแล้ว</Text>
                  </View>
                )}
              </View>
            );
          })
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateIcon}>📢</Text>
            <Text style={styles.emptyStateText}>ไม่มีข่าวสารในขณะนี้</Text>
            <Text style={styles.emptyStateSubtext}>
              กรุณาตรวจสอบอีกครั้งในภายหลัง
            </Text>
          </View>
        )}

        {/* Footer Info */}
        <View style={styles.footerInfo}>
          <Text style={styles.footerText}>
            ข่าวสารจะอัปเดตแบบเรียลไทม์{'\n'}
            หากมีข้อสงสัย กรุณาติดต่อเจ้าหน้าที่
          </Text>
        </View>
      </ScrollView>
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
  announcementCard: {
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
    position: 'relative',
  },
  announcementCardExpired: {
    opacity: 0.6,
  },
  announcementHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  announcementTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
  },
  announcementTypeIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  announcementTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  priorityText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },
  announcementContent: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 16,
  },
  announcementFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  announcementMeta: {
    flex: 1,
  },
  announcementDate: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  announcementAuthor: {
    fontSize: 12,
    color: '#666',
  },
  expiryInfo: {
    alignItems: 'flex-end',
  },
  expiryText: {
    fontSize: 10,
    color: '#666',
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  expiryTextExpired: {
    color: '#dc3545',
    backgroundColor: '#f8d7da',
  },
  expiredOverlay: {
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
  expiredText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
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
  footerInfo: {
    backgroundColor: '#e7f3ff',
    margin: 16,
    padding: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#007bff',
  },
  footerText: {
    fontSize: 12,
    color: '#0066cc',
    textAlign: 'center',
    lineHeight: 18,
  },
});

export default NewsScreen;






