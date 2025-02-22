import { useState, useEffect } from 'react';
import { saveQuizAttempt, getQuizHistory } from '../utils/db';
import { clearQuizHistory } from '../utils/db';

const ResultPage = ({ results, onRetake }) => {
  const [quizHistory, setQuizHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const correctAnswers = results.filter(answer => answer.correct).length;
  const totalQuestions = results.length;
  const percentage = Math.round((correctAnswers / totalQuestions) * 100);

  useEffect(() => {
    let isMounted = true;

    const saveAndFetchHistory = async () => {
      try {
        setLoading(true);
        setError(null);

        // Save current attempt
        const attemptData = {
          score: percentage,
          correctAnswers,
          totalQuestions,
          results
        };

        await saveQuizAttempt(attemptData);
        
        // Fetch updated history
        const history = await getQuizHistory();
        
        if (isMounted) {
          if (!Array.isArray(history)) {
            throw new Error('Invalid history data received');
          }
          
          const sortedHistory = history.sort((a, b) => 
            new Date(b.timestamp) - new Date(a.timestamp)
          );
          
          setQuizHistory(sortedHistory);
          setLoading(false);
        }
      } catch (err) {
        console.error('Quiz history error:', err);
        if (isMounted) {
          setError('Failed to load quiz history. Please try again.');
          setLoading(false);
        }
      }
    };

    saveAndFetchHistory();

    return () => {
      isMounted = false;
    };
  }, []);

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleString('en-US', {
        dateStyle: 'medium',
        timeStyle: 'short'
      });
    } catch (error) {
      console.error('Date formatting error:', error);
      return 'Invalid Date';
    }
  };

  const handleClearHistory = async () => {
    try {
      await clearQuizHistory();
      setQuizHistory([]); // Clear the history in state
      setError(null);
    } catch (err) {
      console.error('Error clearing history:', err);
      setError('Failed to clear quiz history');
    }
  };
  

  return (
    <div className="text-center">
      <h2 className="text-3xl font-bold mb-6">Quiz Results</h2>
      
      <div className="mb-8">
        <div className="text-6xl font-bold text-blue-500 mb-2">{percentage}%</div>
        <p className="text-gray-600">
          You got {correctAnswers} out of {totalQuestions} questions correct
        </p>
      </div>

      <div className="mb-8">
        <button
          onClick={() => setShowHistory(!showHistory)}
          className="bg-gray-500 text-white px-6 py-2 rounded-lg shadow hover:bg-gray-600 transition duration-200 mb-4"
        >
          {showHistory ? 'Hide History' : 'Show Attempt History'}
        </button>

        {showHistory && (
          <div className="mt-4">
            <h3 className="text-xl font-semibold mb-4">Previous Attempts</h3>
            {loading && (
              <div className="text-gray-600">Loading history...</div>
            )}
            {error && (
              <div className="text-red-500 mb-4">
                {error}
                <button 
                  onClick={() => window.location.reload()} 
                  className="ml-2 underline"
                >
                  Refresh
                </button>
              </div>
            )}
            {!loading && !error && quizHistory.length === 0 && (
              <p className="text-gray-600">No previous attempts found</p>
            )}
            {!loading && !error && quizHistory.length > 0 && (
              <div className="max-h-60 overflow-y-auto">
                <table className="w-full border-collapse">
                  <thead className="bg-gray-100 sticky top-0">
                    <tr>
                      <th className="border p-2">Date</th>
                      <th className="border p-2">Score</th>
                      <th className="border p-2">Correct/Total</th>
                    </tr>
                </thead>
                <tbody>
                {quizHistory.map((attempt, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="border p-2">{formatDate(attempt.timestamp)}</td>
                    <td className="border p-2">{attempt.score}%</td>
                    <td className="border p-2">
                    {attempt.correctAnswers}/{attempt.totalQuestions}
                    </td>
                </tr>
                ))}
              </tbody>
            </table>
          <button
            onClick={handleClearHistory}
            className="mt-4 bg-red-500 text-white px-4 py-2 rounded-lg shadow hover:bg-red-600 transition duration-200"
          >
          Clear History
        </button>
        </div>
        )}

        </div>
        )}
      </div>

      <button
        onClick={onRetake}
        className="bg-blue-500 text-white px-6 py-3 rounded-lg shadow hover:bg-blue-600 transition duration-200"
      >
        Take Quiz Again
      </button>
    </div>
  );
};

export default ResultPage;