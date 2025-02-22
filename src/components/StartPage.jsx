const StartPage = ({ onStart }) => {
  return (
    <div className="text-center">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Welcome to the Quiz Platform</h1>
      <p className="text-gray-600 mb-8">
        Test your knowledge with our interactive quiz. You'll have 30 seconds per question.
      </p>
      <button
        onClick={onStart}
        className="bg-blue-500 text-white px-6 py-3 rounded-lg shadow hover:bg-blue-600 transition duration-200"
      >
        Start Quiz
      </button>
    </div>
  );
};

export default StartPage; 