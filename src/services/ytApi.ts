import { useState, useEffect, useCallback } from 'react';

// ---------- API key ----------
const KEY_STORE = 'yt_api_key';
export const getKey = (): string => {
  try {
    return localStorage.getItem(KEY_STORE) || ((import.meta as any).env?.VITE_YT_API_KEY as string) || '';
  } catch {
    return '';
  }
};
export const setKey = (k: string) => {
  try { localStorage.setItem(KEY_STORE, k.trim()); } catch { /* ignore */ }
};

// ---------- Types ----------
export interface YTVideo {
  id: string;
  title: string;
  description: string;
  thumb: string;
  channelId: string;
  channelTitle: string;
  duration: string;
  durationSec: number;
  views: string;
  publishedAt: string;
  ago: string;
  likes: string;
  commentCount: string;
}
export interface YTChannel { id: string; title: string; thumb: string; subs?: string; }
export interface YTComment { id: string; author: string; avatar: string; text: string; likes: string; ago: string; }

// ---------- Formatting ----------
export const compact = (n: number): string => {
  if (!isFinite(n)) return '0';
  if (n >= 1e9) return (n / 1e9).toFixed(n >= 1e10 ? 0 : 1).replace(/\.0$/, '') + 'B';
  if (n >= 1e6) return (n / 1e6).toFixed(n >= 1e7 ? 0 : 1).replace(/\.0$/, '') + 'M';
  if (n >= 1e3) return (n / 1e3).toFixed(n >= 1e4 ? 0 : 1).replace(/\.0$/, '') + 'K';
  return String(n);
};

const parseDuration = (iso: string): number => {
  const m = /^P(?:(\d+)D)?T?(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/.exec(iso || '');
  if (!m) return 0;
  return (+(m[1] || 0)) * 86400 + (+(m[2] || 0)) * 3600 + (+(m[3] || 0)) * 60 + (+(m[4] || 0));
};

export const fmtDuration = (s: number): string => {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  const pad = (x: number) => String(x).padStart(2, '0');
  return h > 0 ? `${h}:${pad(m)}:${pad(sec)}` : `${m}:${pad(sec)}`;
};

export const timeAgo = (iso: string): string => {
  const t = new Date(iso).getTime();
  if (!t) return '';
  const diff = Math.max(0, (Date.now() - t) / 1000);
  const units: [number, string][] = [[31536000, 'year'], [2592000, 'month'], [604800, 'week'], [86400, 'day'], [3600, 'hour'], [60, 'minute']];
  for (const [secs, name] of units) {
    if (diff >= secs) {
      const n = Math.floor(diff / secs);
      return `${n} ${name}${n > 1 ? 's' : ''} ago`;
    }
  }
  return 'Just now';
};

// ---------- Fetch helper with small cache ----------
const cache = new Map<string, { t: number; v: any }>();
const TTL = 10 * 60 * 1000;

async function api(path: string, params: Record<string, string | number | undefined>): Promise<any> {
  const key = getKey();
  if (!key) throw new Error('NO_KEY');
  const url = new URL('https://www.googleapis.com/youtube/v3/' + path);
  Object.entries({ ...params, key }).forEach(([k, v]) => {
    if (v !== undefined && v !== '') url.searchParams.set(k, String(v));
  });
  const ck = url.toString();
  const hit = cache.get(ck);
  if (hit && Date.now() - hit.t < TTL) return hit.v;
  const res = await fetch(ck);
  let json: any = {};
  try { json = await res.json(); } catch { /* ignore */ }
  if (!res.ok) throw new Error(json?.error?.message || `Request failed (${res.status})`);
  cache.set(ck, { t: Date.now(), v: json });
  return json;
}

const region = (): string => {
  try {
    const r = (navigator.language || 'en-US').split('-')[1];
    return (r || 'US').toUpperCase();
  } catch { return 'US'; }
};

const mapVideo = (it: any): YTVideo => {
  const sn = it.snippet || {};
  const st = it.statistics || {};
  const sec = parseDuration(it.contentDetails?.duration || '');
  const th = sn.thumbnails || {};
  return {
    id: typeof it.id === 'string' ? it.id : it.id?.videoId,
    title: sn.title || '',
    description: sn.description || '',
    thumb: (th.high || th.medium || th.default || {}).url || '',
    channelId: sn.channelId || '',
    channelTitle: sn.channelTitle || '',
    durationSec: sec,
    duration: sec ? fmtDuration(sec) : '',
    views: st.viewCount !== undefined ? compact(+st.viewCount) + ' views' : '',
    publishedAt: sn.publishedAt || '',
    ago: timeAgo(sn.publishedAt || ''),
    likes: st.likeCount !== undefined ? compact(+st.likeCount) : 'Like',
    commentCount: st.commentCount !== undefined ? compact(+st.commentCount) : '',
  };
};

// ---------- Public API ----------
export async function details(ids: string[]): Promise<YTVideo[]> {
  const out: YTVideo[] = [];
  for (let i = 0; i < ids.length; i += 50) {
    const j = await api('videos', { part: 'snippet,contentDetails,statistics', id: ids.slice(i, i + 50).join(',') });
    out.push(...(j.items || []).map(mapVideo));
  }
  return out;
}

export async function trending(categoryId?: string, pageToken?: string): Promise<{ items: YTVideo[]; next?: string }> {
  try {
    const j = await api('videos', {
      part: 'snippet,contentDetails,statistics',
      chart: 'mostPopular',
      regionCode: region(),
      maxResults: 24,
      videoCategoryId: categoryId,
      pageToken,
    });
    return { items: (j.items || []).map(mapVideo), next: j.nextPageToken };
  } catch (e: any) {
    if (categoryId && /chart|category/i.test(e?.message || '')) return { items: [] };
    throw e;
  }
}

export async function search(q: string, pageToken?: string, extra: Record<string, string> = {}): Promise<{ items: YTVideo[]; next?: string }> {
  const j = await api('search', { part: 'snippet', type: 'video', q, maxResults: 20, regionCode: region(), pageToken, ...extra });
  const ids = (j.items || []).map((x: any) => x.id?.videoId).filter(Boolean);
  const items = ids.length ? await details(ids) : [];
  return { items, next: j.nextPageToken };
}

export async function shorts(): Promise<YTVideo[]> {
  const r = await search('#shorts', undefined, { videoDuration: 'short', order: 'viewCount' });
  return r.items.filter((v) => v.durationSec > 0 && v.durationSec <= 90);
}

export async function uploads(channelIds: string[]): Promise<YTVideo[]> {
  const ids: string[] = [];
  await Promise.all(
    channelIds.slice(0, 15).map(async (cid) => {
      if (!cid.startsWith('UC')) return;
      try {
        const j = await api('playlistItems', { part: 'contentDetails', playlistId: 'UU' + cid.slice(2), maxResults: 6 });
        (j.items || []).forEach((x: any) => x.contentDetails?.videoId && ids.push(x.contentDetails.videoId));
      } catch { /* skip channel */ }
    })
  );
  if (!ids.length) return [];
  const vids = await details(Array.from(new Set(ids)));
  return vids.sort((a, b) => +new Date(b.publishedAt) - +new Date(a.publishedAt));
}

const chCache = new Map<string, YTChannel>();
export async function channelInfo(ids: string[]): Promise<Record<string, YTChannel>> {
  const need = Array.from(new Set(ids.filter(Boolean))).filter((i) => !chCache.has(i));
  for (let i = 0; i < need.length; i += 50) {
    try {
      const j = await api('channels', { part: 'snippet,statistics', id: need.slice(i, i + 50).join(',') });
      (j.items || []).forEach((c: any) => {
        const th = c.snippet?.thumbnails || {};
        chCache.set(c.id, {
          id: c.id,
          title: c.snippet?.title || '',
          thumb: (th.medium || th.default || {}).url || '',
          subs: c.statistics?.hiddenSubscriberCount ? '' : compact(+(c.statistics?.subscriberCount || 0)) + ' subscribers',
        });
      });
    } catch { /* ignore */ }
  }
  const out: Record<string, YTChannel> = {};
  ids.forEach((i) => { const c = chCache.get(i); if (c) out[i] = c; });
  return out;
}

export async function comments(videoId: string): Promise<YTComment[]> {
  try {
    const j = await api('commentThreads', { part: 'snippet', videoId, maxResults: 25, order: 'relevance', textFormat: 'plainText' });
    return (j.items || []).map((t: any) => {
      const c = t.snippet?.topLevelComment?.snippet || {};
      return {
        id: t.id,
        author: c.authorDisplayName || '',
        avatar: c.authorProfileImageUrl || '',
        text: c.textDisplay || '',
        likes: c.likeCount ? compact(+c.likeCount) : '',
        ago: timeAgo(c.publishedAt || ''),
      };
    });
  } catch {
    return []; // comments disabled or unavailable
  }
}

// ---------- Local storage helpers ----------
export function useLocal<T>(key: string, initial: T): [T, (v: T | ((p: T) => T)) => void] {
  const [val, setVal] = useState<T>(() => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? (JSON.parse(raw) as T) : initial;
    } catch { return initial; }
  });
  const set = useCallback((v: T | ((p: T) => T)) => {
    setVal((prev) => {
      const next = typeof v === 'function' ? (v as (p: T) => T)(prev) : v;
      try { localStorage.setItem(key, JSON.stringify(next)); } catch { /* ignore */ }
      return next;
    });
  }, [key]);
  return [val, set];
}

export function useChannelThumbs(videos: YTVideo[]): Record<string, YTChannel> {
  const [map, setMap] = useState<Record<string, YTChannel>>({});
  const sig = videos.map((v) => v.channelId).join(',');
  useEffect(() => {
    let alive = true;
    if (!videos.length) return;
    channelInfo(videos.map((v) => v.channelId)).then((m) => alive && setMap(m));
    return () => { alive = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sig]);
  return map;
}
