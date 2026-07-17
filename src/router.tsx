import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";

export const getRouter = () => {
  const queryClient = new QueryClient();

  const router = createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    defaultPreloadStaleTime: 0,
    defaultPendingMs: 200,       // wait 200ms before showing any pending UI (avoids flash for fast loads)
    defaultPendingMinMs: 300,    // if pending UI shows, keep it for at least 300ms (avoids flicker)
  });

  return router;
};
