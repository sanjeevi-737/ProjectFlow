import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { workspaceApi } from '../services/workspaceApi';
import { CreateWorkspaceModal } from '../components/modals/CreateWorkspaceModal';
import { HiOutlinePlus, HiOutlineFolder, HiOutlineUsers, HiOutlineDotsHorizontal } from 'react-icons/hi';

export const Workspaces = () => {
  const [workspaces, setWorkspaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => { loadWorkspaces(); }, []);

  const loadWorkspaces = async () => {
    try {
      const { data } = await workspaceApi.getAll();
      setWorkspaces(data.data || []);
    } catch { toast.error('Failed to load workspaces'); }
    finally { setLoading(false); }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-dark-900 dark:text-dark-100">Workspaces</h1>
          <p className="text-dark-500">Manage your workspaces and teams</p>
        </div>
        <button onClick={() => setModalOpen(true)} className="btn-primary">
          <HiOutlinePlus size={18} /> New Workspace
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent" />
        </div>
      ) : workspaces.length === 0 ? (
        <div className="card text-center py-16">
          <HiOutlineFolder className="mx-auto text-dark-300 dark:text-dark-600" size={48} />
          <h3 className="mt-4 text-lg font-semibold text-dark-900 dark:text-dark-100">No workspaces yet</h3>
          <p className="text-dark-500 mt-1 mb-4">Create your first workspace to get started.</p>
          <button onClick={() => setModalOpen(true)} className="btn-primary">Create Workspace</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {workspaces.map((ws) => (
            <Link key={ws._id} to={`/workspaces/${ws._id}`} className="card group hover:shadow-md transition-all cursor-pointer">
              <div className="flex items-start justify-between">
                <div className="h-12 w-12 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                  <HiOutlineFolder className="text-primary-600 dark:text-primary-400" size={24} />
                </div>
              </div>
              <div className="mt-4">
                <h3 className="font-semibold text-dark-900 dark:text-dark-100">{ws.name}</h3>
                {ws.description && <p className="text-sm text-dark-500 mt-1 line-clamp-2">{ws.description}</p>}
              </div>
              <div className="flex items-center gap-4 mt-4 pt-4 border-t dark:border-dark-700">
                <span className="text-sm text-dark-500 flex items-center gap-1.5"><HiOutlineUsers size={16} />{ws.members?.length || 0} members</span>
              </div>
            </Link>
          ))}
        </div>
      )}

      <CreateWorkspaceModal isOpen={modalOpen} onClose={() => setModalOpen(false)} onCreated={(ws) => setWorkspaces((prev) => [ws, ...prev])} />
    </motion.div>
  );
};
