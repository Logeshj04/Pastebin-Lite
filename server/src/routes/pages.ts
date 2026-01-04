import express from 'express';
import { getPaste, incrementViews } from '../services/redis.js';
import { sanitizeHtml } from '../utils/sanitize.js';
import type { ErrorResponse } from '../types.js';

const router = express.Router();

// View paste page endpoint
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Get paste data
    let paste = await getPaste(id);

    if (!paste) {
      return res.status(404).send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Paste Not Found</title>
          <style>
            body {
              font-family: system-ui, -apple-system, sans-serif;
              display: flex;
              justify-content: center;
              align-items: center;
              min-height: 100vh;
              margin: 0;
              background: #f5f5f5;
            }
            .container {
              text-align: center;
              padding: 2rem;
              background: white;
              border-radius: 8px;
              box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            }
            h1 { color: #dc2626; margin: 0 0 1rem 0; }
            p { color: #666; margin: 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>404 - Paste Not Found</h1>
            <p>This paste is unavailable. It may have expired or reached its view limit.</p>
          </div>
        </body>
        </html>
      `);
    }

    // Check view limit
    if (paste.max_views > 0 && paste.views >= paste.max_views) {
      return res.status(404).send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Paste Unavailable</title>
          <style>
            body {
              font-family: system-ui, -apple-system, sans-serif;
              display: flex;
              justify-content: center;
              align-items: center;
              min-height: 100vh;
              margin: 0;
              background: #f5f5f5;
            }
            .container {
              text-align: center;
              padding: 2rem;
              background: white;
              border-radius: 8px;
              box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            }
            h1 { color: #dc2626; margin: 0 0 1rem 0; }
            p { color: #666; margin: 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>404 - Paste Unavailable</h1>
            <p>This paste has reached its view limit.</p>
          </div>
        </body>
        </html>
      `);
    }

    // Increment view count
    try {
      await incrementViews(id);
      paste = await getPaste(id);
      
      if (!paste) {
        return res.status(404).send(`
          <!DOCTYPE html>
          <html lang="en">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Paste Not Found</title>
            <style>
              body {
                font-family: system-ui, -apple-system, sans-serif;
                display: flex;
                justify-content: center;
                align-items: center;
                min-height: 100vh;
                margin: 0;
                background: #f5f5f5;
              }
              .container {
                text-align: center;
                padding: 2rem;
                background: white;
                border-radius: 8px;
                box-shadow: 0 2px 8px rgba(0,0,0,0.1);
              }
              h1 { color: #dc2626; margin: 0 0 1rem 0; }
              p { color: #666; margin: 0; }
            </style>
          </head>
          <body>
            <div class="container">
              <h1>404 - Paste Not Found</h1>
              <p>This paste is unavailable. It may have expired or reached its view limit.</p>
            </div>
          </body>
          </html>
        `);
      }
    } catch (error) {
      return res.status(404).send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Paste Not Found</title>
          <style>
            body {
              font-family: system-ui, -apple-system, sans-serif;
              display: flex;
              justify-content: center;
              align-items: center;
              min-height: 100vh;
              margin: 0;
              background: #f5f5f5;
            }
            .container {
              text-align: center;
              padding: 2rem;
              background: white;
              border-radius: 8px;
              box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            }
            h1 { color: #dc2626; margin: 0 0 1rem 0; }
            p { color: #666; margin: 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>404 - Paste Not Found</h1>
            <p>This paste is unavailable. It may have expired or reached its view limit.</p>
          </div>
        </body>
        </html>
      `);
    }

    // Check view limit again after increment
    if (paste.max_views > 0 && paste.views > paste.max_views) {
      return res.status(404).send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Paste Unavailable</title>
          <style>
            body {
              font-family: system-ui, -apple-system, sans-serif;
              display: flex;
              justify-content: center;
              align-items: center;
              min-height: 100vh;
              margin: 0;
              background: #f5f5f5;
            }
            .container {
              text-align: center;
              padding: 2rem;
              background: white;
              border-radius: 8px;
              box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            }
            h1 { color: #dc2626; margin: 0 0 1rem 0; }
            p { color: #666; margin: 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>404 - Paste Unavailable</h1>
            <p>This paste has reached its view limit.</p>
          </div>
        </body>
        </html>
      `);
    }

    // Validate paste data structure
    if (!paste.content || typeof paste.content !== 'string') {
      throw new Error('Invalid paste data: content is missing or invalid');
    }

    // Sanitize content for safe display
    let sanitizedContent: string;
    try {
      sanitizedContent = sanitizeHtml(paste.content);
    } catch (error) {
      console.error('Error sanitizing content:', error);
      // Fallback to plain text if sanitization fails
      sanitizedContent = String(paste.content).replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }

    // Escape template literal special characters to prevent injection
    const escapedContent = sanitizedContent
      .replace(/\\/g, '\\\\')
      .replace(/`/g, '\\`')
      .replace(/\${/g, '\\${');

    // Render HTML page
    res.status(200).send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Paste</title>
        <style>
          body {
            font-family: system-ui, -apple-system, sans-serif;
            max-width: 800px;
            margin: 0 auto;
            padding: 2rem;
            background: #f5f5f5;
          }
          .container {
            background: white;
            padding: 2rem;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          }
          .content {
            white-space: pre-wrap;
            word-wrap: break-word;
            line-height: 1.6;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="content">${escapedContent}</div>
        </div>
      </body>
      </html>
    `);
  } catch (error) {
    console.error('Error rendering paste page:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : String(error);
    console.error('Error details:', { message: errorMessage, stack: errorStack });
    res.status(500).send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Error</title>
        <style>
          body {
            font-family: system-ui, -apple-system, sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            margin: 0;
            background: #f5f5f5;
          }
          .container {
            text-align: center;
            padding: 2rem;
            background: white;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          }
          h1 { color: #dc2626; margin: 0 0 1rem 0; }
          p { color: #666; margin: 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>500 - Internal Server Error</h1>
          <p>An error occurred while loading the paste.</p>
        </div>
      </body>
      </html>
    `);
  }
});

export default router;

