import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { workspaceApi } from '../../services/workspaceApi';
import { HiOutlineX, HiOutlineFolder } from 'react-icons/hi';

const schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  description: z.string().max(500).optional(),
});

export const CreateWorkspaceModal = ({ isOpen, onClose, onCreated }) => {
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, formState: { errors }, reset } = useForm({ resolver: zodResolver(schema) });

  if (!isOpen) return null;

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const { data: res } = await workspaceApi.create(data);
      toast.success('Workspace created');
      reset();
      onCreated(res.data);
      onClose();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to create workspace');
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
              <HiOutlineFolder className="text-primary-600 dark:text-primary-400" size={20} />
            </div>
            <h2 className="text-lg font-semibold text-dark-900 dark:text-dark-100">Create Workspace</h2>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-dark-100 dark:hover:bg-dark-700"><HiOutlineX size={20} className="text-dark-400" /></button>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1.5">Workspace Name</label>
            <input {...register('name')} className="input-field" placeholder="e.g. Engineering Team" autoFocus />
            {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1.5">Description (optional)</label>
            <textarea {...register('description')} className="input-field resize-none" rows={3} placeholder="What's this workspace about?" />
          </div>
          <div className="flex gap-3 justify-end pt-2">
            <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" /> : 'Create Workspace'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
