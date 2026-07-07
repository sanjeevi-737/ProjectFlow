import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, CartesianGrid, Legend } from 'recharts';
import toast from 'react-hot-toast';
import { dashboardApi } from '../services/dashboardApi';
import { HiOutlineChartBar, HiOutlineTrendingUp, HiOutlineClipboardList, HiOutlineCheckCircle, HiOutlineClock, HiOutlineExclamationCircle } from 'react-icons/hi';
import { cn } from '../utils/cn';

const statusColors = { 'To Do': '#6b7280', 'In Progress': '#3b82f6', Review: '#f59e0b', Completed: '#10b981' };
const priorityColors = { urgent: '#ef4444', high: '#f97316', medium: '#eab308', low: '#3b82f6', none: '#9ca3af' };

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

export const Analytics = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState('all');

  useEffect(() => {
    const load = async () => {
      try {
        const { data: res } = await dashboardApi.getDashboard();
        setData(res.data);
      } catch { toast.error('Failed to load analytics'); }
      finally { setLoading(false); }
    };
    load();
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center py-20"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent" /></div>;
  }

  const stats = data ? [
    { label: 'Total Tasks', value: data.stats.totalTasks, icon: HiOutlineClipboardList, color: 'bg-blue-500', change: null },
    { label: 'Completed', value: data.stats.completedTasks, icon: HiOutlineCheckCircle, color: 'bg-green-500', change: data.stats.totalTasks ? `${Math.round((data.stats.completedTasks / data.stats.totalTasks) * 100)}%` : '0%' },
    { label: 'In Progress', value: data.stats.inProgressTasks, icon: HiOutlineClock, color: 'bg-yellow-500', change: null },
    { label: 'Overdue', value: data.stats.overdueTasks, icon: HiOutlineExclamationCircle, color: 'bg-red-500', change: null },
  ] : [];

  const statusChart = data ? Object.entries(data.distribution.byStatus).map(([name, value]) => ({ name, value })) : [];
  const priorityChart = data ? Object.entries(data.distribution.byPriority).map(([name, value]) => ({ name: name.charAt(0).toUpperCase() + name.slice(1), value })) : [];
  const projectChart = data?.distribution?.byProject || [];

  const completionRate = data?.stats?.totalTasks
    ? Math.round((data.stats.completedTasks / data.stats.totalTasks) * 100)
    : 0;
  const overdueRate = data?.stats?.totalTasks
    ? Math.round((data.stats.overdueTasks / data.stats.totalTasks) * 100)
    : 0;

  const trendData = [
    { month: 'Jan', tasks: 0, completed: 0 },
    { month: 'Feb', tasks: 0, completed: 0 },
    { month: 'Mar', tasks: 0, completed: 0 },
    { month: 'Apr', tasks: 0, completed: 0 },
    { month: 'May', tasks: 0, completed: 0 },
    { month: 'Jun', tasks: 0, completed: 0 },
  ];

  const projectCompletionData = projectChart.map((p) => ({
    name: p.name.length > 12 ? p.name.substring(0, 12) + '...' : p.name,
    total: p.total,
    completed: p.completed,
    rate: p.total ? Math.round((p.completed / p.total) * 100) : 0,
  }));

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-dark-900 dark:text-dark-100">Analytics</h1>
          <p className="text-dark-500">Deep insights into your project performance</p>
        </div>
        <div className="flex gap-1 bg-dark-50 dark:bg-dark-800 rounded-lg p-1">
          {['week', 'month', 'quarter', 'all'].map((t) => (
            <button key={t} onClick={() => setTimeframe(t)}
              className={cn('px-3 py-1.5 text-xs font-medium rounded-md transition-all capitalize',
                timeframe === t ? 'bg-white dark:bg-dark-700 text-dark-900 dark:text-dark-100 shadow-sm' : 'text-dark-500 hover:text-dark-700'
              )}>
              {t === 'all' ? 'All Time' : t}
            </button>
          ))}
        </div>
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
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={statusChart} cx="50%" cy="50%" innerRadius={65} outerRadius={110} paddingAngle={4} dataKey="value">
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
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={priorityChart} barSize={48} layout="vertical">
                <XAxis type="number" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} width={70} />
                <Tooltip />
                <Bar dataKey="value" radius={[0, 6, 6, 0]}>
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
            <h2 className="text-lg font-semibold text-dark-900 dark:text-dark-100">Project Completion Rates</h2>
            <HiOutlineTrendingUp className="text-dark-400" size={20} />
          </div>
          {projectCompletionData.length === 0 ? (
            <div className="text-center py-8 text-dark-400 text-sm">No projects yet</div>
          ) : (
            <div className="space-y-4">
              {projectCompletionData.map((project) => (
                <div key={project.name}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm font-medium text-dark-700 dark:text-dark-200">{project.name}</span>
                    <span className="text-xs text-dark-500">{project.completed}/{project.total}</span>
                  </div>
                  <div className="h-2.5 rounded-full bg-dark-100 dark:bg-dark-700">
                    <div className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${project.rate}%`, backgroundColor: project.rate >= 80 ? '#10b981' : project.rate >= 50 ? '#f59e0b' : '#ef4444' }} />
                  </div>
                  <span className="text-xs text-dark-400 mt-0.5 block">{project.rate}% complete</span>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        <motion.div variants={item} className="card">
          <h2 className="text-lg font-semibold text-dark-900 dark:text-dark-100 mb-4">Project Task Distribution</h2>
          {projectCompletionData.length === 0 ? (
            <div className="text-center py-8 text-dark-400 text-sm">No projects yet</div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={projectCompletionData} barSize={32}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip />
                <Legend />
                <Bar dataKey="total" name="Total Tasks" fill="#6366f1" radius={[4, 4, 0, 0]} />
                <Bar dataKey="completed" name="Completed" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div variants={item} className="card">
          <h3 className="font-semibold text-dark-900 dark:text-dark-100 mb-3">Completion Rate</h3>
          <div className="flex items-center gap-4">
            <div className="relative h-20 w-20">
              <svg className="h-full w-full -rotate-90" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="16" fill="none" stroke="#e2e8f0" strokeWidth="3" className="dark:stroke-dark-700" />
                <circle cx="18" cy="18" r="16" fill="none" stroke="#10b981" strokeWidth="3" strokeDasharray={`${completionRate} ${100 - completionRate}`} strokeLinecap="round" />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-lg font-bold text-dark-900 dark:text-dark-100">{completionRate}%</span>
            </div>
            <div className="text-sm text-dark-500">
              <p>{data?.stats?.completedTasks} of {data?.stats?.totalTasks} tasks done</p>
              <p className="text-xs mt-1">{data?.stats?.inProgressTasks} still in progress</p>
            </div>
          </div>
        </motion.div>

        <motion.div variants={item} className="card">
          <h3 className="font-semibold text-dark-900 dark:text-dark-100 mb-3">Overdue Rate</h3>
          <div className="flex items-center gap-4">
            <div className="relative h-20 w-20">
              <svg className="h-full w-full -rotate-90" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="16" fill="none" stroke="#e2e8f0" strokeWidth="3" className="dark:stroke-dark-700" />
                <circle cx="18" cy="18" r="16" fill="none" stroke="#ef4444" strokeWidth="3" strokeDasharray={`${overdueRate} ${100 - overdueRate}`} strokeLinecap="round" />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-lg font-bold text-dark-900 dark:text-dark-100">{overdueRate}%</span>
            </div>
            <div className="text-sm text-dark-500">
              <p>{data?.stats?.overdueTasks} tasks past due date</p>
              <p className="text-xs mt-1">Out of {data?.stats?.totalTasks} total</p>
            </div>
          </div>
        </motion.div>

        <motion.div variants={item} className="card">
          <h3 className="font-semibold text-dark-900 dark:text-dark-100 mb-3">Workspace Overview</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-dark-500">Workspaces</span>
              <span className="font-semibold text-dark-900 dark:text-dark-100">{data?.stats?.totalWorkspaces || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-dark-500">Projects</span>
              <span className="font-semibold text-dark-900 dark:text-dark-100">{data?.stats?.totalProjects || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-dark-500">Active Tasks</span>
              <span className="font-semibold text-dark-900 dark:text-dark-100">{(data?.stats?.totalTasks || 0) - (data?.stats?.completedTasks || 0)}</span>
            </div>
          </div>
        </motion.div>
      </div>

      {data?.activity?.length > 0 && (
        <motion.div variants={item} className="card">
          <h2 className="text-lg font-semibold text-dark-900 dark:text-dark-100 mb-4">Recent Activity Timeline</h2>
          <div className="space-y-4 max-h-[400px] overflow-y-auto scrollbar-hide">
            {data.activity.map((log, i) => (
              <div key={log._id} className="flex items-start gap-3">
                <div className="flex flex-col items-center">
                  <div className="h-8 w-8 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-xs font-semibold text-primary-700 dark:text-primary-300 flex-shrink-0">
                    {i + 1}
                  </div>
                  {i < data.activity.length - 1 && <div className="w-px flex-1 bg-dark-200 dark:bg-dark-700 mt-1" />}
                </div>
                <div className="flex-1 min-w-0 pb-4">
                  <p className="text-sm text-dark-700 dark:text-dark-300">{log.description}</p>
                  <p className="text-xs text-dark-400 mt-0.5">{new Date(log.createdAt).toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};
