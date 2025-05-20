import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { Bell, Search } from 'lucide-react';

interface DesktopHeaderProps {
  children?: React.ReactNode;
}

const DesktopHeader: React.FC<DesktopHeaderProps> = ({ children }) => {
  const { user } = useAuth();

  return (
    <div className="flex items-center justify-between w-full">
      {/* Barra de pesquisa */}
      <div className="relative flex-1 max-w-xl">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <input
            type="search"
            placeholder="Pesquisar..."
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
      </div>

      {/* Ações do lado direito */}
      <div className="flex items-center gap-4">
        {/* Botão de notificações */}
        <button className="relative p-2 rounded-lg hover:bg-accent">
          <Bell className="h-5 w-5 text-muted-foreground" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
        </button>

        {/* Componentes injetados (ex: botão de instalação) */}
        {children}

        {/* Avatar e nome do usuário */}
        <div className="flex items-center gap-3 py-2 px-4 rounded-lg hover:bg-accent cursor-pointer">
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
            <span className="text-sm font-medium text-primary">
              {user?.name?.[0] ?? 'U'}
            </span>
          </div>
          <span className="text-sm font-medium">{user?.name ?? 'Usuário'}</span>
        </div>
      </div>
    </div>
  );
};

export default DesktopHeader;
