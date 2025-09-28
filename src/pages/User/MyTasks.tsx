import React, { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { userService } from '../../services/userService';
import { useNavigate } from 'react-router-dom';

interface Todo {
  id: number;
  text: string;
  completed: boolean;
}

interface Task {
  id: number;
  title: string;
  description: string;
  priority: 'Low' | 'Medium' | 'High';
  status: string;
  dueDate: string;
  progress: number;
  todos: Todo[];
  createdAt: string;
}

const MyTasks: React.FC = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    userService.getUserById(user.id)
      .then(userData => {
        setTasks(userData.assignedTasks || []);
      })
      .catch(() => setError('Failed to load tasks.'))
      .finally(() => setLoading(false));
  }, [user, navigate]);

  const handleTaskClick = (taskId: number) => {
    navigate(`/user/task/${taskId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-10 flex flex-col items-center">
      <header className="max-w-2xl w-full pb-6">
        <h1 className="text-2xl font-semibold text-gray-700 mb-2">My Tasks 📋</h1>
        <p className="text-gray-500">Review, update, and track progress on your tasks here.</p>
      </header>

      {loading && <div className="text-gray-400 mt-6">Loading tasks...</div>}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded p-3 mt-6">{error}</div>
      )}
      {!loading && !error && tasks.length === 0 && (
        <div className="text-gray-600 mt-8">No tasks assigned yet.</div>
      )}

      {!loading && !error && tasks.length > 0 && (
        <div className="w-full max-w-2xl space-y-4">
          {tasks.map(task => (
            console.log("Rendering task", task),
            <div
              key={task.id}
              onClick={() => handleTaskClick(task.id)}
              className="bg-white border rounded-lg p-5 shadow-sm cursor-pointer hover:ring transition"
              role="button"
              tabIndex={0}
              onKeyDown={e => { if (e.key === 'Enter') handleTaskClick(task.id); }}
            >
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-medium text-gray-800">{task.title}</h2>
                <span
                  className={`px-2 py-1 text-xs rounded ${
                    task.status === 'Completed'
                      ? 'bg-green-100 text-green-700'
                      : task.status === 'In Progress'
                      ? 'bg-yellow-100 text-yellow-600'
                      : 'bg-gray-100 text-gray-500'
                  }`}
                >
                  {task.status}
                </span>
              </div>
              <p className="text-gray-600 mt-2 mb-1">{task.description}</p>
              <div className="text-xs text-gray-400 mb-2">Due: {task.dueDate}</div>
              <div className="flex gap-6 mb-2">
                <span
                  className={`text-xs rounded-full px-3 py-1 ${
                    {
                      Low: 'bg-green-50 text-green-700',
                      Medium: 'bg-yellow-50 text-yellow-700',
                      High: 'bg-red-50 text-red-700',
                    }[task.priority]
                  }`}
                >
                  Priority: {task.priority}
                </span>
                <span className="text-xs bg-blue-50 text-blue-700 rounded-full px-3 py-1">
                  Progress: {task.progress}%
                </span>
              </div>
              {task.todos?.length > 0 && (
                <div className="mt-3 border-t pt-3">
                  <div className="font-semibold text-gray-800 mb-2">Checklist:</div>
                  <ul className="space-y-1">
                    {task.todos.map(todo => (
                      <li key={todo.id} className="flex items-center gap-2">
                        <input type="checkbox" checked={todo.completed} readOnly />
                        <span className={todo.completed ? 'line-through text-gray-400' : ''}>
                          {todo.text}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyTasks;
