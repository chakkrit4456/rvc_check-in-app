import { Platform, ViewStyle } from 'react-native';

/**
 * Helper function to create shadow styles that work on both native and web
 * For native: uses shadowColor, shadowOffset, shadowOpacity, shadowRadius
 * For web: uses boxShadow
 */
export const createShadowStyle = (
  shadowColor: string = '#000',
  shadowOffset: { width: number; height: number } = { width: 0, height: 2 },
  shadowOpacity: number = 0.1,
  shadowRadius: number = 3.84,
  elevation: number = 5
): ViewStyle => {
  if (Platform.OS === 'web') {
    // For web, use boxShadow
    const { width, height } = shadowOffset;
    const boxShadow = `${width}px ${height}px ${shadowRadius}px rgba(0, 0, 0, ${shadowOpacity})`;
    
    return {
      boxShadow,
      // @ts-ignore - boxShadow is valid for web
      WebkitBoxShadow: boxShadow,
    } as ViewStyle;
  } else {
    // For native (iOS/Android), use shadow properties
    return {
      shadowColor,
      shadowOffset,
      shadowOpacity,
      shadowRadius,
      elevation, // Android
    };
  }
};




