import React from 'react';
import { Link } from 'react-router-dom';
import { formatDate, getPriorityColor, getStatusColor } from '../../utils/helper';

// Mock data - replace with actual API calls
const mockTasks = [
  {
    id: 1,
    title: 'Complete project documentation',
    description: 'Write comprehensive documentation for the new feature',
    priority: 'High',
    status: 'In Progress',
    dueDate: '2024-12-31',
    progress: 60,
  },
  {
    id: 2,
    title: 'Fix login page bug',
    description: 'Resolve the issue with login page validation',
    priority: 'Medium',
    status: 'Pending',
    dueDate: '2024-11-15',
    progress: 0,
  },
  {
    id: 3,
    title: 'Design user dashboard',
    description: 'Create mockups for the new user dashboard',
    priority: 'Low',
    status: 'Completed',
    dueDate: '2024-10-30',
    progress: 100,
  },
];

const MyTasks: React.FC = () => {
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Tasks</h1>
          <p className="text-gray-600">Manage your assigned tasks</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Task List</h2>
        </div>
        
        <div className="divide-y divide-gray-200">
          {mockTasks.map((task) => (
            <div key={task.id} className="p-6 hover:bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-medium text-gray-900">
                      <Link 
                        to={`/user/tasks-details/${task.id}`}
                        className="hover:text-blue-600"
                      >
                        {task.title}
                      </Link>
                    </h3>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                      {task.priority}
                    </span>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                      {task.status}
                    </span>
                  </div>
                  
                  <p className="text-gray-600 mb-3">{task.description}</p>
                  
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>Due: {formatDate(task.dueDate)}</span>
                    <span>Progress: {task.progress}%</span>
                  </div>
                  
                  {/* Progress bar */}
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${task.progress}%` }}
                    />
                  </div>
                </div>
                
                <div className="ml-4">
                  <Link
                    to={`/user/tasks-details/${task.id}`}
                    className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MyTasks;