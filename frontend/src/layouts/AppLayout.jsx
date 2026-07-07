import { useEffect } from 'react';
import { Outlet, Navigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import toast from 'react-hot-toast';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';
import { useSocket } from '../hooks/useSocket';
import { cn } from '../utils/cn';

export const AppLayout = () => {
  const { isAuthenticated, isLoading, user } = useSelector((state) => state.auth);
  const { sidebarOpen } = useSelector((state) => state.ui);
  const dispatch = useDispatch();
  const location = useLocation();

  const { joinWorkspace, joinProject, onNotificationReceived, onTaskUpdated, onTaskMoved } = useSocket();

  useEffect(() => {
    if (!isAuthenticated) return;
    const cleanup = onNotificationReceived((notification) => {
      toast(notification.message || notification.title, {
        icon: '🔔',
        duration: 5000,
        style: { borderRadius: '12px', padding: '12px 16px', fontSize: '14px' },
      });
    });
    return cleanup;
  }, [onNotificationReceived]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div
        className={cn(
          'flex flex-1 flex-col transition-all duration-300',
          sidebarOpen ? 'ml-64' : 'ml-16'
        )}
      >
        <Navbar />
        <main className="flex-1 overflow-y-auto bg-dark-50/50 dark:bg-dark-950/50 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
