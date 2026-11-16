import type {
  ApiResponse,
  CinemaDetailDto,
  CinemaDto,
  CreateHoldRequest,
  CreateHoldResponse,
  CreateOrderRequest,
  CreatePaymentIntentRequest,
  DayScheduleDto,
  ETicketDto,
  MovieDetailDto,
  MovieFilterQuery,
  MovieFormat,
  MovieSummaryDto,
  OrderSummaryDto,
  PaymentIntentResponse,
  PaymentWebhookPayload,
  PaymentWebhookResponse,
  SeatMapDto,
} from '@platform/contracts';

class ApiClientError extends Error {
  code: string;
  status: number;
  details?: unknown;

  constructor(code: string, message: string, status: number, details?: unknown) {
    super(message);
    this.name = 'ApiClientError';
    this.code = code;
    this.status = status;
    this.details = details;
  }
}

async function requestJson<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const url = endpoint.startsWith('http') ? endpoint : endpoint;
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  const body = (await res.json()) as ApiResponse<T>;

  if (!res.ok || !body.success) {
    const err = (body as any)?.error;
    throw new ApiClientError(
      err?.code || 'UNKNOWN_ERROR',
      err?.message || 'Có lỗi xảy ra khi gọi máy chủ.',
      res.status,
      err?.details
    );
  }

  return body.data;
}

export const apiClient = {
  movies: {
    list: (query?: MovieFilterQuery) => {
      const sp = new URLSearchParams();
      if (query?.q) sp.set('q', query.q);
      if (query?.genre) sp.set('genre', query.genre);
      if (query?.cinemaId) sp.set('cinemaId', query.cinemaId);
      if (query?.format) sp.set('format', query.format);
      if (query?.date) sp.set('date', query.date);
      if (query?.status) sp.set('status', query.status);
      if (query?.page) sp.set('page', String(query.page));
      if (query?.limit) sp.set('limit', String(query.limit));
      const qs = sp.toString();
      return requestJson<MovieSummaryDto[]>(`/api/movies${qs ? `?${qs}` : ''}`);
    },
    get: (idOrSlug: string) =>
      requestJson<MovieDetailDto>(`/api/movies/${encodeURIComponent(idOrSlug)}`),
  },

  cinemas: {
    list: () => requestJson<CinemaDto[]>('/api/cinemas'),
    get: (idOrSlug: string) =>
      requestJson<CinemaDetailDto>(`/api/cinemas/${encodeURIComponent(idOrSlug)}`),
  },

  showtimes: {
    get: (query?: {
      movieId?: string;
      cinemaId?: string;
      date?: string;
      format?: MovieFormat;
      status?: string;
    }) => {
      const sp = new URLSearchParams();
      if (query?.movieId) sp.set('movieId', query.movieId);
      if (query?.cinemaId) sp.set('cinemaId', query.cinemaId);
      if (query?.date) sp.set('date', query.date);
      if (query?.format) sp.set('format', query.format);
      if (query?.status) sp.set('status', query.status);
      const qs = sp.toString();
      return requestJson<DayScheduleDto[]>(`/api/showtimes${qs ? `?${qs}` : ''}`);
    },
  },

  seats: {
    getMap: (showtimeId: string) =>
      requestJson<SeatMapDto>(`/api/seats?showtimeId=${encodeURIComponent(showtimeId)}`),
  },

  hold: {
    create: (req: CreateHoldRequest) =>
      requestJson<CreateHoldResponse>('/api/hold', {
        method: 'POST',
        body: JSON.stringify(req),
      }),
    release: (holdId: string, userEmail?: string) =>
      requestJson<{ released: boolean }>('/api/hold', {
        method: 'DELETE',
        headers: userEmail ? { 'x-user-email': userEmail } : undefined,
        body: JSON.stringify({ holdId, userEmail }),
      }),
  },

  orders: {
    create: (req: CreateOrderRequest) =>
      requestJson<OrderSummaryDto>('/api/orders', {
        method: 'POST',
        body: JSON.stringify(req),
      }),
  },

  payment: {
    createIntent: (req: CreatePaymentIntentRequest, userEmail?: string) =>
      requestJson<PaymentIntentResponse>('/api/payment/intent', {
        method: 'POST',
        headers: userEmail ? { 'x-user-email': userEmail } : undefined,
        body: JSON.stringify(req),
      }),
    processWebhook: (payload: PaymentWebhookPayload) =>
      requestJson<PaymentWebhookResponse>('/api/payment/webhook', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
  },

  tickets: {
    get: (ticketCodeOrBookingId: string, userEmail?: string) =>
      requestJson<ETicketDto>(
        `/api/tickets/${encodeURIComponent(ticketCodeOrBookingId)}`,
        {
          headers: userEmail ? { 'x-user-email': userEmail } : undefined,
        }
      ),
  },
};
