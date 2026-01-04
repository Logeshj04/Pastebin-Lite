import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import PasteViewer from '../components/PasteViewer';
import ErrorDisplay from '../components/ErrorDisplay';

interface GetPasteResponse {
  content: string;
  remaining_views: number | null;
  expires_at: string | null;
  created_at: string;
  is_expired: boolean;
}

interface ErrorResponse {
  error: string;
}

export default function ViewPaste() {
  const { id } = useParams<{ id: string }>();
  const [paste, setPaste] = useState<GetPasteResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPaste = async () => {
      if (!id) {
        setError('Invalid paste ID');
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/pastes/${id}`);
        const data = await response.json();

        if (!response.ok) {
          const errorData = data as ErrorResponse;
          setError(errorData.error || 'Paste not found or unavailable');
          setLoading(false);
          return;
        }

        const pasteData = data as GetPasteResponse;
        setPaste(pasteData);
        setLoading(false);
      } catch (err) {
        setError('Network error. Please try again.');
        setLoading(false);
      }
    };

    fetchPaste();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading paste...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <ErrorDisplay
            message={error}
            onRetry={() => {
              setError(null);
              setLoading(true);
              window.location.reload();
            }}
          />
        </div>
      </div>
    );
  }

  if (!paste) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <ErrorDisplay message="Paste not found" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <a
            href="/"
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            ← Create New Paste
          </a>
        </div>
        <div className={`rounded-lg shadow-md p-6 ${paste.is_expired ? 'bg-red-50 border-2 border-red-300' : 'bg-white'}`}>
          <h2 className={`text-2xl font-semibold mb-4 ${paste.is_expired ? 'text-red-800' : 'text-gray-800'}`}>
            Paste Content {paste.is_expired && <span className="text-red-600 text-lg">(Expired)</span>}
          </h2>
          <PasteViewer
            content={paste.content}
            remainingViews={paste.remaining_views}
            expiresAt={paste.expires_at}
            createdAt={paste.created_at}
            isExpired={paste.is_expired}
          />
        </div>
      </div>
    </div>
  );
}

