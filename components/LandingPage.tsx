import React, { useState, useEffect } from 'react';
import { 
  YoutubeIcon, 
  LinkIcon, 
  AlertTriangleIcon, 
  SpinnerIcon 
} from './icons';

interface LandingPageProps {
  session?: any;
  onStartFreeScan: () => void;
  onNavigateLogin: () => void;
  onNavigateDashboard: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ 
  session,
  onStartFreeScan, 
  onNavigateLogin, 
  onNavigateDashboard 
}) => {
  const [demoInput, setDemoInput] = useState('');
  const [isDemoScanning, setIsDemoScanning] = useState(false);
  const [demoProgress, setDemoProgress] = useState(0);
  const [demoStep, setDemoStep] = useState(0);
  const [scannedVideoCount, setScannedVideoCount] = useState(120482);
  const [brokenLinksCount, setBrokenLinksCount] = useState(35108);

  // Scroll reveal animation
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
        }
      });
    }, { threshold: 0.1 });

    const revealElements = document.querySelectorAll('.reveal');
    revealElements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  // Counter animations
  useEffect(() => {
    const timer = setInterval(() => {
      setScannedVideoCount(prev => prev + Math.floor(Math.random() * 3));
      if (Math.random() > 0.7) {
        setBrokenLinksCount(prev => prev + 1);
      }
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  // Demo Scan Simulation
  const handleDemoScan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!demoInput.trim()) return;
    setIsDemoScanning(true);
    setDemoProgress(0);
    setDemoStep(1);

    const interval = setInterval(() => {
      setDemoProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setDemoStep(3); // Scan complete
          setTimeout(() => {
            setIsDemoScanning(false);
            // Redirect to real app
            onStartFreeScan();
          }, 3000);
          return 100;
        }
        const nextProgress = prev + 5;
        if (nextProgress > 50 && nextProgress < 90) {
          setDemoStep(2); // Analyzing URLs
        }
        return nextProgress;
      });
    }, 150);
  };

  const mockVideos = [
    {
      title: "Top 5 Best Backpacking Tents for Ultralight Camping!",
      thumbnail: "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&w=400&q=80",
      links: [
        { url: "https://amzn.to/4kiiCZB", status: "200 OK", ok: true },
        { url: "https://amzn.to/3CUtkER", status: "200 OK", ok: true },
        { url: "https://amzefn.to/435hl1M", status: "Unreachable", ok: false, errorType: "unreachable" },
        { url: "https://amzn.to/3F6bQpm", status: "200 OK", ok: true },
        { url: "https://amsvzn.to/3EUO", status: "Unreachable", ok: false, errorType: "unreachable" },
        { url: "http://thesoloentrepreneur.in/wp-admin-error", status: "404 Not Found", ok: false, errorType: "404" },
      ]
    }
  ];

  return (
    <div className="relative min-h-screen bg-dark-bg text-white font-sans selection:bg-primary selection:text-white">
      {/* Background Orbs & Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-gradient-radial from-primary/15 via-transparent to-transparent animate-pulse-glow"></div>
        <div className="absolute top-[30%] right-[-10%] w-[60%] h-[60%] bg-gradient-radial from-purple-800/10 via-transparent to-transparent animate-pulse-glow" style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-[-10%] left-[20%] w-[50%] h-[50%] bg-gradient-radial from-primary/10 via-transparent to-transparent animate-pulse-glow" style={{ animationDelay: '4s' }}></div>
      </div>
      
      {/* Grid overlay */}
      <div className="absolute inset-0 bg-grid opacity-[0.4] mix-blend-overlay pointer-events-none z-0"></div>

      {/* Sticky Header */}
      <header className="sticky top-0 z-50 glassmorphism transition-all duration-300">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          {/* Logo */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="relative w-9 h-9 flex items-center justify-center rounded-xl bg-gradient-to-tr from-primary to-purple-600 shadow-lg shadow-primary/20">
              <LinkIcon className="h-5 w-5 text-white" />
              <div className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-error-accent animate-ping"></div>
            </div>
            <span className="text-xl font-heading font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-300">
              TubeLink <span className="text-primary">Audit</span>
            </span>
          </div>

          {/* Nav Links */}
          <nav className="hidden md:flex items-center space-x-8 text-sm font-medium text-text-sec">
            <a href="#features" className="hover:text-white transition-colors duration-200">Features</a>
            <a href="#how-it-works" className="hover:text-white transition-colors duration-200">How it Works</a>
            <a href="#dashboard-preview" className="hover:text-white transition-colors duration-200">Product Showcase</a>
            <a href="#pricing" className="hover:text-white transition-colors duration-200">Pricing</a>
          </nav>

          {/* CTA Buttons */}
          <div className="flex items-center space-x-4">
            <button 
              onClick={session ? onNavigateDashboard : onStartFreeScan}
              className="relative group px-5 py-2.5 text-sm font-semibold rounded-xl bg-gradient-to-r from-primary to-purple-600 text-white shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 overflow-hidden"
            >
              <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
              <span>{session ? 'Dashboard' : 'Start Free Scan'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24 lg:pt-32 flex flex-col lg:flex-row gap-16 items-center">
        {/* Hero Info */}
        <div className="flex-1 space-y-8 text-center lg:text-left max-w-2xl lg:max-w-none">
          <div className="inline-flex items-center gap-2 px-3 py-1 text-xs font-semibold tracking-wide uppercase rounded-full bg-primary/10 border border-primary/20 text-primary">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-ping"></span>
            Version 2.0 Live
          </div>
          
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-heading font-extrabold tracking-tight leading-[1.1] text-white">
            Find Broken Links Hidden In Your <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-purple-400 to-pink-500">YouTube Videos</span>
          </h1>

          <p className="text-lg sm:text-xl text-text-sec leading-relaxed">
            Scan every video description instantly and detect dead affiliate links, expired URLs, and SEO issues before they cost you views and revenue.
          </p>

          {/* Hero Form / CTA */}
          <div className="space-y-4 w-full">
            <form onSubmit={handleDemoScan} className="flex flex-col sm:flex-row gap-2 max-w-lg mx-auto lg:mx-0 bg-dark-bg p-2 rounded-2xl border border-white/10 focus-within:border-primary/50 focus-within:ring-1 focus-within:ring-primary/50 transition-all duration-300 shadow-2xl">
              <div className="flex-grow flex items-center pl-4 pr-2 gap-3 min-w-0">
                <span className="text-text-sec text-lg font-medium">@</span>
                <input 
                  type="text" 
                  value={demoInput}
                  onChange={(e) => setDemoInput(e.target.value)}
                  placeholder="Enter YouTube handle (e.g. mkbhd)" 
                  className="bg-transparent border-0 outline-none text-white text-base w-full placeholder-text-sec/50 min-w-0"
                  disabled={isDemoScanning}
                />
              </div>
              <button 
                type="submit" 
                disabled={isDemoScanning}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-primary to-purple-600 hover:shadow-lg hover:shadow-primary/30 font-bold text-sm text-white transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed whitespace-nowrap"
              >
                {isDemoScanning ? (
                  <>
                    <SpinnerIcon className="h-4 w-4 animate-spin" />
                    <span>Scanning...</span>
                  </>
                ) : (
                  <>
                    <span>Scan Channel</span>
                    <LinkIcon className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>
            <p className="text-sm text-text-sec/80 flex items-center justify-center lg:justify-start gap-2 pl-2">
              <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
              No YouTube connection required
            </p>
          </div>

          {/* Action Links */}
          <div className="flex items-center justify-center lg:justify-start gap-6 pt-2">
            <button 
              onClick={onStartFreeScan}
              className="text-sm font-semibold text-white flex items-center gap-2 hover:text-primary transition-colors"
            >
              <span>Explore full platform</span>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>

        {/* Hero Interactive Dashboard Mockup */}
        <div className="flex-1 w-full relative max-w-lg lg:max-w-none">
          <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-primary to-purple-600 opacity-20 blur-xl"></div>
          
          <div className="relative rounded-2xl bg-dark-surface border border-white/10 overflow-hidden shadow-2xl animate-float">
            {/* Top Bar */}
            <div className="px-4 py-3 bg-dark-bg/60 border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-error-accent/60"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500/60"></div>
                <div className="w-3 h-3 rounded-full bg-green-500/60"></div>
              </div>
              <div className="text-xs font-semibold px-2 py-0.5 rounded-full bg-white/5 text-text-sec">
                Demo Audit Scanner
              </div>
              <div className="w-4"></div>
            </div>

            {/* Content area */}
            <div className="p-5 space-y-5">
              {/* Dynamic Scanning Status Card */}
              {isDemoScanning ? (
                <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-primary tracking-wide uppercase">Channel Scan Status</span>
                    <span className="text-xs font-bold text-white font-mono">{demoProgress}%</span>
                  </div>
                  <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-primary to-purple-600 h-full rounded-full transition-all duration-150" 
                      style={{ width: `${demoProgress}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-text-sec flex items-center gap-2">
                    <SpinnerIcon className="h-3 w-3 text-primary animate-spin" />
                    {demoStep === 1 && "Fetching video uploads..."}
                    {demoStep === 2 && "Analyzing description links..."}
                    {demoStep === 3 && "Finalizing broken link report!"}
                  </p>
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-white/5 border border-white/5 flex justify-between items-center">
                  <div>
                    <h4 className="text-xs font-bold text-text-sec uppercase tracking-wider">Target Channel</h4>
                    <p className="text-sm font-semibold mt-1">@{demoInput || 'gearscout-y1n'}</p>
                  </div>
                  <span className="px-3 py-1 text-xs font-semibold bg-green-500/10 border border-green-500/20 text-green-400 rounded-full">
                    Ready to Scan
                  </span>
                </div>
              )}

              {/* Scanned Video Card Preview */}
              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs font-semibold text-text-sec uppercase tracking-wider px-1">
                  <span>Videos Audited</span>
                  <span>Issues Detected</span>
                </div>

                <div className="rounded-xl border border-white/5 bg-dark-bg/60 p-4 space-y-4 relative overflow-hidden">
                  {/* Scan line effect */}
                  {isDemoScanning && (
                    <div className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent animate-scan-line pointer-events-none"></div>
                  )}

                  {mockVideos.map(video => (
                    <div key={video.title} className="space-y-3">
                      <div className="flex gap-3">
                        <img 
                          src={video.thumbnail} 
                          alt="" 
                          className="w-20 h-12 object-cover rounded-lg border border-white/5"
                        />
                        <div className="flex-grow min-w-0">
                          <h5 className="text-xs font-semibold text-white truncate">{video.title}</h5>
                          <p className="text-[11px] text-text-sec mt-1">6 Description links detected</p>
                        </div>
                      </div>

                      {/* Links list */}
                      <div className="space-y-1.5 pt-2 border-t border-white/5">
                        {video.links.map((link, idx) => (
                          <div 
                            key={link.url}
                            className={`flex justify-between items-center text-[11px] px-2.5 py-1.5 rounded-lg transition-all duration-300 ${
                              isDemoScanning && demoProgress < (idx + 1) * 15
                                ? 'opacity-30'
                                : link.ok 
                                  ? 'bg-green-500/5 text-green-400' 
                                  : 'bg-error-accent/5 text-error-accent'
                            }`}
                          >
                            <span className="font-mono truncate max-w-[200px]">{link.url}</span>
                            <div className="flex items-center gap-1.5">
                              {isDemoScanning && demoProgress < (idx + 1) * 15 ? (
                                <span className="w-1.5 h-1.5 rounded-full bg-gray-600 animate-pulse"></span>
                              ) : link.ok ? (
                                <>
                                  <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                                  <span className="font-semibold text-green-500">{link.status}</span>
                                </>
                              ) : (
                                <>
                                  <AlertTriangleIcon className="w-3.5 h-3.5 text-error-accent" />
                                  <span className="font-bold text-error-accent">{link.status}</span>
                                </>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Metrics Section */}
      <section className="relative z-10 border-y border-white/5 bg-dark-surface/30 backdrop-blur-sm py-12 reveal">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Stat Card 1 */}
          <div className="text-center md:border-r border-white/5 py-4 last:border-0 flex flex-col justify-center items-center">
            <span className="text-4xl sm:text-5xl font-heading font-extrabold text-white tracking-tight">
              {scannedVideoCount.toLocaleString()}+
            </span>
            <span className="text-sm font-semibold text-text-sec mt-2 tracking-wide uppercase">
              Videos Scanned
            </span>
          </div>

          {/* Stat Card 2 */}
          <div className="text-center md:border-r border-white/5 py-4 last:border-0 flex flex-col justify-center items-center">
            <span className="text-4xl sm:text-5xl font-heading font-extrabold text-error-accent tracking-tight">
              {brokenLinksCount.toLocaleString()}+
            </span>
            <span className="text-sm font-semibold text-text-sec mt-2 tracking-wide uppercase">
              Broken Links Found
            </span>
          </div>

          {/* Stat Card 3 */}
          <div className="text-center py-4 flex flex-col justify-center items-center">
            <span className="text-4xl sm:text-5xl font-heading font-extrabold text-primary tracking-tight">
              4.9/5
            </span>
            <span className="text-sm font-semibold text-text-sec mt-2 tracking-wide uppercase flex items-center gap-1.5">
              Creator Rating
              <span className="flex text-yellow-500 text-xs">★★★★★</span>
            </span>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section id="problem" className="relative z-10 max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32 flex flex-col lg:flex-row gap-16 items-center reveal">
        {/* Left Side Visual Indicator */}
        <div className="flex-1 w-full order-2 lg:order-1 max-w-lg lg:max-w-none">
          <div className="relative p-6 rounded-2xl bg-dark-surface border border-error-accent/20 overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 w-32 h-32 bg-error-accent/5 rounded-full filter blur-xl"></div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-white/5">
                <div className="flex items-center gap-2">
                  <AlertTriangleIcon className="w-5 h-5 text-error-accent animate-pulse" />
                  <span className="text-sm font-bold tracking-wider text-error-accent uppercase">Warning Diagnostic</span>
                </div>
                <span className="text-[11px] font-mono text-error-accent font-semibold px-2 py-0.5 rounded bg-error-accent/10">
                  Critical Impact
                </span>
              </div>

              {/* Warning Item 1 */}
              <div className="p-3.5 rounded-xl bg-error-accent/5 border border-error-accent/10 flex gap-4 items-start">
                <div className="p-2 rounded bg-error-accent/10 text-error-accent">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Affiliate Commission Drain</h4>
                  <p className="text-xs text-text-sec mt-1">Dead links to Amazon or other affiliate networks represent direct lost revenue every day.</p>
                </div>
              </div>

              {/* Warning Item 2 */}
              <div className="p-3.5 rounded-xl bg-white/5 border border-white/5 flex gap-4 items-start">
                <div className="p-2 rounded bg-white/5 text-yellow-500">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">YouTube SEO Penalty</h4>
                  <p className="text-xs text-text-sec mt-1">YouTube algorithms flag descriptions with broken or spammy links, lowering search rankings.</p>
                </div>
              </div>

              {/* Warning Item 3 */}
              <div className="p-3.5 rounded-xl bg-white/5 border border-white/5 flex gap-4 items-start">
                <div className="p-2 rounded bg-white/5 text-primary">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Broken Audience Trust</h4>
                  <p className="text-xs text-text-sec mt-1">Frustrated viewers clicking dead sponsorship URLs lowers long-term channel loyalty.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side Content */}
        <div className="flex-1 space-y-8 order-1 lg:order-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 text-xs font-semibold uppercase rounded-full bg-error-accent/10 border border-error-accent/20 text-error-accent">
            The Danger of Dead Links
          </div>

          <h2 className="text-3xl sm:text-4xl font-heading font-extrabold text-white tracking-tight leading-tight">
            How Broken Links Hurt Your Channel's Bottom Line
          </h2>

          <p className="text-text-sec text-base sm:text-lg leading-relaxed">
            As a creator, your description links are your digital storefront. Over time, links break—products get discontinued, domains expire, or sponsorship contracts terminate.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
            <div className="space-y-2">
              <span className="text-xs font-bold text-error-accent tracking-wider uppercase">SEO Danger</span>
              <p className="text-sm text-text-sec">A single dead link can signal low-quality metadata to search algorithms, limiting your organic growth.</p>
            </div>
            <div className="space-y-2">
              <span className="text-xs font-bold text-error-accent tracking-wider uppercase">Sponsor Friction</span>
              <p className="text-sm text-text-sec">Expired sponsor campaigns that still redirect to 404 pages create legal and financial conflicts.</p>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section id="how-it-works" className="relative z-10 py-24 lg:py-32 border-t border-white/5 bg-dark-surface/10 reveal">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-4 mb-20">
            <span className="text-xs font-bold uppercase tracking-wider text-primary">SaaS Simplified</span>
            <h2 className="text-3xl sm:text-4xl font-heading font-extrabold text-white tracking-tight">
              Scan Your Entire Channel in 3 Steps
            </h2>
            <p className="text-text-sec text-lg">
              No complicated integration, no passwords required. Quick and completely safe.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative">
            {/* Step 1 */}
            <div className="relative group p-8 rounded-2xl bg-dark-surface border border-white/5 hover:border-primary/20 transition-all duration-300 shadow-xl flex flex-col justify-between min-h-[300px]">
              <div>
                <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mb-6 group-hover:scale-110 transition-transform">
                  <span className="text-lg font-bold">01</span>
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Enter YouTube handle</h3>
                <p className="text-sm text-text-sec leading-relaxed">
                  Type in your YouTube creator username or channel link. Our system automatically fetches your public videos and descriptions securely.
                </p>
              </div>
              <div className="mt-8 text-xs font-semibold text-primary/80 group-hover:text-primary transition-colors flex items-center gap-1.5">
                No login required
                <span>→</span>
              </div>
            </div>

            {/* Step 2 */}
            <div className="relative group p-8 rounded-2xl bg-dark-surface border border-white/5 hover:border-primary/20 transition-all duration-300 shadow-xl flex flex-col justify-between min-h-[300px]">
              <div>
                <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 mb-6 group-hover:scale-110 transition-transform">
                  <span className="text-lg font-bold">02</span>
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Deep Cloud Scan</h3>
                <p className="text-sm text-text-sec leading-relaxed">
                  Our cloud crawlers extract every link in every video. We run rapid diagnostics, checking responses for 404s, DNS failures, or offline servers.
                </p>
              </div>
              <div className="mt-8 text-xs font-semibold text-purple-400 group-hover:text-purple-300 transition-colors flex items-center gap-1.5">
                Completed in seconds
                <span>→</span>
              </div>
            </div>

            {/* Step 3 */}
            <div className="relative group p-8 rounded-2xl bg-dark-surface border border-white/5 hover:border-primary/20 transition-all duration-300 shadow-xl flex flex-col justify-between min-h-[300px]">
              <div>
                <div className="w-12 h-12 rounded-xl bg-error-accent/10 border border-error-accent/20 flex items-center justify-center text-error-accent mb-6 group-hover:scale-110 transition-transform">
                  <span className="text-lg font-bold">03</span>
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Instant Broken Link Report</h3>
                <p className="text-sm text-text-sec leading-relaxed">
                  Get a clear, color-coded report grouping affected videos, broken URLs, and diagnostic information to easily fix them in YouTube Studio.
                </p>
              </div>
              <div className="mt-8 text-xs font-semibold text-error-accent group-hover:text-error-accent/80 transition-colors flex items-center gap-1.5">
                Full report exportable
                <span>→</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative z-10 py-24 lg:py-32 max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 reveal">
        <div className="flex flex-col lg:flex-row gap-12 items-start justify-between mb-20">
          <div className="space-y-4 max-w-xl">
            <span className="text-xs font-bold uppercase tracking-wider text-primary">Powerful Capabilities</span>
            <h2 className="text-3xl sm:text-4xl font-heading font-extrabold text-white tracking-tight">
              Designed For High-Growth Channels
            </h2>
            <p className="text-text-sec text-base">
              Everything you need to audit, secure, and monitor your YouTube portfolio without overhead.
            </p>
          </div>
          <button 
            onClick={onStartFreeScan}
            className="px-6 py-3 rounded-xl bg-primary hover:bg-primary-hover font-semibold text-sm transition-all duration-200"
          >
            Run A Free Scan Now
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 1 */}
          <div className="p-6 rounded-2xl bg-dark-surface border border-white/5 hover:border-white/10 transition-all duration-300 shadow-xl space-y-4">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              <LinkIcon className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white">Detect Dead Links</h3>
            <p className="text-xs text-text-sec leading-relaxed">
              Find 404s, broken redirection pathways, dead affiliate IDs, and expired web hosting.
            </p>
          </div>

          {/* Card 2 */}
          <div className="p-6 rounded-2xl bg-dark-surface border border-white/5 hover:border-white/10 transition-all duration-300 shadow-xl space-y-4">
            <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-white">High-Speed Crawl</h3>
            <p className="text-xs text-text-sec leading-relaxed">
              Audit up to 500 videos within seconds. Built with parallel execution nodes for lightning audits.
            </p>
          </div>

          {/* Card 3 */}
          <div className="p-6 rounded-2xl bg-dark-surface border border-white/5 hover:border-white/10 transition-all duration-300 shadow-xl space-y-4">
            <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center text-green-400">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-white">No Channel Access</h3>
            <p className="text-xs text-text-sec leading-relaxed">
              Completely read-only audit. We never ask for password access to your YouTube channel.
            </p>
          </div>

          {/* Card 4 */}
          <div className="p-6 rounded-2xl bg-dark-surface border border-white/5 hover:border-white/10 transition-all duration-300 shadow-xl space-y-4">
            <div className="w-10 h-10 rounded-lg bg-error-accent/10 flex items-center justify-center text-error-accent">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-white">Detailed Exports</h3>
            <p className="text-xs text-text-sec leading-relaxed">
              Export broken link records into CSV or PDF formats to hand off easily to editors or virtual assistants.
            </p>
          </div>
        </div>
      </section>

      {/* Dashboard Preview Section (MOST IMPORTANT) */}
      <section id="dashboard-preview" className="relative z-10 py-24 lg:py-32 border-t border-white/5 bg-dark-surface/10 overflow-hidden reveal">
        {/* Decorative elements */}
        <div className="absolute top-[20%] right-[10%] w-[300px] h-[300px] bg-primary/5 rounded-full filter blur-[100px] pointer-events-none"></div>
        <div className="absolute bottom-[20%] left-[10%] w-[300px] h-[300px] bg-purple-500/5 rounded-full filter blur-[100px] pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-primary">Product Showcase</span>
            <h2 className="text-3xl sm:text-4xl font-heading font-extrabold text-white tracking-tight">
              An Auditing Dashboard Built For Professionals
            </h2>
            <p className="text-text-sec text-base">
              Experience the core analytics dashboard of TubeLink Audit. Monitor video performance, configure regular scans, and export broken link lists instantly.
            </p>
          </div>

          {/* Interactive UI Box */}
          <div className="relative rounded-2xl bg-dark-surface border border-white/10 overflow-hidden shadow-2xl">
            <div className="flex flex-col lg:flex-row min-h-[500px]">
              
              {/* Sidebar */}
              <div className="w-full lg:w-60 bg-dark-bg/60 border-r border-white/5 p-4 space-y-6">
                {/* User Info */}
                <div className="flex items-center gap-3 px-2 py-1">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary to-purple-600 flex items-center justify-center text-xs font-bold">
                    GS
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white truncate max-w-[130px]">Gear Scout</h4>
                    <p className="text-[10px] text-text-sec">Professional Plan</p>
                  </div>
                </div>

                {/* Sidebar Navigation Links */}
                <div className="space-y-1">
                  <button className="w-full flex items-center gap-3 px-3 py-2 text-xs font-semibold rounded-lg bg-primary/10 text-primary border border-primary/20 text-left">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2v-4zM14 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2v-4z" />
                    </svg>
                    <span>Dashboard Overview</span>
                  </button>
                  <button className="w-full flex items-center gap-3 px-3 py-2 text-xs font-semibold text-text-sec hover:bg-white/5 hover:text-white rounded-lg transition-all text-left">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    <span>Scan Analytics</span>
                  </button>
                  <button className="w-full flex items-center gap-3 px-3 py-2 text-xs font-semibold text-text-sec hover:bg-white/5 hover:text-white rounded-lg transition-all text-left">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                    </svg>
                    <span>Scan Settings</span>
                  </button>
                  <button className="w-full flex items-center gap-3 px-3 py-2 text-xs font-semibold text-text-sec hover:bg-white/5 hover:text-white rounded-lg transition-all text-left">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                    <span>Alert Configurations</span>
                  </button>
                </div>
              </div>

              {/* Main Content Area */}
              <div className="flex-grow p-6 space-y-6">
                
                {/* Head Overview bar */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-white/5">
                  <div>
                    <h3 className="text-lg font-bold text-white">Dashboard Overview</h3>
                    <p className="text-xs text-text-sec">Last complete audit: Just now</p>
                  </div>
                  <button className="px-4 py-2 text-xs font-bold rounded-lg bg-primary hover:bg-primary-hover transition-colors flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    <span>Export CSV Report</span>
                  </button>
                </div>

                {/* Grid Analytics */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                    <h5 className="text-[10px] font-bold uppercase tracking-wider text-text-sec">Scan Coverage</h5>
                    <p className="text-2xl font-extrabold text-white mt-1">20 Videos</p>
                    <span className="text-[10px] text-green-400 mt-1 block">✔ 100% indexed uploads</span>
                  </div>
                  <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                    <h5 className="text-[10px] font-bold uppercase tracking-wider text-text-sec">Links Monitored</h5>
                    <p className="text-2xl font-extrabold text-white mt-1">128 URLs</p>
                    <span className="text-[10px] text-text-sec mt-1 block">Average 6.4 links/description</span>
                  </div>
                  <div className="p-4 rounded-xl bg-error-accent/5 border border-error-accent/15">
                    <h5 className="text-[10px] font-bold uppercase tracking-wider text-error-accent">Broken Links</h5>
                    <p className="text-2xl font-extrabold text-error-accent mt-1">3 Detected</p>
                    <span className="text-[10px] text-error-accent mt-1 block">⚡ Impacting 1 video description</span>
                  </div>
                </div>

                {/* Inner Scan table view mockup */}
                <div className="rounded-xl border border-white/5 overflow-hidden bg-dark-bg/40">
                  <div className="p-3.5 bg-dark-bg/60 border-b border-white/5 text-xs font-bold text-text-sec flex justify-between items-center">
                    <span>Audit Breakdown & Details</span>
                    <span className="text-[10px] text-error-accent">3 Errors Pending Resolution</span>
                  </div>

                  <div className="p-4 space-y-4">
                    {/* Item */}
                    <div className="space-y-3">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                        <div className="flex gap-3">
                          <div className="w-16 h-10 bg-gray-800 rounded overflow-hidden flex-shrink-0">
                            <img src="https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&w=100&q=80" alt="" className="w-full h-full object-cover" />
                          </div>
                          <div>
                            <h4 className="text-xs font-bold text-white">Top 5 Best Backpacking Tents for Ultralight Camping!</h4>
                            <p className="text-[10px] text-text-sec mt-0.5">Published: Feb 25, 2025</p>
                          </div>
                        </div>
                        <span className="text-[10px] font-semibold px-2 py-0.5 bg-error-accent/10 border border-error-accent/20 text-error-accent rounded">
                          3 Broken Links
                        </span>
                      </div>

                      {/* Diagnostic list */}
                      <div className="space-y-1.5 pl-3 border-l-2 border-error-accent/40">
                        
                        <div className="flex justify-between items-center text-[10px] bg-white/5 px-2.5 py-1.5 rounded">
                          <div className="flex items-center gap-2">
                            <span className="text-error-accent font-bold">UNREACHABLE</span>
                            <span className="font-mono text-text-sec">https://amzefn.to/435hl1M</span>
                          </div>
                          <span className="text-text-sec text-[9px]">DNS Resolve Failed</span>
                        </div>

                        <div className="flex justify-between items-center text-[10px] bg-white/5 px-2.5 py-1.5 rounded">
                          <div className="flex items-center gap-2">
                            <span className="text-error-accent font-bold">UNREACHABLE</span>
                            <span className="font-mono text-text-sec">https://amsvzn.to/3EUO</span>
                          </div>
                          <span className="text-text-sec text-[9px]">DNS Resolve Failed</span>
                        </div>

                        <div className="flex justify-between items-center text-[10px] bg-error-accent/5 px-2.5 py-1.5 rounded border border-error-accent/10">
                          <div className="flex items-center gap-2">
                            <span className="text-error-accent font-bold">404</span>
                            <span className="font-mono text-text-sec">http://thesoloentrepreneur.in/wp-admin-error</span>
                          </div>
                          <span className="text-error-accent font-semibold text-[9px]">Page Not Found</span>
                        </div>

                      </div>
                    </div>
                  </div>
                </div>

              </div>

            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="relative z-10 py-24 lg:py-32 max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 border-t border-white/5 reveal">
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-20">
          <span className="text-xs font-bold uppercase tracking-wider text-primary">Pricing Plans</span>
          <h2 className="text-3xl sm:text-4xl font-heading font-extrabold text-white tracking-tight">
            Plans for Creators of All Sizes
          </h2>
          <p className="text-text-sec text-base">
            No locked contracts. Upgrade, downgrade, or cancel at any time.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Card 1: Free */}
          <div className="p-8 rounded-2xl bg-dark-surface border border-white/5 hover:border-white/10 transition-all duration-300 shadow-xl space-y-6 flex flex-col justify-between">
            <div className="space-y-4">
              <div>
                <h4 className="text-lg font-bold text-white">Starter Scan</h4>
                <p className="text-xs text-text-sec mt-1">Perfect for new creators getting started.</p>
              </div>
              
              <div className="flex items-baseline">
                <span className="text-4xl font-heading font-extrabold text-white">$0</span>
                <span className="text-xs font-semibold text-text-sec ml-2">/ forever</span>
              </div>

              <div className="space-y-3 pt-4 border-t border-white/5 text-xs text-text-sec">
                <div className="flex items-center gap-2.5">
                  <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>1 Free Scan</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Up to 30 videos audited</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Basic online diagnostics report</span>
                </div>
              </div>
            </div>

            <button 
              onClick={onStartFreeScan}
              className="w-full py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold text-sm transition-all duration-200"
            >
              Start Free Scan
            </button>
          </div>

          {/* Card 2: Pro */}
          <div className="relative p-8 rounded-2xl bg-dark-surface border border-primary/40 hover:border-primary transition-all duration-300 shadow-2xl space-y-6 flex flex-col justify-between overflow-hidden">
            <div className="absolute top-0 right-0 px-3 py-1 bg-primary text-[10px] font-bold uppercase tracking-wider rounded-bl-xl text-white">
              Most Popular
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="text-lg font-bold text-white">Professional Creator</h4>
                <p className="text-xs text-text-sec mt-1">For channels reliant on sponsor & affiliate income.</p>
              </div>
              
              <div className="flex items-baseline">
                <span className="text-4xl font-heading font-extrabold text-white">$19</span>
                <span className="text-xs font-semibold text-text-sec ml-2">/ month</span>
              </div>

              <div className="space-y-3 pt-4 border-t border-white/5 text-xs text-text-sec">
                <div className="flex items-center gap-2.5">
                  <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-white font-medium">Unlimited deep scans</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-white font-medium">500+ videos audited per crawl</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Export Reports (CSV/PDF)</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Future monitoring & email alerts</span>
                </div>
              </div>
            </div>

            <button 
              onClick={onStartFreeScan}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-primary to-purple-600 hover:shadow-lg hover:shadow-primary/25 text-white font-semibold text-sm transition-all duration-200"
            >
              Get Professional Plan
            </button>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="relative z-10 py-24 lg:py-32 max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 border-t border-white/5 reveal">
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-20">
          <span className="text-xs font-bold uppercase tracking-wider text-primary">Creator Reviews</span>
          <h2 className="text-3xl sm:text-4xl font-heading font-extrabold text-white tracking-tight">
            Trusted by the Web's Best Creators
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="p-6 rounded-2xl bg-dark-surface border border-white/5 space-y-6">
            <p className="text-sm text-text-sec italic leading-relaxed">
              "TubeLink Audit helped me reclaim hundreds of dollars in missing Amazon affiliate revenue within minutes. Truly indispensable!"
            </p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-sm">
                A
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Alex Gear Reviews</h4>
                <p className="text-[10px] text-text-sec">120K Subscribers</p>
              </div>
            </div>
          </div>

          {/* Card 2 */}
          <div className="p-6 rounded-2xl bg-dark-surface border border-white/5 space-y-6">
            <p className="text-sm text-text-sec italic leading-relaxed">
              "Simple, secure, and incredibly fast. I managed to scan over 300 sponsorship videos without ever inputting any channel passwords."
            </p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center font-bold text-sm">
                S
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Sarah's Tech Journey</h4>
                <p className="text-[10px] text-text-sec">85K Subscribers</p>
              </div>
            </div>
          </div>

          {/* Card 3 */}
          <div className="p-6 rounded-2xl bg-dark-surface border border-white/5 space-y-6">
            <p className="text-sm text-text-sec italic leading-relaxed">
              "A must-have utility tool for digital media teams. We caught multiple typos on redirect URLs that were hurting our SEO rankings."
            </p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center font-bold text-sm">
                D
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Design & Tech Studio</h4>
                <p className="text-[10px] text-text-sec">450K Subscribers</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="relative z-10 pt-24 pb-12 max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 reveal">
        <div className="relative rounded-3xl bg-gradient-to-tr from-dark-surface to-primary/10 border border-primary/20 p-12 lg:p-20 text-center overflow-hidden shadow-2xl">
          {/* Subtle Glow Orb inside CTA */}
          <div className="absolute top-[-50%] left-[50%] -translate-x-[50%] w-[300px] h-[300px] bg-primary/10 rounded-full filter blur-[80px] pointer-events-none"></div>

          <div className="relative max-w-3xl mx-auto space-y-6">
            <h2 className="text-3xl sm:text-5xl font-heading font-extrabold tracking-tight text-white">
              Stop Losing Revenue From Broken Links
            </h2>
            <p className="text-text-sec text-base sm:text-lg max-w-xl mx-auto">
              Scan your YouTube channel in under 60 seconds. Secure your commissions and protect your search authority today.
            </p>
            <div className="pt-4">
              <button 
                onClick={onStartFreeScan}
                className="px-8 py-4 rounded-xl bg-gradient-to-r from-primary to-purple-600 font-bold text-base hover:shadow-lg hover:shadow-primary/30 transition-all duration-200"
              >
                Start Free Scan
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/5 pt-8 pb-6 bg-dark-bg/90">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-gradient-to-tr from-primary to-purple-600 shadow-md">
              <LinkIcon className="h-4.5 w-4.5 text-white" />
            </div>
            <span className="text-base font-heading font-bold tracking-tight text-white">
              TubeLink <span className="text-primary">Audit</span>
            </span>
          </div>

          <p className="text-xs text-text-sec">
            © {new Date().getFullYear()} TubeLink Audit. All rights reserved. Built for professional YouTube creators.
          </p>

          <div className="flex space-x-6 text-xs text-text-sec">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
            <a href="#testimonials" className="hover:text-white transition-colors">Privacy</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
