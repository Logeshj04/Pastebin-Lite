import { useState, useEffect } from 'react';

interface PasteCardProps {
  id: string;
  url: string;
  createdAt: string;
  ttlSeconds?: number;
  maxViews?: number;
  onCopy: (url: string) => void;
  copied: string | null;
  onUpdate?: () => void;
}

export default function PasteCard({ id, url, createdAt, ttlSeconds, maxViews, onCopy, copied, onUpdate }: PasteCardProps) {
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [isExpired, setIsExpired] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [content, setContent] = useState<string>('');
  const [editingContent, setEditingContent] = useState<string>('');
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const remainingViews = maxViews || null;

  useEffect(() => {
    if (!ttlSeconds || ttlSeconds <= 0) {
      setTimeRemaining(0);
      return;
    }

    const createdTime = new Date(createdAt).getTime();
    const expiryTime = createdTime + (ttlSeconds * 1000);

    const updateTimer = () => {
      const now = Date.now();
      const diff = Math.max(0, Math.floor((expiryTime - now) / 1000));

      if (diff <= 0) {
        setIsExpired(true);
        setTimeRemaining(0);
        return;
      }

      setIsExpired(false);
      setTimeRemaining(diff);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [createdAt, ttlSeconds]);

  const fetchContent = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/pastes/${id}`);
      const data = await response.json();
      
      if (response.ok) {
        setContent(data.content);
        setEditingContent(data.content);
        // Update expired state if paste is expired
        if (data.is_expired) {
          setIsExpired(true);
        }
      } else {
        const errorData = data as { error?: string };
        setError(errorData.error || 'Failed to load paste content');
        // If paste not found or expired, collapse the view
        if (response.status === 404) {
          setIsExpanded(false);
        }
      }
    } catch (err) {
      setError('Network error. Please try again.');
      setIsExpanded(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExpand = () => {
    if (!isExpanded) {
      fetchContent();
    }
    setIsExpanded(!isExpanded);
  };

  const handleSave = async () => {
    if (!editingContent.trim()) {
      setError('Content cannot be empty');
      return;
    }

    if (isExpired) {
      setError('Cannot update expired paste');
      return;
    }

    setIsSaving(true);
    setError(null);
    try {
      const response = await fetch(`/api/pastes/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: editingContent }),
      });

      const data = await response.json();

      if (response.ok) {
        setContent(editingContent);
        setIsEditing(false);
        setError(null);
        if (onUpdate) {
          onUpdate();
        }
      } else {
        const errorData = data as { error?: string };
        setError(errorData.error || 'Failed to update paste');
        // If paste expired during editing, update state
        if (response.status === 400 && errorData.error?.includes('expired')) {
          setIsExpired(true);
        }
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setEditingContent(content);
    setIsEditing(false);
    setError(null);
  };


  const borderColor = isExpired ? 'border-red-400' : 'border-green-300';
  const bgColor = isExpired ? 'bg-red-50' : 'bg-white';

  return (
    <div className={`${bgColor} border-2 ${borderColor} rounded-lg p-4 shadow-sm`}>
      <div className="flex items-center space-x-2 mb-3">
        <input
          type="text"
          value={url}
          readOnly
          onClick={handleExpand}
          className={`flex-1 px-3 py-2 border ${borderColor} rounded-md ${bgColor} text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm cursor-pointer hover:bg-gray-50`}
          placeholder="Click to view/edit content"
        />
        <button
          onClick={() => onCopy(url)}
          className={`${isExpired ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'} text-white px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors text-sm font-medium`}
        >
          {copied === url ? 'Copied!' : 'Copy'}
        </button>
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex justify-between items-center">
          <span className="text-gray-600 font-medium">Created:</span>
          <span className={`font-semibold ${isExpired ? 'text-red-700' : 'text-gray-900'}`}>
            {new Date(createdAt).toLocaleString()}
          </span>
        </div>

        {ttlSeconds && ttlSeconds > 0 && (
          <div className="flex justify-between items-center">
            <span className="text-gray-600 font-medium">Remaining Time:</span>
            <span className={`font-bold text-lg ${isExpired ? 'text-red-700' : 'text-blue-600'}`}>
              {isExpired ? 'Expired' : `${timeRemaining}s`}
            </span>
          </div>
        )}

        {remainingViews !== null && (
          <div className="flex justify-between items-center">
            <span className="text-gray-600 font-medium">Remaining Views:</span>
            <span className={`font-bold ${isExpired || remainingViews === 0 ? 'text-red-700' : 'text-green-600'}`}>
              {remainingViews}
            </span>
          </div>
        )}

        {isExpired && (
          <div className="mt-2 p-2 bg-red-100 border border-red-300 rounded text-red-800 text-center font-medium text-xs">
            ⚠️ This paste has expired
          </div>
        )}
      </div>

      {isExpanded && (
        <div className="mt-4 pt-4 border-t border-gray-300">
          <div className="flex justify-between items-center mb-3">
            <h4 className="font-semibold text-gray-800">Paste Content</h4>
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                Edit
              </button>
            )}
          </div>

          {isLoading ? (
            <div className="text-center py-4 text-gray-500">Loading content...</div>
          ) : error && !isEditing ? (
            <div className="space-y-2">
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
                {error}
              </div>
              <button
                onClick={fetchContent}
                className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors text-sm font-medium"
              >
                Retry
              </button>
            </div>
          ) : isEditing ? (
            <div className="space-y-3">
              <textarea
                value={editingContent}
                onChange={(e) => setEditingContent(e.target.value)}
                rows={10}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
                placeholder="Enter paste content..."
              />
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
                  {error}
                </div>
              )}
              <div className="flex justify-end space-x-2">
                <button
                  onClick={handleCancel}
                  disabled={isSaving}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors text-sm font-medium disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={isSaving || !editingContent.trim()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSaving ? 'Saving...' : 'Save'}
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <pre className="whitespace-pre-wrap break-words font-mono text-sm text-gray-800">
                {content}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

