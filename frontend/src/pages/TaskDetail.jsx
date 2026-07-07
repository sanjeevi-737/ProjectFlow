import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { taskApi } from '../services/taskApi';
import { projectApi } from '../services/projectApi';
import { useSocket } from '../hooks/useSocket';
import { HiOutlinePaperClip, HiOutlineChat, HiOutlineCalendar, HiOutlineClock, HiOutlineTrash, HiOutlinePencil, HiOutlineCheck, HiOutlineX, HiOutlinePlus, HiOutlineDotsHorizontal, HiOutlineArrowLeft } from 'react-icons/hi';
import { cn } from '../utils/cn';
import { getInitials, formatDate, formatDateTime, timeAgo, formatDueDate, formatFileSize } from '../utils/formatters';

const priorityOptions = ['none', 'low', 'medium', 'high', 'urgent'];
const priorityStyles = {
  none: 'bg-dark-100 dark:bg-dark-700 text-dark-500',
  low: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
  medium: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300',
  high: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300',
  urgent: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300',
};
const labelColors = ['#6366f1', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#8b5cf6', '#14b8a6'];

export const TaskDetail = () => {
  const { taskId } = useParams();
  const navigate = useNavigate();

  const [task, setTask] = useState(null);
  const [project, setProject] = useState(null);
  const [comments, setComments] = useState([]);
  const [activityLog, setActivityLog] = useState([]);
  const [loading, setLoading] = useState(true);

  const [editingTitle, setEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState('');
  const [editingDesc, setEditingDesc] = useState(false);
  const [descDraft, setDescDraft] = useState('');
  const [newComment, setNewComment] = useState('');
  const [sendingComment, setSendingComment] = useState(false);
  const [newCheckItem, setNewCheckItem] = useState('');
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [newLabelName, setNewLabelName] = useState('');
  const [showLabelPicker, setShowLabelPicker] = useState(false);
  const [showAssigneePicker, setShowAssigneePicker] = useState(false);
  const [projectMembers, setProjectMembers] = useState([]);

  const { joinBoard, leaveBoard, onCommentAdded } = useSocket();

  useEffect(() => { loadTask(); }, [taskId]);

  useEffect(() => {
    if (!task) return;
    const boardId = task.board?._id || task.board;
    if (boardId) joinBoard(boardId);
    const cleanup = onCommentAdded((comment) => {
      if (comment.task === taskId || comment.task?._id === taskId) {
        setComments((prev) => [...prev, comment]);
      }
    });
    return () => {
      if (boardId) leaveBoard(boardId);
      cleanup?.();
    };
  }, [task?._id]);

  const loadTask = async () => {
    try {
      const { data: tRes } = await taskApi.getById(taskId);
      const fetched = tRes.data;
      setTask(fetched);
      setTitleDraft(fetched.title);
      setDescDraft(fetched.description || '');

      try {
        const { data: pRes } = await projectApi.getById(fetched.project);
        setProject(pRes.data);
        setProjectMembers(pRes.data.members || []);
      } catch {}

      const { data: cRes } = await taskApi.getComments(taskId);
      setComments(cRes.data || []);

      try {
        const { data: aRes } = await taskApi.getActivityLog(taskId);
        setActivityLog(aRes.data || []);
      } catch {}
    } catch { toast.error('Failed to load task'); navigate('/tasks'); }
    finally { setLoading(false); }
  };

  const updateTaskField = async (updates) => {
    const prev = { ...task };
    setTask((t) => t ? { ...t, ...updates } : t);
    try {
      const { data } = await taskApi.update(taskId, updates);
      setTask((t) => t ? { ...t, ...data.data } : t);
    } catch (err) {
      setTask(prev);
      toast.error(err?.response?.data?.message || 'Failed to update');
    }
  };

  const handleSaveTitle = async () => {
    if (!titleDraft.trim()) return;
    setEditingTitle(false);
    await updateTaskField({ title: titleDraft });
  };

  const handleSaveDesc = async () => {
    setEditingDesc(false);
    await updateTaskField({ description: descDraft });
  };

  const handleDelete = async () => {
    if (!confirm('Delete this task?')) return;
    try {
      await taskApi.delete(taskId);
      toast.success('Task deleted');
      navigate(-1);
    } catch (err) { toast.error(err?.response?.data?.message || 'Failed to delete'); }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    setSendingComment(true);
    try {
      const { data } = await taskApi.addComment(taskId, newComment);
      setComments((prev) => [...prev, data.data]);
      setNewComment('');
    } catch (err) { toast.error(err?.response?.data?.message || 'Failed to add comment'); }
    finally { setSendingComment(false); }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await taskApi.deleteComment ? taskApi.deleteComment(taskId, commentId) : toast.error('Comment deletion not implemented');
      setComments((prev) => prev.filter((c) => c._id !== commentId));
    } catch { toast.error('Failed to delete comment'); }
  };

  const handleToggleChecklist = async (index) => {
    const newChecklist = [...task.checklist];
    newChecklist[index] = { ...newChecklist[index], completed: !newChecklist[index].completed };
    try {
      const { data } = await taskApi.updateChecklist(taskId, newChecklist);
      setTask((t) => t ? { ...t, checklist: data.data.checklist || newChecklist } : t);
    } catch { toast.error('Failed to update checklist'); }
  };

  const handleAddChecklistItem = async () => {
    if (!newCheckItem.trim()) return;
    const newChecklist = [...(task.checklist || []), { text: newCheckItem, completed: false }];
    try {
      const { data } = await taskApi.updateChecklist(taskId, newChecklist);
      setTask((t) => t ? { ...t, checklist: data.data.checklist || newChecklist } : t);
      setNewCheckItem('');
    } catch { toast.error('Failed to add checklist item'); }
  };

  const handleRemoveChecklistItem = async (index) => {
    const newChecklist = task.checklist.filter((_, i) => i !== index);
    try {
      const { data } = await taskApi.updateChecklist(taskId, newChecklist);
      setTask((t) => t ? { ...t, checklist: data.data.checklist || newChecklist } : t);
    } catch { toast.error('Failed to remove item'); }
  };

  const handleAddSubtask = async () => {
    if (!newSubtaskTitle.trim()) return;
    const newSubtasks = [...(task.subtasks || []), { title: newSubtaskTitle, completed: false }];
    try {
      const { data } = await taskApi.updateSubtasks(taskId, newSubtasks);
      setTask((t) => t ? { ...t, subtasks: data.data.subtasks || newSubtasks } : t);
      setNewSubtaskTitle('');
    } catch { toast.error('Failed to add subtask'); }
  };

  const handleToggleSubtask = async (index) => {
    const newSubtasks = [...task.subtasks];
    newSubtasks[index] = { ...newSubtasks[index], completed: !newSubtasks[index].completed };
    try {
      const { data } = await taskApi.updateSubtasks(taskId, newSubtasks);
      setTask((t) => t ? { ...t, subtasks: data.data.subtasks || newSubtasks } : t);
    } catch { toast.error('Failed to update subtask'); }
  };

  const handleRemoveSubtask = async (index) => {
    const newSubtasks = task.subtasks.filter((_, i) => i !== index);
    try {
      const { data } = await taskApi.updateSubtasks(taskId, newSubtasks);
      setTask((t) => t ? { ...t, subtasks: data.data.subtasks || newSubtasks } : t);
    } catch { toast.error('Failed to remove subtask'); }
  };

  const handleAddLabel = async (color) => {
    if (!newLabelName.trim()) return;
    const newLabels = [...(task.labels || []), { name: newLabelName, color }];
    await updateTaskField({ labels: newLabels });
    setNewLabelName('');
    setShowLabelPicker(false);
  };

  const handleRemoveLabel = async (index) => {
    const newLabels = task.labels.filter((_, i) => i !== index);
    await updateTaskField({ labels: newLabels });
  };

  const handleToggleAssignee = async (userId) => {
    const current = task.assignees?.map((a) => a._id || a) || [];
    let newAssignees;
    if (current.includes(userId)) {
      newAssignees = current.filter((id) => id !== userId);
    } else {
      newAssignees = [...current, userId];
    }
    await updateTaskField({ assignees: newAssignees });
  };

  if (loading) {
    return <div className="flex items-center justify-center py-20"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent" /></div>;
  }

  if (!task) return null;

  const completedChecks = task.checklist?.filter((c) => c.completed).length || 0;
  const totalChecks = task.checklist?.length || 0;
  const completedSubtasks = task.subtasks?.filter((s) => s.completed).length || 0;
  const totalSubtasks = task.subtasks?.length || 0;
  const dueInfo = formatDueDate(task.dueDate);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto space-y-6 pb-12">
      <div className="flex items-center gap-2 text-sm text-dark-500">
        <Link to="/projects" className="hover:text-primary-500">Projects</Link>
        {project && (
          <>
            <span>/</span>
            <Link to={`/projects/${project._id}`} className="hover:text-primary-500">{project.name}</Link>
          </>
        )}
        <span>/</span>
        {task.board && (
          <>
            <Link to={`/projects/${task.project}/board?board=${task.board._id || task.board}`} className="hover:text-primary-500">Board</Link>
            <span>/</span>
          </>
        )}
        <span className="text-dark-700 dark:text-dark-200 truncate max-w-[200px]">{task.title}</span>
      </div>

      <div className="card">
        <div className="flex items-start justify-between mb-4 gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              <select value={task.priority} onChange={(e) => updateTaskField({ priority: e.target.value })}
                className={cn('badge cursor-pointer appearance-none text-center text-xs pr-6 relative', priorityStyles[task.priority] || priorityStyles.none)}
                style={{ backgroundImage: 'none' }}>
                {priorityOptions.map((p) => <option key={p} value={p}>{p === 'none' ? 'No priority' : p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
              </select>
              {task.labels?.map((label, i) => (
                <span key={i} className="badge text-xs flex items-center gap-1" style={{ backgroundColor: label.color + '20', color: label.color }}>
                  {label.name}
                  <button onClick={() => handleRemoveLabel(i)} className="hover:opacity-60"><HiOutlineX size={12} /></button>
                </span>
              ))}
              <div className="relative">
                <button onClick={() => setShowLabelPicker(!showLabelPicker)} className="badge text-xs bg-dark-100 dark:bg-dark-700 text-dark-500 hover:text-dark-700 dark:hover:text-dark-200 cursor-pointer">+ Label</button>
                {showLabelPicker && (
                  <div className="absolute top-8 left-0 z-50 card p-3 shadow-xl min-w-[180px]">
                    <input value={newLabelName} onChange={(e) => setNewLabelName(e.target.value)} className="input-field text-sm mb-2" placeholder="Label name..." />
                    <div className="flex flex-wrap gap-1 mb-2">
                      {labelColors.map((c) => (
                        <button key={c} onClick={() => newLabelName && handleAddLabel(c)}
                          className="h-5 w-5 rounded-full border-2 border-white dark:border-dark-700 hover:scale-110 transition-transform"
                          style={{ backgroundColor: c }} />
                      ))}
                    </div>
                    <button onClick={() => { setShowLabelPicker(false); setNewLabelName(''); }} className="text-xs text-dark-500">Cancel</button>
                  </div>
                )}
              </div>
            </div>

            {editingTitle ? (
              <div className="flex items-center gap-2 mb-1">
                <input value={titleDraft} onChange={(e) => setTitleDraft(e.target.value)}
                  className="input-field text-xl font-bold flex-1" autoFocus onKeyDown={(e) => e.key === 'Enter' && handleSaveTitle()} />
                <button onClick={handleSaveTitle} className="btn-primary p-1.5"><HiOutlineCheck size={16} /></button>
                <button onClick={() => { setEditingTitle(false); setTitleDraft(task.title); }} className="btn-ghost p-1.5"><HiOutlineX size={16} /></button>
              </div>
            ) : (
              <h1 className="text-xl font-bold text-dark-900 dark:text-dark-100 group cursor-pointer"
                onClick={() => setEditingTitle(true)}>
                {task.title}
                <HiOutlinePencil size={14} className="inline ml-2 opacity-0 group-hover:opacity-100 text-dark-400 transition-opacity" />
              </h1>
            )}
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button onClick={handleDelete} className="btn-ghost p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"><HiOutlineTrash size={18} /></button>
          </div>
        </div>

        <div className="flex flex-wrap gap-1 text-xs text-dark-400 mb-4">
          <span>Created {timeAgo(task.createdAt)}</span>
          {task.createdBy?.name && <span>by {task.createdBy.name}</span>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div>
            <p className="text-xs text-dark-500 mb-1.5 font-medium">Assignee</p>
            <div className="relative">
              <button onClick={() => setShowAssigneePicker(!showAssigneePicker)}
                className="flex items-center gap-2 text-sm text-dark-700 dark:text-dark-200 hover:text-primary-500">
                {task.assignees?.length > 0 ? (
                  <div className="flex -space-x-2">
                    {task.assignees.map((a, i) => (
                      <div key={a._id || i} className="h-7 w-7 rounded-full bg-primary-500 flex items-center justify-center text-[10px] font-semibold text-white border-2 border-white dark:border-dark-800" title={a.name}>
                        {getInitials(a.name)}
                      </div>
                    ))}
                  </div>
                ) : (
                  <span className="text-dark-400">Unassigned</span>
                )}
              </button>
              {showAssigneePicker && (
                <div className="absolute top-10 left-0 z-50 card p-2 shadow-xl min-w-[200px] max-h-[200px] overflow-y-auto">
                  {projectMembers.map((m) => {
                    const uid = m.user?._id || m._id;
                    const name = m.user?.name || m.name || 'Unknown';
                    const isSelected = task.assignees?.some((a) => (a._id || a) === uid);
                    return (
                      <button key={uid} onClick={() => handleToggleAssignee(uid)}
                        className={cn('flex items-center gap-2 w-full px-3 py-2 text-sm rounded-lg hover:bg-dark-100 dark:hover:bg-dark-700', isSelected && 'bg-primary-50 dark:bg-primary-900/20')}>
                        <div className="h-6 w-6 rounded-full bg-primary-500 flex items-center justify-center text-[10px] font-semibold text-white">{getInitials(name)}</div>
                        <span className={cn('flex-1 text-left', isSelected ? 'text-primary-600 font-medium' : 'text-dark-700 dark:text-dark-200')}>{name}</span>
                        {isSelected && <HiOutlineCheck size={14} className="text-primary-500" />}
                      </button>
                    );
                  })}
                  {projectMembers.length === 0 && <p className="text-xs text-dark-400 p-2">No members</p>}
                </div>
              )}
            </div>
          </div>

          <div>
            <p className="text-xs text-dark-500 mb-1.5 font-medium">Due Date</p>
            <input type="date" value={task.dueDate ? task.dueDate.split('T')[0] : ''}
              onChange={(e) => updateTaskField({ dueDate: e.target.value || null })}
              className={cn('text-sm bg-transparent border-0 p-0 cursor-pointer focus:ring-0', dueInfo?.isOverdue ? 'text-red-500' : 'text-dark-700 dark:text-dark-200')} />
          </div>

          <div>
            <p className="text-xs text-dark-500 mb-1.5 font-medium">Est. Time</p>
            <div className="flex items-center gap-1 text-sm text-dark-700 dark:text-dark-200">
              <HiOutlineClock size={14} className="text-dark-400" />
              <input type="number" value={task.estimatedTime || 0} min="0"
                onChange={(e) => updateTaskField({ estimatedTime: parseInt(e.target.value) || 0 })}
                className="w-16 bg-transparent border-0 p-0 text-sm focus:ring-0" />
              <span className="text-dark-400">hrs</span>
            </div>
          </div>

          <div>
            <p className="text-xs text-dark-500 mb-1.5 font-medium">Status</p>
            <span className="badge bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300">{task.column}</span>
          </div>
        </div>

        <div className="mb-6">
          <p className="text-xs text-dark-500 mb-1.5 font-medium">Description</p>
          {editingDesc ? (
            <div className="space-y-2">
              <textarea value={descDraft} onChange={(e) => setDescDraft(e.target.value)}
                className="input-field resize-none" rows={3} autoFocus />
              <div className="flex gap-2">
                <button onClick={handleSaveDesc} className="btn-primary text-xs px-3 py-1.5"><HiOutlineCheck size={14} /> Save</button>
                <button onClick={() => { setEditingDesc(false); setDescDraft(task.description || ''); }} className="btn-ghost text-xs px-3 py-1.5">Cancel</button>
              </div>
            </div>
          ) : (
            <div onClick={() => setEditingDesc(true)}
              className="text-sm text-dark-600 dark:text-dark-300 cursor-pointer hover:bg-dark-50 dark:hover:bg-dark-800/50 rounded-lg p-2 -mx-2 min-h-[2rem]">
              {task.description || <span className="text-dark-400 italic">Add a description...</span>}
            </div>
          )}
        </div>

        {totalSubtasks > 0 && (
          <div className="mb-6">
            <h3 className="font-semibold text-sm text-dark-900 dark:text-dark-100 mb-2">Subtasks ({completedSubtasks}/{totalSubtasks})</h3>
            <div className="h-1.5 bg-dark-100 dark:bg-dark-700 rounded-full mb-3 overflow-hidden">
              <div className="h-full bg-primary-500 rounded-full transition-all" style={{ width: `${totalSubtasks ? (completedSubtasks / totalSubtasks) * 100 : 0}%` }} />
            </div>
            <div className="space-y-1">
              {task.subtasks.map((sub, i) => (
                <div key={i} className="flex items-center gap-2 group">
                  <input type="checkbox" checked={sub.completed} onChange={() => handleToggleSubtask(i)}
                    className="rounded text-primary-500 focus:ring-primary-500 h-4 w-4" />
                  <span className={cn('text-sm flex-1', sub.completed ? 'line-through text-dark-400' : 'text-dark-700 dark:text-dark-200')}>{sub.title}</span>
                  <button onClick={() => handleRemoveSubtask(i)} className="opacity-0 group-hover:opacity-100 text-dark-400 hover:text-red-500 transition-all"><HiOutlineX size={14} /></button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mb-6">
          <h3 className="font-semibold text-sm text-dark-900 dark:text-dark-100 mb-2">
            Checklist {totalChecks > 0 && <span className="font-normal text-dark-400">({completedChecks}/{totalChecks})</span>}
          </h3>
          {totalChecks > 0 && (
            <div className="h-1.5 bg-dark-100 dark:bg-dark-700 rounded-full mb-3 overflow-hidden">
              <div className="h-full bg-primary-500 rounded-full transition-all" style={{ width: `${totalChecks ? (completedChecks / totalChecks) * 100 : 0}%` }} />
            </div>
          )}
          <div className="space-y-1 mb-2">
            {task.checklist?.map((item, i) => (
              <div key={i} className="flex items-center gap-2 group">
                <input type="checkbox" checked={item.completed} onChange={() => handleToggleChecklist(i)}
                  className="rounded text-primary-500 focus:ring-primary-500 h-4 w-4" />
                <span className={cn('text-sm flex-1', item.completed ? 'line-through text-dark-400' : 'text-dark-700 dark:text-dark-200')}>{item.text}</span>
                <button onClick={() => handleRemoveChecklistItem(i)} className="opacity-0 group-hover:opacity-100 text-dark-400 hover:text-red-500 transition-all"><HiOutlineX size={14} /></button>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <input value={newCheckItem} onChange={(e) => setNewCheckItem(e.target.value)}
              className="input-field text-sm flex-1" placeholder="Add checklist item..."
              onKeyDown={(e) => e.key === 'Enter' && handleAddChecklistItem()} />
            <button onClick={handleAddChecklistItem} disabled={!newCheckItem.trim()}
              className="btn-primary text-xs px-3 py-1.5"><HiOutlinePlus size={14} /></button>
          </div>
        </div>

        {task.attachments?.length > 0 && (
          <div className="mb-6">
            <h3 className="font-semibold text-sm text-dark-900 dark:text-dark-100 mb-2 flex items-center gap-1.5">
              <HiOutlinePaperClip size={16} /> Attachments ({task.attachments.length})
            </h3>
            <div className="flex flex-wrap gap-2">
              {task.attachments.map((att, i) => (
                <a key={i} href={att.url} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 bg-dark-50 dark:bg-dark-700 rounded-lg px-3 py-2 text-sm hover:bg-dark-100 dark:hover:bg-dark-600 transition-colors">
                  <HiOutlinePaperClip size={14} className="text-dark-400" />
                  <span className="text-dark-600 dark:text-dark-300">{att.filename}</span>
                  {att.size > 0 && <span className="text-[10px] text-dark-400">({formatFileSize(att.size)})</span>}
                </a>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="card">
        <h3 className="font-semibold text-dark-900 dark:text-dark-100 mb-4 flex items-center gap-2">
          <HiOutlineChat size={18} />
          Comments ({comments.length})
        </h3>

        <div className="space-y-4 mb-4">
          {comments.map((comment) => (
            <div key={comment._id} className="flex gap-3">
              <div className="h-8 w-8 rounded-full bg-primary-500 flex items-center justify-center text-xs font-semibold text-white flex-shrink-0">
                {getInitials(comment.author?.name)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-sm text-dark-900 dark:text-dark-100">{comment.author?.name || 'Unknown'}</span>
                  <span className="text-xs text-dark-400">{timeAgo(comment.createdAt)}</span>
                </div>
                <p className="text-sm text-dark-600 dark:text-dark-300 whitespace-pre-wrap">{comment.text}</p>
              </div>
            </div>
          ))}
          {comments.length === 0 && <p className="text-sm text-dark-400 text-center py-4">No comments yet</p>}
        </div>

        <div className="flex gap-3">
          <div className="h-8 w-8 rounded-full bg-primary-500 flex items-center justify-center text-xs font-semibold text-white flex-shrink-0">ME</div>
          <div className="flex-1">
            <textarea value={newComment} onChange={(e) => setNewComment(e.target.value)}
              placeholder="Write a comment..." rows={2} className="input-field resize-none"
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleAddComment())} />
            <div className="flex justify-end mt-2">
              <button onClick={handleAddComment} disabled={!newComment.trim() || sendingComment}
                className="btn-primary text-sm px-4 py-2">
                {sendingComment ? <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" /> : 'Send'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {activityLog.length > 0 && (
        <div className="card">
          <h3 className="font-semibold text-dark-900 dark:text-dark-100 mb-4">Activity</h3>
          <div className="space-y-3">
            {activityLog.map((log) => (
              <div key={log._id} className="flex items-start gap-3 text-sm">
                <div className="h-6 w-6 rounded-full bg-dark-100 dark:bg-dark-700 flex items-center justify-center text-[10px] font-semibold text-dark-500 flex-shrink-0 mt-0.5">
                  {getInitials(log.performedBy?.name)}
                </div>
                <div>
                  <p className="text-dark-600 dark:text-dark-300">{log.description}</p>
                  <p className="text-xs text-dark-400 mt-0.5">{timeAgo(log.createdAt)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-center justify-center gap-2 text-xs text-dark-400">
        <span>Task ID: {task._id}</span>
        <span>&middot;</span>
        <span>Updated {timeAgo(task.updatedAt)}</span>
      </div>
    </motion.div>
  );
};
