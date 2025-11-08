/**
 * Mobile App Configuration (P1.14)
 * React Native mobile app setup for iOS and Android
 * Responsive design, offline mode, native features
 */

export interface MobileAppConfig {
  name: string;
  displayName: string;
  bundleId: string; // iOS
  packageName: string; // Android
  version: string;
  buildNumber: number;
  primaryColor: string;
  splashScreen: SplashScreenConfig;
  icons: AppIconConfig;
  permissions: MobilePermissions;
  features: MobileFeatures;
}

export interface SplashScreenConfig {
  backgroundColor: string;
  image: string;
  resizeMode: 'contain' | 'cover' | 'stretch';
  duration?: number; // milliseconds
}

export interface AppIconConfig {
  ios: {
    '1024x1024': string; // App Store
    '180x180': string;   // iPhone 3x
    '120x120': string;   // iPhone 2x
  };
  android: {
    'xxxhdpi': string;   // 192x192
    'xxhdpi': string;    // 144x144
    'xhdpi': string;     // 96x96
    'hdpi': string;      // 72x72
    'mdpi': string;      // 48x48
  };
}

export interface MobilePermissions {
  camera?: boolean;          // For scanning QR codes
  photos?: boolean;          // For image uploads
  notifications?: boolean;   // Push notifications
  location?: boolean;        // For analytics
  storage?: boolean;         // Offline storage
}

export interface MobileFeatures {
  offline: boolean;          // Offline presentation viewing
  sync: boolean;             // Cloud sync
  sharing: boolean;          // Native share sheet
  deepLinking: boolean;      // Open presentations from URLs
  biometrics: boolean;       // Face ID / Fingerprint
  darkMode: boolean;         // Dark mode support
}

export interface ResponsiveBreakpoints {
  mobile: number;      // 0-767px
  tablet: number;      // 768-1023px
  desktop: number;     // 1024px+
}

export interface OfflineCache {
  presentations: Map<string, CachedPresentation>;
  maxSize: number; // MB
  currentSize: number; // MB
}

export interface CachedPresentation {
  id: string;
  title: string;
  slides: any[];
  cachedAt: Date;
  size: number; // bytes
  lastViewed?: Date;
}

/**
 * Mobile App Manager
 * React Native mobile app configuration and features
 */
export class MobileAppManager {
  private config: MobileAppConfig;
  private offlineCache: OfflineCache;
  private isOnline: boolean = true;

  constructor() {
    this.config = this.getDefaultConfig();
    this.offlineCache = {
      presentations: new Map(),
      maxSize: 100, // 100MB default
      currentSize: 0
    };

    // Detect online status
    if (typeof window !== 'undefined') {
      this.isOnline = navigator.onLine;
      window.addEventListener('online', () => this.setOnlineStatus(true));
      window.addEventListener('offline', () => this.setOnlineStatus(false));
    }
  }

  /**
   * Get default mobile app configuration
   */
  private getDefaultConfig(): MobileAppConfig {
    return {
      name: 'SlideDesigner',
      displayName: 'AI Slide Designer',
      bundleId: 'com.slidedesigner.app',
      packageName: 'com.slidedesigner.app',
      version: '1.0.0',
      buildNumber: 1,
      primaryColor: '#4299E1',
      splashScreen: {
        backgroundColor: '#1A365D',
        image: 'assets/splash.png',
        resizeMode: 'contain',
        duration: 2000
      },
      icons: {
        ios: {
          '1024x1024': 'assets/icon-1024.png',
          '180x180': 'assets/icon-180.png',
          '120x120': 'assets/icon-120.png'
        },
        android: {
          'xxxhdpi': 'assets/icon-xxxhdpi.png',
          'xxhdpi': 'assets/icon-xxhdpi.png',
          'xhdpi': 'assets/icon-xhdpi.png',
          'hdpi': 'assets/icon-hdpi.png',
          'mdpi': 'assets/icon-mdpi.png'
        }
      },
      permissions: {
        camera: true,
        photos: true,
        notifications: true,
        location: false,
        storage: true
      },
      features: {
        offline: true,
        sync: true,
        sharing: true,
        deepLinking: true,
        biometrics: true,
        darkMode: true
      }
    };
  }

  /**
   * Generate React Native config
   */
  generateReactNativeConfig(): string {
    return JSON.stringify({
      name: this.config.name,
      displayName: this.config.displayName,
      dependencies: {
        'react': '^18.2.0',
        'react-native': '^0.72.0',
        '@react-navigation/native': '^6.1.0',
        '@react-navigation/stack': '^6.3.0',
        'react-native-gesture-handler': '^2.12.0',
        'react-native-reanimated': '^3.3.0',
        'react-native-safe-area-context': '^4.7.0',
        'react-native-screens': '^3.24.0',
        '@react-native-async-storage/async-storage': '^1.19.0',
        'react-native-share': '^9.4.0',
        'react-native-biometrics': '^3.0.0',
        'react-native-gesture-zoom': '^2.0.0'
      },
      scripts: {
        'android': 'react-native run-android',
        'ios': 'react-native run-ios',
        'start': 'react-native start',
        'test': 'jest',
        'lint': 'eslint .'
      }
    }, null, 2);
  }

  /**
   * Generate app.json for Expo
   */
  generateExpoConfig(): string {
    return JSON.stringify({
      expo: {
        name: this.config.displayName,
        slug: this.config.name.toLowerCase(),
        version: this.config.version,
        orientation: 'default',
        icon: this.config.icons.ios['1024x1024'],
        userInterfaceStyle: this.config.features.darkMode ? 'automatic' : 'light',
        splash: {
          image: this.config.splashScreen.image,
          resizeMode: this.config.splashScreen.resizeMode,
          backgroundColor: this.config.splashScreen.backgroundColor
        },
        updates: {
          fallbackToCacheTimeout: 0
        },
        assetBundlePatterns: [
          '**/*'
        ],
        ios: {
          supportsTablet: true,
          bundleIdentifier: this.config.bundleId,
          buildNumber: String(this.config.buildNumber),
          infoPlist: this.generateiOSPermissions()
        },
        android: {
          adaptiveIcon: {
            foregroundImage: this.config.icons.android.xxxhdpi,
            backgroundColor: this.config.primaryColor
          },
          package: this.config.packageName,
          versionCode: this.config.buildNumber,
          permissions: this.generateAndroidPermissions()
        },
        web: {
          favicon: './assets/favicon.png'
        }
      }
    }, null, 2);
  }

  /**
   * Generate iOS permissions (Info.plist)
   */
  private generateiOSPermissions(): Record<string, string> {
    const permissions: Record<string, string> = {};

    if (this.config.permissions.camera) {
      permissions.NSCameraUsageDescription = 'Used to scan QR codes and take photos for presentations';
    }
    if (this.config.permissions.photos) {
      permissions.NSPhotoLibraryUsageDescription = 'Used to select images for presentations';
    }
    if (this.config.permissions.notifications) {
      permissions.NSUserNotificationUsageDescription = 'Used to notify you about presentation updates';
    }
    if (this.config.permissions.location) {
      permissions.NSLocationWhenInUseUsageDescription = 'Used for presentation analytics';
    }

    return permissions;
  }

  /**
   * Generate Android permissions
   */
  private generateAndroidPermissions(): string[] {
    const permissions: string[] = ['android.permission.INTERNET'];

    if (this.config.permissions.camera) {
      permissions.push('android.permission.CAMERA');
    }
    if (this.config.permissions.photos) {
      permissions.push('android.permission.READ_EXTERNAL_STORAGE');
      permissions.push('android.permission.WRITE_EXTERNAL_STORAGE');
    }
    if (this.config.permissions.notifications) {
      permissions.push('android.permission.POST_NOTIFICATIONS');
    }
    if (this.config.permissions.location) {
      permissions.push('android.permission.ACCESS_FINE_LOCATION');
    }

    return permissions;
  }

  /**
   * Cache presentation for offline use
   */
  cachePresentation(presentation: CachedPresentation): boolean {
    if (!this.config.features.offline) return false;

    const sizeInMB = presentation.size / (1024 * 1024);

    // Check if we have space
    if (this.offlineCache.currentSize + sizeInMB > this.offlineCache.maxSize) {
      // Clean up old cached presentations
      this.cleanupOldCache();

      // Check again
      if (this.offlineCache.currentSize + sizeInMB > this.offlineCache.maxSize) {
        return false; // Still not enough space
      }
    }

    this.offlineCache.presentations.set(presentation.id, presentation);
    this.offlineCache.currentSize += sizeInMB;

    return true;
  }

  /**
   * Get cached presentation
   */
  getCachedPresentation(id: string): CachedPresentation | undefined {
    const cached = this.offlineCache.presentations.get(id);
    if (cached) {
      cached.lastViewed = new Date();
    }
    return cached;
  }

  /**
   * Remove cached presentation
   */
  removeCachedPresentation(id: string): boolean {
    const cached = this.offlineCache.presentations.get(id);
    if (!cached) return false;

    const sizeInMB = cached.size / (1024 * 1024);
    this.offlineCache.currentSize -= sizeInMB;

    return this.offlineCache.presentations.delete(id);
  }

  /**
   * Clean up old cached presentations
   */
  private cleanupOldCache(): void {
    const cached = Array.from(this.offlineCache.presentations.values())
      .sort((a, b) => {
        const aTime = a.lastViewed || a.cachedAt;
        const bTime = b.lastViewed || b.cachedAt;
        return aTime.getTime() - bTime.getTime();
      });

    // Remove oldest 25%
    const toRemove = Math.ceil(cached.length * 0.25);
    for (let i = 0; i < toRemove; i++) {
      this.removeCachedPresentation(cached[i].id);
    }
  }

  /**
   * Get all cached presentations
   */
  getCachedPresentations(): CachedPresentation[] {
    return Array.from(this.offlineCache.presentations.values())
      .sort((a, b) => {
        const aTime = a.lastViewed || a.cachedAt;
        const bTime = b.lastViewed || b.cachedAt;
        return bTime.getTime() - aTime.getTime();
      });
  }

  /**
   * Get responsive breakpoints
   */
  getBreakpoints(): ResponsiveBreakpoints {
    return {
      mobile: 767,
      tablet: 1023,
      desktop: 1024
    };
  }

  /**
   * Get device type
   */
  getDeviceType(): 'mobile' | 'tablet' | 'desktop' {
    if (typeof window === 'undefined') return 'desktop';

    const width = window.innerWidth;
    const breakpoints = this.getBreakpoints();

    if (width <= breakpoints.mobile) return 'mobile';
    if (width <= breakpoints.tablet) return 'tablet';
    return 'desktop';
  }

  /**
   * Check if online
   */
  isOnlineMode(): boolean {
    return this.isOnline;
  }

  /**
   * Set online status
   */
  private setOnlineStatus(online: boolean): void {
    this.isOnline = online;
  }

  /**
   * Generate deep link
   */
  generateDeepLink(presentationId: string): string {
    return `slidedesigner://presentation/${presentationId}`;
  }

  /**
   * Parse deep link
   */
  parseDeepLink(url: string): { type: string; id: string } | null {
    const match = url.match(/slidedesigner:\/\/([^\/]+)\/(.+)/);
    if (!match) return null;

    return {
      type: match[1],
      id: match[2]
    };
  }

  /**
   * Native share
   */
  async nativeShare(title: string, message: string, url: string): Promise<boolean> {
    // In React Native, would use react-native-share
    if (typeof navigator !== 'undefined' && 'share' in navigator) {
      try {
        await (navigator as any).share({
          title,
          text: message,
          url
        });
        return true;
      } catch {
        return false;
      }
    }
    return false;
  }

  /**
   * Request biometric authentication
   */
  async requestBiometricAuth(): Promise<boolean> {
    if (!this.config.features.biometrics) return false;

    // In React Native, would use react-native-biometrics
    // Simulation for now
    return new Promise(resolve => {
      setTimeout(() => resolve(true), 1000);
    });
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): {
    totalCached: number;
    currentSize: number;
    maxSize: number;
    usagePercentage: number;
  } {
    return {
      totalCached: this.offlineCache.presentations.size,
      currentSize: this.offlineCache.currentSize,
      maxSize: this.offlineCache.maxSize,
      usagePercentage: (this.offlineCache.currentSize / this.offlineCache.maxSize) * 100
    };
  }

  /**
   * Clear all cache
   */
  clearCache(): void {
    this.offlineCache.presentations.clear();
    this.offlineCache.currentSize = 0;
  }

  /**
   * Update configuration
   */
  updateConfig(updates: Partial<MobileAppConfig>): void {
    Object.assign(this.config, updates);
  }

  /**
   * Get configuration
   */
  getConfig(): MobileAppConfig {
    return { ...this.config };
  }

  /**
   * Generate build scripts
   */
  generateBuildScripts(): {
    ios: string;
    android: string;
    release: string;
  } {
    return {
      ios: `
#!/bin/bash
echo "Building iOS app..."
cd ios
pod install
cd ..
npx react-native run-ios --configuration Release
      `.trim(),

      android: `
#!/bin/bash
echo "Building Android app..."
cd android
./gradlew assembleRelease
cd ..
      `.trim(),

      release: `
#!/bin/bash
echo "Creating release builds..."
npm run build:ios
npm run build:android
echo "Release builds complete!"
      `.trim()
    };
  }
}

// Singleton instance
export const mobileAppManager = new MobileAppManager();
