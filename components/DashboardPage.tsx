import React, { useState } from 'react';
import { performScan } from '../services/mockApi';
import { ScanResult } from '../types';
import { SpinnerIcon, YoutubeIcon, LinkIcon, AlertTriangleIcon } from './icons';

interface DashboardPageProps {
  session: any;
}

const DashboardPage: React.FC<DashboardPageProps> = () => {
  const [channelName, setChannelName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<ScanResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [scanned, setScanned] = useState(false);

  const handleScan = async () => {
    if (!channelName.trim()) {
      setError("Please enter a YouTube username.");
      return;
    }
    
    setIsLoading(true);
    setError(null);
    setResults([]);
    setScanned(false);

    try {
      const scanResults = await performScan(channelName);
      setResults(scanResults);
    } catch (err: any) {
      setError(err.message || 'Failed to scan channel. Please check the username and try again.');
    } finally {
      setIsLoading(false);
      setScanned(true);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200">
      <header className="bg-white dark:bg-gray-800 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <YoutubeIcon className="h-8 w-8 text-red-500"/>
            <h1 className="text-xl font-bold">Link Guardian</h1>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white">Find Broken Links Before Your Audience Does</h2>
            <p className="mt-4 text-lg text-gray-500 dark:text-gray-400">
              Enter a YouTube username below to scan all video descriptions for dead links.
            </p>
        </div>

        <div className="mt-10 max-w-2xl mx-auto">
            <div className="flex flex-col sm:flex-row gap-4">
                <input
                    type="text"
                    value={channelName}
                    onChange={(e) => { setChannelName(e.target.value); setError(null); }}
                    placeholder="Enter YouTube username (e.g., mkbhd)"
                    className="flex-grow px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white"
                />
                <button
                    onClick={handleScan}
                    disabled={isLoading}
                    className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-primary hover:bg-primary-hover disabled:bg-indigo-300 disabled:cursor-not-allowed"
                >
                    {isLoading ? <SpinnerIcon className="h-5 w-5 mr-2" /> : <LinkIcon className="h-5 w-5 mr-2"/>}
                    {isLoading ? 'Scanning...' : 'Scan For Broken Links'}
                </button>
            </div>
            {error && <p className="mt-2 text-sm text-red-500 text-center sm:text-left">{error}</p>}
        </div>

        <div className="mt-12">
          {isLoading && (
            <div className="flex justify-center items-center flex-col text-center">
              <SpinnerIcon className="h-12 w-12 text-primary"/>
              <p className="mt-4 text-lg font-medium">Scanning videos and checking links...</p>
              <p className="text-gray-500 dark:text-gray-400">This may take a moment.</p>
            </div>
          )}

          {!isLoading && scanned && results.length === 0 && (
            <div className="text-center bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md">
                <h3 className="text-2xl font-bold text-green-500">All Clear!</h3>
                <p className="mt-2 text-gray-600 dark:text-gray-300">We scanned the channel and found no broken links. Great job!</p>
            </div>
          )}
          
          {!isLoading && results.length > 0 && (
            <div className="space-y-6">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Scan Results: <span className="text-red-500">{results.length} video{results.length > 1 ? 's' : ''} with broken links</span></h3>
                {results.map(result => (
                  <div key={result.video.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden flex flex-col sm:flex-row">
                      <img src={result.video.thumbnailUrl} alt={result.video.title} className="w-full sm:w-48 h-auto object-cover"/>
                      <div className="p-6 flex-grow">
                          <h4 className="text-lg font-bold text-gray-900 dark:text-white">{result.video.title}</h4>
                          <div className="mt-4 space-y-3">
                              {result.brokenLinks.map(link => (
                                  <div key={link.url} className="flex items-start space-x-3 text-sm border-l-4 border-red-400 pl-3 py-2">
                                      <AlertTriangleIcon className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5"/>
                                      <div className="flex-grow">
                                        <p className="text-gray-500 dark:text-gray-400 font-mono break-all mb-2">{link.url}</p>
                                        <div className="flex items-center gap-2 flex-wrap">
                                          <span className="font-semibold text-red-500">{link.status} {link.statusText}</span>
                                          {link.errorType === '404' && (
                                            <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">404 Error</span>
                                          )}
                                          {link.errorType === 'unreachable' && (
                                            <span className="px-2 py-1 text-xs font-medium bg-orange-100 text-orange-800 rounded-full">Site Can't Be Reached</span>
                                          )}
                                          {link.errorType === 'not-found' && (
                                            <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">Page Not Found</span>
                                          )}
                                        </div>
                                      </div>
                                  </div>
                              ))}
                          </div>
                      </div>
                  </div>
                ))}
            </div>
          )}

        </div>
      </main>
    </div>
  );
};

export default DashboardPage;
