import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { projectApi } from '../../services/projectApi';
import { HiOutlineX, HiOutlineClipboardList } from 'react-icons/hi';

const schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  description: z.string().max(1000).optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']),
});

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#8b5cf6', '#ec4899', '#14b8a6'];

export const CreateProjectModal = ({ isOpen, onClose, onCreated, workspaceId }) => {
  const [loading, setLoading] = useState(false);
  const [color, setColor] = useState(COLORS[0]);
  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { priority: 'medium' },
  });

  if (!isOpen) return null;

  const onSubmit = async (data) => {
    if (!workspaceId) { toast.error('No workspace selected'); return; }
    setLoading(true);
    try {
      const { data: res } = await projectApi.create({ ...data, color, workspace: workspaceId });
      toast.success('Project created');
      reset();
      onCreated(res.data);
      onClose();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to create project');
    } finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div className="card w-full max-w-lg mx-4 animate-scale-in" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
              <HiOutlineClipboardList className="text-primary-600 dark:text-primary-400" size={20} />
            </div>
            <h2 className="text-lg font-semibold text-dark-900 dark:text-dark-100">Create Project</h2>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-dark-100 dark:hover:bg-dark-700"><HiOutlineX size={20} className="text-dark-400" /></button>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1.5">Project Name</label>
            <input {...register('name')} className="input-field" placeholder="e.g. Website Redesign" autoFocus />
            {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1.5">Description (optional)</label>
            <textarea {...register('description')} className="input-field resize-none" rows={3} placeholder="Project description..." />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1.5">Priority</label>
              <select {...register('priority')} className="input-field">
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1.5">Color</label>
              <div className="flex gap-1.5 mt-1.5">
                {COLORS.map((c) => (
                  <button key={c} type="button" onClick={() => setColor(c)}
                    className={`h-7 w-7 rounded-full transition-all ${color === c ? 'ring-2 ring-offset-2 ring-dark-400 dark:ring-offset-dark-800' : ''}`}
                    style={{ backgroundColor: c }} />
                ))}
              </div>
            </div>
          </div>
          <div className="flex gap-3 justify-end pt-2">
            <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" /> : 'Create Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
