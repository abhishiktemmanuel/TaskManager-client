import React from 'react';
import { Link } from 'react-router-dom';
import { useDashboard } from '../../hooks/useTask';
import { useAuth } from '../../hooks/useAuth';

// Define proper TypeScript interfaces for the component props
interface StatCardProps {
  title: string;
  value: number;
  color: string;
  icon: string;
}

interface TaskCardProps {
  title: string;
  status: string;
  priority: string;
  dueDate: string;
  progress: number;
}

interface Task {
  id: number;
  title: string;
  status: string;
  priority: string;
  dueDate: string;
  progress: number;
}

const UserDashboard: React.FC = () => {
  const { stats, loading } = useDashboard();
  const { user } = useAuth();

  const StatCard: React.FC<StatCardProps> = ({ title, value, color, icon }) => (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
        </div>
        <div className={`w-12 h-12 ${color} rounded-xl flex items-center justify-center`}>
          <span className="text-2xl">{icon}</span>
        </div>
      </div>
    </div>
  );

  const TaskCard: React.FC<TaskCardProps> = ({ title, status, priority, dueDate, progress }) => (
    <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-sm transition-shadow">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-gray-900">{title}</h3>
        <div className="flex space-x-2">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            priority === 'High' ? 'bg-red-100 text-red-800' :
            priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
            'bg-green-100 text-green-800'
          }`}>
            {priority}
          </span>
        </div>
      </div>
      <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
        <span>Due: {new Date(dueDate).toLocaleDateString()}</span>
        <span>{progress}% complete</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className="bg-blue-600 h-2 rounded-full transition-all"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-32 bg-gray-200 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Mock recent tasks - replace with actual data
  const recentTasks: Task[] = [
    { id: 1, title: 'Complete project documentation', status: 'In Progress', priority: 'High', dueDate: '2024-12-31', progress: 60 },
    { id: 2, title: 'Fix login page bug', status: 'Pending', priority: 'Medium', dueDate: '2024-11-15', progress: 0 },
    { id: 3, title: 'Design user dashboard', status: 'Completed', priority: 'Low', dueDate: '2024-10-30', progress: 100 },
  ];

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Welcome, {user?.name}!</h1>
        <p className="text-gray-600 mt-2">Here's an overview of your tasks and progress.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Tasks"
          value={stats?.totalTasks || 0}
          color="bg-blue-100 text-blue-600"
          icon="📋"
        />
        <StatCard
          title="Pending Tasks"
          value={stats?.pendingTasks || 0}
          color="bg-yellow-100 text-yellow-600"
          icon="⏳"
        />
        <StatCard
          title="In Progress"
          value={stats?.inProgressTasks || 0}
          color="bg-purple-100 text-purple-600"
          icon="🚀"
        />
        <StatCard
          title="Completed"
          value={stats?.completedTasks || 0}
          color="bg-green-100 text-green-600"
          icon="✅"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Tasks */}
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="p-6 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-900">Recent Tasks</h2>
            <Link to="/user/tasks" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
              View all
            </Link>
          </div>
          <div className="p-6 space-y-4">
            {recentTasks.map((task) => (
              <TaskCard 
                key={task.id} 
                title={task.title}
                status={task.status}
                priority={task.priority}
                dueDate={task.dueDate}
                progress={task.progress}
              />
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <Link
                to="/user/create-task"
                className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors group"
              >
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                  <span className="text-blue-600 text-lg">➕</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Create Task</h3>
                  <p className="text-sm text-gray-600">Add a new personal task</p>
                </div>
              </Link>
              
              <Link
                to="/user/tasks"
                className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors group"
              >
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                  <span className="text-green-600 text-lg">✅</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">View All Tasks</h3>
                  <p className="text-sm text-gray-600">See your complete task list</p>
                </div>
              </Link>
            </div>
          </div>

          {/* Progress Overview */}
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white">
            <h2 className="text-xl font-bold mb-2">Your Progress</h2>
            <p className="text-blue-100 mb-4">
              You've completed {stats?.completedTasks || 0} out of {stats?.totalTasks || 0} tasks
            </p>
            <div className="w-full bg-blue-400 rounded-full h-2">
              <div
                className="bg-white h-2 rounded-full transition-all"
                style={{ 
                  width: stats?.totalTasks ? `${(stats.completedTasks / stats.totalTasks) * 100}%` : '0%' 
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;