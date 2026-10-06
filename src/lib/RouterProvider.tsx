import { useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { formatHash, nextRoute, parseHash, RouterContext, type NavigateOptions, type Route } from './router';

/** Router backed by the URL hash — used by the app and the prototype. */
export function HashRouter({ children }: { children: ReactNode }) {
  const [route, setRoute] = useState<Route>(() => parseHash(window.location.hash));
  // Latest route, so several navigate calls in one event build on each other.
  const routeRef = useRef(route);

  useEffect(() => {
    const sync = () => {
      routeRef.current = parseHash(window.location.hash);
      setRoute(routeRef.current);
    };
    window.addEventListener('popstate', sync);
    window.addEventListener('hashchange', sync);
    return () => {
      window.removeEventListener('popstate', sync);
      window.removeEventListener('hashchange', sync);
    };
  }, []);

  const navigate = useCallback((options: NavigateOptions) => {
    const next = nextRoute(routeRef.current, options);
    routeRef.current = next;
    const hash = formatHash(next);
    if (hash !== window.location.hash) {
      if (options.replace) window.history.replaceState(null, '', hash);
      else window.history.pushState(null, '', hash);
    }
    setRoute(next);
  }, []);

  const value = useMemo(() => ({ route, navigate }), [route, navigate]);
  return <RouterContext.Provider value={value}>{children}</RouterContext.Provider>;
}

/** In-memory router — used by stories so they never touch the URL. */
export function MemoryRouter({ initial, children }: { initial?: string; children: ReactNode }) {
  const [route, setRoute] = useState<Route>(() => parseHash(initial ?? ''));
  const navigate = useCallback((options: NavigateOptions) => setRoute((current) => nextRoute(current, options)), []);
  const value = useMemo(() => ({ route, navigate }), [route, navigate]);
  return <RouterContext.Provider value={value}>{children}</RouterContext.Provider>;
}

/** Use the router above if there is one; otherwise provide an in-memory one seeded with `initial`. */
export function EnsureRouter({ initial, children }: { initial?: string; children: ReactNode }) {
  const existing = useContext(RouterContext);
  if (existing) return <>{children}</>;
  return <MemoryRouter initial={initial}>{children}</MemoryRouter>;
}
