import { useState, useEffect } from 'react';

interface PasteViewerProps {
  content: string;
  remainingViews: number | null;
  expiresAt: string | null;
  createdAt: string;
  isExpired: boolean;
}

function formatTimeRemaining(expiresAt: string | null): string {
  if (!expiresAt) return 'Never';
  
  const now = Date.now();
  const expiry = new Date(expiresAt).getTime();
  const diff = expiry - now;

  if (diff <= 0) return 'Expired';

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}d ${hours % 24}h ${minutes % 60}m`;
  if (hours > 0) return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
  if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
  return `${seconds}s`;
}

export default function PasteViewer({ content, remainingViews, expiresAt, createdAt, isExpired }: PasteViewerProps) {
  const [timeRemaining, setTimeRemaining] = useState<string>(formatTimeRemaining(expiresAt));
  const [isCurrentlyExpired, setIsCurrentlyExpired] = useState(isExpired);

  useEffect(() => {
    if (!expiresAt) return;

    const updateTimer = () => {
      const now = Date.now();
      const expiry = new Date(expiresAt).getTime();
      const diff = expiry - now;

      if (diff <= 0) {
        setIsCurrentlyExpired(true);
        setTimeRemaining('Expired');
        return;
      }

      setIsCurrentlyExpired(false);
      setTimeRemaining(formatTimeRemaining(expiresAt));
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [expiresAt]);

  const borderColor = isCurrentlyExpired ? 'border-red-300' : 'border-gray-200';
  const bgColor = isCurrentlyExpired ? 'bg-red-50' : 'bg-white';
  const textColor = isCurrentlyExpired ? 'text-red-800' : 'text-gray-800';

  return (
    <div className="space-y-4">
      <div className={`${bgColor} border ${borderColor} rounded-lg p-6 shadow-sm`}>
        <pre className={`whitespace-pre-wrap break-words font-mono text-sm ${textColor}`}>
          {content}
        </pre>
      </div>

      <div className={`${isCurrentlyExpired ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-200'} border rounded-lg p-4`}>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Created:</span>
            <span className={`font-medium ${isCurrentlyExpired ? 'text-red-700' : 'text-gray-900'}`}>
              {new Date(createdAt).toLocaleString()}
            </span>
          </div>
          {remainingViews !== null && (
            <div className="flex justify-between">
              <span className="text-gray-600">Remaining Views:</span>
              <span className={`font-medium ${isCurrentlyExpired ? 'text-red-700' : remainingViews === 0 ? 'text-orange-600' : 'text-gray-900'}`}>
                {remainingViews}
              </span>
            </div>
          )}
          {expiresAt && (
            <>
              <div className="flex justify-between">
                <span className="text-gray-600">Expires At:</span>
                <span className={`font-medium ${isCurrentlyExpired ? 'text-red-700' : 'text-gray-900'}`}>
                  {new Date(expiresAt).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Time Remaining:</span>
                <span className={`font-bold ${isCurrentlyExpired ? 'text-red-700' : 'text-blue-600'}`}>
                  {timeRemaining}
                </span>
              </div>
            </>
          )}
          {isCurrentlyExpired && (
            <div className="mt-2 p-2 bg-red-100 border border-red-300 rounded text-red-800 text-center font-medium">
              ⚠️ This paste has expired
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

