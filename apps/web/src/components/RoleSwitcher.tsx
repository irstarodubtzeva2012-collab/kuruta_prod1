'use client';

import { useRole } from '@/contexts/RoleContext';
import { useState, useRef, useEffect } from 'react';

const roleLabels: Record<string, string> = {
  creator: 'Креатор',
  ambassador: 'Амбассадор',
  owner: 'Владелец площадки',
};

const roleIcons: Record<string, string> = {
  creator: '🎨',
  ambassador: '🚀',
  owner: '🏢',
};

export function RoleSwitcher() {
  const { currentRole, availableRoles, switchRole } = useRole();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Закрытие dropdown при клике вне
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (availableRoles.length <= 1) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 border border-border rounded-button">
        <span>{roleIcons[currentRole]}</span>
        <span className="text-sm font-medium">{roleLabels[currentRole]}</span>
      </div>
    );
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 border border-border rounded-button hover:border-primary/40 transition-colors duration-200"
      >
        <span>{roleIcons[currentRole]}</span>
        <span className="text-sm font-medium">{roleLabels[currentRole]}</span>
        <svg
          className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white border border-border rounded-card shadow-lg z-50">
          <div className="p-2">
            {availableRoles.map((role) => (
              <button
                key={role}
                onClick={() => {
                  switchRole(role);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-button text-left transition-colors duration-200 ${
                  currentRole === role
                    ? 'bg-accent/10 text-accent'
                    : 'hover:bg-background'
                }`}
              >
                <span className="text-lg">{roleIcons[role]}</span>
                <div>
                  <div className="text-sm font-medium">{roleLabels[role]}</div>
                  {currentRole === role && (
                    <div className="text-xs text-accent">Текущая роль</div>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
