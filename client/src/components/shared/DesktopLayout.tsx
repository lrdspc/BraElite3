import React from 'react';

interface DesktopLayoutProps {
  children: React.ReactNode;
  sidebarContent: React.ReactNode;
  isOnline: boolean;
  headerContent?: React.ReactNode;
}

const DesktopLayout: React.FC<DesktopLayoutProps> = ({
  children,
  sidebarContent,
  isOnline,
  headerContent
}) => {
  return (
    <div className="flex min-h-screen">
      {/* Sidebar fixa para desktop */}
      <aside className="w-80 fixed left-0 top-0 h-full bg-card border-r border-border shadow-sm overflow-y-auto">
        {sidebarContent}
      </aside>

      {/* Container principal */}
      <div className="flex-1 ml-80">
        {/* Header opcional */}
        {headerContent && (
          <header className="h-16 border-b border-border bg-card shadow-sm px-8 flex items-center">
            {headerContent}
          </header>
        )}

        {/* Área de conteúdo principal */}
        <main className="p-8">
          {/* Barra de status offline */}
          {!isOnline && (
            <div className="bg-yellow-100 text-yellow-800 px-6 py-3 mb-6 rounded-lg flex items-center gap-3">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              <span>
                Você está offline. Algumas funcionalidades podem estar limitadas.
              </span>
            </div>
          )}

          {/* Grid de conteúdo com largura máxima para melhor legibilidade */}
          <div className="max-w-7xl mx-auto">
            <div className="grid gap-8">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default DesktopLayout;
