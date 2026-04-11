import { useCallback, useState } from 'react';
import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';

/**
 * API Response Interface
 * Defines the structure of responses from the backend
 */
interface ApiResponse {
  success: boolean;
  response?: string;
  error?: string;
  user?: any;
  access_token?: string;
  access_expires_at?: string;
  [key: string]: any; // Allow additional properties
}

/**
 * Hook Return Type Interface
 * Defines all the methods and state this hook exposes
 */
interface UseApiSetupReturn {
  // State
  loading: boolean;
  error: string | null;
  data: any | null;

  // HTTP Methods
  get: <T = any>(url: string, config?: AxiosRequestConfig) => Promise<T>;
  post: <T = any>(url: string, data?: any, config?: AxiosRequestConfig) => Promise<T>;
  put: <T = any>(url: string, data?: any, config?: AxiosRequestConfig) => Promise<T>;
  patch: <T = any>(url: string, data?: any, config?: AxiosRequestConfig) => Promise<T>;
  delete: <T = any>(url: string, config?: AxiosRequestConfig) => Promise<T>;

  // Utilities
  resetState: () => void;
  setAuthToken: (token: string) => void;
  clearAuthToken: () => void;
}

/**
 * Custom hook for making API requests with built-in token handling
 * @param baseURL - Base URL for API requests (defaults to env variable)
 * @returns Object containing loading state, error state, data, and HTTP methods
 */
const useRouteApiSetup = (
  baseURL: string = import.meta.env.VITE_API_URL || '/api',
): UseApiSetupReturn => {
  // State management
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<any | null>(null);

  /**
   * Create axios instance with default configuration
   * - withCredentials: true allows cookies to be sent/received
   */
  const axiosInstance = axios.create({
    baseURL,
    timeout: 30000, // 30 seconds timeout
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    withCredentials: true, // Required for refresh token cookie
  });

  /**
   * Request Interceptor
   * Adds authorization token to every request if available
   */
  axiosInstance.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('access_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error),
  );

  /**
   * Response Interceptor
   * Handles token refresh on 401 errors (except for login and refresh requests)
   */
  axiosInstance.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

      // CRITICAL FIX: Skip interceptor for login and refresh endpoints
      const isLoginEndpoint = originalRequest.url?.includes('/verify-user-account');
      const isRefreshEndpoint = originalRequest.url?.includes('/refresh');

      if (isLoginEndpoint || isRefreshEndpoint) {
        return Promise.reject(error);
      }

      // Attempt token refresh for other 401 errors
      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;

        try {
          // Call refresh endpoint to get new access token
          const response = await axios.post(
            `${baseURL}/refresh`,
            {},
            {
              withCredentials: true,
            },
          );

          if (response.data.success && response.data.access_token) {
            // Store new token and retry original request
            localStorage.setItem('access_token', response.data.access_token);

            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${response.data.access_token}`;
            }
            return axiosInstance(originalRequest);
          }
        } catch (refreshError) {
          // Refresh failed - clear token only, NO redirect
          localStorage.removeItem('access_token');
          localStorage.removeItem('access_expires_at');
          localStorage.removeItem('user');
          localStorage.removeItem('student_info');
          return Promise.reject(refreshError);
        }
      }

      return Promise.reject(error);
    },
  );

  /**
   * Generic request handler
   * Manages loading state, error handling, and response processing
   */
  const handleRequest = useCallback(
    async <T,>(
      method: 'get' | 'post' | 'put' | 'patch' | 'delete',
      url: string,
      data?: any,
      config?: AxiosRequestConfig,
    ): Promise<T> => {
      // Set loading state and clear previous errors
      setLoading(true);
      setError(null);

      try {
        let response: AxiosResponse<ApiResponse>;

        // Execute the appropriate HTTP method
        switch (method) {
          case 'get':
            response = await axiosInstance.get(url, config);
            break;
          case 'post':
            response = await axiosInstance.post(url, data, config);
            break;
          case 'put':
            response = await axiosInstance.put(url, data, config);
            break;
          case 'patch':
            response = await axiosInstance.patch(url, data, config);
            break;
          case 'delete':
            response = await axiosInstance.delete(url, config);
            break;
          default:
            throw new Error(`Unsupported method: ${method}`);
        }

        // Validate and process response
        if (response.data && typeof response.data === 'object') {
          setData(response.data);

          // Store access token if provided in response
          if (response.data.access_token) {
            localStorage.setItem('access_token', response.data.access_token);
          }

          return response.data as T;
        }

        throw new Error('Invalid response format');
      } catch (err) {
        const axiosError = err as AxiosError<ApiResponse>;
        let errorMessage = 'An error occurred';

        // Extract error message from response
        if (axiosError.response) {
          // Server responded with an error
          errorMessage =
            axiosError.response.data?.error ||
            axiosError.response.data?.response ||
            `Error: ${axiosError.response.status}`;
        } else if (axiosError.request) {
          // Request was made but no response received
          errorMessage = 'No response from server. Please check your connection.';
        } else {
          // Something else happened
          errorMessage = axiosError.message || 'Request failed';
        }

        setError(errorMessage);
        throw new Error(errorMessage);
      } finally {
        setLoading(false);
      }
    },
    [axiosInstance],
  );

  /**
   * HTTP method wrappers
   * Provide a clean interface for making specific types of requests
   */
  const get = useCallback(
    <T,>(url: string, config?: AxiosRequestConfig): Promise<T> =>
      handleRequest<T>('get', url, undefined, config),
    [handleRequest],
  );

  const post = useCallback(
    <T,>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> =>
      handleRequest<T>('post', url, data, config),
    [handleRequest],
  );

  const put = useCallback(
    <T,>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> =>
      handleRequest<T>('put', url, data, config),
    [handleRequest],
  );

  const patch = useCallback(
    <T,>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> =>
      handleRequest<T>('patch', url, data, config),
    [handleRequest],
  );

  const deleteRequest = useCallback(
    <T,>(url: string, config?: AxiosRequestConfig): Promise<T> =>
      handleRequest<T>('delete', url, undefined, config),
    [handleRequest],
  );

  /**
   * Utility Functions
   */
  const resetState = useCallback(() => {
    setLoading(false);
    setError(null);
    setData(null);
  }, []);

  const setAuthToken = useCallback((token: string) => {
    localStorage.setItem('access_token', token);
  }, []);

  const clearAuthToken = useCallback(() => {
    // Clear all auth data - NO automatic redirect
    localStorage.removeItem('access_token');
    localStorage.removeItem('access_expires_at');
    localStorage.removeItem('user');
    localStorage.removeItem('student_info');
    // Let the component handle navigation
  }, []);

  /**
   * Hook return value
   * Exposes state, HTTP methods, and utilities
   */
  return {
    // State
    loading,
    error,
    data,

    // HTTP Methods
    get,
    post,
    put,
    patch,
    delete: deleteRequest,

    // Utilities
    resetState,
    setAuthToken,
    clearAuthToken,
  };
};

export default useRouteApiSetup;
