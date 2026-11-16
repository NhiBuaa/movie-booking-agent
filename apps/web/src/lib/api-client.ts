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
  MovieSummaryDto,
  OrderSummaryDto,
  PaymentIntentResponse,
  SeatMapDto,
} from '../../../../packages/contracts/src/index.ts';

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
      err?.code || 'HTTP_ERROR',
      err?.message || `Request failed with status ${res.status}`,
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
    get: (query?: { movieId?: string; cinemaId?: string; date?: string }) => {
      const sp = new URLSearchParams();
      if (query?.movieId) sp.set('movieId', query.movieId);
      if (query?.cinemaId) sp.set('cinemaId', query.cinemaId);
      if (query?.date) sp.set('date', query.date);
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
    release: (holdId: string) =>
      requestJson<{ released: boolean }>('/api/hold', {
        method: 'DELETE',
        body: JSON.stringify({ holdId }),
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
    createIntent: (req: CreatePaymentIntentRequest) =>
      requestJson<PaymentIntentResponse>('/api/payment/intent', {
        method: 'POST',
        body: JSON.stringify(req),
      }),
  },

  tickets: {
    get: (ticketCodeOrBookingId: string) =>
      requestJson<ETicketDto>(
        `/api/tickets/${encodeURIComponent(ticketCodeOrBookingId)}`
      ),
  },
};
