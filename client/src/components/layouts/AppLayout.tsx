import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useLocation } from 'wouter';
import { useDevice } from '@/hooks/use-device';
import { isInstallPromptAvailable } from '@/lib/pwa';

// Components
import LoadingScreen from '@/components/shared/LoadingScreen';
import MobileHeader from '@/components/shared/MobileHeader';
import MobileSidebar from '@/components/shared/MobileSidebar';
import MobileBottomNav from '@/components/shared/MobileBottomNav';
import TabletLayout from '@/components/shared/TabletLayout';
import DesktopLayout from '@/components/shared/DesktopLayout';
import DesktopSidebar from '@/components/shared/DesktopSidebar';
import DesktopHeader from '@/components/shared/DesktopHeader';
import InstallPwaButton from '@/components/shared/InstallPwaButton';

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const { isLoading, isLoggedIn, user } = useAuth();
  const [, navigate] = useLocation();
  const { deviceType, isMobile, isTablet, isDesktop } = useDevice();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showInstallButton] = useState(isInstallPromptAvailable());

  // Garantir autenticação
  useEffect(() => {
    const currentPath = window.location.pathname;
    if (!isLoading && !isLoggedIn && currentPath !== '/login') {
      navigate('/login');
    }
  }, [isLoading, isLoggedIn, navigate, location]);

  // Monitorar status de conexão
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isLoading) {
    return <LoadingScreen />;
  }

  // Renderizar layout apropriado baseado no tipo de dispositivo
  if (isMobile) {
    return (
      <>
        <MobileHeader 
          onMenuClick={() => setMobileSidebarOpen(true)} 
          showInstallButton={showInstallButton}
        />        <MobileSidebar 
          isOpen={mobileSidebarOpen} 
          onClose={() => setMobileSidebarOpen(false)}
          user={user}
        />
        <main className="pb-16 px-4 pt-16">
          {!isOnline && (
            <div className="bg-yellow-100 text-yellow-800 px-4 py-2 mb-4 rounded">
              Você está offline. Algumas funcionalidades podem estar limitadas.
            </div>
          )}
          {children}
        </main>
        <MobileBottomNav />
      </>
    );
  }

  // Conteúdo compartilhado da sidebar para tablet e desktop
  const sidebarContent = (
    <DesktopSidebar 
      collapsed={isTablet} 
      className={isTablet ? 'w-64' : 'w-80'} 
    />
  );

  if (isTablet) {
    return (
      <TabletLayout
        sidebarContent={sidebarContent}
        isOnline={isOnline}
      >
        {children}
      </TabletLayout>
    );
  }

  return (
    <DesktopLayout
      sidebarContent={sidebarContent}
      isOnline={isOnline}      headerContent={
        <DesktopHeader>
          <div className="flex items-center gap-4">
            <InstallPwaButton variant="outline" size="sm" />
          </div>
        </DesktopHeader>
      }
    >
      {children}
    </DesktopLayout>
  );
};

export default AppLayout;
