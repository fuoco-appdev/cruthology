/* eslint-disable @typescript-eslint/no-empty-interface */
import { useObservable } from '@ngneat/use-observable';
import { AuthError } from '@supabase/supabase-js';
import * as React from 'react';
import { Helmet } from 'react-helmet';
import ResetPasswordController from '../../shared/controllers/reset-password.controller';
import WindowController from '../../shared/controllers/window.controller';
import { ResetPasswordState } from '../../shared/models';
import {
  ResponsiveSuspenseDesktop,
  ResponsiveSuspenseMobile,
  ResponsiveSuspenseTablet,
} from './responsive.component';

const ResetPasswordDesktopComponent = React.lazy(
  () => import('./desktop/reset-password.desktop.component')
);
const ResetPasswordMobileComponent = React.lazy(
  () => import('./mobile/reset-password.mobile.component')
);

export interface ResetPasswordProps {}

export interface ResetPasswordResponsiveProps {
  resetPasswordProps: ResetPasswordState;
  passwordError: string;
  confirmPasswordError: string;
  setAuthError: (error: AuthError | null) => void;
}

export default function ResetPasswordComponent(): JSX.Element {
  const [authError, setAuthError] = React.useState<AuthError | null>(null);
  const [passwordError, setPasswordError] = React.useState<string>('');
  const [confirmPasswordError, setConfirmPasswordError] =
    React.useState<string>('');
  const [resetPasswordProps] = useObservable(
    ResetPasswordController.model.store
  );
  const [resetDebugPasswordProps] = useObservable(
    ResetPasswordController.model.debugStore
  );
  const renderCountRef = React.useRef<number>(0);

  React.useEffect(() => {
    ResetPasswordController.load(renderCountRef.current);

    return () => {
      ResetPasswordController.disposeLoad(renderCountRef.current);
    };
  }, []);

  React.useEffect(() => {
    if (authError) {
      WindowController.addToast({
        key: `reset-password-${Math.random()}`,
        message: authError?.name,
        description: authError?.message,
        type: 'error',
      });
    } else {
      setPasswordError('');
      setConfirmPasswordError('');
    }
  }, [authError, resetPasswordProps.password]);

  const suspenceComponent = (
    <>
      <ResponsiveSuspenseDesktop>
        <div />
      </ResponsiveSuspenseDesktop>
      <ResponsiveSuspenseTablet>
        <div />
      </ResponsiveSuspenseTablet>
      <ResponsiveSuspenseMobile>
        <div />
      </ResponsiveSuspenseMobile>
    </>
  );

  if (resetDebugPasswordProps.suspense) {
    return suspenceComponent;
  }

  return (
    <>
      <Helmet>
        <title>Reset Password | fuoco.appdev</title>
        <link rel="canonical" href={window.location.href} />
        <meta name="title" content={'Reset Password | fuoco.appdev'} />
        <meta
          name="description"
          content={
            'Reset your Cruthology password to continue your journey through the world of exceptional wines, gourmet experiences, and exclusive cultural events. Your palate is in for a treat!'
          }
        />
        <meta
          property="og:image"
          content={'https://cruthology.com/assets/opengraph/opengraph.jpg'}
        />
        <meta property="og:title" content={'Reset Password | fuoco.appdev'} />
        <meta
          property="og:description"
          content={
            'Reset your Cruthology password to continue your journey through the world of exceptional wines, gourmet experiences, and exclusive cultural events. Your palate is in for a treat!'
          }
        />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={window.location.href} />
      </Helmet>
      <React.Suspense fallback={suspenceComponent}>
        <ResetPasswordDesktopComponent
          resetPasswordProps={resetPasswordProps}
          passwordError={passwordError}
          confirmPasswordError={confirmPasswordError}
          setAuthError={setAuthError}
        />
        <ResetPasswordMobileComponent
          resetPasswordProps={resetPasswordProps}
          passwordError={passwordError}
          confirmPasswordError={confirmPasswordError}
          setAuthError={setAuthError}
        />
      </React.Suspense>
    </>
  );
}
