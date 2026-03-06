
import React from 'react';
import { ViewType } from '../types';
import { Compass, MessageCircle, User as UserIcon, Layout, Bell } from 'lucide-react';

interface NavigationProps {
  currentView: ViewType;
  setView: (view: ViewType) => void;
  notificationCount?: number;
  onNotificationClick?: () => void;
}

const Navigation: React.FC<NavigationProps> = ({ currentView, setView, notificationCount = 0, onNotificationClick }) => {
  const navItems = [
    { id: 'dashboard', label: 'Plan', icon: Layout },
    { id: 'community', label: 'Explore', icon: Compass },
    { id: 'notifications', label: 'Alerts', icon: Bell, isNotification: true },
    { id: 'chat', label: 'Chat', icon: MessageCircle },
    { id: 'profile', label: 'Profile', icon: UserIcon },
  ];

  return (
    <nav
      className="bg-white border-t border-stone-100 flex items-center justify-around px-4 pt-2 shrink-0 z-50"
      style={{ paddingBottom: 'max(12px, env(safe-area-inset-bottom, 12px))' }}
    >
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = currentView === item.id;
        const isNotification = (item as any).isNotification;

        return (
          <button
            key={item.id}
            onClick={() => {
              if (isNotification && onNotificationClick) {
                onNotificationClick();
              } else if (!isNotification) {
                setView(item.id as ViewType);
              }
            }}
            className={`flex flex-col items-center gap-1 transition-all duration-300 relative ${
              isActive ? 'text-[#3a5a40] scale-110' : 'text-stone-400'
            }`}
          >
            <div className={`p-2 rounded-2xl relative ${isActive ? 'bg-[#a3b18a]/20' : ''}`}>
              <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
              {isNotification && notificationCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 shadow-sm">
                  {notificationCount > 9 ? '9+' : notificationCount}
                </span>
              )}
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
};

export default Navigation;
