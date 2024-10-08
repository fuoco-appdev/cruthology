import { useObservable } from '@ngneat/use-observable';
import * as React from 'react';
import { Helmet } from 'react-helmet';
import { useNavigate } from 'react-router-dom';
import ExploreController from '../../shared/controllers/explore.controller';
import PermissionsController from '../../shared/controllers/permissions.controller';
import WindowController from '../../shared/controllers/window.controller';
import { PermissionsState } from '../../shared/models/permissions.model';
import { WindowState } from '../../shared/models/window.model';
import { RoutePathsType } from '../../shared/route-paths-type';
import { useQuery } from '../route-paths';

const PermissionsDesktopComponent = React.lazy(
  () => import('./desktop/permissions.desktop.component')
);
const PermissionsMobileComponent = React.lazy(
  () => import('./mobile/permissions.mobile.component')
);

export interface PermissionsResponsiveProps {
  permissionsProps: PermissionsState;
  windowProps: WindowState;
  onAccessLocationChecked: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onContinueAsync: () => void;
}

export default function PermissionsComponent(): JSX.Element {
  const [permissionsProps] = useObservable(PermissionsController.model.store);
  const [permissionsDebugProps] = useObservable(
    PermissionsController.model.debugStore
  );
  const [windowProps] = useObservable(WindowController.model.store);
  const renderCountRef = React.useRef<number>(0);
  const navigate = useNavigate();
  const query = useQuery();

  const onAccessLocationChecked = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.currentTarget.checked) {
      navigator.geolocation.getCurrentPosition(
        (position) => PermissionsController.updateCurrentPosition(position),
        (error) => console.error(error)
      );
    } else {
      PermissionsController.updateCurrentPosition(undefined);
    }
  };

  const onContinueAsync = async () => {
    if (windowProps.loadedLocationPath !== RoutePathsType.Permissions) {
      navigate({
        pathname: windowProps.loadedLocationPath ?? RoutePathsType.Explore,
        search: query.toString(),
      });
    } else {
      navigate({ pathname: RoutePathsType.Explore, search: query.toString() });
    }
  };

  const updateDefaultInventoryLocationAsync = async () => {
    if (!ExploreController.model.selectedInventoryLocation) {
      const defaultInventoryLocation =
        await ExploreController.getDefaultInventoryLocationAsync();
      await WindowController.updateQueryInventoryLocationAsync(
        defaultInventoryLocation?.id,
        query
      );
    }
  };

  React.useEffect(() => {
    renderCountRef.current += 1;

    PermissionsController.load(renderCountRef.current);

    return () => {
      PermissionsController.disposeLoad(renderCountRef.current);
    };
  }, []);

  React.useLayoutEffect(() => {
    return () => {
      updateDefaultInventoryLocationAsync();
    };
  }, []);

  const suspenceComponent = (
    <>
      {/* <PermissionsSuspenseDesktopComponent />
      <PermissionsSuspenseTabletComponent />
      <PermissionsSuspenseMobileComponent /> */}
    </>
  );

  if (permissionsDebugProps.suspense) {
    return suspenceComponent;
  }

  return (
    <>
      <Helmet>
        <title>Permissions | fuoco.appdev</title>
        <link rel="canonical" href={window.location.href} />
        <meta name="title" content={'Permissions | fuoco.appdev'} />
        <meta
          name="description"
          content={
            'Enhance your Cruthology Wine Club experience by granting app permissions.'
          }
        />
        <meta
          property="og:image"
          content={'https://cruthology.com/assets/opengraph/opengraph.jpg'}
        />
        <meta property="og:title" content={'Permissions | fuoco.appdev'} />
        <meta
          property="og:description"
          content={
            'Enhance your Cruthology Wine Club experience by granting app permissions.'
          }
        />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={window.location.href} />
      </Helmet>
      <React.Suspense fallback={suspenceComponent}>
        <PermissionsDesktopComponent
          permissionsProps={permissionsProps}
          windowProps={windowProps}
          onAccessLocationChecked={onAccessLocationChecked}
          onContinueAsync={onContinueAsync}
        />
        <PermissionsMobileComponent
          permissionsProps={permissionsProps}
          windowProps={windowProps}
          onAccessLocationChecked={onAccessLocationChecked}
          onContinueAsync={onContinueAsync}
        />
      </React.Suspense>
    </>
  );
}
