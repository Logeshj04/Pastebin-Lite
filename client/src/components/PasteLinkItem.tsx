import { useState, useEffect } from 'react';

interface PasteLinkItemProps {
  url: string;
  createdAt: string;
  expiresAt?: string | null;
  onCopy: (url: string) => void;
  copied: string | null;
}

export default function PasteLinkItem({ url, createdAt, expiresAt, onCopy, copied }: PasteLinkItemProps) {
  const [isExpired, setIsExpired] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<string>('');

  useEffect(() => {
    if (!expiresAt) {
      setIsExpired(false);
      return;
    }

    const updateStatus = () => {
      const now = Date.now();
      const expiry = new Date(expiresAt).getTime();
      const diff = expiry - now;

      if (diff <= 0) {
        setIsExpired(true);
        setTimeRemaining('Expired');
        return;
      }

      setIsExpired(false);
      const seconds = Math.floor(diff / 1000);
      const minutes = Math.floor(seconds / 60);
      const hours = Math.floor(minutes / 60);
      const days = Math.floor(hours / 24);

      if (days > 0) {
        setTimeRemaining(`${days}d ${hours % 24}h`);
      } else if (hours > 0) {
        setTimeRemaining(`${hours}h ${minutes % 60}m`);
      } else if (minutes > 0) {
        setTimeRemaining(`${minutes}m ${seconds % 60}s`);
      } else {
        setTimeRemaining(`${seconds}s`);
      }
    };

    updateStatus();
    const interval = setInterval(updateStatus, 1000);

    return () => clearInterval(interval);
  }, [expiresAt]);

  const borderColor = isExpired ? 'border-red-300' : 'border-green-300';
  const bgColor = isExpired ? 'bg-red-50' : 'bg-white';
  const textColor = isExpired ? 'text-red-800' : 'text-gray-900';

  return (
    <div className={`${bgColor} border ${borderColor} rounded p-3`}>
      <div className="flex items-center space-x-2 mb-2">
        <input
          type="text"
          value={url}
          readOnly
          className={`flex-1 px-3 py-2 border ${borderColor} rounded-md ${bgColor} ${textColor} focus:outline-none focus:ring-2 focus:ring-green-500 text-sm`}
        />
        <button
          onClick={() => onCopy(url)}
          className={`${isExpired ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'} text-white px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors text-sm`}
        >
          {copied === url ? 'Copied!' : 'Copy'}
        </button>
      </div>
      <div className="flex justify-between items-center text-xs">
        <span className={isExpired ? 'text-red-600' : 'text-gray-600'}>
          Created: {new Date(createdAt).toLocaleString()}
        </span>
        {expiresAt && (
          <span className={isExpired ? 'text-red-700 font-bold' : 'text-blue-600 font-medium'}>
            {isExpired ? '⚠️ Expired' : `⏱️ ${timeRemaining}`}
          </span>
        )}
      </div>
    </div>
  );
}

