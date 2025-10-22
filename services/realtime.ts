// services/realtime.ts
import { supabase } from './supabaseClient';
import { RealtimeChannel } from '@supabase/supabase-js';
import { Activity, Announcement, AttendanceRecord } from '../types';

export class RealtimeService {
  private channels: Map<string, RealtimeChannel> = new Map();

  // Subscribe to activities updates
  subscribeToActivities(callback: (payload: any) => void): RealtimeChannel {
    const channel = supabase
      .channel('activities_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'activities',
        },
        callback
      )
      .subscribe();

    this.channels.set('activities', channel);
    return channel;
  }

  // Subscribe to announcements updates
  subscribeToAnnouncements(callback: (payload: any) => void): RealtimeChannel {
    const channel = supabase
      .channel('announcements_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'announcements',
        },
        callback
      )
      .subscribe();

    this.channels.set('announcements', channel);
    return channel;
  }

  // Subscribe to attendance records updates
  subscribeToAttendance(callback: (payload: any) => void): RealtimeChannel {
    const channel = supabase
      .channel('attendance_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'attendance_records',
        },
        callback
      )
      .subscribe();

    this.channels.set('attendance', channel);
    return channel;
  }

  // Subscribe to user's own attendance records
  subscribeToUserAttendance(userId: string, callback: (payload: any) => void): RealtimeChannel {
    const channel = supabase
      .channel(`user_attendance_${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'attendance_records',
          filter: `student_id=eq.${userId}`,
        },
        callback
      )
      .subscribe();

    this.channels.set(`user_attendance_${userId}`, channel);
    return channel;
  }

  // Subscribe to profile updates
  subscribeToProfile(userId: string, callback: (payload: any) => void): RealtimeChannel {
    const channel = supabase
      .channel(`profile_${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${userId}`,
        },
        callback
      )
      .subscribe();

    this.channels.set(`profile_${userId}`, channel);
    return channel;
  }

  // Unsubscribe from a specific channel
  unsubscribe(channelName: string): void {
    const channel = this.channels.get(channelName);
    if (channel) {
      supabase.removeChannel(channel);
      this.channels.delete(channelName);
    }
  }

  // Unsubscribe from all channels
  unsubscribeAll(): void {
    this.channels.forEach((channel) => {
      supabase.removeChannel(channel);
    });
    this.channels.clear();
  }

  // Get channel status
  getChannelStatus(channelName: string): string | null {
    const channel = this.channels.get(channelName);
    return channel ? channel.state : null;
  }

  // Get all active channels
  getActiveChannels(): string[] {
    return Array.from(this.channels.keys());
  }
}

// Create singleton instance
export const realtimeService = new RealtimeService();

// Helper functions for common use cases
export const subscribeToActivitiesUpdates = (callback: (activities: Activity[]) => void) => {
  return realtimeService.subscribeToActivities(async (payload) => {
    console.log('Activities updated:', payload);
    
    // Fetch updated activities
    const { data: activities, error } = await supabase
      .from('activities')
      .select(`
        *,
        creator:profiles(first_name, last_name)
      `)
      .eq('status', 'active')
      .order('start_time', { ascending: true });

    if (!error && activities) {
      callback(activities as Activity[]);
    }
  });
};

export const subscribeToAnnouncementsUpdates = (callback: (announcements: Announcement[]) => void) => {
  return realtimeService.subscribeToAnnouncements(async (payload) => {
    console.log('Announcements updated:', payload);
    
    // Fetch updated announcements
    const { data: announcements, error } = await supabase
      .from('announcements')
      .select(`
        *,
        creator:profiles(first_name, last_name)
      `)
      .eq('is_published', true)
      .order('created_at', { ascending: false });

    if (!error && announcements) {
      callback(announcements as Announcement[]);
    }
  });
};

export const subscribeToUserAttendanceUpdates = (
  userId: string, 
  callback: (records: AttendanceRecord[]) => void
) => {
  return realtimeService.subscribeToUserAttendance(userId, async (payload) => {
    console.log('User attendance updated:', payload);
    
    // Fetch updated attendance records
    const { data: records, error } = await supabase
      .from('attendance_records')
      .select(`
        *,
        activity:activities(*),
        student:profiles(*)
      `)
      .eq('student_id', userId)
      .order('check_in_time', { ascending: false });

    if (!error && records) {
      callback(records as AttendanceRecord[]);
    }
  });
};

// Cleanup function for React components
export const useRealtimeCleanup = () => {
  return () => {
    realtimeService.unsubscribeAll();
  };
};
