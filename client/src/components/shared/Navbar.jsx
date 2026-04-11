import React from 'react';
import { Bell, User, Settings, Menu } from 'lucide-react';
import Button from './Button';
import Badge from './Badge';
import {useUiStore} from '../../store/uiStore'; // Assuming a UI store for sidebar toggle

const Navbar = () => {
  const { toggleSidebar } = useUiStore();

  return (
    <nav className="bg-surface border-b border-border p-4 flex items-center justify-between sticky top-0 z-30 shadow-lg animate-fade-in">
      <div className="flex items-center gap-4">
        <Button onClick={toggleSidebar} className="p-2 rounded-lg hover:bg-background md:hidden">
          <Menu className="w-6 h-6 text-text" />
        </Button>
        <h1 className="text-2xl font-bold text-text">CrisisOS</h1>
      </div>
      <div className="flex items-center gap-6">
        <div className="relative">
          <Bell className="w-6 h-6 text-textSecondary hover:text-primary cursor-pointer transition-colors duration-200" />
          <Badge type="error" className="absolute -top-2 -right-2">3</Badge> {/* Placeholder for notifications */}
        </div>
        <div className="flex items-center gap-2">
          <User className="w-6 h-6 text-textSecondary" />
          <span className="text-text font-medium">Admin User</span>
        </div>
        <Button className="p-2 rounded-lg hover:bg-background">
          <Settings className="w-6 h-6 text-textSecondary hover:text-primary transition-colors duration-200" />
        </Button>
      </div>
    </nav>
  );
};

export default Navbar;

