import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Award, MessageSquare, BookOpen, CheckCircle, Clock } from 'lucide-react';
import interviewAPI from '../../services/interviewAPI';

function InterviewResult() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [qaHistory, setQaHistory] = useState([]);

  const parseTranscript = useCallback((transcript) => {
    if (!transcript) {
      console.warn('Transcript is empty or null');
      return;
    }

    console.log('Parsing transcript:', transcript);

    const lines = transcript.split('\n').filter(line => line.trim());
    console.log('Split lines:', lines);

    const history = [];
    let currentQ = null;
    let currentA = null;

    lines.forEach(line => {
      const trimmed = line.trim();

      if (trimmed.startsWith('Interviewer:') || trimmed.startsWith('AI:') || trimmed.startsWith('Bot:')) {
        if (currentQ && currentA) {
          history.push({ question: currentQ, answer: currentA });
        }
        currentQ = trimmed.replace(/^(Interviewer:|AI:|Bot:)/, '').trim();
        currentA = null;
      } else if (trimmed.startsWith('You:') || trimmed.startsWith('User:') || trimmed.startsWith('Candidate:')) {
        currentA = trimmed.replace(/^(You:|User:|Candidate:)/, '').trim();
      } else if (currentA) {
        currentA += ' ' + trimmed;
      }
    });

    if (currentQ && currentA) {
      history.push({ question: currentQ, answer: currentA });
    }

    console.log('Parsed history:', history);
    setQaHistory(history);
  }, []);

  const fetchResult = useCallback(async () => {
    try {
      const data = await interviewAPI.getResult(id);
      console.log('Interview result:', data);
      console.log('Chat transcript:', data.chatTranscript);
      console.log('Transcript type:', typeof data.chatTranscript);
      setResult(data);

      if (data.chatTranscript) {
        parseTranscript(data.chatTranscript);
      } else {
        console.warn('No chatTranscript found in result data');
      }

      setLoading(false);
    } catch (err) {
      console.error('Failed to load results:', err);
      setError('Failed to load results');
      setLoading(false);
    }
  }, [id, parseTranscript]);

  useEffect(() => {
    fetchResult();
  }, [fetchResult]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4"></div>
          <h3 className="text-2xl font-bold text-gray-800 mb-2">Loading Results...</h3>
          <p className="text-gray-600">Please wait...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h3 className="text-2xl font-bold text-gray-800 mb-4">Failed to Load Results</h3>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const questionCount = qaHistory.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-12 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-green-100 rounded-full mb-4">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Interview Complete!</h1>
          <p className="text-gray-600">Here's your interview summary</p>
        </div>

        {/* Question Count Card */}
        <div className="flex justify-center mb-8">
          <div className="bg-blue-50 rounded-2xl p-8 text-center border border-blue-100 w-full max-w-md">
            <MessageSquare className="w-16 h-16 text-blue-600 mx-auto mb-4" />
            <div className="text-5xl font-bold text-blue-600 mb-3">{questionCount}</div>
            <div className="text-gray-700 font-semibold text-lg">Questions Answered</div>
          </div>
        </div>

        {/* Interview History */}
        <div className="bg-white rounded-2xl p-8 mb-8 shadow-lg border border-gray-200">
          <div className="flex items-center gap-3 mb-6">
            <BookOpen className="w-7 h-7 text-indigo-600" />
            <h2 className="text-2xl font-bold text-gray-900">Interview History</h2>
          </div>

          {qaHistory.length > 0 ? (
            <div className="space-y-6">
              {qaHistory.map((qa, index) => (
                <div key={index} className="border-l-4 border-indigo-200 pl-6 py-2">
                  <div className="mb-4">
                    <div className="flex items-start gap-2 mb-2">
                      <span className="inline-block px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-semibold">
                        Q{index + 1}
                      </span>
                    </div>
                    <p className="text-gray-800 font-medium text-lg leading-relaxed">
                      {qa.question}
                    </p>
                  </div>
                  <div>
                    <div className="flex items-start gap-2 mb-2">
                      <span className="inline-block px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
                        Your Answer
                      </span>
                    </div>
                    <p className="text-gray-700 leading-relaxed bg-gray-50 p-4 rounded-lg">
                      {qa.answer}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Clock className="w-12 h-12 mx-auto mb-3 text-gray-400" />
              <p>No interview history available</p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => navigate('/new-interview')}
            className="px-8 py-4 bg-indigo-600 text-white rounded-xl font-semibold text-lg hover:bg-indigo-700 transition shadow-lg hover:shadow-xl"
          >
            Start New Interview
          </button>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-8 py-4 bg-gray-700 text-white rounded-xl font-semibold text-lg hover:bg-gray-800 transition shadow-lg hover:shadow-xl"
          >
            View Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}

export default InterviewResult;