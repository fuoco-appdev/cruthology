import { useCookies } from 'react-cookie';
import { Navigate } from 'react-router-dom';
import { RoutePathsType } from '../../shared/route-paths-type';

export interface GuestProps {
  children: any;
}

export function GuestComponent({ children }: GuestProps): React.ReactElement {
  const [cookies] = useCookies();
  const accessToken =
    Object.keys(cookies).includes('sb-access-token') &&
    cookies['sb-access-token'];
  const refreshToken =
    Object.keys(cookies).includes('sb-refresh-token') &&
    cookies['sb-refresh-token'];
  return !accessToken && !refreshToken ? (
    children
  ) : (
    <Navigate to={RoutePathsType.AccountLikes} />
  );
}
