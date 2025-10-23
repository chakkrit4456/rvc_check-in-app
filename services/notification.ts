// services/notification.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from './supabaseClient';

export interface NotificationData {
  title: string;
  body: string;
  data?: any;
  type?: 'announcement' | 'activity' | 'reminder';
}

export class NotificationService {
  private static instance: NotificationService;
  
  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  // Request notification permissions
  async requestPermissions(): Promise<boolean> {
    try {
      // This would typically use expo-notifications or react-native-push-notification
      // For now, we'll simulate the permission request
      console.log('Requesting notification permissions...');
      return true;
    } catch (error) {
      console.error('Error requesting permissions:', error);
      return false;
    }
  }

  // Get device token
  async getDeviceToken(): Promise<string | null> {
    try {
      // This would typically get the actual device token
      // For now, we'll generate a mock token
      const token = `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      await AsyncStorage.setItem('device_token', token);
      return token;
    } catch (error) {
      console.error('Error getting device token:', error);
      return null;
    }
  }

  // Register device for notifications
  async registerDevice(userId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const token = await this.getDeviceToken();
      if (!token) {
        return { success: false, error: 'ไม่สามารถรับ device token ได้' };
      }

      // Store device token in database
      const { error } = await supabase
        .from('device_tokens')
        .upsert({
          user_id: userId,
          device_token: token,
          platform: 'mobile',
          is_active: true,
          updated_at: new Date().toISOString(),
        });

      if (error) {
        console.error('Error registering device:', error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      console.error('Error registering device:', error);
      return { success: false, error: 'เกิดข้อผิดพลาดในการลงทะเบียนอุปกรณ์' };
    }
  }

  // Unregister device
  async unregisterDevice(userId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('device_tokens')
        .update({ is_active: false })
        .eq('user_id', userId);

      if (error) {
        console.error('Error unregistering device:', error);
        return { success: false, error: error.message };
      }

      await AsyncStorage.removeItem('device_token');
      return { success: true };
    } catch (error) {
      console.error('Error unregistering device:', error);
      return { success: false, error: 'เกิดข้อผิดพลาดในการยกเลิกการลงทะเบียน' };
    }
  }

  // Send local notification
  async sendLocalNotification(notification: NotificationData): Promise<void> {
    try {
      // This would typically use expo-notifications
      console.log('Sending local notification:', notification);
    } catch (error) {
      console.error('Error sending local notification:', error);
    }
  }

  // Schedule notification
  async scheduleNotification(
    notification: NotificationData,
    triggerDate: Date
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // This would typically use expo-notifications
      console.log('Scheduling notification:', notification, 'for', triggerDate);
      return { success: true };
    } catch (error) {
      console.error('Error scheduling notification:', error);
      return { success: false, error: 'เกิดข้อผิดพลาดในการตั้งเวลาการแจ้งเตือน' };
    }
  }

  // Cancel scheduled notification
  async cancelNotification(notificationId: string): Promise<{ success: boolean; error?: string }> {
    try {
      // This would typically use expo-notifications
      console.log('Canceling notification:', notificationId);
      return { success: true };
    } catch (error) {
      console.error('Error canceling notification:', error);
      return { success: false, error: 'เกิดข้อผิดพลาดในการยกเลิกการแจ้งเตือน' };
    }
  }

  // Handle notification received
  async handleNotificationReceived(notification: any): Promise<void> {
    try {
      console.log('Notification received:', notification);
      
      // Handle different notification types
      switch (notification.data?.type) {
        case 'announcement':
          // Navigate to news screen
          break;
        case 'activity':
          // Navigate to check-in screen
          break;
        case 'reminder':
          // Show reminder
          break;
        default:
          // Handle general notification
          break;
      }
    } catch (error) {
      console.error('Error handling notification:', error);
    }
  }

  // Handle notification tapped
  async handleNotificationTapped(notification: any): Promise<void> {
    try {
      console.log('Notification tapped:', notification);
      
      // Navigate based on notification data
      if (notification.data?.screen) {
        // Navigate to specific screen
      }
    } catch (error) {
      console.error('Error handling notification tap:', error);
    }
  }

  // Subscribe to notification updates
  subscribeToNotifications(callback: (notification: NotificationData) => void): void {
    // This would typically set up a listener for incoming notifications
    console.log('Subscribing to notifications...');
  }

  // Unsubscribe from notifications
  unsubscribeFromNotifications(): void {
    // This would typically remove the listener
    console.log('Unsubscribing from notifications...');
  }
}

// Export singleton instance
export const notificationService = NotificationService.getInstance();

// Helper functions
export const getDeviceToken = async (): Promise<string | null> => {
  return await notificationService.getDeviceToken();
};

export const registerForNotifications = async (userId: string): Promise<boolean> => {
  const result = await notificationService.registerDevice(userId);
  return result.success;
};

export const sendTestNotification = async (): Promise<void> => {
  await notificationService.sendLocalNotification({
    title: 'การแจ้งเตือนทดสอบ',
    body: 'นี่คือการแจ้งเตือนทดสอบจากระบบ',
    type: 'announcement',
  });
};

// Notification templates
export const createAnnouncementNotification = (
  title: string,
  content: string
): NotificationData => ({
  title: `📢 ${title}`,
  body: content,
  type: 'announcement',
});

export const createActivityNotification = (
  activityTitle: string,
  startTime: string
): NotificationData => ({
  title: `🎯 กิจกรรมใหม่: ${activityTitle}`,
  body: `เริ่มเวลา ${startTime}`,
  type: 'activity',
});

export const createReminderNotification = (
  activityTitle: string,
  minutesLeft: number
): NotificationData => ({
  title: `⏰ เตือนกิจกรรม`,
  body: `${activityTitle} จะเริ่มในอีก ${minutesLeft} นาที`,
  type: 'reminder',
});

// Background notification handler
export const handleBackgroundNotification = async (notification: any): Promise<void> => {
  try {
    console.log('Background notification received:', notification);
    
    // Process notification in background
    if (notification.data?.type === 'announcement') {
      // Update local announcements cache
    } else if (notification.data?.type === 'activity') {
      // Update local activities cache
    }
  } catch (error) {
    console.error('Error handling background notification:', error);
  }
};






