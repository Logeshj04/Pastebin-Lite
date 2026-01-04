import { useState } from 'react';

interface CreatePasteProps {
  onSuccess: (id: string, url: string, created_at: string, ttl_seconds?: number, max_views?: number) => void;
}

interface CreatePasteResponse {
  id: string;
  url: string;
  created_at: string;
}

interface ErrorResponse {
  error: string;
}

export default function CreatePaste({ onSuccess }: CreatePasteProps) {
  const [content, setContent] = useState('');
  const [ttlSeconds, setTtlSeconds] = useState<number | ''>('');
  const [maxViews, setMaxViews] = useState<number | ''>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const body: {
        content: string;
        ttl_seconds?: number;
        max_views?: number;
      } = {
        content: content.trim(),
      };

      if (ttlSeconds !== '' && ttlSeconds >= 1) {
        body.ttl_seconds = Number(ttlSeconds);
      }

      if (maxViews !== '' && maxViews >= 1) {
        body.max_views = Number(maxViews);
      }

      const response = await fetch('/api/pastes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        const errorData = data as ErrorResponse;
        setError(errorData.error || 'Failed to create paste');
        setLoading(false);
        return;
      }

      const successData = data as CreatePasteResponse;
      onSuccess(
        successData.id, 
        successData.url, 
        successData.created_at,
        ttlSeconds !== '' ? Number(ttlSeconds) : undefined,
        maxViews !== '' ? Number(maxViews) : undefined
      );
      
      // Reset form
      setContent('');
      setTtlSeconds('');
      setMaxViews('');
      setLoading(false);
    } catch (err) {
      setError('Network error. Please try again.');
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
          Content <span className="text-red-500">*</span>
        </label>
        <textarea
          id="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
          rows={10}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Enter your paste content here..."
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="ttl" className="block text-sm font-medium text-gray-700 mb-2">
            TTL (seconds)
          </label>
          <input
            type="number"
            id="ttl"
            value={ttlSeconds}
            onChange={(e) => setTtlSeconds(e.target.value === '' ? '' : Number(e.target.value))}
            min="1"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Optional (e.g., 3600)"
          />
          <p className="mt-1 text-xs text-gray-500">Leave empty for no expiration</p>
        </div>

        <div>
          <label htmlFor="maxViews" className="block text-sm font-medium text-gray-700 mb-2">
            Max Views
          </label>
          <input
            type="number"
            id="maxViews"
            value={maxViews}
            onChange={(e) => setMaxViews(e.target.value === '' ? '' : Number(e.target.value))}
            min="1"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Optional (e.g., 10)"
          />
          <p className="mt-1 text-xs text-gray-500">Leave empty for unlimited views</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading || !content.trim()}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {loading ? 'Creating...' : 'Create Paste'}
      </button>
    </form>
  );
}

