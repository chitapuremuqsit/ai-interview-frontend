
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Briefcase, TrendingUp, Target, ArrowLeft } from 'lucide-react';
import interviewAPI from '../../services/interviewAPI';

function NewInterview() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    position: '',
    experience: '',
    difficulty: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const userId = localStorage.getItem('userId');
    console.log('=== DEBUG INFO ===');
    console.log('User ID from localStorage:', userId);
    console.log('Form Data:', formData);

    if (!userId) {
      setError('You are not logged in. Please sign in again.');
      setIsLoading(false);
      setTimeout(() => navigate('/signin'), 2000);
      return;
    }

    try {
      console.log('Calling createInterview API...');
      const data = await interviewAPI.createInterview(formData);
      console.log('API Response:', data);

      // ✅ Fixed: Handle both response formats
      if (data.success || data.id || data.interviewId) {
        const interviewId = data.interviewId || data.id;
        console.log('Navigating to interview:', interviewId);
        navigate(`/interview/${interviewId}`);
      } else {
        const errorMsg = data.message || 'Failed to create interview';
        console.error('API returned error:', errorMsg);
        setError(errorMsg);
      }
    } catch (err) {
      console.error('=== ERROR DETAILS ===');
      console.error('Error:', err);
      console.error('Error message:', err.message);

      let errorMessage = 'Failed to create interview';

      if (err.code === 'ERR_NETWORK') {
        errorMessage = 'Cannot connect to server. Please make sure the backend is running on port 8080.';
      } else if (err.message) {
        errorMessage = err.message;
      }

      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-gray-700 hover:text-indigo-600 transition"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Back to Dashboard</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex items-center justify-center p-4 md:p-8">
        <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl p-8 md:p-12">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-indigo-100 rounded-full mb-4">
              <Briefcase className="w-10 h-10 text-indigo-600" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
              Start New Interview
            </h1>
            <p className="text-gray-600">
              Configure your AI interview session
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm">
              <div className="font-semibold mb-1">Error:</div>
              <div>{error}</div>
              <div className="mt-2 text-xs text-red-500">
                Check the browser console (F12) for more details
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Position Input */}
            <div>
              <label className="flex items-center gap-2 text-gray-700 font-semibold mb-3">
                <Briefcase className="w-5 h-5 text-indigo-600" />
                Position
              </label>
              <input
                type="text"
                name="position"
                placeholder="e.g., Software Engineer, Product Manager, Data Scientist"
                value={formData.position}
                onChange={handleChange}
                className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500 transition text-gray-800 placeholder-gray-400"
                required
                disabled={isLoading}
              />
              <p className="mt-2 text-sm text-gray-500">
                Enter the job position you're preparing for
              </p>
            </div>

            {/* Experience Level */}
            <div>
              <label className="flex items-center gap-2 text-gray-700 font-semibold mb-3">
                <TrendingUp className="w-5 h-5 text-indigo-600" />
                Experience Level
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {[
                  { value: 'Entry Level', label: 'Entry Level', subtitle: '0-2 years' },
                  { value: 'Mid Level', label: 'Mid Level', subtitle: '3-5 years' },
                  { value: 'Senior Level', label: 'Senior', subtitle: '5+ years' }
                ].map((option) => (
                  <label
                    key={option.value}
                    className={`relative flex flex-col p-4 border-2 rounded-xl cursor-pointer transition ${
                      formData.experience === option.value
                        ? 'border-indigo-600 bg-indigo-50'
                        : 'border-gray-200 hover:border-indigo-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="experience"
                      value={option.value}
                      checked={formData.experience === option.value}
                      onChange={handleChange}
                      className="sr-only"
                      required
                      disabled={isLoading}
                    />
                    <span className="font-semibold text-gray-800">{option.label}</span>
                    <span className="text-sm text-gray-500">{option.subtitle}</span>
                    {formData.experience === option.value && (
                      <div className="absolute top-2 right-2 w-5 h-5 bg-indigo-600 rounded-full flex items-center justify-center">
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </label>
                ))}
              </div>
            </div>

            {/* Difficulty Level */}
            <div>
              <label className="flex items-center gap-2 text-gray-700 font-semibold mb-3">
                <Target className="w-5 h-5 text-indigo-600" />
                Difficulty Level
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {[
                  { value: 'Easy', label: 'Easy', color: 'green', desc: 'Basic questions' },
                  { value: 'Medium', label: 'Medium', color: 'yellow', desc: 'Moderate challenge' },
                  { value: 'Hard', label: 'Hard', color: 'red', desc: 'Advanced topics' }
                ].map((option) => (
                  <label
                    key={option.value}
                    className={`relative flex flex-col p-4 border-2 rounded-xl cursor-pointer transition ${
                      formData.difficulty === option.value
                        ? 'border-indigo-600 bg-indigo-50'
                        : 'border-gray-200 hover:border-indigo-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="difficulty"
                      value={option.value}
                      checked={formData.difficulty === option.value}
                      onChange={handleChange}
                      className="sr-only"
                      required
                      disabled={isLoading}
                    />
                    <span className="font-semibold text-gray-800">{option.label}</span>
                    <span className="text-sm text-gray-500">{option.desc}</span>
                    {formData.difficulty === option.value && (
                      <div className="absolute top-2 right-2 w-5 h-5 bg-indigo-600 rounded-full flex items-center justify-center">
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </label>
                ))}
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-4 bg-indigo-600 text-white rounded-xl font-semibold text-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-lg hover:shadow-xl"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Creating Interview...
                  </span>
                ) : (
                  'Start Interview'
                )}
              </button>
            </div>
          </form>

          {/* Info Box */}
          <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-xl">
            <div className="flex gap-3">
              <div className="text-blue-600 text-xl">💡</div>
              <div>
                <h4 className="font-semibold text-blue-900 mb-1">Interview Tips</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Use the STAR method for behavioral questions</li>
                  <li>• Be specific with examples from your experience</li>
                  <li>• Take your time to think before answering</li>
                  <li>• Speak clearly and confidently</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default NewInterview;