import { useState } from 'react';

interface CreateMultiplePastesProps {
  onSuccess: (pastes: Array<{ id: string; url: string; created_at: string }>) => void;
}

interface CreatePasteResponse {
  id: string;
  url: string;
  created_at: string;
}

interface ErrorResponse {
  error: string;
}

interface PasteInput {
  content: string;
  ttlSeconds: number | '';
  maxViews: number | '';
}

export default function CreateMultiplePastes({ onSuccess }: CreateMultiplePastesProps) {
  const [pastes, setPastes] = useState<PasteInput[]>([
    { content: '', ttlSeconds: '', maxViews: '' }
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addPasteField = () => {
    if (pastes.length < 10) {
      setPastes([...pastes, { content: '', ttlSeconds: '', maxViews: '' }]);
    }
  };

  const removePasteField = (index: number) => {
    if (pastes.length > 1) {
      setPastes(pastes.filter((_, i) => i !== index));
    }
  };

  const updatePaste = (index: number, field: keyof PasteInput, value: string | number) => {
    const updated = [...pastes];
    updated[index] = { ...updated[index], [field]: value };
    setPastes(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Filter out empty pastes
      const validPastes = pastes.filter(p => p.content.trim().length > 0);
      
      if (validPastes.length === 0) {
        setError('At least one paste with content is required');
        setLoading(false);
        return;
      }

      const body = {
        pastes: validPastes.map(p => {
          const paste: any = { content: p.content.trim() };
          if (p.ttlSeconds !== '' && p.ttlSeconds >= 1) {
            paste.ttl_seconds = Number(p.ttlSeconds);
          }
          if (p.maxViews !== '' && p.maxViews >= 1) {
            paste.max_views = Number(p.maxViews);
          }
          return paste;
        })
      };

      const response = await fetch('/api/pastes/batch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        const errorData = data as ErrorResponse;
        setError(errorData.error || 'Failed to create pastes');
        setLoading(false);
        return;
      }

      const successData = data as { pastes: CreatePasteResponse[] };
      onSuccess(successData.pastes);
      
      // Reset form
      setPastes([{ content: '', ttlSeconds: '', maxViews: '' }]);
      setLoading(false);
    } catch (err) {
      setError('Network error. Please try again.');
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-4">
        {pastes.map((paste, index) => (
          <div key={index} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-medium text-gray-700">Paste {index + 1}</h3>
              {pastes.length > 1 && (
                <button
                  type="button"
                  onClick={() => removePasteField(index)}
                  className="text-red-600 hover:text-red-800 text-sm font-medium"
                >
                  Remove
                </button>
              )}
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Content <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={paste.content}
                  onChange={(e) => updatePaste(index, 'content', e.target.value)}
                  required
                  rows={5}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter paste content..."
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    TTL (seconds)
                  </label>
                  <input
                    type="number"
                    value={paste.ttlSeconds}
                    onChange={(e) => updatePaste(index, 'ttlSeconds', e.target.value === '' ? '' : Number(e.target.value))}
                    min="1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Optional"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Max Views
                  </label>
                  <input
                    type="number"
                    value={paste.maxViews}
                    onChange={(e) => updatePaste(index, 'maxViews', e.target.value === '' ? '' : Number(e.target.value))}
                    min="1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Optional"
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {pastes.length < 10 && (
        <button
          type="button"
          onClick={addPasteField}
          className="w-full bg-gray-200 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
        >
          + Add Another Paste
        </button>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading || pastes.every(p => !p.content.trim())}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {loading ? 'Creating...' : `Create ${pastes.filter(p => p.content.trim()).length} Paste(s)`}
      </button>
    </form>
  );
}

