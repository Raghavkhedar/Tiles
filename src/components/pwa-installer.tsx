"use client";

import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { Download, Smartphone, Wifi, WifiOff, Bell, BellOff, CheckCircle, XCircle } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

interface PWAStatus {
  isInstalled: boolean;
  isOnline: boolean;
  hasServiceWorker: boolean;
  canInstall: boolean;
  notificationsSupported: boolean;
  notificationsEnabled: boolean;
}

export default function PWAInstaller() {
  const { toast } = useToast();
  const [pwaStatus, setPwaStatus] = useState<PWAStatus>({
    isInstalled: false,
    isOnline: navigator.onLine,
    hasServiceWorker: false,
    canInstall: false,
    notificationsSupported: 'Notification' in window,
    notificationsEnabled: false,
  });
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);

  useEffect(() => {
    // Check if app is installed
    const checkInstallation = () => {
      const isInstalled = window.matchMedia('(display-mode: standalone)').matches ||
                         (window.navigator as any).standalone === true;
      setPwaStatus(prev => ({ ...prev, isInstalled }));
    };

    // Check service worker registration
    const checkServiceWorker = async () => {
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.getRegistration();
        setPwaStatus(prev => ({ ...prev, hasServiceWorker: !!registration }));
      }
    };

    // Check notification permission
    const checkNotifications = () => {
      if ('Notification' in window) {
        setPwaStatus(prev => ({ 
          ...prev, 
          notificationsEnabled: Notification.permission === 'granted' 
        }));
      }
    };

    // Online/offline status
    const handleOnlineStatus = () => {
      setPwaStatus(prev => ({ ...prev, isOnline: navigator.onLine }));
    };

    // Install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setPwaStatus(prev => ({ ...prev, canInstall: true }));
      setShowInstallPrompt(true);
    };

    // App installed
    const handleAppInstalled = () => {
      setPwaStatus(prev => ({ ...prev, isInstalled: true, canInstall: false }));
      setShowInstallPrompt(false);
      toast({
        title: "App Installed!",
        description: "TileManager Pro has been successfully installed on your device.",
      });
    };

    // Register service worker
    const registerServiceWorker = async () => {
      if ('serviceWorker' in navigator) {
        try {
          const registration = await navigator.serviceWorker.register('/sw.js');
          console.log('Service Worker registered:', registration);
          setPwaStatus(prev => ({ ...prev, hasServiceWorker: true }));
        } catch (error) {
          console.error('Service Worker registration failed:', error);
        }
      }
    };

    // Initialize
    checkInstallation();
    checkServiceWorker();
    checkNotifications();
    registerServiceWorker();

    // Event listeners
    window.addEventListener('online', handleOnlineStatus);
    window.addEventListener('offline', handleOnlineStatus);
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('online', handleOnlineStatus);
      window.removeEventListener('offline', handleOnlineStatus);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [toast]);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        console.log('User accepted the install prompt');
      } else {
        console.log('User dismissed the install prompt');
      }
      
      setDeferredPrompt(null);
      setPwaStatus(prev => ({ ...prev, canInstall: false }));
      setShowInstallPrompt(false);
    } catch (error) {
      console.error('Install prompt error:', error);
      toast({
        title: "Installation Failed",
        description: "Failed to install the app. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleNotificationPermission = async () => {
    if (!('Notification' in window)) return;

    try {
      const permission = await Notification.requestPermission();
      setPwaStatus(prev => ({ 
        ...prev, 
        notificationsEnabled: permission === 'granted' 
      }));
      
      if (permission === 'granted') {
        toast({
          title: "Notifications Enabled",
          description: "You will now receive notifications from TileManager Pro.",
        });
      }
    } catch (error) {
      console.error('Notification permission error:', error);
    }
  };

  const handleDismissInstall = () => {
    setShowInstallPrompt(false);
    setDeferredPrompt(null);
    setPwaStatus(prev => ({ ...prev, canInstall: false }));
  };

  if (pwaStatus.isInstalled) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            App Installed
          </CardTitle>
          <CardDescription>
            TileManager Pro is installed on your device
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm">Status</span>
              <Badge variant="outline" className="bg-green-50 text-green-700">
                Installed
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Connection</span>
              <div className="flex items-center gap-1">
                {pwaStatus.isOnline ? (
                  <Wifi className="w-4 h-4 text-green-600" />
                ) : (
                  <WifiOff className="w-4 h-4 text-red-600" />
                )}
                <span className="text-sm">
                  {pwaStatus.isOnline ? 'Online' : 'Offline'}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Install Prompt */}
      {showInstallPrompt && (
        <Card className="w-full max-w-md mx-auto border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-900">
              <Download className="w-5 h-5" />
              Install App
            </CardTitle>
            <CardDescription className="text-blue-700">
              Install TileManager Pro for a better experience
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex gap-2">
              <Button 
                onClick={handleInstallClick}
                className="flex-1"
                size="sm"
              >
                Install
              </Button>
              <Button 
                variant="outline" 
                onClick={handleDismissInstall}
                size="sm"
              >
                <XCircle className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Get quick access, offline functionality, and push notifications
            </p>
          </CardContent>
        </Card>
      )}

      {/* PWA Status */}
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="w-5 h-5" />
            PWA Status
          </CardTitle>
          <CardDescription>
            Progressive Web App features and capabilities
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">Service Worker</span>
              <Badge variant={pwaStatus.hasServiceWorker ? "default" : "secondary"}>
                {pwaStatus.hasServiceWorker ? "Active" : "Inactive"}
              </Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm">Connection</span>
              <div className="flex items-center gap-1">
                {pwaStatus.isOnline ? (
                  <Wifi className="w-4 h-4 text-green-600" />
                ) : (
                  <WifiOff className="w-4 h-4 text-red-600" />
                )}
                <span className="text-sm">
                  {pwaStatus.isOnline ? 'Online' : 'Offline'}
                </span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm">Notifications</span>
              <div className="flex items-center gap-2">
                {pwaStatus.notificationsSupported ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleNotificationPermission}
                    className="h-6 px-2"
                  >
                    {pwaStatus.notificationsEnabled ? (
                      <>
                        <Bell className="w-3 h-3 mr-1" />
                        Enabled
                      </>
                    ) : (
                      <>
                        <BellOff className="w-3 h-3 mr-1" />
                        Enable
                      </>
                    )}
                  </Button>
                ) : (
                  <Badge variant="secondary">Not Supported</Badge>
                )}
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm">Installation</span>
              <Badge variant={pwaStatus.canInstall ? "default" : "secondary"}>
                {pwaStatus.canInstall ? "Available" : "Not Available"}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* PWA Benefits */}
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle>PWA Benefits</CardTitle>
          <CardDescription>
            Why install TileManager Pro as a PWA?
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <Download className="w-4 h-4 text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-sm">Quick Access</h4>
                <p className="text-xs text-muted-foreground">
                  Access the app directly from your home screen
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <WifiOff className="w-4 h-4 text-green-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-sm">Offline Support</h4>
                <p className="text-xs text-muted-foreground">
                  View cached data and work without internet
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <Bell className="w-4 h-4 text-purple-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-sm">Push Notifications</h4>
                <p className="text-xs text-muted-foreground">
                  Get real-time updates and alerts
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <Smartphone className="w-4 h-4 text-orange-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-sm">Native Experience</h4>
                <p className="text-xs text-muted-foreground">
                  App-like experience with full-screen mode
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 