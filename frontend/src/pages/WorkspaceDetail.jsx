import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { workspaceApi } from '../services/workspaceApi';
import { InviteMemberModal } from '../components/modals/InviteMemberModal';
import { HiOutlineFolder, HiOutlineUsers, HiOutlineCog, HiOutlineUserAdd, HiOutlineTrash, HiOutlineExternalLink, HiOutlineClipboardList, HiOutlineShieldCheck } from 'react-icons/hi';
import { cn } from '../utils/cn';
import { getInitials, formatDate } from '../utils/formatters';

const tabs = [
  { id: 'overview', label: 'Overview', icon: HiOutlineFolder },
  { id: 'members', label: 'Members', icon: HiOutlineUsers },
  { id: 'settings', label: 'Settings', icon: HiOutlineCog },
];

export const WorkspaceDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [workspace, setWorkspace] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [inviteOpen, setInviteOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadWorkspace();
  }, [id]);

  const loadWorkspace = async () => {
    try {
      const { data } = await workspaceApi.getById(id);
      setWorkspace(data.data);
      setEditName(data.data.name);
      setEditDesc(data.data.description || '');
    } catch {
      toast.error('Failed to load workspace');
      navigate('/workspaces');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveMember = async (memberId) => {
    if (!confirm('Remove this member?')) return;
    try {
      await workspaceApi.removeMember(id, memberId);
      toast.success('Member removed');
      loadWorkspace();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to remove member');
    }
  };

  const handleUpdateRole = async (memberId, role) => {
    try {
      await workspaceApi.updateMemberRole(id, memberId, role);
      toast.success('Role updated');
      loadWorkspace();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to update role');
    }
  };

  const handleSaveSettings = async () => {
    if (!editName.trim()) return toast.error('Name is required');
    setSaving(true);
    try {
      const { data } = await workspaceApi.update(id, { name: editName, description: editDesc });
      setWorkspace(data.data);
      setEditing(false);
      toast.success('Workspace updated');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to update');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure? This will delete the workspace and all its data.')) return;
    if (!confirm('This action cannot be undone. Continue?')) return;
    try {
      await workspaceApi.delete(id);
      toast.success('Workspace deleted');
      navigate('/workspaces');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to delete');
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center py-20"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent" /></div>;
  }

  if (!workspace) return null;

  const isAdmin = workspace.members?.some((m) => m.role === 'admin' || m.role === 'project_manager');

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
            <HiOutlineFolder className="text-primary-600 dark:text-primary-400" size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-dark-900 dark:text-dark-100">{workspace.name}</h1>
            {workspace.description && <p className="text-dark-500">{workspace.description}</p>}
            <p className="text-xs text-dark-400 mt-1">Created {formatDate(workspace.createdAt)}</p>
          </div>
        </div>
        {isAdmin && (
          <button onClick={() => setInviteOpen(true)} className="btn-primary">
            <HiOutlineUserAdd size={18} /> Invite
          </button>
        )}
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

      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="card md:col-span-2">
            <h3 className="font-semibold mb-3">About</h3>
            <p className="text-sm text-dark-600 dark:text-dark-300">{workspace.description || 'No description'}</p>
          </div>
          <div className="card">
            <h3 className="font-semibold mb-3">Quick Stats</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-dark-500 flex items-center gap-2"><HiOutlineUsers size={16} />Members</span>
                <span className="font-semibold">{workspace.members?.length || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-dark-500 flex items-center gap-2"><HiOutlineClipboardList size={16} />Projects</span>
                <span className="font-semibold">{workspace.projects?.length || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-dark-500 flex items-center gap-2"><HiOutlineShieldCheck size={16} />Owner</span>
                <span className="font-semibold text-sm">{workspace.owner?.name || 'N/A'}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'members' && (
        <div className="card p-0">
          <div className="divide-y dark:divide-dark-700">
            {workspace.members?.map((member) => (
              <div key={member.user?._id || member.user} className="flex items-center justify-between px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-full bg-primary-500 flex items-center justify-center text-xs font-semibold text-white">
                    {getInitials(member.user?.name)}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-dark-900 dark:text-dark-100">{member.user?.name || 'Unknown'}</p>
                    <p className="text-xs text-dark-500">{member.user?.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {isAdmin && member.user?._id !== workspace.owner?._id ? (
                    <select value={member.role} onChange={(e) => handleUpdateRole(member.user._id, e.target.value)}
                      className="text-xs rounded-lg border border-dark-200 dark:border-dark-600 bg-transparent px-2 py-1 text-dark-600 dark:text-dark-300">
                      <option value="admin">Admin</option>
                      <option value="project_manager">Project Manager</option>
                      <option value="team_member">Team Member</option>
                      <option value="guest">Guest</option>
                    </select>
                  ) : (
                    <span className="text-xs badge bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300">{member.role}</span>
                  )}
                  {isAdmin && member.user?._id !== workspace.owner?._id && (
                    <button onClick={() => handleRemoveMember(member.user._id)} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-dark-400 hover:text-red-500">
                      <HiOutlineTrash size={16} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="card max-w-2xl space-y-6">
          <div>
            <h3 className="font-semibold mb-4">Workspace Settings</h3>
            {editing ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1.5">Name</label>
                  <input value={editName} onChange={(e) => setEditName(e.target.value)} className="input-field" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1.5">Description</label>
                  <textarea value={editDesc} onChange={(e) => setEditDesc(e.target.value)} className="input-field resize-none" rows={3} />
                </div>
                <div className="flex gap-3">
                  <button onClick={handleSaveSettings} disabled={saving} className="btn-primary">
                    {saving ? <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" /> : 'Save'}
                  </button>
                  <button onClick={() => { setEditing(false); setEditName(workspace.name); setEditDesc(workspace.description || ''); }} className="btn-secondary">Cancel</button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div><p className="text-xs text-dark-500">Name</p><p className="text-sm font-medium">{workspace.name}</p></div>
                <div><p className="text-xs text-dark-500">Description</p><p className="text-sm">{workspace.description || 'No description'}</p></div>
                <button onClick={() => setEditing(true)} className="btn-secondary text-sm">Edit Workspace</button>
              </div>
            )}
          </div>

          <div className="pt-4 border-t dark:border-dark-700">
            <h3 className="font-semibold text-red-600 mb-2">Danger Zone</h3>
            <p className="text-sm text-dark-500 mb-3">Once deleted, this workspace and all its data cannot be recovered.</p>
            <button onClick={handleDelete} className="btn-danger text-sm"><HiOutlineTrash size={16} /> Delete Workspace</button>
          </div>
        </div>
      )}

      <InviteMemberModal isOpen={inviteOpen} onClose={() => setInviteOpen(false)} workspaceId={id} />
    </motion.div>
  );
};
