import React from 'react';
import type { Page } from '../types';
import { AnalyticsIcon, DashboardIcon, LeadsIcon, SettingsIcon, BuyerIcon, DeliveryIcon } from './Icons';

interface SidebarProps {
  activePage: Page;
  setActivePage: (page: Page) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activePage, setActivePage }) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: DashboardIcon },
    { id: 'leads', label: 'Leads', icon: LeadsIcon },
    { id: 'buyers', label: 'Buyers', icon: BuyerIcon },
    { id: 'delivery', label: 'Delivery Log', icon: DeliveryIcon },
    { id: 'analytics', label: 'Analytics', icon: AnalyticsIcon },
    { id: 'settings', label: 'Settings', icon: SettingsIcon },
  ] as const;

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-700 flex flex-col h-screen fixed">
      <div className="p-6 border-b border-slate-700">
        <h1 className="text-2xl font-bold text-white tracking-wider">LUAI<span className="text-brand-green">Leads</span></h1>
      </div>
      <nav className="flex-1 p-4">
        <ul>
          {navItems.map((item) => (
            <li key={item.id}>
              <button
                onClick={() => setActivePage(item.id)}
                className={`w-full flex items-center p-3 my-1 rounded-lg transition-colors duration-200 ${
                  activePage === item.id
                    ? 'bg-brand-green text-white'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <item.icon className="h-5 w-5 mr-3" />
                <span className="font-medium">{item.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>
      <div className="p-4 border-t border-slate-700">
        <div className="p-4 bg-slate-800 rounded-lg text-center">
            <h3 className="font-semibold text-white">Upgrade Your Plan</h3>
            <p className="text-sm text-slate-400 mt-1 mb-3">Go Pro to unlock all features and advanced analytics.</p>
            <button className="w-full bg-brand-green text-white font-bold py-2 px-4 rounded-lg hover:bg-emerald-500 transition-colors">
                Upgrade
            </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;