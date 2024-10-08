import { CookiesProvider } from 'react-cookie';
import { hydrateRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import '../shared/i18n';
import { getRoutePaths } from './route-paths';

const routePaths = getRoutePaths();
const router = createBrowserRouter(routePaths);

hydrateRoot(
  document.getElementById('root') as any,
  <CookiesProvider>
    <RouterProvider router={router} />
  </CookiesProvider>
);
