'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type UserRole = 'creator' | 'ambassador' | 'owner';

interface RoleContextType {
  currentRole: UserRole;
  availableRoles: UserRole[];
  switchRole: (role: UserRole) => void;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export function RoleProvider({ children, userRoles }: { children: ReactNode; userRoles: UserRole[] }) {
  const [currentRole, setCurrentRole] = useState<UserRole>(userRoles[0] || 'creator');

  // Сохраняем роль в localStorage
  useEffect(() => {
    const savedRole = localStorage.getItem('currentRole') as UserRole;
    if (savedRole && userRoles.includes(savedRole)) {
      setCurrentRole(savedRole);
    }
  }, [userRoles]);

  const switchRole = (role: UserRole) => {
    if (userRoles.includes(role)) {
      setCurrentRole(role);
      localStorage.setItem('currentRole', role);
      
      // Меняем URL в зависимости от роли
      const rolePath = `/${role}`;
      window.history.pushState({}, '', rolePath);
    }
  };

  return (
    <RoleContext.Provider value={{ currentRole, availableRoles: userRoles, switchRole }}>
      {children}
    </RoleContext.Provider>
  );
}

export function useRole() {
  const context = useContext(RoleContext);
  if (context === undefined) {
    throw new Error('useRole must be used within a RoleProvider');
  }
  return context;
}
