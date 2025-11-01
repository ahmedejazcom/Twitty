import React from 'react';
import type { Tweet } from '../types';
import TwitterIcon from './icons/TwitterIcon';
import LinkIcon from './icons/LinkIcon';

interface TweetCardProps {
  tweet: Tweet;
}

const TweetCard: React.FC<TweetCardProps> = ({ tweet }) => {
  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 md:p-6 mb-4 w-full animate-fade-in-up">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
            <TwitterIcon className="w-7 h-7 text-white" />
          </div>
        </div>
        <div className="ml-4 flex-1">
          <div className="flex items-center">
            <span className="font-bold text-white">AI News Bot</span>
            <span className="text-gray-400 ml-2">@AINewsBot</span>
            <span className="text-gray-400 mx-2">·</span>
            <span className="text-gray-400 text-sm">{tweet.timestamp}</span>
          </div>
          <p className="mt-2 text-gray-200 whitespace-pre-wrap">{tweet.text}</p>
          
          {tweet.sources.length > 0 && (
            <div className="mt-4">
              <h4 className="text-sm font-semibold text-gray-400 mb-2">Sources:</h4>
              <ul className="space-y-1">
                {tweet.sources.map((source, index) => (
                  <li key={index} className="flex items-center">
                    <LinkIcon className="w-4 h-4 text-blue-400 mr-2 flex-shrink-0" />
                    <a
                      href={source.uri}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:underline text-sm truncate"
                      title={source.title}
                    >
                      {source.title}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="mt-4">
             <button
              onClick={() => alert('This is a simulation. Tweet not posted.')}
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-full text-sm transition-colors duration-200"
            >
              Post to X
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TweetCard;
