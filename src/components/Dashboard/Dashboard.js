import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LogOut, User } from 'lucide-react';
import interviewAPI from '../../services/interviewAPI';

function Dashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const [interviews, setInterviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const userName = useState(() => {
    const stored = localStorage.getItem('userName');
    return stored || 'User';
  })[0];

  const userEmail = useState(() => {
    const stored = localStorage.getItem('userEmail');
    return stored || '';
  })[0];

  useEffect(() => {
    fetchInterviews();
  }, []);

  useEffect(() => {
    if (location.pathname === '/dashboard') {
      setTimeout(() => {
        fetchInterviews();
      }, 500);
    }
  }, [location]);

  const fetchInterviews = async () => {
    try {
      setIsLoading(true);
      const data = await interviewAPI.getAllInterviews();

      if (data && Array.isArray(data)) {
        setInterviews(data);
      }
    } catch (error) {
      console.error('Failed to fetch interviews:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/signin');
  };

  const handleAddNew = () => {
    navigate('/new-interview');
  };

  const handleFeedback = (id) => {
    navigate(`/result/${id}`);
  };

  const handleStart = (id) => {
    navigate(`/interview/${id}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">{userName}</p>
                <p className="text-xs text-gray-500">{userEmail}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-red-600 transition"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-8 py-12">
        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-indigo-700 mb-2">Dashboard</h1>
          <p className="text-gray-600">Create and Start your AI Mockup Interview</p>
        </div>

        {/* Add New Card */}
        <div className="mb-12">
          <button
            onClick={handleAddNew}
            className="w-full max-w-md bg-gray-100 border-2 border-dashed border-gray-300 rounded-xl p-12 hover:bg-gray-200 hover:border-gray-400 transition flex items-center justify-center"
          >
            <span className="text-xl font-semibold text-gray-700">+ Add New</span>
          </button>
        </div>

        {/* Previous Interviews Section */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Previous Mock Interview</h2>

          {isLoading ? (
            <div className="text-center py-16">
              <div className="inline-block w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-gray-500">Loading...</p>
            </div>
          ) : interviews.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-gray-500">No previous interviews</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {interviews.map((interview, index) => (
                <div
                  key={interview.id || index}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition"
                >
                  <h3 className="text-lg font-bold text-indigo-700 mb-2">
                    {interview.position}
                  </h3>
                  <p className="text-sm text-gray-600 mb-1">
                    {interview.experience}
                  </p>
                  <p className="text-xs text-gray-400 mb-6">
                    Created At: {new Date(interview.createdAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </p>

                  <div className="flex gap-3">
                    <button
                      onClick={() => handleFeedback(interview.id)}
                      className="flex-1 px-4 py-2.5 bg-white border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition"
                    >
                      Feedback
                    </button>
                    <button
                      onClick={() => handleStart(interview.id)}
                      className="flex-1 px-4 py-2.5 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition"
                    >
                      Start
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;