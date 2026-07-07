import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { cn } from '../utils/cn';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../hooks/useTheme';
import { useSocket } from '../hooks/useSocket';
import { fetchUnreadCount, incrementUnread } from '../redux/slices/notificationSlice';
import { getInitials } from '../utils/formatters';
import {
  HiOutlineBell,
  HiOutlineSun,
  HiOutlineMoon,
  HiOutlineSearch,
  HiOutlineUser,
  HiOutlineCog,
  HiOutlineLogout,
} from 'react-icons/hi';
import { useState, useRef, useEffect, useCallback } from 'react';

export const Navbar = () => {
  const { user, logoutUser } = useAuth();
  const { isDark, toggle } = useTheme();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { unreadCount } = useSelector((state) => state.notifications);
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef(null);

  const { onNotificationReceived } = useSocket();

  useEffect(() => {
    dispatch(fetchUnreadCount());
  }, [dispatch]);

  useEffect(() => {
    const cleanup = onNotificationReceived(() => {
      dispatch(incrementUnread());
    });
    return cleanup;
  }, [onNotificationReceived, dispatch]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setShowDropdown(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchKeydown = useCallback((e) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      navigate(`/tasks?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  }, [searchQuery, navigate]);

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-white/80 backdrop-blur-lg px-6 dark:bg-dark-900/80 dark:border-dark-700">
      <div className="flex items-center gap-4 flex-1">
        <div className="relative max-w-md w-full">
          <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400" size={18} />
          <input
            type="text"
            placeholder="Search tasks, projects, people..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleSearchKeydown}
            className="input-field pl-10 pr-4 h-10"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={toggle}
          className="rounded-lg p-2 hover:bg-dark-100 dark:hover:bg-dark-800 text-dark-500"
          title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {isDark ? <HiOutlineSun size={20} /> : <HiOutlineMoon size={20} />}
        </button>

        <Link
          to="/notifications"
          className="relative rounded-lg p-2 hover:bg-dark-100 dark:hover:bg-dark-800 text-dark-500"
        >
          <HiOutlineBell size={20} />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-primary-500 text-[10px] font-bold text-white flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Link>

        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center gap-2 rounded-lg p-1.5 hover:bg-dark-100 dark:hover:bg-dark-800"
          >
            <div className="h-8 w-8 rounded-full bg-primary-500 flex items-center justify-center text-sm font-semibold text-white">
              {getInitials(user?.name)}
            </div>
            <span className="hidden sm:block text-sm font-medium text-dark-700 dark:text-dark-200">
              {user?.name}
            </span>
          </button>

          {showDropdown && (
            <div className="absolute right-0 top-full mt-2 w-56 rounded-xl border bg-white p-1.5 shadow-lg animate-scale-in dark:bg-dark-800 dark:border-dark-700">
              <div className="px-3 py-2 border-b dark:border-dark-700">
                <p className="text-sm font-medium text-dark-900 dark:text-dark-100">{user?.name}</p>
                <p className="text-xs text-dark-500">{user?.email}</p>
              </div>
              <Link to="/settings" onClick={() => setShowDropdown(false)}
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-dark-600 hover:bg-dark-100 dark:text-dark-300 dark:hover:bg-dark-700">
                <HiOutlineUser size={16} /> Profile
              </Link>
              <Link to="/settings" onClick={() => setShowDropdown(false)}
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-dark-600 hover:bg-dark-100 dark:text-dark-300 dark:hover:bg-dark-700">
                <HiOutlineCog size={16} /> Settings
              </Link>
              <button onClick={() => { setShowDropdown(false); logoutUser(); }}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20">
                <HiOutlineLogout size={16} /> Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
