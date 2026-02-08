
import React from 'react';
import { ViewType } from '../types';
import { Compass, MessageCircle, User as UserIcon, Map, Layout } from 'lucide-react';

interface NavigationProps {
  currentView: ViewType;
  setView: (view: ViewType) => void;
}

const Navigation: React.FC<NavigationProps> = ({ currentView, setView }) => {
  const navItems = [
    { id: 'dashboard', label: 'Plan', icon: Layout },
    { id: 'community', label: 'Explore', icon: Compass },
    { id: 'chat', label: 'Chat', icon: MessageCircle },
    { id: 'profile', label: 'Profile', icon: UserIcon },
  ];

  return (
    <nav className="h-20 bg-white border-t border-stone-100 flex items-center justify-around px-4 pb-4 sticky bottom-0 z-50">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = currentView === item.id;
        return (
          <button
            key={item.id}
            onClick={() => setView(item.id as ViewType)}
            className={`flex flex-col items-center gap-1 transition-all duration-300 ${
              isActive ? 'text-[#3a5a40] scale-110' : 'text-stone-400'
            }`}
          >
            <div className={`p-2 rounded-2xl ${isActive ? 'bg-[#a3b18a]/20' : ''}`}>
              <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
};

export default Navigation;
