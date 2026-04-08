export interface ErrorResponse {
  success: false;
  error: {
    message: string;
    statusCode: number;
  };
  timestamp: string;
}
