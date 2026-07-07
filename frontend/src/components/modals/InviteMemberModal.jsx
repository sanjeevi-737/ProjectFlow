import { useState } from 'react';
import toast from 'react-hot-toast';
import { workspaceApi } from '../../services/workspaceApi';
import { HiOutlineX, HiOutlineMail, HiOutlineUserAdd } from 'react-icons/hi';

const ROLES = [
  { value: 'team_member', label: 'Team Member' },
  { value: 'project_manager', label: 'Project Manager' },
  { value: 'admin', label: 'Admin' },
  { value: 'guest', label: 'Guest' },
];

export const InviteMemberModal = ({ isOpen, onClose, workspaceId }) => {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('team_member');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    try {
      await workspaceApi.inviteMember(workspaceId, { email: email.trim(), role });
      toast.success(`Invitation sent to ${email}`);
      setEmail('');
      onClose();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to send invitation');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div className="card w-full max-w-md mx-4 animate-scale-in" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
              <HiOutlineUserAdd className="text-primary-600 dark:text-primary-400" size={20} />
            </div>
            <h2 className="text-lg font-semibold text-dark-900 dark:text-dark-100">Invite Member</h2>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-dark-100 dark:hover:bg-dark-700"><HiOutlineX size={20} className="text-dark-400" /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1.5">Email Address</label>
            <div className="relative">
              <HiOutlineMail className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400" size={18} />
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="input-field pl-10" placeholder="colleague@company.com" required autoFocus />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1.5">Role</label>
            <select value={role} onChange={(e) => setRole(e.target.value)} className="input-field">
              {ROLES.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
            </select>
          </div>
          <div className="flex gap-3 justify-end pt-2">
            <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={loading || !email.trim()} className="btn-primary">
              {loading ? <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" /> : 'Send Invitation'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
