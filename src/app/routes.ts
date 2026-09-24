export const ROUTE_PATHS = {
  home: '/',
  live: '/live',
  forecast: '/forecast',
  campus: '/campus',
  status: '/status',
  about: '/about',
  privacy: '/privacy',
  imprint: '/imprint',
} as const;

export const REQUIRED_ROUTE_PATHS = Object.values(ROUTE_PATHS);
