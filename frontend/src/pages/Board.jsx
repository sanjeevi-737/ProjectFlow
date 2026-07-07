import { useState, useEffect, useCallback } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import toast from 'react-hot-toast';
import { boardApi } from '../services/boardApi';
import { taskApi } from '../services/taskApi';
import { useSocket } from '../hooks/useSocket';
import { HiOutlinePlus, HiOutlineCalendar, HiOutlineChat, HiOutlinePaperClip } from 'react-icons/hi';
import { cn } from '../utils/cn';
import { getInitials } from '../utils/formatters';

const priorityColors = {
  none: 'bg-dark-100 dark:bg-dark-700 text-dark-500',
  low: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
  medium: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300',
  high: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300',
  urgent: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300',
};

const columnColors = {
  'To Do': '#6b7280',
  'In Progress': '#3b82f6',
  Review: '#f59e0b',
  Completed: '#10b981',
};

export const Board = () => {
  const { projectId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const boardId = searchParams.get('board');

  const [board, setBoard] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [boards, setBoards] = useState([]);
  const [showNewTask, setShowNewTask] = useState(null);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [creating, setCreating] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const { joinBoard, leaveBoard, onTaskUpdated, onTaskMoved } = useSocket();

  useEffect(() => { loadData(); }, [projectId, boardId]);

  useEffect(() => {
    if (!board) return;
    joinBoard(board._id);
    const cleanUpdate = onTaskUpdated((updatedTask) => {
      setTasks((prev) => prev.map((t) => t._id === updatedTask._id ? { ...t, ...updatedTask } : t));
    });
    const cleanMove = onTaskMoved(({ task: movedTask }) => {
      setTasks((prev) => prev.map((t) => t._id === movedTask._id ? { ...t, ...movedTask } : t));
    });
    return () => {
      leaveBoard(board._id);
      cleanUpdate?.();
      cleanMove?.();
    };
  }, [board?._id]);

  const loadData = async () => {
    try {
      const { data: brdData } = await boardApi.getByProject(projectId);
      const fetchedBoards = brdData.data || [];
      setBoards(fetchedBoards);

      const activeBoardId = boardId || fetchedBoards[0]?._id;
      if (activeBoardId) {
        const { data: boardRes } = await boardApi.getById(activeBoardId);
        setBoard(boardRes.data);
        const { data: taskRes } = await taskApi.getByBoard(activeBoardId);
        setTasks(taskRes.data || []);
        if (!boardId) setSearchParams({ board: activeBoardId });
      }
    } catch { toast.error('Failed to load board'); }
    finally { setLoading(false); }
  };

  const handleCreateTask = async (columnName) => {
    if (!newTaskTitle.trim() || !board) return;
    setCreating(true);
    try {
      const { data } = await taskApi.create({
        title: newTaskTitle,
        project: projectId,
        board: board._id,
        column: columnName,
      });
      setTasks((prev) => [...prev, data.data]);
      setNewTaskTitle('');
      setShowNewTask(null);
      toast.success('Task created');
    } catch (err) { toast.error(err?.response?.data?.message || 'Failed to create task'); }
    finally { setCreating(false); }
  };

  const onDragStart = useCallback(() => setIsDragging(true), []);
  const onDragEnd = useCallback(async (result) => {
    setIsDragging(false);
    const { source, destination, draggableId } = result;
    if (!destination) return;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    const srcCol = source.droppableId;
    const dstCol = destination.droppableId;
    const task = tasks.find((t) => t._id === draggableId);
    if (!task) return;

    const srcTasks = tasks.filter((t) => t.column === srcCol && !t.isDeleted);
    const dstTasks = tasks.filter((t) => t.column === dstCol && !t.isDeleted);

    if (srcCol === dstCol) {
      const reordered = Array.from(srcTasks);
      const [moved] = reordered.splice(source.index, 1);
      reordered.splice(destination.index, 0, moved);
      const otherTasks = tasks.filter((t) => t.column !== srcCol || t.isDeleted);
      setTasks([...otherTasks, ...reordered]);
    } else {
      const newSrc = Array.from(srcTasks);
      newSrc.splice(source.index, 1);
      const newDst = Array.from(dstTasks);
      const moved = { ...task, column: dstCol };
      newDst.splice(destination.index, 0, moved);
      const otherTasks = tasks.filter((t) => (t.column !== srcCol && t.column !== dstCol) || t.isDeleted);
      setTasks([...otherTasks, ...newSrc, ...newDst]);
    }

    try {
      await taskApi.move(draggableId, { column: dstCol, boardId: board._id });
    } catch {
      loadData();
      toast.error('Failed to save drag');
    }
  }, [tasks, board]);

  const switchBoard = (newBoardId) => {
    setSearchParams({ board: newBoardId });
    setLoading(true);
    setTasks([]);
    setBoard(null);
    boardApi.getById(newBoardId).then(({ data }) => setBoard(data.data));
    taskApi.getByBoard(newBoardId).then(({ data }) => setTasks(data.data || [])).finally(() => setLoading(false));
  };

  if (loading) {
    return <div className="flex items-center justify-center py-20"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent" /></div>;
  }

  if (!board) {
    return <div className="text-center py-20 text-dark-500">No boards yet. <Link to={`/projects/${projectId}`} className="text-primary-500">Create one</Link></div>;
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-2 text-sm text-dark-500 mb-1">
            <Link to="/projects" className="hover:text-primary-500">Projects</Link>
            <span>/</span>
            <Link to={`/projects/${projectId}`} className="hover:text-primary-500">{board.project?.name || 'Project'}</Link>
          </div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-dark-900 dark:text-dark-100">{board.name}</h1>
            <div className="flex gap-1">
              {boards.map((b) => (
                <button key={b._id} onClick={() => switchBoard(b._id)}
                  className={cn('px-2.5 py-1 text-xs rounded-lg transition-all', b._id === board._id ? 'bg-primary-500 text-white' : 'bg-dark-100 dark:bg-dark-700 text-dark-500 hover:bg-dark-200 dark:hover:bg-dark-600')}>
                  {b.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
        <DragDropContext onDragStart={onDragStart} onDragEnd={onDragEnd}>
          {board.columns?.sort((a, b) => a.order - b.order).map((column) => {
            const colName = column.name;
            const columnTasks = tasks
              .filter((t) => t.column === colName && !t.isDeleted)
              .sort((a, b) => (a.columnOrder || 0) - (b.columnOrder || 0));

            return (
              <div key={column._id || colName} className="flex-shrink-0 w-72 md:w-80 flex flex-col">
                <div className="flex items-center justify-between mb-3 px-1">
                  <div className="flex items-center gap-2">
                    <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: column.color || columnColors[colName] || '#6b7280' }} />
                    <h3 className="font-semibold text-dark-700 dark:text-dark-200">{colName}</h3>
                    <span className="text-xs text-dark-400 bg-dark-100 dark:bg-dark-700 px-1.5 py-0.5 rounded-full">{columnTasks.length}</span>
                  </div>
                </div>

                <Droppable droppableId={colName} key={colName}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={cn(
                        'flex-1 space-y-3 overflow-y-auto scrollbar-hide min-h-[120px] rounded-xl p-2 -mx-2 transition-colors',
                        snapshot.isDraggingOver && 'bg-primary-50/50 dark:bg-primary-900/10'
                      )}
                    >
                      {columnTasks.map((task, index) => (
                        <Draggable key={task._id} draggableId={task._id} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={cn(
                                'card p-3 transition-all',
                                snapshot.isDragging
                                  ? 'shadow-xl rotate-2 scale-105 ring-2 ring-primary-500'
                                  : 'hover:shadow-md'
                              )}
                              style={{ ...provided.draggableProps.style }}
                            >
                              <div className="flex items-start justify-between mb-2 gap-2">
                                <div className="flex gap-1 flex-wrap">
                                  {task.priority && task.priority !== 'none' && (
                                    <span className={cn('badge text-[10px] px-1.5 py-0.5', priorityColors[task.priority] || priorityColors.none)}>
                                      {task.priority}
                                    </span>
                                  )}
                                  {task.labels?.slice(0, 2).map((l, i) => (
                                    <span key={i} className="badge text-[10px] px-1.5 py-0.5" style={{ backgroundColor: l.color + '20', color: l.color }}>
                                      {l.name}
                                    </span>
                                  ))}
                                </div>
                              </div>
                              <Link to={`/tasks/${task._id}`} className="text-sm font-medium text-dark-900 dark:text-dark-100 hover:text-primary-500 mb-3 block">
                                {task.title}
                              </Link>
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 text-xs text-dark-400">
                                  {task.dueDate && (
                                    <span className={cn('flex items-center gap-0.5', new Date(task.dueDate) < new Date() ? 'text-red-500' : '')}>
                                      <HiOutlineCalendar size={12} />{new Date(task.dueDate).toLocaleDateString()}
                                    </span>
                                  )}
                                  {task.checklist?.length > 0 && (
                                    <span>{task.checklist.filter((c) => c.completed).length}/{task.checklist.length}</span>
                                  )}
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <div className="flex -space-x-2">
                                    {task.assignees?.slice(0, 3).map((a, i) => (
                                      <div key={a._id || i} className="h-6 w-6 rounded-full bg-primary-500 flex items-center justify-center text-[10px] font-semibold text-white border-2 border-white dark:border-dark-800" title={a.name}>
                                        {getInitials(a.name)}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}

                      {showNewTask === colName ? (
                        <div className="card p-2 space-y-2">
                          <input value={newTaskTitle} onChange={(e) => setNewTaskTitle(e.target.value)}
                            className="input-field text-sm" placeholder="Task title..." autoFocus
                            onKeyDown={(e) => e.key === 'Enter' && handleCreateTask(colName)} />
                          <div className="flex gap-2">
                            <button onClick={() => handleCreateTask(colName)} disabled={creating || !newTaskTitle.trim()}
                              className="btn-primary text-xs px-3 py-1.5">{creating ? '...' : 'Add'}</button>
                            <button onClick={() => { setShowNewTask(null); setNewTaskTitle(''); }}
                              className="btn-ghost text-xs px-3 py-1.5">Cancel</button>
                          </div>
                        </div>
                      ) : (
                        <button onClick={() => setShowNewTask(colName)}
                          className={cn(
                            'w-full rounded-lg border-2 border-dashed border-dark-200 dark:border-dark-700 p-3 text-sm text-dark-400 transition-all flex items-center justify-center gap-1.5',
                            snapshot.isDraggingOver ? 'border-primary-400 text-primary-500' : 'hover:border-primary-400 hover:text-primary-500'
                          )}>
                          <HiOutlinePlus size={16} /> Add Task
                        </button>
                      )}
                    </div>
                  )}
                </Droppable>
              </div>
            );
          })}
        </DragDropContext>
      </div>
    </div>
  );
};
