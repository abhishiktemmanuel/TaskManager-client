import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTasks } from '../../hooks/useTask';
import type { Task, Todo } from '../../types/index';

const ViewTaskDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { updateTask, updateTaskChecklist } = useTasks();

  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [progress, setProgress] = useState(0);
  const [todos, setTodos] = useState<Todo[]>([]);
  const [savingProgress, setSavingProgress] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!id) return;

    let mounted = true;
    setLoading(true);
    setError('');

    import('../../services/taskService').then(({ taskService }) => {
      taskService.getTaskById(+id)
        .then(task => {
          if (mounted) {
            setTask(task);
            setProgress(task.progress);
            setTodos(task.todos);
          }
        })
        .catch(() => mounted && setError('Failed to load task details'))
        .finally(() => mounted && setLoading(false));
    });

    return () => {
      mounted = false;
    };
  }, [id]);

  if (loading)
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-50">
        <span className="text-neutral-400 text-lg">Loading…</span>
      </div>
    );

  if (error)
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-50">
        <span className="text-red-500">{error}</span>
      </div>
    );

  if (!task)
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-50">
        <span className="text-red-500">Task not found.</span>
      </div>
    );

  // Update the handleProgressSave function
const handleProgressSave = async () => {
  if (!task) return;

  const newStatus: Task['status'] =
    progress === 100 ? 'Completed' : progress > 0 ? 'In Progress' : 'Pending';

  // Only send fields that backend UpdateTaskDto accepts
  const updatePayload: any = {};
  
  if (progress !== task.progress) {
    updatePayload.progress = progress;
  }
  
  if (newStatus !== task.status) {
    updatePayload.status = newStatus;
  }

  // If nothing changed, don't make the request
  if (Object.keys(updatePayload).length === 0) {
    return;
  }

  console.log('Updating task with payload:', updatePayload);

  setSavingProgress(true);
  setError('');
  try {
    const updated = await updateTask(task.id, updatePayload);
    setTask(updated);
    setProgress(updated.progress || 0);
  } catch (err: any) {
    console.error('Update task failed:', err.response?.data || err);
    setError('Failed to update progress');
  } finally {
    setSavingProgress(false);
  }
};

// Update the handleTodoToggle function
const handleTodoToggle = async (index: number) => {
  if (!task) return;

  const updatedTodos = todos.map((todo, idx) =>
    idx === index ? { ...todo, completed: !todo.completed } : todo
  );

  setTodos(updatedTodos); // Optimistic update

  const total = updatedTodos.length;
  const completedCount = updatedTodos.filter(todo => todo.completed).length;
  const newProgress = total > 0 ? Math.round((completedCount / total) * 100) : 0;

  setError('');
  try {
    // Update checklist - backend expects array of {id?, text, completed}
    const checklistPayload = updatedTodos.map(todo => ({
      id: todo.id,
      text: todo.text,
      completed: todo.completed
    }));

    console.log('Updating checklist with payload:', checklistPayload);
    
    const updatedTaskWithTodos = await updateTaskChecklist(task.id, checklistPayload);
    
    // Update local state
    setTask({ ...task, ...updatedTaskWithTodos });
    setTodos(updatedTaskWithTodos.todos || updatedTodos);
    setProgress(updatedTaskWithTodos.progress || newProgress);
    
  } catch (err: any) {
    console.error('Failed to update todo:', err.response?.data || err);
    setError('Failed to update checklist');
    // Revert optimistic update
    setTodos(task.todos || []);
  }
};

  return (
    <main className="flex items-center justify-center min-h-screen bg-neutral-50 px-4">
      <article className="w-full max-w-xl bg-white rounded-xl shadow-lg px-7 py-8 flex flex-col gap-7">
        <header className="mb-4 flex flex-col gap-2">
          <button
            onClick={() => navigate(-1)}
            className="w-min px-3 py-1 text-xs text-neutral-400 rounded hover:text-blue-600 focus:text-blue-700 transition"
            aria-label="Go back"
          >
            ← Back
          </button>
          <h1 className="text-2xl font-semibold text-neutral-900">{task.title}</h1>
          <p className="text-neutral-500 text-base">{task.description}</p>
        </header>

        <section className="flex gap-4 flex-wrap border-b pb-5">
          <span className="px-2 text-sm text-neutral-500">
            <span className="font-medium text-neutral-700">Due</span>: {task.dueDate}
          </span>
          <span className="px-2 text-sm text-neutral-500">
            <span className="font-medium text-neutral-700">Priority</span>: {task.priority}
          </span>
          <span
            className={
              "px-2 py-1 rounded text-xs h-min ml-2 " +
              (task.status === 'Completed'
                ? 'bg-green-50 text-green-600'
                : task.status === 'In Progress'
                ? 'bg-yellow-50 text-yellow-600'
                : 'bg-neutral-100 text-neutral-400')
            }
          >
            {task.status}
          </span>
        </section>

        <section>
          <div className="flex justify-between items-center mb-2">
            <label className="text-xs font-medium text-neutral-400">
              Progress
              <span className="ml-2 text-neutral-800 font-bold">{progress}%</span>
            </label>
          </div>
          <div className="flex gap-2 items-center">
            <input
              type="range"
              min={0}
              max={100}
              step={1}
              value={progress}
              onChange={e => setProgress(Number(e.target.value))}
              className="w-full accent-blue-600"
            />
            <button
              onClick={handleProgressSave}
              disabled={savingProgress}
              className={`ml-2 px-4 py-2 rounded-lg text-sm font-semibold transition
                ${savingProgress ? 'bg-blue-300 cursor-wait' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}
            >
              {savingProgress ? 'Saving...' : 'Save'}
            </button>
          </div>
        </section>

        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-medium text-neutral-700 text-lg">Checklist</h2>
            {todos.length === 0 && <span className="text-xs text-neutral-400">No items</span>}
          </div>
          <ul className="space-y-2">
            {todos.map((todo, i) => (
              <li
                key={todo.id}
                className={
                  "flex items-center gap-3 rounded-lg px-3 py-2 " +
                  (todo.completed ? "bg-neutral-100" : "hover:bg-neutral-50 transition")
                }
              >
                <input
                  type="checkbox"
                  checked={todo.completed}
                  onChange={() => handleTodoToggle(i)}
                  className="h-5 w-5 accent-blue-600 rounded-md focus:ring"
                />
                <span
                  className={todo.completed ? "line-through text-neutral-400" : "text-neutral-800"}
                >
                  {todo.text}
                </span>
              </li>
            ))}
          </ul>
        </section>

        {error && (
          <footer className="mt-4 text-xs text-red-500 text-center">{error}</footer>
        )}
      </article>
    </main>
  );
};

export default ViewTaskDetails;
