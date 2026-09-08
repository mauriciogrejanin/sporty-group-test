import { QueryCache, QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  // Single place to log a failed query. Today console.warn; in production this
  // is where Sentry or Datadog would be plugged in.
  queryCache: new QueryCache({
    onError: (error, query) => {
      console.warn(`[query] ${JSON.stringify(query.queryKey)} failed: ${error.message}`);
    },
  }),
  defaultOptions: {
    queries: {
      staleTime: 60 * 60 * 1000,
      retry: 1,
    },
  },
});
