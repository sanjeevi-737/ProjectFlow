import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { projectApi } from '../services/projectApi';
import { workspaceApi } from '../services/workspaceApi';
import { CreateProjectModal } from '../components/modals/CreateProjectModal';
import { HiOutlinePlus, HiOutlineClipboardList, HiOutlineUsers, HiOutlineCalendar, HiOutlineDotsHorizontal, HiOutlineFolder } from 'react-icons/hi';
import { cn } from '../utils/cn';
import { formatDate } from '../utils/formatters';

export const Projects = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [workspaces, setWorkspaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedWs, setSelectedWs] = useState('');

  useEffect(() => {
    Promise.all([loadWorkspaces(), loadProjects()]).finally(() => setLoading(false));
  }, []);

  const loadWorkspaces = async () => {
    try { const { data } = await workspaceApi.getAll(); setWorkspaces(data.data || []); }
    catch { /* ignore */ }
  };

  const loadProjects = async (wsId) => {
    try {
      if (wsId) {
        const { data } = await projectApi.getByWorkspace(wsId);
        setProjects(data.data || []);
      } else {
        const wsList = (await workspaceApi.getAll()).data.data || [];
        const all = await Promise.all(wsList.map((ws) => projectApi.getByWorkspace(ws._id).then((r) => r.data.data || []).catch(() => [])));
        setProjects(all.flat());
      }
    } catch { setProjects([]); }
  };

  const handleWsFilter = async (wsId) => {
    setSelectedWs(wsId);
    setLoading(true);
    await loadProjects(wsId);
    setLoading(false);
  };

  const handleArchive = async (id) => {
    try {
      await projectApi.archive(id);
      toast.success('Project archived');
      loadProjects(selectedWs);
    } catch (err) { toast.error(err?.response?.data?.message || 'Failed to archive'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this project and all its data?')) return;
    try {
      await projectApi.delete(id);
      toast.success('Project deleted');
      loadProjects(selectedWs);
    } catch (err) { toast.error(err?.response?.data?.message || 'Failed to delete'); }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-dark-900 dark:text-dark-100">Projects</h1>
          <p className="text-dark-500">Manage your projects across workspaces</p>
        </div>
        <button onClick={() => setModalOpen(true)} className="btn-primary" disabled={workspaces.length === 0}>
          <HiOutlinePlus size={18} /> New Project
        </button>
      </div>

      <div className="flex items-center gap-2">
        <button onClick={() => handleWsFilter('')}
          className={cn('px-3 py-1.5 text-sm rounded-lg transition-all', !selectedWs ? 'bg-primary-500 text-white' : 'bg-dark-100 dark:bg-dark-700 text-dark-600 dark:text-dark-300 hover:bg-dark-200 dark:hover:bg-dark-600')}>
          All
        </button>
        {workspaces.map((ws) => (
          <button key={ws._id} onClick={() => handleWsFilter(ws._id)}
            className={cn('px-3 py-1.5 text-sm rounded-lg transition-all', selectedWs === ws._id ? 'bg-primary-500 text-white' : 'bg-dark-100 dark:bg-dark-700 text-dark-600 dark:text-dark-300 hover:bg-dark-200 dark:hover:bg-dark-600')}>
            {ws.name}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent" /></div>
      ) : projects.length === 0 ? (
        <div className="card text-center py-16">
          <HiOutlineClipboardList className="mx-auto text-dark-300 dark:text-dark-600" size={48} />
          <h3 className="mt-4 text-lg font-semibold text-dark-900 dark:text-dark-100">No projects yet</h3>
          <p className="text-dark-500 mt-1 mb-4">Create your first project to get started.</p>
          <button onClick={() => setModalOpen(true)} className="btn-primary">Create Project</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project) => {
            const pct = project.tasks?.length ? Math.round((project.completed || 0) / project.tasks.length * 100) : 0;
            return (
              <div key={project._id} className="card group hover:shadow-md transition-all">
                <Link to={`/projects/${project._id}`} className="block">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="h-3 w-3 rounded-full" style={{ backgroundColor: project.color || '#6366f1' }} />
                      <h3 className="font-semibold text-dark-900 dark:text-dark-100">{project.name}</h3>
                    </div>
                    <span className={cn('badge', project.status === 'active' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' : project.status === 'archived' ? 'bg-dark-100 text-dark-600 dark:bg-dark-700 dark:text-dark-300' : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300')}>
                      {project.status}
                    </span>
                  </div>
                  <p className="text-sm text-dark-500 mb-4 line-clamp-2">{project.description || 'No description'}</p>
                  <div className="mb-3">
                    <div className="flex items-center justify-between text-xs text-dark-500 mb-1">
                      <span>{project.completed || 0}/{project.tasks?.length || 0} tasks</span>
                      <span>{pct}%</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-dark-100 dark:bg-dark-700">
                      <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: project.color || '#6366f1' }} />
                    </div>
                  </div>
                </Link>
                <div className="flex items-center justify-between pt-3 border-t dark:border-dark-700">
                  <div className="flex items-center gap-3 text-xs text-dark-500">
                    <span className="flex items-center gap-1"><HiOutlineClipboardList size={14} />{project.boards?.length || 0} boards</span>
                    <span className="flex items-center gap-1"><HiOutlineUsers size={14} />{project.members?.length || 0}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => navigate(`/projects/${project._id}/board`)} className="p-1 rounded hover:bg-dark-100 dark:hover:bg-dark-700 text-dark-400 hover:text-primary-500" title="Open Board">
                      <HiOutlineClipboardList size={16} />
                    </button>
                    {project.status === 'active' && (
                      <button onClick={() => handleArchive(project._id)} className="p-1 rounded hover:bg-dark-100 dark:hover:bg-dark-700 text-dark-400 hover:text-yellow-500" title="Archive">
                        <HiOutlineDotsHorizontal size={16} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <CreateProjectModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreated={(data) => { setProjects((prev) => [data.project || data, ...prev]); }}
        workspaceId={selectedWs || workspaces[0]?._id}
      />
    </motion.div>
  );
};
