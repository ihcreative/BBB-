import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { X, Menu, ChevronRight } from 'lucide-react';
import { cn } from '../lib/utils';

export default function AdminNav() {
  const [isVisible, setIsVisible] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const hidden = localStorage.getItem('hide-bbb-admin');
    if (hidden === 'true') {
      setIsVisible(false);
    }
  }, []);

  const handleClose = () => {
    localStorage.setItem('hide-bbb-admin', 'true');
    setIsVisible(false);
    // Dispatch a custom event to notify App.tsx to adjust padding
    window.dispatchEvent(new Event('admin-nav-toggle'));
  };

  const routes = [
    { path: '/', label: 'Home' },
    { path: '/admin', label: 'Dashboard' },
    { path: '/directory', label: 'Matches' },
    { path: '/directory', label: 'Profile' },
    { path: '/directory', label: 'Leads' },
    { path: '/', label: 'Login' },
  ];

  if (!isVisible) return null;

  return (
    <nav className="fixed top-0 left-0 w-full bg-gray-900 text-white z-[200] shadow-lg h-16 flex items-center px-4 md:px-6 border-b border-gray-800">
      {/* Left: Logo/Label */}
      <div className="flex-shrink-0 flex items-center gap-2 mr-8">
        <span className="text-xl">🚀</span>
        <span className="font-bold tracking-tight whitespace-nowrap hidden sm:inline">BBB ADMIN</span>
        <span className="font-bold tracking-tight whitespace-nowrap sm:hidden">ADMIN</span>
      </div>

      {/* Center: Desktop Scrollable Buttons */}
      <div className="hidden md:flex flex-1 items-center gap-2 overflow-x-auto no-scrollbar py-2">
        {routes.map((route, idx) => (
          <Link
            key={idx}
            to={route.path}
            className="px-4 py-1.5 bg-gray-800 hover:bg-gray-700 rounded-full text-xs font-medium transition-colors whitespace-nowrap border border-gray-700"
          >
            {route.label}
          </Link>
        ))}
      </div>

      {/* Mobile Menu Toggle */}
      <div className="md:hidden flex-1 flex justify-center">
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
        >
          <Menu className="w-6 h-6" />
        </button>
      </div>

      {/* Right: Close Button */}
      <div className="flex-shrink-0 ml-4">
        <button 
          onClick={handleClose}
          className="flex items-center gap-1 text-xs text-gray-400 hover:text-white transition-colors bg-gray-800 hover:bg-gray-700 px-3 py-1.5 rounded-md border border-gray-700"
        >
          <X className="w-4 h-4" />
          <span className="hidden xs:inline">Close</span>
        </button>
      </div>

      {/* Mobile Dropdown */}
      {isMobileMenuOpen && (
        <div className="absolute top-16 left-0 w-full bg-gray-900 border-b border-gray-800 shadow-2xl py-4 flex flex-col gap-2 px-6 md:hidden">
          {routes.map((route, idx) => (
            <Link
              key={idx}
              to={route.path}
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center justify-between py-3 text-sm font-medium border-b border-gray-800 last:border-0 hover:text-gold-500 transition-colors"
            >
              {route.label}
              <ChevronRight className="w-4 h-4 text-gray-600" />
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}
