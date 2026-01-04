export interface PasteData {
  content: string;
  ttl_seconds: number;
  max_views: number;
  created_at: number;
  views: number;
}

export interface CreatePasteRequest {
  content: string;
  ttl_seconds?: number;
  max_views?: number;
}

export interface CreateMultiplePastesRequest {
  pastes: Array<{
    content: string;
    ttl_seconds?: number;
    max_views?: number;
  }>;
}

export interface CreatePasteResponse {
  id: string;
  url: string;
  created_at: string;
}

export interface CreateMultiplePastesResponse {
  pastes: CreatePasteResponse[];
}

export interface GetPasteResponse {
  content: string;
  remaining_views: number | null;
  expires_at: string | null;
  created_at: string;
  is_expired: boolean;
}

export interface ErrorResponse {
  error: string;
}

