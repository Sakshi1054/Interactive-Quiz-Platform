import { useState } from 'react';
import StartPage from './components/StartPage';
import QuizPage from './components/QuizPage';
import ResultPage from './components/ResultPage';

const App = () => {
  const [currentPage, setCurrentPage] = useState('start');
  const [quizResults, setQuizResults] = useState(null);
  
  const handleStartQuiz = () => {
    setCurrentPage('quiz');
  };

  const handleQuizComplete = (results) => {
    setQuizResults(results);
    setCurrentPage('results');
  };

  const handleRetakeQuiz = () => {
    setCurrentPage('start');
    setQuizResults(null);
  };

  return (
    <div className="min-h-screen bg-gray-100 py-6 flex flex-col justify-center sm:py-12">
      <div className="relative py-3 sm:max-w-xl sm:mx-auto">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-blue-600 shadow-lg transform -skew-y-6 sm:skew-y-0 sm:-rotate-6 sm:rounded-3xl"></div>
        <div className="relative px-4 py-10 bg-white shadow-lg sm:rounded-3xl sm:p-20">
          {currentPage === 'start' && <StartPage onStart={handleStartQuiz} />}
          {currentPage === 'quiz' && <QuizPage onComplete={handleQuizComplete} />}
          {currentPage === 'results' && <ResultPage results={quizResults} onRetake={handleRetakeQuiz} />}
        </div>
      </div>
    </div>
  );
};

export default App;