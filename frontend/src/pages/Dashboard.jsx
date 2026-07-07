import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import toast from 'react-hot-toast';
import { dashboardApi } from '../services/dashboardApi';
import { HiOutlineClipboardList, HiOutlineCheckCircle, HiOutlineClock, HiOutlineExclamationCircle, HiOutlineFolder, HiOutlinePlus, HiOutlineArrowRight } from 'react-icons/hi';
import { cn } from '../utils/cn';
import { timeAgo, getInitials } from '../utils/formatters';

const statusColors = { 'To Do': '#6b7280', 'In Progress': '#3b82f6', Review: '#f59e0b', Completed: '#10b981' };
const priorityColors = { urgent: '#ef4444', high: '#f97316', medium: '#eab308', low: '#3b82f6', none: '#9ca3af' };

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

export const Dashboard = () => {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const { data: res } = await dashboardApi.getDashboard();
        setData(res.data);
      } catch { toast.error('Failed to load dashboard'); }
      finally { setLoading(false); }
    };
    load();
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center py-20"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent" /></div>;
  }

  const stats = data ? [
    { label: 'Total Projects', value: data.stats.totalProjects, icon: HiOutlineFolder, color: 'bg-violet-500', change: null },
    { label: 'Total Tasks', value: data.stats.totalTasks, icon: HiOutlineClipboardList, color: 'bg-blue-500', change: null },
    { label: 'Completed', value: data.stats.completedTasks, icon: HiOutlineCheckCircle, color: 'bg-green-500', change: data.stats.totalTasks ? `${Math.round((data.stats.completedTasks / data.stats.totalTasks) * 100)}%` : '0%' },
    { label: 'Overdue', value: data.stats.overdueTasks, icon: HiOutlineExclamationCircle, color: 'bg-red-500', change: null },
  ] : [];

  const statusChart = data ? Object.entries(data.distribution.byStatus).map(([name, value]) => ({ name, value })) : [];
  const priorityChart = data ? Object.entries(data.distribution.byPriority).map(([name, value]) => ({ name: name.charAt(0).toUpperCase() + name.slice(1), value })) : [];

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-dark-900 dark:text-dark-100">Dashboard</h1>
          <p className="text-dark-500">Welcome back! Here&apos;s what&apos;s happening.</p>
        </div>
        <Link to="/projects" className="btn-primary">
          <HiOutlinePlus size={18} /> New Project
        </Link>
      </div>

      <motion.div variants={item} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="card">
            <div className="flex items-center justify-between">
              <div className={cn('rounded-lg p-3', stat.color)}><stat.icon className="text-white" size={22} /></div>
              {stat.change && <span className="text-sm font-medium text-green-600">{stat.change}</span>}
            </div>
            <div className="mt-4">
              <p className="text-2xl font-bold text-dark-900 dark:text-dark-100">{stat.value}</p>
              <p className="text-sm text-dark-500">{stat.label}</p>
            </div>
          </div>
        ))}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div variants={item} className="card">
          <h2 className="text-lg font-semibold text-dark-900 dark:text-dark-100 mb-4">Task Status Distribution</h2>
          {statusChart.length === 0 ? (
            <div className="text-center py-8 text-dark-400 text-sm">No tasks yet</div>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={statusChart} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={4} dataKey="value">
                  {statusChart.map((entry) => <Cell key={entry.name} fill={statusColors[entry.name] || '#6b7280'} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          )}
          <div className="flex flex-wrap justify-center gap-4 mt-2">
            {statusChart.map((entry) => (
              <div key={entry.name} className="flex items-center gap-1.5 text-xs text-dark-500">
                <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: statusColors[entry.name] || '#6b7280' }} />
                {entry.name} ({entry.value})
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div variants={item} className="card">
          <h2 className="text-lg font-semibold text-dark-900 dark:text-dark-100 mb-4">Tasks by Priority</h2>
          {priorityChart.length === 0 ? (
            <div className="text-center py-8 text-dark-400 text-sm">No tasks yet</div>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={priorityChart} barSize={48}>
                <XAxis dataKey="name" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {priorityChart.map((entry) => <Cell key={entry.name} fill={priorityColors[entry.name.toLowerCase()] || '#9ca3af'} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div variants={item} className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-dark-900 dark:text-dark-100">Project Progress</h2>
            <Link to="/projects" className="text-sm text-primary-600 hover:text-primary-500 flex items-center gap-1">View all <HiOutlineArrowRight size={14} /></Link>
          </div>
          {data?.distribution?.byProject?.length === 0 ? (
            <div className="text-center py-8 text-dark-400 text-sm">No projects yet</div>
          ) : (
            <div className="space-y-4">
              {data?.distribution?.byProject?.map((project) => {
                const pct = project.total ? Math.round((project.completed / project.total) * 100) : 0;
                return (
                  <div key={project.name} onClick={() => navigate('/projects')} className="cursor-pointer">
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full" style={{ backgroundColor: project.color || '#6366f1' }} />
                        <span className="text-sm font-medium text-dark-700 dark:text-dark-200">{project.name}</span>
                      </div>
                      <span className="text-xs text-dark-500">{project.completed}/{project.total} tasks</span>
                    </div>
                    <div className="h-2 rounded-full bg-dark-100 dark:bg-dark-700">
                      <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, backgroundColor: project.color || '#6366f1' }} />
                    </div>
                    <div className="flex justify-between mt-1">
                      <span className="text-xs text-dark-400">{pct}% complete</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </motion.div>

        <motion.div variants={item} className="card">
          <h2 className="text-lg font-semibold text-dark-900 dark:text-dark-100 mb-4">Recent Activity</h2>
          {data?.activity?.length === 0 ? (
            <div className="text-center py-8 text-dark-400 text-sm">No activity yet</div>
          ) : (
            <div className="space-y-4 max-h-[320px] overflow-y-auto scrollbar-hide">
              {data?.activity?.map((log) => (
                <div key={log._id} className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-xs font-semibold text-primary-700 dark:text-primary-300 flex-shrink-0">
                    {getInitials(log.performedBy?.name)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-dark-700 dark:text-dark-300">{log.description}</p>
                    <p className="text-xs text-dark-400 mt-0.5">{timeAgo(log.createdAt)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      <motion.div variants={item} className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-dark-900 dark:text-dark-100">Recent Tasks</h2>
          <Link to="/tasks" className="text-sm text-primary-600 hover:text-primary-500 flex items-center gap-1">View all <HiOutlineArrowRight size={14} /></Link>
        </div>
        {data?.recentTasks?.length === 0 ? (
          <div className="text-center py-8 text-dark-400 text-sm">No tasks yet</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b dark:border-dark-700">
                  <th className="text-left py-3 px-2 font-medium text-dark-500">Task</th>
                  <th className="text-left py-3 px-2 font-medium text-dark-500">Project</th>
                  <th className="text-left py-3 px-2 font-medium text-dark-500">Priority</th>
                  <th className="text-left py-3 px-2 font-medium text-dark-500">Status</th>
                  <th className="text-left py-3 px-2 font-medium text-dark-500">Due</th>
                </tr>
              </thead>
              <tbody>
                {data?.recentTasks?.map((task) => (
                  <tr key={task._id} onClick={() => navigate(`/tasks/${task._id}`)}
                    className="border-b dark:border-dark-700/50 hover:bg-dark-50 dark:hover:bg-dark-800/50 cursor-pointer">
                    <td className="py-3 px-2"><span className="font-medium text-dark-900 dark:text-dark-100">{task.title}</span></td>
                    <td className="py-3 px-2 text-dark-500">{task.project?.name || '—'}</td>
                    <td className="py-3 px-2">
                      {task.priority && task.priority !== 'none' ? (
                        <span className={cn('badge text-[10px]', {
                          'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300': task.priority === 'urgent',
                          'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300': task.priority === 'high',
                          'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300': task.priority === 'medium',
                          'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300': task.priority === 'low',
                        })}>{task.priority}</span>
                      ) : <span className="text-dark-400 text-xs">—</span>}
                    </td>
                    <td className="py-3 px-2">
                      <span className={cn('badge text-[10px]', {
                        'bg-dark-100 text-dark-700 dark:bg-dark-700 dark:text-dark-300': task.column === 'To Do',
                        'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300': task.column === 'In Progress',
                        'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300': task.column === 'Review',
                        'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300': task.column === 'Completed',
                      })}>{task.column}</span>
                    </td>
                    <td className="py-3 px-2 text-dark-500">{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};
