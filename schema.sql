-- 1. Create a table to store the scanned channels
CREATE TABLE public.scans (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    channel_handle TEXT NOT NULL,
    total_videos_scanned INTEGER DEFAULT 0,
    total_broken_links INTEGER DEFAULT 0,
    status TEXT DEFAULT 'completed', -- 'running', 'completed', 'failed'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Create a table to store individual broken links found during a scan
CREATE TABLE public.broken_links (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    scan_id UUID REFERENCES public.scans(id) ON DELETE CASCADE,
    video_id TEXT NOT NULL,
    video_title TEXT NOT NULL,
    video_thumbnail TEXT,
    broken_url TEXT NOT NULL,
    error_status TEXT, -- e.g., '404', 'Unreachable'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Set up Row Level Security (RLS) so users can only see their own scans
ALTER TABLE public.scans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.broken_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own scans" ON public.scans
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own scans" ON public.scans
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own broken links" ON public.broken_links
    FOR SELECT USING (
        scan_id IN (SELECT id FROM public.scans WHERE user_id = auth.uid())
    );

CREATE POLICY "Users can insert their own broken links" ON public.broken_links
    FOR INSERT WITH CHECK (
        scan_id IN (SELECT id FROM public.scans WHERE user_id = auth.uid())
    );
