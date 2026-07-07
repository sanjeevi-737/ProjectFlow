import { NavLink, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { cn } from '../utils/cn';
import {
  HiOutlineHome,
  HiOutlineFolder,
  HiOutlineClipboardList,
  HiOutlineUsers,
  HiOutlineCog,
  HiOutlineChartBar,
  HiOutlineBell,
  HiOutlineChevronLeft,
  HiOutlineChevronRight,
} from 'react-icons/hi';
import { toggleSidebar } from '../redux/slices/uiSlice';
import { useDispatch } from 'react-redux';

const navItems = [
  { to: '/dashboard', icon: HiOutlineHome, label: 'Dashboard' },
  { to: '/workspaces', icon: HiOutlineFolder, label: 'Workspaces' },
  { to: '/projects', icon: HiOutlineClipboardList, label: 'Projects' },
  { to: '/tasks', icon: HiOutlineClipboardList, label: 'Tasks' },
  { to: '/team', icon: HiOutlineUsers, label: 'Team' },
  { to: '/notifications', icon: HiOutlineBell, label: 'Notifications' },
  { to: '/analytics', icon: HiOutlineChartBar, label: 'Analytics' },
  { to: '/settings', icon: HiOutlineCog, label: 'Settings' },
];

export const Sidebar = () => {
  const dispatch = useDispatch();
  const { sidebarOpen } = useSelector((state) => state.ui);
  const location = useLocation();

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-40 flex h-screen flex-col border-r bg-white transition-all duration-300 dark:bg-dark-900 dark:border-dark-700',
        sidebarOpen ? 'w-64' : 'w-16'
      )}
    >
      <div className="flex h-16 items-center justify-between px-4 border-b dark:border-dark-700">
        {sidebarOpen && (
          <span className="text-xl font-bold bg-gradient-to-r from-primary-500 to-purple-500 bg-clip-text text-transparent">
            ManagePD
          </span>
        )}
        <button
          onClick={() => dispatch(toggleSidebar())}
          className="rounded-lg p-1.5 hover:bg-dark-100 dark:hover:bg-dark-800 text-dark-500"
        >
          {sidebarOpen ? <HiOutlineChevronLeft size={20} /> : <HiOutlineChevronRight size={20} />}
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto p-3 space-y-1 scrollbar-hide">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                isActive || location.pathname.startsWith(item.to)
                  ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-400'
                  : 'text-dark-600 hover:bg-dark-100 dark:text-dark-400 dark:hover:bg-dark-800',
                !sidebarOpen && 'justify-center px-2'
              )
            }
            title={item.label}
          >
            <item.icon size={20} />
            {sidebarOpen && <span>{item.label}</span>}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};
