import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { taskApi } from '../services/taskApi';
import { workspaceApi } from '../services/workspaceApi';
import { projectApi } from '../services/projectApi';
import { HiOutlinePlus, HiOutlineSearch, HiOutlineChat, HiOutlinePaperClip } from 'react-icons/hi';
import { cn } from '../utils/cn';
import { getInitials } from '../utils/formatters';

const priorityStyles = {
  urgent: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
  high: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
  medium: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
  low: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  none: 'bg-dark-100 text-dark-500 dark:bg-dark-700 dark:text-dark-400',
};

const statusStyles = {
  'To Do': 'bg-dark-100 text-dark-700 dark:bg-dark-700 dark:text-dark-300',
  'In Progress': 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
  Review: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
  Completed: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
};

const emptyStates = {
  all: { title: 'No tasks found', desc: 'Tasks will appear here once they are created in a project.' },
  filtered: { title: 'No matching tasks', desc: 'Try adjusting your search or filters.' },
};

export const Tasks = () => {
  const [searchParams] = useSearchParams();
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [filterPriority, setFilterPriority] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterProject, setFilterProject] = useState('all');

  useEffect(() => {
    const loadAll = async () => {
      try {
        const { data: wsRes } = await workspaceApi.getMy();
        const workspaces = wsRes.data || [];
        const projPromises = workspaces.map((ws) => projectApi.getByWorkspace(ws._id));
        const projResults = await Promise.all(projPromises);
        const allProjects = projResults.flatMap((r) => r.data.data || []);
        setProjects(allProjects);

        const taskPromises = allProjects.map((p) => taskApi.getByProject(p._id));
        const taskResults = await Promise.all(taskPromises);
        const allTasks = taskResults.flatMap((r) => r.data.data || []);
        setTasks(allTasks);
      } catch {} finally { setLoading(false); }
    };
    loadAll();
  }, []);

  const filtered = tasks.filter((t) => {
    if (search && !t.title.toLowerCase().includes(search.toLowerCase())) return false;
    if (filterPriority !== 'all' && t.priority !== filterPriority) return false;
    if (filterStatus !== 'all' && t.column !== filterStatus) return false;
    if (filterProject !== 'all' && t.project !== filterProject) return false;
    return true;
  });

  const statuses = [...new Set(tasks.map((t) => t.column).filter(Boolean))];

  if (loading) {
    return <div className="flex items-center justify-center py-20"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent" /></div>;
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-dark-900 dark:text-dark-100">Tasks</h1>
          <p className="text-dark-500">{tasks.length} total tasks</p>
        </div>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400" size={18} />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search tasks..." className="input-field pl-10" />
        </div>
        <select className="input-field w-auto" value={filterProject} onChange={(e) => setFilterProject(e.target.value)}>
          <option value="all">All Projects</option>
          {projects.map((p) => <option key={p._id} value={p._id}>{p.name}</option>)}
        </select>
        <select className="input-field w-auto" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
          <option value="all">All Statuses</option>
          {statuses.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <select className="input-field w-auto" value={filterPriority} onChange={(e) => setFilterPriority(e.target.value)}>
          <option value="all">All Priorities</option>
          <option value="urgent">Urgent</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
          <option value="none">None</option>
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="card py-16 text-center">
          <p className="font-semibold text-dark-900 dark:text-dark-100">{search || filterPriority !== 'all' || filterStatus !== 'all' || filterProject !== 'all' ? emptyStates.filtered.title : emptyStates.all.title}</p>
          <p className="text-dark-500 text-sm mt-1">{search || filterPriority !== 'all' || filterStatus !== 'all' || filterProject !== 'all' ? emptyStates.filtered.desc : emptyStates.all.desc}</p>
        </div>
      ) : (
        <div className="card p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-dark-50 dark:bg-dark-800/50">
                <tr>
                  <th className="text-left py-3 px-4 font-medium text-dark-500">Task</th>
                  <th className="text-left py-3 px-4 font-medium text-dark-500">Project</th>
                  <th className="text-left py-3 px-4 font-medium text-dark-500">Priority</th>
                  <th className="text-left py-3 px-4 font-medium text-dark-500">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-dark-500">Assignee</th>
                  <th className="text-left py-3 px-4 font-medium text-dark-500">Due</th>
                  <th className="text-left py-3 px-4 font-medium text-dark-500">Meta</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((task) => {
                  const project = projects.find((p) => p._id === task.project);
                  return (
                    <tr key={task._id} className="border-t dark:border-dark-700 hover:bg-dark-50 dark:hover:bg-dark-800/30 cursor-pointer transition-colors">
                      <td className="py-3 px-4">
                        <Link to={`/tasks/${task._id}`} className="font-medium text-dark-900 dark:text-dark-100 hover:text-primary-500">
                          {task.title}
                        </Link>
                      </td>
                      <td className="py-3 px-4 text-dark-500">{project?.name || '—'}</td>
                      <td className="py-3 px-4">
                        {task.priority && task.priority !== 'none' ? (
                          <span className={cn('badge text-[10px]', priorityStyles[task.priority])}>{task.priority}</span>
                        ) : (
                          <span className="text-dark-400 text-xs">—</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <span className={cn('badge text-[10px]', statusStyles[task.column] || 'bg-dark-100 text-dark-500')}>
                          {task.column}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        {task.assignees?.length > 0 ? (
                          <div className="flex -space-x-2">
                            {task.assignees.map((a, i) => (
                              <div key={a._id || i} className="h-6 w-6 rounded-full bg-primary-500 flex items-center justify-center text-[10px] font-semibold text-white border-2 border-white dark:border-dark-800" title={a.name}>
                                {getInitials(a.name)}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span className="text-dark-400 text-xs">—</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        {task.dueDate ? (
                          <span className={cn('text-xs', new Date(task.dueDate) < new Date() && task.column !== 'Completed' ? 'text-red-500' : 'text-dark-500')}>
                            {new Date(task.dueDate).toLocaleDateString()}
                          </span>
                        ) : (
                          <span className="text-dark-400 text-xs">—</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2 text-dark-400">
                          <span className="flex items-center gap-0.5 text-xs"><HiOutlineChat size={12} />{task.comments?.length || 0}</span>
                          {task.attachments?.length > 0 && (
                            <span className="flex items-center gap-0.5 text-xs"><HiOutlinePaperClip size={12} />{task.attachments.length}</span>
                          )}
                          {task.checklist?.length > 0 && (
                            <span className="text-xs">{task.checklist.filter((c) => c.completed).length}/{task.checklist.length}</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </motion.div>
  );
};
