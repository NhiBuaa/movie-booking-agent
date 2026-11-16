/**
 * Standard API wrappers and pagination DTOs.
 */

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  timestamp: string; // ISO 8601
}

export interface ApiErrorResponse {
  success: false;
  error: {
    code: string; // e.g. "SEAT_ALREADY_HELD", "HOLD_EXPIRED", "UNAUTHORIZED"
    message: string;
    details?: unknown;
  };
  timestamp: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  meta: PaginationMeta;
  timestamp: string;
}
