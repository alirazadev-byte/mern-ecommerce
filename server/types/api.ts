export interface ApiErrorBody {
  success: false;
  message: string;
  error: {
    code: string;
    message: string;
  };
}

export interface ApiSuccessBody<T> {
  success: true;
  data: T;
}
