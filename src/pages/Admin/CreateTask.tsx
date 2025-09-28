import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTasks } from '../../hooks/useTask';
import { useAuth } from '../../hooks/useAuth';
import { userService } from '../../services/userService';
import { getErrorMessage } from '../../utils/errorHandler';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';

const baseInputStyle = 'w-full px-4 py-3 text-base outline-none focus:ring rounded border-gray-200 transition';

const PriorityOptions = {
  LOW: 'Low',
  MEDIUM: 'Medium',
  HIGH: 'High',
} as const;

type Priority = typeof PriorityOptions[keyof typeof PriorityOptions];

interface UserSummary {
  id: number;
  name: string;
}

const CreateTask: React.FC = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Priority>(PriorityOptions.MEDIUM);
  const [dueDate, setDueDate] = useState('');
  const [error, setError] = useState('');

  // Checklist handling
  const [todos, setTodos] = useState<string[]>([]);
  const [newTodoText, setNewTodoText] = useState('');

  // Team state for admin assignment
  const [team, setTeam] = useState<UserSummary[]>([]);
  const [assignedToId, setAssignedToId] = useState<number>();
  const [isFetchingTeam, setIsFetchingTeam] = useState(false);

  const { createTask, loading } = useTasks();
  const { user } = useAuth(); // must include user.role, user.id
  const isAdmin = user?.role === 'admin';
  const navigate = useNavigate();

  // Fetch team for admins on mount
  useEffect(() => {
    if (isAdmin) {
      setIsFetchingTeam(true);
      userService.getTeamMembers()
        .then((teamList: UserSummary[]) => {
          // Include the admin themselves as a possible assignee
          const withSelf = [
            { id: user.id, name: user.name + ' (Me)' },
            ...(teamList || [])
          ];
          setTeam(withSelf);
          setAssignedToId(user.id);
        })
        .catch(err => {
          setError('Failed to fetch team members');
        })
        .finally(() => setIsFetchingTeam(false));
    } else {
      setAssignedToId(user?.id);
    }
  }, [isAdmin, user]);

  // Checklist handlers
  const handleAddTodo = () => {
    if (newTodoText.trim()) {
      setTodos([...todos, newTodoText.trim()]);
      setNewTodoText('');
    }
  };

  const handleRemoveTodo = (removeIdx: number) => {
    setTodos(todos.filter((_, idx) => idx !== removeIdx));
  };

  // Form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!title || !description || !dueDate) {
      setError('Please fill in all required fields');
      return;
    }
    if (isAdmin && !assignedToId) {
      setError('Please choose an assignee');
      return;
    }

    try {
      await createTask({
        title,
        description,
        priority,
        dueDate,
        assignedToId, // included for admins (and users, but users will have their own id)
        todos,
      });
      navigate('/admin/tasks');
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Failed to create task'));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-10 flex justify-center">
      <form 
        onSubmit={handleSubmit} 
        className="w-full max-w-2xl p-8 space-y-8"
      >
        <header className="pb-4">
          <h1 className="text-3xl font-light text-gray-800 tracking-wide">Create New Task 📝</h1>
          <p className="text-sm text-gray-500 mt-1">A focused space for capturing task essentials.</p>
        </header>
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
            <p>{error}</p>
          </div>
        )}

        {/* Task title/description */}
        <section className="space-y-6">
          <div>
            <Input
              label="Title"
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Title"
              className={`text-xl font-medium ${baseInputStyle} border-b-2`}
              required
            />
          </div>

          <div>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Description"
              className={`resize-y ${baseInputStyle} rounded-lg border-2 border-dashed`}
              required
            />
          </div>
        </section>

        <hr className="border-gray-100" />

        {/* Settings: DueDate, Priority, Assignee */}
        <section className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {/* Due Date */}
            <div>
              <label htmlFor="dueDate" className="block text-xs text-left px-4 font-medium text-gray-400 mb-1">DUE DATE</label>
              <input
                id="dueDate"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className={`block ${baseInputStyle}`}
                required
              />
            </div>
            {/* Priority */}
            <div>
              <label className="block text-xs font-medium text-left px-4 pb-4 text-gray-400 mb-1">PRIORITY</label>
              <div className="flex space-x-2">
                {Object.entries(PriorityOptions).map(([key, value]) => {
                  const isActive = priority === value;
                  const colorMap = {
                    [PriorityOptions.LOW]: 'text-green-600 bg-green-50 hover:bg-green-100',
                    [PriorityOptions.MEDIUM]: 'text-yellow-600 bg-yellow-50 hover:bg-yellow-100',
                    [PriorityOptions.HIGH]: 'text-red-600 bg-red-50 hover:bg-red-100',
                  };
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setPriority(value)}
                      className={`px-3 py-1.5 text-xs font-medium rounded-full transition duration-200 
                        ${colorMap[value]} 
                        ${isActive ? 'ring-2 ring-blue-500 ring-offset-2' : 'opacity-70'}`
                      }
                    >
                      {value}
                    </button>
                  );
                })}
              </div>
            </div>
            {/* Assignment dropdown for Admins */}
            {isAdmin && (
              <div>
                <label htmlFor="assignedToId" className="block text-xs text-left px-4 font-medium text-gray-400 mb-1">ASSIGN TO</label>
                <select
                  id="assignedToId"
                  value={assignedToId}
                  onChange={e => setAssignedToId(Number(e.target.value))}
                  className={`block ${baseInputStyle} appearance-none`}
                  disabled={isFetchingTeam}
                >
                  {team.map(user => (
                    <option key={user.id} value={user.id}>{user.name}</option>
                  ))}
                </select>
              </div>
            )}
          </div>
          {/* Checklist Builder */}
          <div>
            <label className="block text-xs text-left px-4 font-medium text-gray-400 mb-2">TODO</label>
            <div className="space-y-2 mb-3 max-h-40 overflow-y-auto pr-2">
              {todos.map((todo, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-gray-50 border-l-4 border-gray-300 rounded-r-md">
                  <span className="text-sm text-gray-700">{todo}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveTodo(index)}
                    className="text-gray-400 hover:text-red-600 transition text-lg leading-none"
                    aria-label="Remove sub-task"
                  >
                    &times;
                  </button>
                </div>
              ))}
            </div>
            <div className="flex space-x-2">
              <input
                type="text"
                value={newTodoText}
                onChange={e => setNewTodoText(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTodo();
                  }
                }}
                placeholder="Add a new checklist item..."
                className="flex-grow p-3 border border-gray-200 rounded-lg focus:ring-1 focus:ring-blue-500 outline-none"
              />
              <button
                type="button"
                onClick={handleAddTodo}
                className="px-4 py-2.5 bg-gray-700 text-white font-medium rounded-lg hover:bg-gray-800 transition duration-150 shadow-md"
                disabled={!newTodoText.trim()}
              >
                Add
              </button>
            </div>
          </div>
        </section>
        <hr className="border-gray-100" />
        {/* Form actions */}
        <footer className="flex justify-end space-x-4 pt-4">
          <button
            type="button"
            onClick={() => navigate('/admin/tasks')}
            className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition duration-150"
          >
            Cancel
          </button>
          <Button
            type="submit"
            loading={loading}
            className="px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition duration-150 shadow-lg disabled:bg-blue-300"
            disabled={loading}
          >
            {loading ? 'Creating...' : 'Create Task'}
          </Button>
        </footer>
      </form>
    </div>
  );
};

export default CreateTask;
