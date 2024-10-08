import { useObservable } from '@ngneat/use-observable';
import * as React from 'react';
import { Helmet } from 'react-helmet';
import WindowController from '../../shared/controllers/window.controller';
import { WindowState } from '../../shared/models/window.model';
import { AuthenticatedComponent } from './authenticated.component';
import SettingsSuspenseDesktopComponent from './desktop/suspense/settings.suspense.desktop';
import SettingsSuspenseMobileComponent from './mobile/suspense/settings.suspense.mobile';

const SettingsDesktopComponent = React.lazy(
  () => import('./desktop/settings.desktop.component')
);
const SettingsMobileComponent = React.lazy(
  () => import('./mobile/settings.mobile.component')
);

export interface SettingsResponsiveProps {
  windowProps: WindowState;
}

export default function SettingsComponent(): JSX.Element {
  const [windowProps] = useObservable(WindowController.model.store);
  const [windowDebugProps] = useObservable(WindowController.model.debugStore);

  const suspenceComponent = (
    <>
      <SettingsSuspenseDesktopComponent />
      <SettingsSuspenseMobileComponent />
    </>
  );

  if (windowDebugProps.suspense) {
    return suspenceComponent;
  }

  return (
    <>
      <Helmet>
        <title>Cruthology</title>
        <link rel="canonical" href={window.location.href} />
        <meta name="title" content={'Cruthology'} />
        <meta
          name="description"
          content={
            'An exclusive wine club offering high-end dinners, entertainment, and enchanting wine tastings, providing a gateway to extraordinary cultural experiences.'
          }
        />
        <meta
          property="og:image"
          content={'https://cruthology.com/assets/opengraph/opengraph.jpg'}
        />
        <meta property="og:title" content={'Home | fuoco.appdev'} />
        <meta
          property="og:description"
          content={
            'An exclusive wine club offering high-end dinners, entertainment, and enchanting wine tastings, providing a gateway to extraordinary cultural experiences.'
          }
        />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={window.location.href} />
      </Helmet>
      <React.Suspense fallback={suspenceComponent}>
        <AuthenticatedComponent>
          <SettingsDesktopComponent windowProps={windowProps} />
          <SettingsMobileComponent windowProps={windowProps} />
        </AuthenticatedComponent>
      </React.Suspense>
    </>
  );
}
