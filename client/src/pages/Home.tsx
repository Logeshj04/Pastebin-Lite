import { useState } from 'react';
import CreatePaste from '../components/CreatePaste';
import PasteCard from '../components/PasteCard';

interface PasteInfo {
  id: string;
  url: string;
  created_at: string;
  ttl_seconds?: number;
  max_views?: number;
}

export default function Home() {
  const [createdPastes, setCreatedPastes] = useState<PasteInfo[]>([]);
  const [copied, setCopied] = useState<string | null>(null);

  const handleSuccess = (id: string, url: string, created_at: string, ttl_seconds?: number, max_views?: number) => {
    setCreatedPastes(prev => [...prev, { id, url, created_at, ttl_seconds, max_views }]);
    setCopied(null);
  };

  const handleCopy = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(url);
      setTimeout(() => setCopied(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Paste Link</h1>
          <p className="text-gray-600">Create and share your pastes with time-based expiry and view limits</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Create New Paste</h2>
          <CreatePaste onSuccess={handleSuccess} />
        </div>

        {createdPastes.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-gray-800">Created Pastes</h3>
            {createdPastes.map((paste) => (
              <PasteCard
                key={paste.id}
                id={paste.id}
                url={paste.url}
                createdAt={paste.created_at}
                ttlSeconds={paste.ttl_seconds}
                maxViews={paste.max_views}
                onCopy={handleCopy}
                copied={copied}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

