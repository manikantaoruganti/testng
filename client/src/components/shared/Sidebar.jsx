import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Activity, BarChart, ScrollText, Settings, X } from 'lucide-react';
import useUiStore from '../../store/uiStore';
import Button from './Button';

const Sidebar = () => {
  const { isSidebarOpen, toggleSidebar } = useUiStore();

  const navItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { name: 'Simulation', icon: Activity, path: '/simulation' },
    { name: 'Analytics', icon: BarChart, path: '/analytics' },
    { name: 'Logs', icon: ScrollText, path: '/logs' },
    { name: 'Settings', icon: Settings, path: '/settings' },
  ];

  return (
    <>
      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-background/50 z-40 md:hidden"
          onClick={toggleSidebar}
        ></div>
      )}

      <aside
        className={`fixed inset-y-0 left-0 w-64 bg-surface border-r border-border p-6 flex flex-col z-50
          transform transition-transform duration-300 ease-in-out md:translate-x-0
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="flex items-center justify-between mb-10">
          <img src="/icons/crisis-os-logo.svg" alt="CrisisOS Logo" className="h-10 w-auto mr-3" />
          <span className="text-3xl font-bold text-primary">CrisisOS</span>
          <Button onClick={toggleSidebar} className="p-2 rounded-lg hover:bg-background md:hidden">
            <X className="w-6 h-6 text-text" />
          </Button>
        </div>

        <nav className="flex-1">
          <ul className="space-y-3">
            {navItems.map((item) => (
              <li key={item.name}>
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center gap-4 p-3 rounded-xl text-textSecondary font-medium transition-colors duration-200
                    ${isActive ? 'bg-primary text-white shadow-glow' : 'hover:bg-background hover:text-primary'}`
                  }
                  onClick={toggleSidebar} // Close sidebar on navigation for mobile
                >
                  <item.icon className="w-6 h-6" />
                  <span>{item.name}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="mt-auto pt-6 border-t border-border text-textSecondary text-sm">
          <p>&copy; {new Date().getFullYear()} CrisisOS. All rights reserved.</p>
          <p className="mt-1">Developed by Bolt</p>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;

