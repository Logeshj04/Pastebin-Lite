import { Redis } from '@upstash/redis';
import type { PasteData } from '../types.js';
import { env } from '../config/env.js';

// Initialize Redis client with validated environment variables
let redis: Redis;

try {
  if (!env.UPSTASH_REDIS_REST_URL || !env.UPSTASH_REDIS_REST_TOKEN) {
    throw new Error('Redis credentials not found in environment variables');
  }
  
  redis = new Redis({
    url: env.UPSTASH_REDIS_REST_URL,
    token: env.UPSTASH_REDIS_REST_TOKEN,
  });
} catch (error) {
  console.error('❌ Failed to initialize Redis client:', error);
  throw error;
}

export async function createPaste(id: string, data: PasteData, ttlSeconds: number): Promise<void> {
  const key = `paste:${id}`;
  await redis.setex(key, ttlSeconds, JSON.stringify(data));
}

export async function createPasteWithoutTTL(id: string, data: PasteData): Promise<void> {
  const key = `paste:${id}`;
  await redis.set(key, JSON.stringify(data));
}

export async function getPaste(id: string): Promise<PasteData | null> {
  const key = `paste:${id}`;
  const data = await redis.get(key);
  
  if (!data) {
    return null;
  }
  
  // Handle both string and already-parsed object responses
  let paste: PasteData;
  if (typeof data === 'string') {
    try {
      paste = JSON.parse(data) as PasteData;
    } catch (error) {
      console.error('Error parsing paste data:', error);
      return null;
    }
  } else {
    paste = data as PasteData;
  }
  
  // Validate paste data structure
  if (!paste || typeof paste !== 'object') {
    console.error('Invalid paste data: not an object');
    return null;
  }
  
  // Ensure all required fields exist with defaults
  const validatedPaste: PasteData = {
    content: typeof paste.content === 'string' ? paste.content : '',
    ttl_seconds: typeof paste.ttl_seconds === 'number' ? paste.ttl_seconds : 0,
    max_views: typeof paste.max_views === 'number' ? paste.max_views : 0,
    created_at: typeof paste.created_at === 'number' ? paste.created_at : Date.now(),
    views: typeof paste.views === 'number' ? paste.views : 0,
  };
  
  return validatedPaste;
}

export async function incrementViews(id: string): Promise<number> {
  const key = `paste:${id}`;
  const data = await redis.get(key);
  
  if (!data) {
    throw new Error('Paste not found');
  }
  
  // Handle both string and already-parsed object responses
  let paste: PasteData;
  if (typeof data === 'string') {
    try {
      paste = JSON.parse(data) as PasteData;
    } catch (error) {
      console.error('Error parsing paste data:', error);
      throw new Error('Invalid paste data format');
    }
  } else {
    paste = data as PasteData;
  }
  
  paste.views += 1;
  
  // Get remaining TTL
  const ttl = await redis.ttl(key);
  
  if (ttl > 0) {
    await redis.setex(key, ttl, JSON.stringify(paste));
  } else {
    // If TTL is -1 (no expiry) or -2 (key doesn't exist), just set without expiry
    await redis.set(key, JSON.stringify(paste));
  }
  
  return paste.views;
}

export async function deletePaste(id: string): Promise<void> {
  const key = `paste:${id}`;
  await redis.del(key);
}

export async function updatePasteContent(id: string, newContent: string): Promise<boolean> {
  const key = `paste:${id}`;
  const data = await redis.get(key);
  
  if (!data) {
    return false;
  }
  
  // Handle both string and already-parsed object responses
  let paste: PasteData;
  if (typeof data === 'string') {
    try {
      paste = JSON.parse(data) as PasteData;
    } catch (error) {
      console.error('Error parsing paste data:', error);
      return false;
    }
  } else {
    paste = data as PasteData;
  }
  
  // Update content
  paste.content = newContent.trim();
  
  // Get remaining TTL
  const ttl = await redis.ttl(key);
  
  if (ttl > 0) {
    await redis.setex(key, ttl, JSON.stringify(paste));
  } else {
    // If TTL is -1 (no expiry) or -2 (key doesn't exist), just set without expiry
    await redis.set(key, JSON.stringify(paste));
  }
  
  return true;
}

export async function checkRedisConnection(): Promise<boolean> {
  try {
    // Check if Redis client is initialized
    if (!redis) {
      console.error('Redis client not initialized');
      return false;
    }
    
    // Check if credentials are set
    if (!env.UPSTASH_REDIS_REST_URL || !env.UPSTASH_REDIS_REST_TOKEN) {
      console.error('Redis credentials not found in environment variables');
      return false;
    }
    
    await redis.ping();
    return true;
  } catch (error) {
    console.error('Redis connection error:', error);
    return false;
  }
}

export { redis };

