import express from 'express';
import { createPaste, createPasteWithoutTTL, getPaste, incrementViews, checkRedisConnection, updatePasteContent } from '../services/redis.js';
import { generatePasteId } from '../utils/idGenerator.js';
import type { CreatePasteRequest, CreatePasteResponse, CreateMultiplePastesRequest, CreateMultiplePastesResponse, GetPasteResponse, ErrorResponse, PasteData } from '../types.js';

const router = express.Router();

// Health check endpoint
router.get('/healthz', async (req, res) => {
  try {
    const isConnected = await checkRedisConnection();
    res.status(200).json({
      status: 'ok',
      redis: isConnected ? 'connected' : 'disconnected',
      message: isConnected 
        ? 'Redis connection successful' 
        : 'Redis connection failed. Please check your .env file in the server directory and verify UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN are set correctly.'
    });
  } catch (error) {
    console.error('Health check error:', error);
    res.status(200).json({
      status: 'ok',
      redis: 'disconnected',
      message: 'Redis connection failed. Please check your .env file in the server directory and verify UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN are set correctly.',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Create multiple pastes endpoint
router.post('/pastes/batch', async (req, res) => {
  try {
    const { pastes }: CreateMultiplePastesRequest = req.body;

    // Validation
    if (!pastes || !Array.isArray(pastes) || pastes.length === 0) {
      return res.status(400).json({ error: 'pastes must be a non-empty array' } as ErrorResponse);
    }

    if (pastes.length > 10) {
      return res.status(400).json({ error: 'Maximum 10 pastes can be created at once' } as ErrorResponse);
    }

    const protocol = req.protocol;
    const host = req.get('host');
    const createdPastes: CreatePasteResponse[] = [];

    for (const paste of pastes) {
      const { content, ttl_seconds, max_views } = paste;

      // Validation for each paste
      if (!content || typeof content !== 'string' || content.trim().length === 0) {
        continue; // Skip invalid pastes
      }

      if (ttl_seconds !== undefined && (typeof ttl_seconds !== 'number' || !Number.isInteger(ttl_seconds) || ttl_seconds < 1)) {
        continue;
      }

      if (max_views !== undefined && (typeof max_views !== 'number' || !Number.isInteger(max_views) || max_views < 1)) {
        continue;
      }

      // Generate ID and create paste
      const id = generatePasteId();
      const pasteData: PasteData = {
        content: content.trim(),
        ttl_seconds: ttl_seconds || 0,
        max_views: max_views || 0,
        created_at: Date.now(),
        views: 0
      };

      // Store in Redis
      if (ttl_seconds && ttl_seconds > 0) {
        await createPaste(id, pasteData, ttl_seconds);
      } else {
        await createPasteWithoutTTL(id, pasteData);
      }

      const url = `${protocol}://${host}/p/${id}`;
      createdPastes.push({
        id,
        url,
        created_at: new Date(pasteData.created_at).toISOString()
      });
    }

    if (createdPastes.length === 0) {
      return res.status(400).json({ error: 'No valid pastes were created. Please check your input.' } as ErrorResponse);
    }

    const response: CreateMultiplePastesResponse = { pastes: createdPastes };
    res.status(200).json(response);
  } catch (error) {
    console.error('Error creating multiple pastes:', error);
    res.status(500).json({ error: 'Internal server error' } as ErrorResponse);
  }
});

// Create paste endpoint
router.post('/pastes', async (req, res) => {
  try {
    const { content, ttl_seconds, max_views }: CreatePasteRequest = req.body;

    // Validation
    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      return res.status(400).json({ error: 'content is required and must be a non-empty string' } as ErrorResponse);
    }

    if (ttl_seconds !== undefined) {
      if (typeof ttl_seconds !== 'number' || !Number.isInteger(ttl_seconds) || ttl_seconds < 1) {
        return res.status(400).json({ error: 'ttl_seconds must be an integer ≥ 1' } as ErrorResponse);
      }
    }

    if (max_views !== undefined) {
      if (typeof max_views !== 'number' || !Number.isInteger(max_views) || max_views < 1) {
        return res.status(400).json({ error: 'max_views must be an integer ≥ 1' } as ErrorResponse);
      }
    }

    // Generate ID and create paste
    const id = generatePasteId();
    const pasteData: PasteData = {
      content: content.trim(),
      ttl_seconds: ttl_seconds || 0, // 0 means no TTL
      max_views: max_views || 0, // 0 means unlimited views
      created_at: Date.now(),
      views: 0
    };

    // Store in Redis with TTL if specified
    if (ttl_seconds && ttl_seconds > 0) {
      await createPaste(id, pasteData, ttl_seconds);
    } else {
      // No TTL - store without expiration
      await createPasteWithoutTTL(id, pasteData);
    }

    // Generate URL
    const protocol = req.protocol;
    const host = req.get('host');
    const url = `${protocol}://${host}/p/${id}`;

    const response: CreatePasteResponse = { 
      id, 
      url,
      created_at: new Date(pasteData.created_at).toISOString()
    };
    res.status(200).json(response);
  } catch (error) {
    console.error('Error creating paste:', error);
    res.status(500).json({ error: 'Internal server error' } as ErrorResponse);
  }
});

// Get paste endpoint
router.get('/pastes/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Get paste data
    let paste = await getPaste(id);

    if (!paste) {
      return res.status(404).json({ error: 'Paste not found or expired' } as ErrorResponse);
    }

    // Check view limit
    if (paste.max_views > 0 && paste.views >= paste.max_views) {
      return res.status(404).json({ error: 'Paste view limit exceeded' } as ErrorResponse);
    }

    // Increment view count (this also counts as a view)
    try {
      await incrementViews(id);
      paste = await getPaste(id);
      
      if (!paste) {
        return res.status(404).json({ error: 'Paste not found or expired' } as ErrorResponse);
      }
    } catch (error) {
      // If increment fails, paste might have been deleted
      return res.status(404).json({ error: 'Paste not found or expired' } as ErrorResponse);
    }

    // Check view limit again after increment
    if (paste.max_views > 0 && paste.views > paste.max_views) {
      return res.status(404).json({ error: 'Paste view limit exceeded' } as ErrorResponse);
    }

    // Calculate expiry
    let expires_at: string | null = null;
    let is_expired = false;
    if (paste.ttl_seconds > 0) {
      const expiryTime = paste.created_at + (paste.ttl_seconds * 1000);
      expires_at = new Date(expiryTime).toISOString();
      is_expired = Date.now() > expiryTime;
    }

    // Calculate remaining views
    const remaining_views = paste.max_views > 0 
      ? Math.max(0, paste.max_views - paste.views)
      : null;

    // Check if expired due to view limit
    if (paste.max_views > 0 && paste.views >= paste.max_views) {
      is_expired = true;
    }

    const response: GetPasteResponse = {
      content: paste.content,
      remaining_views,
      expires_at,
      created_at: new Date(paste.created_at).toISOString(),
      is_expired
    };

    res.status(200).json(response);
  } catch (error) {
    console.error('Error fetching paste:', error);
    res.status(500).json({ error: 'Internal server error' } as ErrorResponse);
  }
});

// Update paste content endpoint
router.put('/pastes/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;

    // Validation
    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      return res.status(400).json({ error: 'content is required and must be a non-empty string' } as ErrorResponse);
    }

    // Check if paste exists
    const paste = await getPaste(id);
    if (!paste) {
      return res.status(404).json({ error: 'Paste not found or expired' } as ErrorResponse);
    }

    // Check if paste is expired
    let is_expired = false;
    if (paste.ttl_seconds > 0) {
      const expiryTime = paste.created_at + (paste.ttl_seconds * 1000);
      is_expired = Date.now() > expiryTime;
    }
    if (paste.max_views > 0 && paste.views >= paste.max_views) {
      is_expired = true;
    }
    if (is_expired) {
      return res.status(400).json({ error: 'Cannot update expired paste' } as ErrorResponse);
    }

    // Update content
    const updated = await updatePasteContent(id, content);
    if (!updated) {
      return res.status(500).json({ error: 'Failed to update paste' } as ErrorResponse);
    }

    res.status(200).json({ 
      message: 'Paste updated successfully',
      content: content.trim()
    });
  } catch (error) {
    console.error('Error updating paste:', error);
    res.status(500).json({ error: 'Internal server error' } as ErrorResponse);
  }
});

export default router;

