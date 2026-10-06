import { createContext, useContext } from 'react';

/**
 * Tiny hash router: `#/path?key=value`. Hash URLs need no server config, so every screen and
 * state can be deep-linked from the dev app, the prototype, or a static host.
 */
export interface Route {
  path: string;
  params: Record<string, string>;
}

export interface NavigateOptions {
  /** New path; when it changes, params reset unless `keepParams`. */
  path?: string;
  /** Params to set; `undefined` removes one. */
  params?: Record<string, string | undefined>;
  keepParams?: boolean;
  /** Replace the history entry instead of pushing a new one (e.g. picking a day). */
  replace?: boolean;
}

export interface Router {
  route: Route;
  navigate: (options: NavigateOptions) => void;
}

export const DEFAULT_PATH = '/plan';

export function parseHash(hash: string): Route {
  const raw = hash.replace(/^#/, '');
  const [path, query = ''] = raw.split('?');
  return { path: path || DEFAULT_PATH, params: Object.fromEntries(new URLSearchParams(query)) };
}

export function formatHash(route: Route): string {
  const query = new URLSearchParams(route.params).toString();
  return `#${route.path}${query ? `?${query}` : ''}`;
}

/** Apply navigate options to a route. */
export function nextRoute(current: Route, { path, params, keepParams }: NavigateOptions): Route {
  const changingPath = path !== undefined && path !== current.path;
  const base = changingPath && !keepParams ? {} : { ...current.params };
  for (const [key, value] of Object.entries(params ?? {})) {
    if (value === undefined || value === '') delete base[key];
    else base[key] = value;
  }
  return { path: path ?? current.path, params: base };
}

export const RouterContext = createContext<Router | null>(null);

export function useRouter(): Router {
  const router = useContext(RouterContext);
  if (!router) throw new Error('useRouter needs a <HashRouter> or <MemoryRouter> above it');
  return router;
}
