// services/storage.ts
import { supabase } from './supabaseClient';
import { StorageFile } from '../types';

export class StorageService {
  private static instance: StorageService;
  
  public static getInstance(): StorageService {
    if (!StorageService.instance) {
      StorageService.instance = new StorageService();
    }
    return StorageService.instance;
  }

  // Upload profile picture
  async uploadProfilePicture(
    file: File | Blob, 
    userId: string, 
    fileName?: string
  ): Promise<{ success: boolean; url?: string; error?: string }> {
    try {
      const finalFileName = fileName || `profile_${userId}_${Date.now()}.jpg`;
      
      const { data, error } = await supabase.storage
        .from('profile-pictures')
        .upload(finalFileName, file, {
          contentType: 'image/jpeg',
          upsert: true, // Replace if exists
        });

      if (error) {
        console.error('Upload error:', error);
        return { success: false, error: error.message };
      }

      const { data: { publicUrl } } = supabase.storage
        .from('profile-pictures')
        .getPublicUrl(finalFileName);

      return { success: true, url: publicUrl };
    } catch (error) {
      console.error('Storage service error:', error);
      return { success: false, error: 'เกิดข้อผิดพลาดในการอัปโหลด' };
    }
  }

  // Upload attendance photo
  async uploadAttendancePhoto(
    file: File | Blob, 
    userId: string, 
    activityId: string,
    fileName?: string
  ): Promise<{ success: boolean; url?: string; error?: string }> {
    try {
      const finalFileName = fileName || `attendance_${userId}_${activityId}_${Date.now()}.jpg`;
      
      const { data, error } = await supabase.storage
        .from('attendance-photos')
        .upload(finalFileName, file, {
          contentType: 'image/jpeg',
        });

      if (error) {
        console.error('Upload error:', error);
        return { success: false, error: error.message };
      }

      const { data: { publicUrl } } = supabase.storage
        .from('attendance-photos')
        .getPublicUrl(finalFileName);

      return { success: true, url: publicUrl };
    } catch (error) {
      console.error('Storage service error:', error);
      return { success: false, error: 'เกิดข้อผิดพลาดในการอัปโหลด' };
    }
  }

  // Delete file
  async deleteFile(bucket: string, fileName: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase.storage
        .from(bucket)
        .remove([fileName]);

      if (error) {
        console.error('Delete error:', error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      console.error('Storage service error:', error);
      return { success: false, error: 'เกิดข้อผิดพลาดในการลบไฟล์' };
    }
  }

  // Get file URL
  getFileUrl(bucket: string, fileName: string): string {
    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(fileName);
    
    return publicUrl;
  }

  // List files in bucket
  async listFiles(bucket: string, folder?: string): Promise<{ success: boolean; files?: StorageFile[]; error?: string }> {
    try {
      const { data, error } = await supabase.storage
        .from(bucket)
        .list(folder);

      if (error) {
        console.error('List error:', error);
        return { success: false, error: error.message };
      }

      const files: StorageFile[] = data.map(file => ({
        name: file.name,
        url: this.getFileUrl(bucket, folder ? `${folder}/${file.name}` : file.name),
        size: file.metadata?.size || 0,
        type: file.metadata?.mimetype || 'unknown',
      }));

      return { success: true, files };
    } catch (error) {
      console.error('Storage service error:', error);
      return { success: false, error: 'เกิดข้อผิดพลาดในการดึงรายการไฟล์' };
    }
  }

  // Get file metadata
  async getFileMetadata(bucket: string, fileName: string): Promise<{ success: boolean; metadata?: any; error?: string }> {
    try {
      const { data, error } = await supabase.storage
        .from(bucket)
        .getPublicUrl(fileName);

      if (error) {
        console.error('Metadata error:', error);
        return { success: false, error: error.message };
      }

      return { success: true, metadata: data };
    } catch (error) {
      console.error('Storage service error:', error);
      return { success: false, error: 'เกิดข้อผิดพลาดในการดึงข้อมูลไฟล์' };
    }
  }

  // Create signed URL for private access
  async createSignedUrl(
    bucket: string, 
    fileName: string, 
    expiresIn: number = 3600
  ): Promise<{ success: boolean; url?: string; error?: string }> {
    try {
      const { data, error } = await supabase.storage
        .from(bucket)
        .createSignedUrl(fileName, expiresIn);

      if (error) {
        console.error('Signed URL error:', error);
        return { success: false, error: error.message };
      }

      return { success: true, url: data.signedUrl };
    } catch (error) {
      console.error('Storage service error:', error);
      return { success: false, error: 'เกิดข้อผิดพลาดในการสร้างลิงก์' };
    }
  }

  // Upload multiple files
  async uploadMultipleFiles(
    files: File[],
    bucket: string,
    folder?: string
  ): Promise<{ success: boolean; urls?: string[]; errors?: string[] }> {
    const results = await Promise.allSettled(
      files.map(file => {
        const fileName = folder ? `${folder}/${file.name}` : file.name;
        return supabase.storage.from(bucket).upload(fileName, file);
      })
    );

    const urls: string[] = [];
    const errors: string[] = [];

    results.forEach((result, index) => {
      if (result.status === 'fulfilled' && result.value.data) {
        const fileName = folder ? `${folder}/${files[index].name}` : files[index].name;
        urls.push(this.getFileUrl(bucket, fileName));
      } else {
        errors.push(`ไฟล์ ${files[index].name}: ${result.status === 'rejected' ? result.reason : 'ไม่สามารถอัปโหลดได้'}`);
      }
    });

    return {
      success: urls.length > 0,
      urls: urls.length > 0 ? urls : undefined,
      errors: errors.length > 0 ? errors : undefined,
    };
  }
}

// Export singleton instance
export const storageService = StorageService.getInstance();

// Helper functions for React Native
export const uploadImageFromUri = async (
  uri: string,
  bucket: string,
  fileName: string
): Promise<{ success: boolean; url?: string; error?: string }> => {
  try {
    const response = await fetch(uri);
    const blob = await response.blob();
    
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(fileName, blob, {
        contentType: 'image/jpeg',
      });

    if (error) {
      return { success: false, error: error.message };
    }

    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(fileName);

    return { success: true, url: publicUrl };
  } catch (error) {
    console.error('Upload from URI error:', error);
    return { success: false, error: 'เกิดข้อผิดพลาดในการอัปโหลด' };
  }
};

// Helper function to compress image
export const compressImage = async (
  uri: string,
  quality: number = 0.8
): Promise<string> => {
  // This would typically use a library like react-native-image-resizer
  // For now, return the original URI
  return uri;
};

// Helper function to get file size
export const getFileSize = async (uri: string): Promise<number> => {
  try {
    const response = await fetch(uri);
    const blob = await response.blob();
    return blob.size;
  } catch (error) {
    console.error('Error getting file size:', error);
    return 0;
  }
};
