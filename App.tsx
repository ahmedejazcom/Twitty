import React, { useState, useRef, useCallback, useEffect } from 'react';
import { fetchLatestNews, generateTweet } from './services/geminiService';
import type { Tweet } from './types';
import TweetCard from './components/TweetCard';
import LoadingSpinner from './components/icons/LoadingSpinner';

const MONITORING_INTERVAL = 30000; // 30 seconds

const App: React.FC = () => {
  const [topic, setTopic] = useState<string>('latest AI developments');
  const [isMonitoring, setIsMonitoring] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [status, setStatus] = useState<string>('Ready to monitor.');
  const [tweets, setTweets] = useState<Tweet[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Fix: Use 'number' for setInterval return type in browser environments instead of 'NodeJS.Timeout'.
  const intervalRef = useRef<number | null>(null);

  const fetchAndGenerate = useCallback(async () => {
    if (!topic) {
      setError('Please enter a topic to monitor.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setStatus(`Searching for latest news on "${topic}"...`);

    try {
      const newsUpdate = await fetchLatestNews(topic);

      if (!newsUpdate || !newsUpdate.summary) {
        setStatus(`No new updates found for "${topic}". Checking again soon.`);
        setIsLoading(false);
        return;
      }

      if (tweets.length > 0 && newsUpdate.summary === tweets[0].originalSummary) {
        setStatus(`No new updates found for "${topic}". The latest news is unchanged. Checking again soon.`);
        setIsLoading(false);
        return;
      }
      
      setStatus('Found new information. Generating tweet...');
      const tweetText = await generateTweet(newsUpdate.summary);

      const newTweet: Tweet = {
        id: new Date().toISOString(),
        text: tweetText,
        sources: newsUpdate.sources,
        timestamp: new Date().toLocaleTimeString(),
        originalSummary: newsUpdate.summary,
      };

      setTweets(prevTweets => [newTweet, ...prevTweets]);
      setStatus('Tweet generated! Monitoring for next update...');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      setError(`Error: ${errorMessage}`);
      setStatus('An error occurred. Pausing monitoring.');
      setIsMonitoring(false);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    } finally {
      setIsLoading(false);
    }
  }, [topic, tweets]);

  const handleStartMonitoring = () => {
    if (intervalRef.current) return;
    setIsMonitoring(true);
    setStatus(`Starting to monitor "${topic}"...`);
    fetchAndGenerate(); 
    intervalRef.current = setInterval(fetchAndGenerate, MONITORING_INTERVAL);
  };

  const handleStopMonitoring = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsMonitoring(false);
    setStatus('Monitoring stopped.');
    setIsLoading(false);
  };
  
  useEffect(() => {
    // Cleanup on unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col items-center p-4 sm:p-6 md:p-8">
      <style>{`
        @keyframes fade-in-up {
          0% { opacity: 0; transform: translateY(20px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up { animation: fade-in-up 0.5s ease-out forwards; }
      `}</style>
      <div className="w-full max-w-3xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
            AI News-to-Tweet Monitor
          </h1>
          <p className="mt-2 text-gray-400">
            Real-time news monitoring and automated tweet generation powered by Gemini.
          </p>
        </header>

        <main className="w-full">
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-6 mb-8 sticky top-4 z-10">
            <div className="mb-4">
              <label htmlFor="topic" className="block text-sm font-medium text-gray-300 mb-2">
                Topic to Monitor
              </label>
              <input
                type="text"
                id="topic"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g., breakthroughs in quantum computing"
                className="w-full bg-gray-900 border border-gray-600 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                disabled={isMonitoring}
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={handleStartMonitoring}
                disabled={isMonitoring || !topic}
                className="w-full sm:w-1/2 flex items-center justify-center bg-blue-600 text-white font-semibold py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
              >
                {isMonitoring ? 'Monitoring...' : 'Start Monitoring'}
              </button>
              <button
                onClick={handleStopMonitoring}
                disabled={!isMonitoring}
                className="w-full sm:w-1/2 bg-gray-600 text-white font-semibold py-2 px-4 rounded-md hover:bg-gray-700 disabled:bg-gray-800 disabled:text-gray-500 disabled:cursor-not-allowed transition-colors"
              >
                Stop Monitoring
              </button>
            </div>
             <div className="h-8 mt-4 text-center text-sm text-gray-400 flex items-center justify-center">
              {isLoading && <LoadingSpinner />}
              <span className="ml-2">{status}</span>
            </div>
            {error && <p className="mt-2 text-red-400 text-center text-sm">{error}</p>}
          </div>

          <div className="mt-8">
            {tweets.length === 0 && !isMonitoring && !isLoading && (
              <div className="text-center text-gray-500 py-10">
                <p>Generated tweets will appear here once monitoring begins.</p>
              </div>
            )}
            {tweets.map((tweet) => (
              <TweetCard key={tweet.id} tweet={tweet} />
            ))}
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;