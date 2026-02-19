/**
 * API Explorer Store
 * Story 8.5: API Explorer
 * State management for API explorer using Zustand
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Types
export type HTTPMethod = 'get' | 'post' | 'put' | 'delete' | 'patch' | 'head' | 'options' | 'trace';

export interface ParameterDef {
  name: string;
  in: 'query' | 'path' | 'header';
  type: string;
  required: boolean;
  description: string;
  enum?: string[];
  default?: string;
}

export interface EndpointMetadata {
  id: string;
  method: HTTPMethod;
  path: string;
  category: string;
  description: string;
  parameters: {
    path?: ParameterDef[];
    query?: ParameterDef[];
    header?: ParameterDef[];
  };
  requestBody?: {
    contentType: string;
    schema: Record<string, { type: string; description: string; required?: boolean }>;
    description: string;
  };
}

export interface ExplorerRequest {
  id: string;
  method: HTTPMethod;
  path: string;
  queryParams: Record<string, string>;
  headers: Record<string, string>;
  body: string;
  timestamp: number;
  status?: number;
  success?: boolean;
}

export interface ExplorerResponse {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  body: unknown;
  duration: number;
}

interface ExplorerState {
  // Selected endpoint
  selectedEndpoint: EndpointMetadata | null;

  // Request parameters
  pathParams: Record<string, string>;
  queryParams: Record<string, string>;
  headers: Record<string, string>;
  body: string;

  // Authentication - NOT persisted for security
  authMethod: 'session' | 'api_key';
  apiKey: string;

  // Response
  response: ExplorerResponse | null;
  isLoading: boolean;
  error: string | null;

  // History
  history: ExplorerRequest[];

  // Actions
  setSelectedEndpoint: (endpoint: EndpointMetadata | null) => void;
  setPathParam: (name: string, value: string) => void;
  setQueryParam: (name: string, value: string) => void;
  setHeader: (name: string, value: string) => void;
  setBody: (body: string) => void;
  setAuthMethod: (method: 'session' | 'api_key') => void;
  setApiKey: (key: string) => void;
  sendRequest: () => Promise<void>;
  clearResponse: () => void;
  clearHistory: () => void;
  loadRequest: (request: ExplorerRequest) => void;
}

export const useApiExplorerStore = create<ExplorerState>()(
  persist(
    (set, get) => ({
      // Initial state
      selectedEndpoint: null,
      pathParams: {},
      queryParams: {},
      headers: {
        'Content-Type': 'application/json',
      },
      body: '',
      authMethod: 'session',
      apiKey: '', // NOT persisted for security - session-only
      response: null,
      isLoading: false,
      error: null,
      history: [],

      // Actions
      setSelectedEndpoint: (endpoint) => {
        set({ selectedEndpoint: endpoint });
        // Reset form state
        if (endpoint) {
          // Initialize default path params from endpoint definition
          const defaultPathParams: Record<string, string> = {};
          endpoint.parameters.path?.forEach((param) => {
            if (param.default) {
              defaultPathParams[param.name] = param.default;
            }
          });
          set({
            pathParams: defaultPathParams,
            queryParams: {},
            body: '',
            response: null,
            error: null,
          });
        }
      },

      setPathParam: (name, value) => {
        set((state) => ({
          pathParams: { ...state.pathParams, [name]: value },
        }));
      },

      setQueryParam: (name, value) => {
        set((state) => ({
          queryParams: { ...state.queryParams, [name]: value },
        }));
      },

      setHeader: (name, value) => {
        set((state) => ({
          headers: { ...state.headers, [name]: value },
        }));
      },

      setBody: (body) => {
        set({ body });
      },

      setAuthMethod: (method) => {
        set({ authMethod: method });
      },

      setApiKey: (key) => {
        set({ apiKey: key });
      },

      sendRequest: async () => {
        const state = get();
        if (!state.selectedEndpoint) {
          set({ error: 'No endpoint selected' });
          return;
        }

        set({ isLoading: true, error: null, response: null });

        try {
          const startTime = Date.now();

          // Build URL with path and query parameters
          let url = `/api/v1${state.selectedEndpoint.path}`;

          // Replace path parameters
          Object.entries(state.pathParams).forEach(([key, value]) => {
            url = url.replace(`{${key}}`, encodeURIComponent(value));
          });

          // Add query parameters
          const searchParams = new URLSearchParams();
          Object.entries(state.queryParams).forEach(([key, value]) => {
            if (value) searchParams.append(key, value);
          });
          const queryString = searchParams.toString();
          if (queryString) {
            url += `?${queryString}`;
          }

          // Build headers with authentication
          const headers: HeadersInit = {};
          Object.entries(state.headers).forEach(([key, value]) => {
            headers[key] = value;
          });

          // Add authentication header based on auth method
          if (state.authMethod === 'api_key' && state.apiKey) {
            headers['Authorization'] = `Bearer ${state.apiKey}`;
          } else if (state.authMethod === 'session') {
            // Session auth uses cookies automatically - no additional header needed
            // But we could add session token if needed
            const sessionToken = document.cookie
              .split('; ')
              .find((row) => row.startsWith('next-auth.session-token='))
              ?.split('=')[1];
            if (sessionToken) {
              headers['Authorization'] = `Bearer ${sessionToken}`;
            }
          }

          // Build fetch options
          const options: RequestInit = {
            method: state.selectedEndpoint.method,
            headers,
          };

          // Add body for methods that support it
          if (['post', 'put', 'patch'].includes(state.selectedEndpoint.method) && state.body) {
            // Validate JSON for application/json content type
            if (state.headers['Content-Type'] === 'application/json') {
              try {
                JSON.parse(state.body); // Validate it's valid JSON
              } catch {
                throw new Error('Invalid JSON in request body');
              }
            }
            options.body = state.body;
          }

          // Execute request
          const response = await fetch(url, options);
          const duration = Date.now() - startTime;

          // Parse response
          const contentType = response.headers.get('content-type') || '';
          let responseBody: unknown;

          if (contentType.includes('application/json')) {
            responseBody = await response.json();
          } else {
            responseBody = await response.text();
          }

          // Convert headers to record
          const responseHeaders: Record<string, string> = {};
          response.headers.forEach((value, key) => {
            responseHeaders[key] = value;
          });

          // Set response
          set({
            response: {
              status: response.status,
              statusText: response.statusText,
              headers: responseHeaders,
              body: responseBody,
              duration,
            },
          });

          // Add to history with status and success info
          const historyItem: ExplorerRequest = {
            id: crypto.randomUUID().slice(0, 8),
            method: state.selectedEndpoint.method,
            path: `/api/v1${state.selectedEndpoint.path}`,
            queryParams: { ...state.queryParams },
            headers: { ...state.headers },
            body: state.body,
            timestamp: Date.now(),
            status: response.status,
            success: response.ok,
          };
          set((state) => ({
            history: [historyItem, ...state.history].slice(0, 50), // Keep last 50
          }));

        } catch (err) {
          set({
            error: err instanceof Error ? err.message : 'Request failed',
            isLoading: false,
          });
        } finally {
          set({ isLoading: false });
        }
      },

      clearResponse: () => {
        set({ response: null, error: null });
      },

      clearHistory: () => {
        set({ history: [] });
      },

      loadRequest: (request) => {
        set({
          pathParams: {},
          queryParams: request.queryParams,
          headers: request.headers,
          body: request.body,
          response: null,
          error: null,
        });
      },
    }),
    {
      name: 'api-explorer-storage',
      // Only persist history - NOT auth credentials for security
      partialize: (state) => ({
        history: state.history,
        // authMethod is safe to persist (preference only)
        authMethod: state.authMethod,
        // apiKey is NOT persisted - session-only for security
      }),
    }
  )
);
