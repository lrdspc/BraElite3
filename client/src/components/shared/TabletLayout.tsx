import React from 'react';

interface TabletLayoutProps {
  children: React.ReactNode;
  sidebarContent: React.ReactNode;
  isOnline: boolean;
}

const TabletLayout: React.FC<TabletLayoutProps> = ({
  children,
  sidebarContent,
  isOnline
}) => {
  return (
    <div className="flex min-h-screen">
      {/* Sidebar para tablet - mais compacta que a versão desktop */}
      <aside className="w-64 fixed left-0 top-0 h-full bg-card border-r border-border shadow-sm">
        {sidebarContent}
      </aside>

      {/* Conteúdo principal */}
      <main className="flex-1 ml-64 p-6">
        {/* Barra de status offline */}
        {!isOnline && (
          <div className="bg-yellow-100 text-yellow-800 px-4 py-2 mb-4 rounded-lg flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            Você está offline. Algumas funcionalidades podem estar limitadas.
          </div>
        )}

        {/* Conteúdo da página */}
        <div className="rounded-lg bg-background shadow-sm p-6">
          {children}
        </div>
      </main>
    </div>
  );
};

export default TabletLayout;
