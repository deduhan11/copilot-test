export interface ApiResponse<T> {
  status: 'OK' | 'FAILED';
  data: T;
}

export interface ErrorResponse {
  status: 'FAILED';
  data: {
    error: string;
  };
}
