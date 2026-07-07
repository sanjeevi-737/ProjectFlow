import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { workspaceApi } from '../services/workspaceApi';
import { HiOutlineUsers, HiOutlineMail, HiOutlineShieldCheck, HiOutlineCalendar, HiOutlineFolder, HiOutlineSearch } from 'react-icons/hi';
import { getInitials, formatDate } from '../utils/formatters';
import { cn } from '../utils/cn';

const roleColors = {
  admin: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
  project_manager: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  team_member: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
  guest: 'bg-dark-100 text-dark-500 dark:bg-dark-700 dark:text-dark-400',
};

export const Team = () => {
  const [workspaces, setWorkspaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [selectedWorkspace, setSelectedWorkspace] = useState('all');

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await workspaceApi.getAll();
        setWorkspaces(data.data || []);
      } catch { toast.error('Failed to load team data'); }
      finally { setLoading(false); }
    };
    load();
  }, []);

  const allMembers = workspaces.flatMap((ws) =>
    (ws.members || []).map((m) => ({
      ...m,
      workspaceName: ws.name,
      workspaceId: ws._id,
      joinedAt: m.joinedAt || ws.createdAt,
    }))
  );

  const uniqueMembers = allMembers.reduce((acc, m) => {
    const key = m.user?._id;
    if (!key) return acc;
    if (!acc[key]) acc[key] = { ...m, workspaces: [m.workspaceName] };
    else acc[key].workspaces.push(m.workspaceName);
    return acc;
  }, {});

  const memberList = Object.values(uniqueMembers).filter((m) => {
    if (search && !m.user?.name?.toLowerCase().includes(search.toLowerCase()) && !m.user?.email?.toLowerCase().includes(search.toLowerCase())) return false;
    if (selectedRole !== 'all' && m.role !== selectedRole) return false;
    if (selectedWorkspace !== 'all' && !m.workspaces.includes(selectedWorkspace)) return false;
    return true;
  });

  if (loading) {
    return <div className="flex items-center justify-center py-20"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent" /></div>;
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-dark-900 dark:text-dark-100">Team</h1>
          <p className="text-dark-500">{Object.keys(uniqueMembers).length} members across {workspaces.length} workspaces</p>
        </div>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400" size={18} />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search members..." className="input-field pl-10" />
        </div>
        <select className="input-field w-auto" value={selectedRole} onChange={(e) => setSelectedRole(e.target.value)}>
          <option value="all">All Roles</option>
          <option value="admin">Admin</option>
          <option value="project_manager">Project Manager</option>
          <option value="team_member">Team Member</option>
          <option value="guest">Guest</option>
        </select>
        <select className="input-field w-auto" value={selectedWorkspace} onChange={(e) => setSelectedWorkspace(e.target.value)}>
          <option value="all">All Workspaces</option>
          {workspaces.map((ws) => <option key={ws._id} value={ws.name}>{ws.name}</option>)}
        </select>
      </div>

      {memberList.length === 0 ? (
        <div className="card py-16 text-center">
          <HiOutlineUsers className="mx-auto text-4xl text-dark-300 mb-3" />
          <p className="font-semibold text-dark-900 dark:text-dark-100">No members found</p>
          <p className="text-dark-500 text-sm mt-1">Try adjusting your search or filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {memberList.map((member) => {
            const user = member.user || {};
            return (
              <div key={user._id} className="card hover:shadow-md transition-all">
                <div className="flex items-start gap-4">
                  <div className="h-12 w-12 rounded-full bg-primary-500 flex items-center justify-center text-base font-bold text-white flex-shrink-0">
                    {getInitials(user.name)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="font-semibold text-dark-900 dark:text-dark-100 truncate">{user.name || 'Unknown'}</h3>
                      <span className={cn('badge text-[10px] whitespace-nowrap', roleColors[member.role] || roleColors.guest)}>
                        {member.role.replace('_', ' ')}
                      </span>
                    </div>
                    <p className="text-sm text-dark-500 flex items-center gap-1.5 mt-0.5">
                      <HiOutlineMail size={14} /> {user.email || 'No email'}
                    </p>
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t dark:border-dark-700 space-y-2">
                  <div className="flex items-center gap-2 text-sm text-dark-500">
                    <HiOutlineFolder size={14} />
                    <span>{member.workspaces.length} workspace{member.workspaces.length > 1 ? 's' : ''}: {member.workspaces.join(', ')}</span>
                  </div>
                  {member.joinedAt && (
                    <div className="flex items-center gap-2 text-sm text-dark-500">
                      <HiOutlineCalendar size={14} />
                      <span>Joined {formatDate(member.joinedAt)}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
};
