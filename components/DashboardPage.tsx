import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { performScan } from '../services/mockApi'; // We will still use this to simulate scan engine for now
import { supabase } from '../services/supabase';
import { ScanResult } from '../types';
import { SpinnerIcon, LinkIcon, AlertTriangleIcon } from './icons';

interface DashboardPageProps {
  session: any;
  onBackToHome?: () => void;
}

const DashboardPage: React.FC<DashboardPageProps> = ({ session, onBackToHome }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const activeTab = location.pathname.includes('/scan-history') ? 'history' : 'scanner';
  
  // Scanner State
  const [channelName, setChannelName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<ScanResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [scanned, setScanned] = useState(false);

  // History State
  const [history, setHistory] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (activeTab === 'history') {
      fetchHistory();
    }
  }, [activeTab]);

  const fetchHistory = async () => {
    if (!session?.user) return;
    setLoadingHistory(true);
    try {
      const { data, error } = await supabase
        .from('scans')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setHistory(data || []);
    } catch (err: any) {
      console.error('Error fetching history:', err.message);
    } finally {
      setLoadingHistory(false);
    }
  };

  const viewHistoryScan = async (scan: any) => {
    setChannelName(scan.channel_handle);
    navigate('/dashboard');
    setIsLoading(true);
    setError(null);
    setScanned(false);
    
    try {
      const { data, error } = await supabase
        .from('broken_links')
        .select('*')
        .eq('scan_id', scan.id);
        
      if (error) throw error;
      
      // Group by video
      const groupedResults: Record<string, ScanResult> = {};
      
      data?.forEach(link => {
        if (!groupedResults[link.video_id]) {
          groupedResults[link.video_id] = {
            video: {
              id: link.video_id,
              title: link.video_title,
              thumbnailUrl: link.video_thumbnail,
              description: ''
            },
            brokenLinks: []
          };
        }
        
        // Parse error status
        const [status, ...errorTypeArr] = (link.error_status || '0 unreachable').split(' ');
        
        groupedResults[link.video_id].brokenLinks.push({
          url: link.broken_url,
          status: parseInt(status) || 0,
          statusText: 'Broken',
          errorType: errorTypeArr.join(' ') as any
        });
      });
      
      setResults(Object.values(groupedResults));
      setScanned(true);
    } catch (err: any) {
      setError("Failed to load historical scan results: " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteHistoryScan = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation(); // prevent opening the scan
    if (!window.confirm("Are you sure you want to delete this scan history?")) return;
    
    try {
      const { error } = await supabase.from('scans').delete().eq('id', id);
      if (error) throw error;
      setHistory(prev => prev.filter(scan => scan.id !== id));
    } catch (err: any) {
      console.error("Failed to delete scan:", err.message);
      alert("Failed to delete scan.");
    }
  };

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
      // Create scan record in database
      let scanId = null;
      if (session?.user && supabase) {
        const { data, error } = await supabase.from('scans').insert({
          user_id: session.user.id,
          channel_handle: channelName,
          status: 'running'
        }).select().single();
        
        if (error) {
          console.error("Supabase Scan Insert Error:", error);
          setError("Database error: " + error.message);
        }
        
        if (!error && data) {
          scanId = data.id;
        }
      }

      // Run scan engine (currently mocked)
      const scanResults = await performScan(channelName);
      setResults(scanResults);
      
      // Calculate totals and insert broken links
      let totalVideos = scanResults.length || 6;
      let totalBroken = 0;
      
      if (scanId && supabase) {
        const linksToInsert: any[] = [];
        
        scanResults.forEach(r => { 
          totalBroken += r.brokenLinks.length; 
          r.brokenLinks.forEach(link => {
            linksToInsert.push({
              scan_id: scanId,
              video_id: r.video.id,
              video_title: r.video.title,
              video_thumbnail: r.video.thumbnailUrl,
              broken_url: link.url,
              error_status: `${link.status} ${link.errorType}`
            });
          });
        });

        if (linksToInsert.length > 0) {
          const { error: linkError } = await supabase.from('broken_links').insert(linksToInsert);
          if (linkError) console.error("Supabase Broken Links Insert Error:", linkError);
        }

        // Update scan record to completed
        const { error: updateError } = await supabase.from('scans').update({
          status: 'completed',
          total_videos_scanned: totalVideos,
          total_broken_links: totalBroken
        }).eq('id', scanId);
        
        if (updateError) console.error("Supabase Scan Update Error:", updateError);
      }
      
    } catch (err: any) {
      setError(err.message || 'Failed to scan channel. Please check the username and try again.');
    } finally {
      setIsLoading(false);
      setScanned(true);
    }
  };

  const exportToCsv = () => {
    if (results.length === 0) return;
    
    // Header row
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Video Title,Video URL,Broken Link,Error Type,Status Code\n";
    
    results.forEach(result => {
      const videoTitle = `"${result.video.title.replace(/"/g, '""')}"`;
      const videoUrl = `https://youtube.com/watch?v=${result.video.id}`;
      
      result.brokenLinks.forEach(link => {
        const linkUrl = `"${link.url.replace(/"/g, '""')}"`;
        const errorType = link.errorType || "unknown";
        const status = link.status || "N/A";
        
        csvContent += `${videoTitle},${videoUrl},${linkUrl},${errorType},${status}\n`;
      });
    });
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `broken_links_${channelName}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleLogout = async () => {
    if (supabase) {
      await supabase.auth.signOut();
    }
    if (onBackToHome) onBackToHome();
  };

  return (
    <div className="min-h-screen bg-dark-bg text-white font-sans flex overflow-hidden">
      
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-dark-surface border-r border-white/5 flex flex-col justify-between hidden md:flex h-screen sticky top-0">
        <div>
          <div className="p-6 border-b border-white/5 flex items-center space-x-3 cursor-pointer" onClick={onBackToHome}>
            <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-gradient-to-tr from-primary to-purple-600 shadow-md">
              <LinkIcon className="h-4 w-4 text-white" />
            </div>
            <span className="text-lg font-heading font-extrabold tracking-tight">
              TubeLink <span className="text-primary">Audit</span>
            </span>
          </div>

          <nav className="p-4 space-y-2">
            <button 
              onClick={() => navigate('/dashboard')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${activeTab === 'scanner' ? 'bg-primary/10 text-primary border border-primary/20' : 'text-text-sec hover:bg-white/5 hover:text-white'}`}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <span>New Scan</span>
            </button>
            <button 
              onClick={() => navigate('/dashboard/scan-history')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${activeTab === 'history' ? 'bg-primary/10 text-primary border border-primary/20' : 'text-text-sec hover:bg-white/5 hover:text-white'}`}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Scan History</span>
            </button>
          </nav>
        </div>

        <div className="p-4 border-t border-white/5">
          <div className="flex items-center justify-between px-2 mb-4">
            <div className="flex items-center space-x-2 truncate">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-gray-700 to-gray-500 flex items-center justify-center font-bold text-xs">
                {session?.user?.email?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="text-xs truncate text-text-sec">
                {session?.user?.email}
              </div>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-error-accent hover:bg-error-accent/10 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 relative h-screen overflow-y-auto">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-radial from-primary/10 via-transparent to-transparent pointer-events-none z-0"></div>
        
        {/* Mobile Header */}
        <div className="md:hidden p-4 border-b border-white/5 flex items-center justify-between bg-dark-surface sticky top-0 z-50">
          <div className="flex items-center space-x-2" onClick={onBackToHome}>
            <LinkIcon className="h-5 w-5 text-primary" />
            <span className="font-bold">TubeLink Audit</span>
          </div>
          <div className="flex space-x-2">
            <button onClick={() => navigate('/dashboard')} className={`p-2 rounded-lg ${activeTab === 'scanner' ? 'bg-primary/20 text-primary' : 'text-text-sec'}`}>Scan</button>
            <button onClick={() => navigate('/dashboard/scan-history')} className={`p-2 rounded-lg ${activeTab === 'history' ? 'bg-primary/20 text-primary' : 'text-text-sec'}`}>History</button>
            <button onClick={handleLogout} className="p-2 rounded-lg text-error-accent">Out</button>
          </div>
        </div>

        <div className="p-6 lg:p-12 relative z-10 w-full mx-auto">
          
          {activeTab === 'scanner' && (
            <div className="space-y-12">
              {/* Centered Search/Scan Section */}
              <div className="max-w-3xl mx-auto space-y-8">
                <div className="space-y-4 text-center">
                  <h1 className="text-3xl font-heading font-extrabold tracking-tight">New Channel Audit</h1>
                  <p className="text-text-sec text-sm mx-auto">
                    Enter a YouTube handle below to launch a comprehensive crawl of their video descriptions. 
                    We'll detect dead links, out-of-stock affiliates, and 404 errors.
                  </p>
                </div>

                {/* Scanner Input */}
                <div className="w-full bg-dark-surface p-2 rounded-2xl border border-white/10 focus-within:border-primary/40 shadow-xl transition-all flex flex-col sm:flex-row gap-3">
                <div className="flex-grow flex items-center px-3 gap-2">
                  <span className="text-text-sec text-sm font-semibold">@</span>
                  <input
                    type="text"
                    value={channelName}
                    onChange={(e) => { setChannelName(e.target.value); setError(null); }}
                    placeholder="Enter YouTube handle (e.g. mkbhd)"
                    className="bg-transparent border-0 outline-none text-white text-sm w-full placeholder-text-sec/40"
                    disabled={isLoading}
                  />
                </div>
                <button
                  onClick={handleScan}
                  disabled={isLoading}
                  className="px-6 py-3 rounded-xl bg-primary hover:bg-primary-hover font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-primary/20 disabled:bg-primary/50"
                >
                  {isLoading ? (
                    <>
                      <SpinnerIcon className="h-4 w-4 mr-2 animate-spin" />
                      <span>Scanning...</span>
                    </>
                  ) : (
                    <>
                      <LinkIcon className="h-4 w-4 mr-2"/>
                      <span>Launch Scan</span>
                    </>
                  )}
                </button>
              </div>
              {error && <p className="text-xs text-error-accent text-center">{error}</p>}
            </div>

              {/* Scan Results rendering */}
              <div className="mt-8">
                {isLoading && (
                  <div className="flex justify-center items-center flex-col text-center space-y-4 max-w-sm mx-auto p-8 rounded-2xl bg-dark-surface border border-white/5 shadow-xl animate-pulse">
                    <SpinnerIcon className="h-10 w-10 text-primary animate-spin"/>
                    <div>
                      <h4 className="text-sm font-bold text-white">Crawling channel uploads...</h4>
                      <p className="text-xs text-text-sec mt-1">This takes between 5-15 seconds depending on count.</p>
                    </div>
                  </div>
                )}

                {!isLoading && scanned && results.length === 0 && (
                  <div className="text-center max-w-lg mx-auto bg-dark-surface border border-white/10 p-8 rounded-2xl shadow-xl space-y-4">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-500/10 text-green-400">
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">All Clear! No Broken Links</h3>
                      <p className="text-xs text-text-sec mt-1.5">Excellent! We scanned all video descriptions and found no faulty URLs or dead redirects.</p>
                    </div>
                  </div>
                )}
                
                {!isLoading && results.length > 0 && (
                  <div className="space-y-6">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <h3 className="text-xl font-bold text-white tracking-tight">
                        Scan Results: <span className="text-error-accent">{results.length} video{results.length > 1 ? 's' : ''} with issues</span>
                      </h3>
                      <button 
                        onClick={exportToCsv}
                        className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm font-semibold text-white transition-colors flex items-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        Export to CSV
                      </button>
                    </div>
                    
                    {/* 3 cards per row on large screens */}
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                      {results.map(result => (
                        <div key={result.video.id} className="bg-dark-surface border border-white/10 rounded-2xl shadow-xl overflow-hidden flex flex-col">
                          {/* Image on top */}
                          <img src={result.video.thumbnailUrl} alt={result.video.title} className="w-full aspect-video object-cover border-b border-white/10"/>
                          
                          {/* Content below image */}
                          <div className="p-5 flex-grow space-y-4">
                            <div>
                              <h4 className="text-base font-bold text-white leading-snug">{result.video.title}</h4>
                              <p className="text-[10px] text-text-sec mt-1">Video ID: {result.video.id}</p>
                            </div>

                            <div className="space-y-2">
                              {result.brokenLinks.map(link => (
                                <div key={link.url} className="flex flex-col gap-2 text-xs border border-white/5 bg-dark-bg/60 p-3 rounded-xl">
                                  <div className="flex items-start gap-2.5 min-w-0">
                                    <AlertTriangleIcon className="h-4 w-4 text-error-accent flex-shrink-0 mt-0.5 animate-pulse"/>
                                    <span className="font-mono text-text-sec break-all">{link.url}</span>
                                  </div>
                                  
                                  <div className="flex items-center gap-2 flex-shrink-0">
                                    <span className="font-bold text-error-accent">{link.status} {link.statusText}</span>
                                    {link.errorType === '404' && (
                                      <span className="px-2 py-0.5 text-[9px] font-bold bg-error-accent/10 border border-error-accent/25 text-error-accent rounded-full uppercase">404 Found</span>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h1 className="text-3xl font-heading font-extrabold tracking-tight">Scan History</h1>
                
                {/* Search Bar */}
                <div className="relative w-full sm:w-64">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-4 w-4 text-text-sec" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    placeholder="Search handles..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-dark-surface border border-white/10 rounded-xl text-sm focus:outline-none focus:border-primary/50 text-white placeholder-text-sec transition-colors"
                  />
                </div>
              </div>
              
              {loadingHistory ? (
                <div className="flex items-center justify-center p-12">
                  <SpinnerIcon className="h-8 w-8 text-primary animate-spin" />
                </div>
              ) : history.length === 0 ? (
                <div className="text-center p-12 bg-dark-surface border border-white/5 rounded-2xl">
                  <p className="text-text-sec">You haven't run any scans yet.</p>
                </div>
              ) : (
                <div className="bg-dark-surface border border-white/10 rounded-2xl shadow-xl overflow-hidden">
                  <div className="divide-y divide-white/5">
                    {history
                      .filter(scan => scan.channel_handle.toLowerCase().includes(searchQuery.toLowerCase()))
                      .map(scan => (
                      <div 
                        key={scan.id} 
                        onClick={() => viewHistoryScan(scan)}
                        className="group flex flex-col sm:flex-row sm:items-center justify-between p-4 hover:bg-white/5 cursor-pointer transition-colors"
                      >
                        <div className="flex items-center gap-4 mb-3 sm:mb-0">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-gray-800 to-gray-700 flex items-center justify-center flex-shrink-0">
                            <span className="text-sm font-bold text-white uppercase">{scan.channel_handle.substring(0, 2)}</span>
                          </div>
                          <div>
                            <h4 className="text-base font-bold text-white">@{scan.channel_handle}</h4>
                            <div className="text-xs text-text-sec flex items-center gap-2">
                              <span>{new Date(scan.created_at).toLocaleDateString()}</span>
                              <span className="w-1 h-1 rounded-full bg-white/20"></span>
                              <span className="uppercase text-[10px] tracking-wider">{scan.status}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-6 sm:gap-8 ml-14 sm:ml-0">
                          <div className="flex gap-4 sm:gap-8">
                            <div className="text-center">
                              <div className="text-[10px] text-text-sec uppercase tracking-wider mb-0.5">Videos</div>
                              <div className="font-mono text-sm font-semibold">{scan.total_videos_scanned}</div>
                            </div>
                            <div className="text-center">
                              <div className="text-[10px] text-text-sec uppercase tracking-wider mb-0.5">Broken Links</div>
                              <div className={`font-mono text-sm font-semibold ${scan.total_broken_links > 0 ? 'text-error-accent' : 'text-green-500'}`}>
                                {scan.total_broken_links}
                              </div>
                            </div>
                          </div>
                          
                          <button
                            onClick={(e) => deleteHistoryScan(scan.id, e)}
                            className="p-2 text-text-sec hover:text-error-accent hover:bg-error-accent/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                            title="Delete Scan"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    ))}
                    
                    {history.filter(scan => scan.channel_handle.toLowerCase().includes(searchQuery.toLowerCase())).length === 0 && (
                      <div className="p-8 text-center text-text-sec text-sm">
                        No scans found matching "{searchQuery}"
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

        </div>
      </main>
    </div>
  );
};

export default DashboardPage;
