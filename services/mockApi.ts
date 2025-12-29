import { Video, BrokenLink, ScanResult } from '../types';

const YOUTUBE_API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY || 'AIzaSyBGoHlyBKtxRphLZkthRTlqMu2Ux7HnhGs';
const YOUTUBE_API_BASE = 'https://www.googleapis.com/youtube/v3';

export const fetchVideosByUsername = async (username: string): Promise<Video[]> => {
  try {
    const channelResponse = await fetch(
      `${YOUTUBE_API_BASE}/search?part=snippet&type=channel&q=${encodeURIComponent(username)}&maxResults=1&key=${YOUTUBE_API_KEY}`
    ).catch(() => null);

    if (!channelResponse) {
      throw new Error('Failed to connect to YouTube API');
    }

    const channelData = await channelResponse.json().catch(() => ({}));

    if (channelData.error) {
      throw new Error(channelData.error.message || 'YouTube API Error');
    }

    if (!channelData.items?.length) {
      throw new Error('Channel not found');
    }

    const channelId = channelData.items[0].snippet.channelId;

    const videosResponse = await fetch(
      `${YOUTUBE_API_BASE}/search?part=snippet&channelId=${channelId}&type=video&maxResults=20&order=date&key=${YOUTUBE_API_KEY}`
    ).catch(() => null);

    if (!videosResponse) {
      throw new Error('Failed to fetch videos');
    }

    const videosData = await videosResponse.json().catch(() => ({}));

    if (videosData.error) {
      throw new Error(videosData.error.message || 'YouTube API Error');
    }

    if (!videosData.items?.length) {
      return [];
    }

    const videoIds = videosData.items.map((item: any) => item.id.videoId).join(',');
    const detailsResponse = await fetch(
      `${YOUTUBE_API_BASE}/videos?part=snippet&id=${videoIds}&key=${YOUTUBE_API_KEY}`
    ).catch(() => null);

    if (!detailsResponse) {
      throw new Error('Failed to fetch video details');
    }

    const detailsData = await detailsResponse.json().catch(() => ({}));

    if (detailsData.error) {
      throw new Error(detailsData.error.message || 'YouTube API Error');
    }

    return detailsData.items?.map((item: any) => ({
      id: item.id,
      title: item.snippet.title,
      thumbnailUrl: item.snippet.thumbnails.medium.url,
      description: item.snippet.description || ''
    })) || [];
  } catch (error: any) {
    throw new Error(error.message || 'Failed to fetch videos');
  }
};

export const checkLinks = async (urls: string[]): Promise<BrokenLink[]> => {
  const checkPromises = urls.map(url => checkSingleLink(url));
  const results = await Promise.all(checkPromises);
  return results.filter((result): result is BrokenLink => result !== null);
};

async function checkSingleLink(url: string): Promise<BrokenLink | null> {
  try {
    const response = await fetch('/api/check-link', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url })
    });

    const data = await response.json();

    if (!data.ok) {
      return {
        url,
        status: data.status,
        statusText: data.error || 'Link is broken',
        errorType: data.status === 0 ? 'unreachable' : 'http-error'
      };
    }

    return null;
  } catch (error: any) {
    return {
      url,
      status: 0,
      statusText: 'Failed to check link',
      errorType: 'unreachable'
    };
  }
}

export const performScan = async (username: string): Promise<ScanResult[]> => {
  const videos = await fetchVideosByUsername(username);
  const urlRegex = /(https?:\/\/[^\s]+)/g;

  const videoPromises = videos.map(async (video) => {
    const urls = video.description.match(urlRegex) || [];
    if (urls.length > 0) {
      const uniqueUrls = [...new Set(urls)];
      const brokenLinks = await checkLinks(uniqueUrls);
      if (brokenLinks.length > 0) {
        return { video, brokenLinks };
      }
    }
    return null;
  });

  const results = await Promise.all(videoPromises);
  return results.filter((result): result is ScanResult => result !== null);
};
