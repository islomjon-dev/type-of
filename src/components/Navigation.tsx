import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAppStore } from '../stores/appStore';
import {
  Keyboard, Trophy, Target, Users, BarChart3, Award,
  User, Settings, Home, Dumbbell, LogIn, LogOut, Menu, X
} from 'lucide-react';

export const Navigation: React.FC = () => {
  const location = useLocation();
  const { isAuthenticated, user, logout } = useAppStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/test', label: 'Test', icon: Keyboard },
    { path: '/daily', label: 'Daily', icon: Target },
    { path: '/multiplayer', label: 'Race', icon: Users },
    { path: '/leaderboard', label: 'Board', icon: Trophy },
    { path: '/practice', label: 'Practice', icon: Dumbbell },
    { path: '/statistics', label: 'Stats', icon: BarChart3 },
    { path: '/achievements', label: 'Awards', icon: Award },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-gray-950/90 backdrop-blur-xl border-b border-gray-800/50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 text-white font-bold text-lg">
            <Keyboard className="w-5 h-5 text-yellow-400" />
            <span className="hidden sm:inline">TypeFlow</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-0.5">
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs transition-colors ${
                    isActive
                      ? 'bg-gray-800 text-white'
                      : 'text-gray-500 hover:text-white hover:bg-gray-800/50'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-1.5">
            {isAuthenticated ? (
              <>
                <Link
                  to="/profile"
                  className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs text-gray-400 hover:text-white hover:bg-gray-800/50 transition-colors"
                >
                  <User className="w-3.5 h-3.5" />
                  <span>{user?.username}</span>
                </Link>
                <Link
                  to="/settings"
                  className="p-1.5 rounded-lg text-gray-500 hover:text-white hover:bg-gray-800/50 transition-colors"
                >
                  <Settings className="w-3.5 h-3.5" />
                </Link>
                <button
                  onClick={logout}
                  className="p-1.5 rounded-lg text-gray-500 hover:text-white hover:bg-gray-800/50 transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </>
            ) : (
              <Link
                to="/auth"
                className="flex items-center gap-1.5 px-3 py-1.5 bg-yellow-500 hover:bg-yellow-400 text-gray-900 font-medium rounded-lg text-xs transition-colors"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Sign In</span>
              </Link>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800/50 transition-colors"
            >
              {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden pb-3 border-t border-gray-800/50 pt-2">
            <div className="grid grid-cols-4 gap-1">
              {navItems.map(item => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex flex-col items-center gap-1 p-2 rounded-lg text-xs transition-colors ${
                      isActive
                        ? 'bg-gray-800 text-yellow-400'
                        : 'text-gray-500 hover:text-white'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
            {isAuthenticated && (
              <div className="flex items-center gap-2 mt-2 pt-2 border-t border-gray-800/50">
                <Link
                  to="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-gray-400 hover:text-white bg-gray-800/50"
                >
                  <User className="w-3.5 h-3.5" />
                  <span>Profile</span>
                </Link>
                <Link
                  to="/settings"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-gray-400 hover:text-white bg-gray-800/50"
                >
                  <Settings className="w-3.5 h-3.5" />
                  <span>Settings</span>
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};
