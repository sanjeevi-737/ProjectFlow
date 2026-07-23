import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { projectApi } from '../services/projectApi';
import { boardApi } from '../services/boardApi';
import { HiOutlineClipboardList, HiOutlineUsers, HiOutlineCog, HiOutlinePlus, HiOutlineTrash, HiOutlineExternalLink } from 'react-icons/hi';
import { cn } from '../utils/cn';
import { getInitials, formatDate } from '../utils/formatters';

const tabs = [
  { id: 'boards', label: 'Boards', icon: HiOutlineClipboardList },
  { id: 'members', label: 'Members', icon: HiOutlineUsers },
  { id: 'settings', label: 'Settings', icon: HiOutlineCog },
];

export const ProjectDetail = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [boards, setBoards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('boards');
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [saving, setSaving] = useState(false);
  const [creatingBoard, setCreatingBoard] = useState(false);
  const [boardName, setBoardName] = useState('');

  useEffect(() => { loadProject(); }, [projectId]);

  const loadProject = async () => {
    try {
      const { data: projData } = await projectApi.getById(projectId);
      setProject(projData.data);
      setEditName(projData.data.name);
      setEditDesc(projData.data.description || '');
      const { data: brdData } = await projectApi.getBoards(projectId);
      setBoards(brdData.data || []);
    } catch { toast.error('Failed to load project'); navigate('/projects'); }
    finally { setLoading(false); }
  };

  const handleSave = async () => {
    if (!editName.trim()) return;
    setSaving(true);
    try {
      const { data } = await projectApi.update(projectId, { name: editName, description: editDesc });
      setProject(data.data);
      setEditing(false);
      toast.success('Project updated');
    } catch (err) { toast.error(err?.response?.data?.message || 'Failed to update'); }
    finally { setSaving(false); }
  };

  const handleCreateBoard = async () => {
    if (!boardName.trim()) return;
    try {
      const { data } = await boardApi.create({
        name: boardName,
        project: projectId,
        columns: [
          { name: 'To Do', color: '#6b7280', order: 0 },
          { name: 'In Progress', color: '#3b82f6', order: 1 },
          { name: 'Review', color: '#f59e0b', order: 2 },
          { name: 'Completed', color: '#10b981', order: 3 },
        ],
      });
      setBoards((prev) => [...prev, data.data]);
      setBoardName('');
      setCreatingBoard(false);
      toast.success('Board created');
    } catch (err) { toast.error(err?.response?.data?.message || 'Failed to create board'); }
  };

  const handleDeleteBoard = async (boardId) => {
    if (!confirm('Delete this board?')) return;
    try {
      await boardApi.delete(boardId);
      setBoards((prev) => prev.filter((b) => b._id !== boardId));
      toast.success('Board deleted');
    } catch (err) { toast.error(err?.response?.data?.message || 'Failed to delete board'); }
  };

  const handleArchive = async () => {
    try {
      const { data } = await projectApi.archive(projectId);
      setProject(data.data);
      toast.success(data.data.status === 'active' ? 'Project restored' : 'Project archived');
    } catch (err) { toast.error(err?.response?.data?.message || 'Failed to archive'); }
  };

  const handleDeleteProject = async () => {
    if (!confirm('Delete this project permanently? This cannot be undone.')) return;
    try {
      await projectApi.delete(projectId);
      toast.success('Project deleted');
      navigate('/projects');
    } catch (err) { toast.error(err?.response?.data?.message || 'Failed to delete'); }
  };

  if (loading) {
    return <div className="flex items-center justify-center py-20"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent" /></div>;
  }

  if (!project) return null;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-xl flex items-center justify-center" style={{ backgroundColor: (project.color || '#6366f1') + '20' }}>
            <HiOutlineClipboardList className="text-2xl" style={{ color: project.color || '#6366f1' }} />
          </div>
          <div>
            <div className="flex items-center gap-2 text-sm text-dark-500 mb-1">
              <Link to="/projects" className="hover:text-primary-500">Projects</Link>
              <span>/</span>
              <span className="text-dark-700 dark:text-dark-200">{project.name}</span>
            </div>
            <h1 className="text-2xl font-bold text-dark-900 dark:text-dark-100">{project.name}</h1>
            {project.description && <p className="text-dark-500 text-sm">{project.description}</p>}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleArchive} className="btn-secondary text-sm">
            {project.status === 'archived' ? 'Restore' : 'Archive'}
          </button>
        </div>
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

      {activeTab === 'boards' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Boards ({boards.length})</h3>
            <button onClick={() => setCreatingBoard(true)} className="btn-primary text-sm">
              <HiOutlinePlus size={16} /> New Board
            </button>
          </div>
          {creatingBoard && (
            <div className="card flex items-center gap-3">
              <input value={boardName} onChange={(e) => setBoardName(e.target.value)} className="input-field flex-1" placeholder="Board name..." autoFocus onKeyDown={(e) => e.key === 'Enter' && handleCreateBoard()} />
              <button onClick={handleCreateBoard} className="btn-primary text-sm">Create</button>
              <button onClick={() => { setCreatingBoard(false); setBoardName(''); }} className="btn-ghost text-sm">Cancel</button>
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {boards.map((board) => (
              <div key={board._id} className="card group hover:shadow-md transition-all">
                <Link to={`/projects/${projectId}/board?board=${board._id}`} className="block">
                  <h4 className="font-semibold text-dark-900 dark:text-dark-100 mb-2">{board.name}</h4>
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {board.columns?.map((col) => (
                      <span key={col._id || col.name} className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: col.color + '20', color: col.color }}>
                        {col.name}
                      </span>
                    ))}
                  </div>
                </Link>
                <div className="flex items-center justify-between pt-3 border-t dark:border-dark-700">
                  <span className="text-xs text-dark-500">{board.columns?.length || 0} columns</span>
                  <div className="flex items-center gap-1">
                    <Link to={`/projects/${projectId}/board?board=${board._id}`} className="p-1 rounded hover:bg-dark-100 dark:hover:bg-dark-700 text-dark-400 hover:text-primary-500">
                      <HiOutlineExternalLink size={16} />
                    </Link>
                    {!board.isDefault && (
                      <button onClick={() => handleDeleteBoard(board._id)} className="p-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20 text-dark-400 hover:text-red-500">
                        <HiOutlineTrash size={16} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'members' && (
        <div className="card p-0">
          <div className="divide-y dark:divide-dark-700">
            {project.members?.map((m) => (
              <div key={m.user?._id} className="flex items-center justify-between px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-full bg-primary-500 flex items-center justify-center text-xs font-semibold text-white">
                    {getInitials(m.user?.name)}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-dark-900 dark:text-dark-100">{m.user?.name || 'Unknown'}</p>
                    <p className="text-xs text-dark-500">{m.user?.email}</p>
                  </div>
                </div>
                <span className="text-xs badge bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300">{m.role}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="card max-w-2xl space-y-6">
          {editing ? (
            <div className="space-y-4">
              <h3 className="font-semibold">Edit Project</h3>
              <div>
                <label className="block text-sm font-medium mb-1.5">Name</label>
                <input value={editName} onChange={(e) => setEditName(e.target.value)} className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Description</label>
                <textarea value={editDesc} onChange={(e) => setEditDesc(e.target.value)} className="input-field resize-none" rows={3} />
              </div>
              <div className="flex gap-3">
                <button onClick={handleSave} disabled={saving} className="btn-primary">
                  {saving ? <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" /> : 'Save'}
                </button>
                <button onClick={() => { setEditing(false); setEditName(project.name); setEditDesc(project.description || ''); }} className="btn-secondary">Cancel</button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <h3 className="font-semibold">Project Settings</h3>
              <div><p className="text-xs text-dark-500">Name</p><p className="text-sm font-medium">{project.name}</p></div>
              <div><p className="text-xs text-dark-500">Description</p><p className="text-sm">{project.description || 'No description'}</p></div>
              <div><p className="text-xs text-dark-500">Status</p><span className={cn('badge text-xs mt-1', project.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-dark-100 text-dark-600')}>{project.status}</span></div>
              <div><p className="text-xs text-dark-500">Created</p><p className="text-sm">{formatDate(project.createdAt)}</p></div>
              <button onClick={() => setEditing(true)} className="btn-secondary text-sm">Edit Project</button>
            </div>
          )}

          <div className="pt-4 border-t dark:border-dark-700">
            <h3 className="font-semibold text-red-600 mb-2">Danger Zone</h3>
            <p className="text-sm text-dark-500 mb-3">Permanently delete this project and all its data.</p>
            <button onClick={handleDeleteProject} className="btn-danger text-sm"><HiOutlineTrash size={16} /> Delete Project</button>
          </div>
        </div>
      )}
    </motion.div>
  );
};
