import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useSelector, useDispatch } from 'react-redux';
import { notificationApi } from '../services/notificationApi';
import { fetchUnreadCount } from '../redux/slices/notificationSlice';
import { HiOutlineBell, HiOutlineCheckCircle, HiOutlineXCircle, HiOutlineTrash, HiOutlineCheck } from 'react-icons/hi';
import { cn } from '../utils/cn';
import { timeAgo } from '../utils/formatters';

const typeIcons = {
  task_assigned: HiOutlineCheckCircle,
  task_updated: HiOutlineBell,
  task_completed: HiOutlineCheckCircle,
  comment_added: HiOutlineBell,
  mention: HiOutlineBell,
  due_date_reminder: HiOutlineBell,
  workspace_invitation: HiOutlineBell,
  project_update: HiOutlineBell,
  member_joined: HiOutlineBell,
  status_change: HiOutlineBell,
};

export const Notifications = () => {
  const dispatch = useDispatch();
  const { unreadCount } = useSelector((state) => state.notifications);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [marking, setMarking] = useState(null);

  useEffect(() => { load(); }, [page]);

  const load = async () => {
    try {
      const { data } = await notificationApi.getAll({ page, limit: 20 });
      if (page === 1) setNotifications(data.data.data || []);
      else setNotifications((prev) => [...prev, ...(data.data.data || [])]);
      setTotal(data.data.meta?.total || 0);
    } catch { toast.error('Failed to load notifications'); }
    finally { setLoading(false); }
  };

  const handleMarkRead = async (id) => {
    setMarking(id);
    try {
      await notificationApi.markAsRead(id);
      setNotifications((prev) => prev.map((n) => n._id === id ? { ...n, isRead: true } : n));
      dispatch(fetchUnreadCount());
    } catch { toast.error('Failed to mark as read'); }
    finally { setMarking(null); }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationApi.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      dispatch(fetchUnreadCount());
      toast.success('All marked as read');
    } catch { toast.error('Failed to mark all as read'); }
  };

  const handleDelete = async (id) => {
    try {
      await notificationApi.delete(id);
      setNotifications((prev) => prev.filter((n) => n._id !== id));
      dispatch(fetchUnreadCount());
    } catch { toast.error('Failed to delete'); }
  };

  const hasMore = notifications.length < total;

  if (loading && page === 1) {
    return <div className="flex items-center justify-center py-20"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent" /></div>;
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-dark-900 dark:text-dark-100">Notifications</h1>
          <p className="text-dark-500">{total} total{unreadCount > 0 && `, ${unreadCount} unread`}</p>
        </div>
        {unreadCount > 0 && (
          <button onClick={handleMarkAllRead} className="btn-secondary text-sm">
            <HiOutlineCheck size={16} /> Mark All Read
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="card py-16 text-center">
          <HiOutlineBell className="mx-auto text-4xl text-dark-300 mb-3" />
          <p className="font-semibold text-dark-900 dark:text-dark-100">All caught up!</p>
          <p className="text-dark-500 text-sm">No notifications yet.</p>
        </div>
      ) : (
        <div className="space-y-1">
          {notifications.map((notif) => {
            const Icon = typeIcons[notif.type] || HiOutlineBell;
            return (
              <div key={notif._id} className={cn('flex items-start gap-3 p-4 rounded-xl transition-colors', notif.isRead ? '' : 'bg-primary-50/50 dark:bg-primary-900/10')}>
                <div className={cn('h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0', notif.isRead ? 'bg-dark-100 dark:bg-dark-700' : 'bg-primary-100 dark:bg-primary-900/30')}>
                  <Icon size={16} className={notif.isRead ? 'text-dark-400' : 'text-primary-600'} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-dark-900 dark:text-dark-100">{notif.title}</p>
                  <p className="text-sm text-dark-600 dark:text-dark-300 mt-0.5">{notif.message}</p>
                  <p className="text-xs text-dark-400 mt-1">{timeAgo(notif.createdAt)}</p>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  {notif.link && (
                    <Link to={notif.link} className="btn-ghost p-1.5 text-xs text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20">
                      View
                    </Link>
                  )}
                  {!notif.isRead && (
                    <button onClick={() => handleMarkRead(notif._id)} disabled={marking === notif._id}
                      className="btn-ghost p-1.5 text-dark-400 hover:text-primary-500" title="Mark as read">
                      <HiOutlineCheck size={16} />
                    </button>
                  )}
                  <button onClick={() => handleDelete(notif._id)} className="btn-ghost p-1.5 text-dark-400 hover:text-red-500" title="Delete">
                    <HiOutlineTrash size={16} />
                  </button>
                </div>
              </div>
            );
          })}
          {hasMore && (
            <div className="text-center pt-4">
              <button onClick={() => setPage((p) => p + 1)} className="btn-secondary text-sm">Load More</button>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
};
