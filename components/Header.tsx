import React from 'react';
import { BellIcon, LogoutIcon } from './Icons';
import type { UserProfile } from '../types';

interface HeaderProps {
  title: string;
  user: UserProfile | null;
  onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ title, user, onLogout }) => {
  return (
    <header className="bg-slate-900/80 backdrop-blur-sm sticky top-0 z-10 py-4 px-8 border-b border-slate-700 flex justify-between items-center">
      <h2 className="text-2xl font-bold text-white capitalize">{title}</h2>
      <div className="flex items-center space-x-6">
        <button className="text-slate-400 hover:text-white relative">
          <BellIcon className="h-6 w-6" />
          <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full border-2 border-slate-900"></span>
        </button>
        <div className="flex items-center space-x-3">
          <img src={`https://i.pravatar.cc/40?u=${user?.id}`} alt="User" className="h-10 w-10 rounded-full object-cover" />
          <div>
            <p className="text-white font-semibold text-sm">{user?.full_name || 'Guest'}</p>
            <p className="text-slate-400 text-xs">{user?.role || ''}</p>
          </div>
          <button onClick={onLogout} title="Logout" className="text-slate-400 hover:text-red-500">
            <LogoutIcon className="h-5 w-5"/>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
