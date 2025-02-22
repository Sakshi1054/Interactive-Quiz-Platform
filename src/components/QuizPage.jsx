import { useState, useEffect } from 'react';
import { quizQuestions } from '../data/questions';

const QuizPage = ({ onComplete }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [integerAnswer, setIntegerAnswer] = useState('');
  const [timeLeft, setTimeLeft] = useState(30);
  const [answers, setAnswers] = useState([]);
  const [showFeedback, setShowFeedback] = useState(false);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);

  useEffect(() => {
    if (hasAnswered) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setShowFeedback(true);
          setTimeout(() => {
            handleTimeUp();
          }, 2000);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [currentQuestion, hasAnswered]);

  const handleTimeUp = () => {
    // Record the current question's result
    const newAnswers = [...answers, {
      question: currentQuestion,
      selected: null,
      correct: false
    }];
    setAnswers(newAnswers);
  
    // Simply move to the next question in sequence
    if (currentQuestion < quizQuestions.length - 1) {
      // Move to next question index, regardless of type
      setCurrentQuestion(currentQuestion + 1);
      // Reset all states for the new question
      setSelectedAnswer(null);
      setIntegerAnswer('');
      setShowFeedback(false);
      setHasAnswered(false);
      setIsAnswerSubmitted(false);
      setTimeLeft(30);
    } else {
      onComplete(newAnswers);
    }
  };

  const handleAnswerSelect = (answer) => {
    setSelectedAnswer(answer);
    setShowFeedback(true);
    setHasAnswered(true);
    setIsAnswerSubmitted(true);
  
    setTimeout(() => {
      handleNextQuestion();
    }, 2000); // Move to next question after 2 seconds
  };
  

  const handleIntegerInput = (value) => {
    const numValue = value === '' ? '' : parseInt(value, 10);
    setIntegerAnswer(numValue);
  };

  const handleIntegerSubmit = () => {
    if (integerAnswer !== '') {
      setShowFeedback(true);
      setHasAnswered(true);
      setIsAnswerSubmitted(true);
    }
  };

  const isAnswerCorrect = () => {
    const currentQ = quizQuestions[currentQuestion];
    if (currentQ.type === 'multiple-choice') {
      return selectedAnswer === currentQ.correctAnswer;
    } else {
      return parseInt(integerAnswer, 10) === currentQ.correctAnswer;
    }
  };

  const handleNextQuestion = () => {
    if (!isAnswerSubmitted) return;

    const currentAnswer = quizQuestions[currentQuestion].type === 'multiple-choice' 
      ? selectedAnswer 
      : integerAnswer;

    const newAnswers = [...answers, {
      question: currentQuestion,
      selected: currentAnswer,
      correct: isAnswerCorrect()
    }];
    setAnswers(newAnswers);

    if (currentQuestion < quizQuestions.length - 1){
      setCurrentQuestion(prev => prev + 1);
      setSelectedAnswer(null);
      setIntegerAnswer('');
      setShowFeedback(false);
      setHasAnswered(false);
      setIsAnswerSubmitted(false);
      setTimeLeft(30);
    } else {
      onComplete(newAnswers);
    }
  };

  const renderQuestion = () => {
    const currentQ = quizQuestions[currentQuestion];

    if (currentQ.type === 'multiple-choice') {
      return (
        <div className="space-y-3">
          {currentQ.options.map((option, index) => (
            <button
              key={index}
              onClick={() => !showFeedback && handleAnswerSelect(option)}
              disabled={showFeedback}
              className={`w-full text-left p-3 rounded transition-colors duration-300 ${
                showFeedback
                  ? option === currentQ.correctAnswer
                    ? 'bg-green-500 text-white'
                    : selectedAnswer === option
                    ? 'bg-red-500 text-white'
                    : 'bg-gray-100'
                  : selectedAnswer === option
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              {option}
            </button>
          ))}
          {showFeedback && timeLeft === 0 && (
            <div className="mt-4 text-center p-3 bg-red-100 text-red-700 rounded">
              Time's up! The correct answer was: {currentQ.correctAnswer}
            </div>
          )}
          {showFeedback && timeLeft !== 0 && (
            <div className={`mt-4 text-center p-3 rounded ${
              isAnswerCorrect() ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
            }`}>
              {isAnswerCorrect() 
                ? 'Correct!' 
                : `Incorrect. The correct answer is ${currentQ.correctAnswer}`}
            </div>
          )}
        </div>
      );
    } else {
      return (
        <div className="space-y-3">
          <input
            type="number"
            value={integerAnswer}
            onChange={(e) => !showFeedback && handleIntegerInput(e.target.value)}
            disabled={showFeedback}
            min={currentQ.min}
            max={currentQ.max}
            className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter your answer"
          />
          {!showFeedback && (
            <button
              onClick={handleIntegerSubmit}
              disabled={integerAnswer === ''}
              className={`w-full py-2 rounded ${
                integerAnswer !== ''
                  ? 'bg-blue-500 text-white hover:bg-blue-600'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              Submit Answer
            </button>
          )}
          {showFeedback && (
            <div className={`text-center p-3 rounded ${
              timeLeft === 0 
                ? 'bg-red-100 text-red-700'
                : isAnswerCorrect()
                  ? 'bg-green-100 text-green-700'
                  : 'bg-red-100 text-red-700'
            }`}>
              {timeLeft === 0 
                ? `Time's up! The correct answer was: ${currentQ.correctAnswer}`
                : isAnswerCorrect()
                  ? 'Correct!'
                  : `Incorrect. The correct answer is ${currentQ.correctAnswer}`
              }
            </div>
          )}
        </div>
      );
    }
  };

  const isNextButtonEnabled = () => {
    const currentQ = quizQuestions[currentQuestion];
    if (currentQ.type === 'multiple-choice') {
      return hasAnswered;
    } else {
      return isAnswerSubmitted;
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-4 flex justify-between items-center">
        <span className="text-gray-600">Question {currentQuestion + 1}/{quizQuestions.length}</span>
        <span className={`font-semibold ${timeLeft <= 5 ? 'text-red-600' : 'text-gray-600'}`}>
          Time left: {timeLeft}s
        </span>
      </div>
      
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">{quizQuestions[currentQuestion].question}</h2>
        {renderQuestion()}
      </div>

      <button
        onClick={handleNextQuestion}
        disabled={!isNextButtonEnabled()}
        className={`w-full py-3 rounded transition-colors duration-200 ${
          isNextButtonEnabled()
            ? 'bg-blue-500 text-white hover:bg-blue-600'
            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
        }`}
      >
        {currentQuestion === quizQuestions.length - 1 ? 'Submit Quiz' : 'Next Question'}
      </button>
    </div>
  );
};

export default QuizPage;