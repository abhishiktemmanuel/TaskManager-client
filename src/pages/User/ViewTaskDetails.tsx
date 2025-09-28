import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTasks } from '../../hooks/useTask';
import type { Task } from '../../types/index';
import type { Todo } from '../../types/index';

const ViewTaskDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { updateTask, updateTaskChecklist } = useTasks();
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [progress, setProgress] = useState(0);
  const [todos, setTodos] = useState<Todo[]>([]);

  const navigate = useNavigate();

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    // Fetch single task via taskService directly or extend hook as needed
    import('../../services/taskService').then(({ taskService }) => {
      console.log("Rendering ViewTaskDetails", id, task);

      taskService.getTaskById(+id)
        .then(task => {
          setTask(task);
          setProgress(task.progress);
          setTodos(task.todos);
        })
        .catch(() => setError('Failed to load task details'))
        .finally(() => setLoading(false));
    });
  }, [id]);

  if (loading) return <div className="p-8 text-gray-400">Loading...</div>;
  if (error) return <div className="p-8 text-red-600">{error}</div>;
  if (!task) return <div className="p-8 text-red-600">Task not found.</div>;

  const handleProgressSave = async () => {
    try {
      const updated = await updateTask(task.id, { progress });
      setTask(updated);
    } catch {
      setError('Failed to update progress');
    }
  };

  const handleTodoToggle = async (index: number) => {
    const updatedTodos = todos.map((todo, idx) =>
      idx === index ? { ...todo, completed: !todo.completed } : todo
    );
    try {
      const updated = await updateTaskChecklist(task.id, updatedTodos);
      setTask(updated);
      setTodos(updated.todos);
      setProgress(updated.progress);
    } catch {
      setError('Failed to update todo');
    }
  };

  return (
    <div className="min-h-screen p-8 max-w-3xl mx-auto bg-gray-50">
      <button onClick={() => navigate(-1)} className="mb-4 text-blue-600 hover:underline">Back</button>
      <h1 className="text-3xl font-semibold">{task.title}</h1>
      <p className="my-4">{task.description}</p>
      <div className="mb-4">
        <label className="block mb-1 font-medium">Progress: {progress}%</label>
        <input
          type="range"
          min={0}
          max={100}
          value={progress}
          onChange={e => setProgress(+e.target.value)}
          className="w-full"
        />
        <button onClick={handleProgressSave} className="mt-2 px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700">
          Save Progress
        </button>
      </div>
      <div>
        <h2 className="font-semibold mb-2">Checklist</h2>
        <ul>
          {todos.length === 0 && <li>No checklist items.</li>}
          {todos.map((todo, i) => (
            <li key={todo.id} className="flex items-center gap-2 my-1">
              <input
                type="checkbox"
                checked={todo.completed}
                onChange={() => handleTodoToggle(i)}
              />
              <span className={todo.completed ? 'line-through text-gray-400' : ''}>{todo.text}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default ViewTaskDetails;
