const DB_NAME = 'QuizAppDB';
const STORE_NAME = 'QuizAttempts';
let db = null;

export const initDB = () => {
  return new Promise((resolve, reject) => {
    if (db) {
      // console.log('Database already initialized');
      resolve(db);
      return;
    }

    // console.log('Opening IndexedDB...');
    const request = indexedDB.open(DB_NAME, 1);

    request.onerror = (event) => {
      // console.error('IndexedDB error:', event.target.error);
      reject('Error opening database');
    };

    request.onsuccess = (event) => {
      db = event.target.result;
      // console.log('IndexedDB opened successfully:', db);
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      const database = event.target.result;
      // console.log('Upgrading database...');
      if (!database.objectStoreNames.contains(STORE_NAME)) {
        database.createObjectStore(STORE_NAME, {
          keyPath: 'id',
          autoIncrement: true
        });
        // console.log('Object store created');
      }
    };
  });
};

export const saveQuizAttempt = async (attemptData) => {
  try {
    const database = await initDB();
    return new Promise((resolve, reject) => {
      const transaction = database.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const data = {
        timestamp: new Date().toISOString(),
        score: attemptData.score,
        correctAnswers: attemptData.correctAnswers,
        totalQuestions: attemptData.totalQuestions,
        results: attemptData.results
      };

      const request = store.add(data);

      request.onsuccess = () => {
        // console.log('Quiz attempt saved:', data);
        resolve(request.result);
      };
      request.onerror = () => {
        // console.error('Error saving attempt:', request.error);
        reject(request.error);
      };
    });
  } catch (error) {
    console.error('Save attempt error:', error);
    throw error;
  }
};

export const getQuizHistory = async () => {
  try {
    const database = await initDB();
    return new Promise((resolve, reject) => {
      const transaction = database.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.getAll();

      request.onsuccess = () => {
        let history = request.result || [];

        // Sort by timestamp (latest first)
        history.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

        // Remove the most recent attempt
        if (history.length > 0) {
          history = history.slice(1);
        }

        // Ensure unique history based on a combination of score and timestamp
        const seenAttempts = new Set();
        const uniqueHistory = history.filter((attempt) => {
          const key = `${attempt.timestamp}-${attempt.score}`;
          if (seenAttempts.has(key)) return false;
          seenAttempts.add(key);
          return true;
        });

        resolve(uniqueHistory);
      };

      request.onerror = (event) => {
        // console.error('Request error:', event.target.error);
        reject('Error in request');
      };
    });
  } catch (error) {
    // console.error('Get history error:', error);
    throw error;
  }
};

export const clearQuizHistory = async () => {
  try {
    const database = await initDB();
    return new Promise((resolve, reject) => {
      const transaction = database.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.clear();

      request.onsuccess = () => {
        // console.log('Quiz history cleared successfully');
        resolve(true);
      };

      request.onerror = (event) => {
        // console.error('Error clearing quiz history:', event.target.error);
        reject('Failed to clear quiz history');
      };
    });
  } catch (error) {
    // console.error('Clear history error:', error);
    throw error;
  }
};
