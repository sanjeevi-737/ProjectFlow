import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useSelector, useDispatch } from 'react-redux';
import { setCredentials } from '../redux/slices/authSlice';
import { userApi } from '../services/userApi';
import { HiOutlineUser, HiOutlineBell, HiOutlineLockClosed, HiOutlineCamera, HiOutlineCheckCircle } from 'react-icons/hi';
import { getInitials } from '../utils/formatters';
import { cn } from '../utils/cn';

const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(50),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'Must be at least 8 characters').regex(/[A-Z]/, 'Must contain uppercase').regex(/[a-z]/, 'Must contain lowercase').regex(/\d/, 'Must contain a number'),
  confirmPassword: z.string(),
}).refine((d) => d.newPassword === d.confirmPassword, { message: 'Passwords do not match', path: ['confirmPassword'] });

const tabs = [
  { id: 'profile', label: 'Profile', icon: HiOutlineUser },
  { id: 'notifications', label: 'Notifications', icon: HiOutlineBell },
  { id: 'security', label: 'Security', icon: HiOutlineLockClosed },
];

export const Settings = () => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const [activeTab, setActiveTab] = useState('profile');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const profileForm = useForm({ resolver: zodResolver(profileSchema), defaultValues: { name: user?.name || '' } });
  const passwordForm = useForm({ resolver: zodResolver(passwordSchema) });

  const [preferences, setPreferences] = useState({
    emailNotifications: true, pushNotifications: true, taskAssigned: true,
    taskDueDate: true, projectUpdates: true, commentsOnTasks: true, workspaceInvitations: true,
  });

  useEffect(() => {
    if (user?.notificationPreferences) setPreferences(user.notificationPreferences);
    profileForm.reset({ name: user?.name || '' });
  }, [user]);

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast.error('File too large (max 5MB)'); return; }
    const formData = new FormData();
    formData.append('avatar', file);
    setUploading(true);
    try {
      const { data } = await userApi.updateAvatar(formData);
      dispatch(setCredentials({ ...data.data, accessToken: localStorage.getItem('accessToken'), refreshToken: localStorage.getItem('refreshToken') }));
      toast.success('Avatar updated');
    } catch { toast.error('Failed to upload avatar'); }
    finally { setUploading(false); }
  };

  const onProfileSubmit = async (formData) => {
    try {
      const { data } = await userApi.updateProfile(formData);
      dispatch(setCredentials({ ...data.data, accessToken: localStorage.getItem('accessToken'), refreshToken: localStorage.getItem('refreshToken') }));
      toast.success('Profile updated');
    } catch { toast.error('Failed to update profile'); }
  };

  const onPasswordSubmit = async (formData) => {
    try {
      await userApi.changePassword({ currentPassword: formData.currentPassword, newPassword: formData.newPassword });
      toast.success('Password changed successfully');
      passwordForm.reset();
    } catch (err) { toast.error(err?.response?.data?.message || 'Failed to change password'); }
  };

  const togglePreference = async (key) => {
    const updated = { ...preferences, [key]: !preferences[key] };
    setPreferences(updated);
    try {
      await userApi.updateNotificationPreferences(updated);
      toast.success('Preferences saved');
    } catch { toast.error('Failed to save preferences'); setPreferences(preferences); }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-dark-900 dark:text-dark-100">Settings</h1>
        <p className="text-dark-500">Manage your account settings</p>
      </div>

      <div className="flex gap-1 bg-dark-50 dark:bg-dark-800 rounded-xl p-1 w-fit">
        {tabs.map((tab) => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={cn('flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all',
              activeTab === tab.id ? 'bg-white dark:bg-dark-700 text-dark-900 dark:text-dark-100 shadow-sm' : 'text-dark-500 hover:text-dark-700 dark:hover:text-dark-300'
            )}>
            <tab.icon size={16} /> {tab.label}
          </button>
        ))}
      </div>

      <div className="card">
        {activeTab === 'profile' && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold">Profile Information</h2>
            <div className="flex items-center gap-6">
              <div className="relative group">
                <div className="h-20 w-20 rounded-full bg-primary-500 flex items-center justify-center text-2xl font-bold text-white overflow-hidden">
                  {user?.avatar?.url ? <img src={user.avatar.url} alt="" className="h-full w-full object-cover" /> : getInitials(user?.name)}
                </div>
                <button onClick={() => fileInputRef.current?.click()} disabled={uploading}
                  className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity text-white">
                  <HiOutlineCamera size={20} />
                </button>
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
              </div>
              <div>
                <p className="font-medium text-dark-900 dark:text-dark-100">{user?.name}</p>
                <p className="text-sm text-dark-500">{user?.email}</p>
                {user?.isEmailVerified && <span className="text-xs text-green-600 flex items-center gap-1 mt-1"><HiOutlineCheckCircle size={12} />Verified</span>}
              </div>
            </div>
            <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4 max-w-md">
              <div>
                <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1.5">Full Name</label>
                <input {...profileForm.register('name')} className="input-field" />
                {profileForm.formState.errors.name && <p className="mt-1 text-xs text-red-500">{profileForm.formState.errors.name.message}</p>}
              </div>
              <button type="submit" className="btn-primary">Save Changes</button>
            </form>
          </div>
        )}

        {activeTab === 'notifications' && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold">Notification Preferences</h2>
            <div className="space-y-1">
              {[
                { key: 'emailNotifications', label: 'Email Notifications', desc: 'Receive notifications via email' },
                { key: 'pushNotifications', label: 'Push Notifications', desc: 'Receive in-browser notifications' },
                { key: 'taskAssigned', label: 'Task Assignments', desc: 'When a task is assigned to you' },
                { key: 'taskDueDate', label: 'Task Due Dates', desc: 'When a task is nearing its due date' },
                { key: 'commentsOnTasks', label: 'Comments on Tasks', desc: 'When someone comments on your task' },
                { key: 'workspaceInvitations', label: 'Workspace Invitations', desc: 'When invited to a workspace' },
              ].map(({ key, label, desc }) => (
                <label key={key} className="flex items-center justify-between py-3 px-2 rounded-lg hover:bg-dark-50 dark:hover:bg-dark-800/50 cursor-pointer">
                  <div>
                    <p className="text-sm font-medium text-dark-900 dark:text-dark-100">{label}</p>
                    <p className="text-xs text-dark-500">{desc}</p>
                  </div>
                  <input type="checkbox" checked={preferences[key]} onChange={() => togglePreference(key)} className="rounded text-primary-500 focus:ring-primary-500" />
                </label>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'security' && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold">Change Password</h2>
            <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4 max-w-md">
              <div>
                <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1.5">Current Password</label>
                <input {...passwordForm.register('currentPassword')} type="password" className="input-field" />
                {passwordForm.formState.errors.currentPassword && <p className="mt-1 text-xs text-red-500">{passwordForm.formState.errors.currentPassword.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1.5">New Password</label>
                <input {...passwordForm.register('newPassword')} type="password" className="input-field" />
                {passwordForm.formState.errors.newPassword && <p className="mt-1 text-xs text-red-500">{passwordForm.formState.errors.newPassword.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1.5">Confirm New Password</label>
                <input {...passwordForm.register('confirmPassword')} type="password" className="input-field" />
                {passwordForm.formState.errors.confirmPassword && <p className="mt-1 text-xs text-red-500">{passwordForm.formState.errors.confirmPassword.message}</p>}
              </div>
              <button type="submit" className="btn-primary">Update Password</button>
            </form>
          </div>
        )}
      </div>
    </motion.div>
  );
};
