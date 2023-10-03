/* eslint-disable @typescript-eslint/no-empty-interface */
import { useLocation, useNavigate } from 'react-router-dom';
import { Auth } from '@fuoco.appdev/core-ui';
import SigninController from '../controllers/signin.controller';
import WindowController from '../controllers/window.controller';
import styles from './signin.module.scss';
import SupabaseService from '../services/supabase.service';
import { RoutePathsType } from '../route-paths';
import { AuthError } from '@supabase/supabase-js';
import { useState, useEffect } from 'react';
import { animated, config, useTransition } from 'react-spring';
import {
  ResponsiveDesktop,
  ResponsiveMobile,
  ResponsiveTablet,
} from './responsive.component';
import { useTranslation } from 'react-i18next';
import { useObservable } from '@ngneat/use-observable';
import { Helmet } from 'react-helmet';
import { SigninState } from '../models/signin.model';
import { GuestComponent } from './guest.component';
import { lazy } from '@loadable/component';
import React from 'react';

const SigninDesktopComponent = lazy(
  () => import('./desktop/signin.desktop.component')
);
const SigninMobileComponent = lazy(
  () => import('./mobile/signin.mobile.component')
);

export interface SigninResponsiveProps {
  signInProps: SigninState;
  setAuthError: (error: AuthError | null) => void;
  emailError: string;
  passwordError: string;
}

export interface SigninProps {}

export default function SigninComponent(): JSX.Element {
  const location = useLocation();
  SigninController.model.location = location;
  const { t } = useTranslation();
  const [signInProps] = useObservable(SigninController.model.store);
  const [authError, setAuthError] = useState<AuthError | null>(null);
  const [emailError, setEmailError] = useState<string>('');
  const [passwordError, setPasswordError] = useState<string>('');

  useEffect(() => {
    if (authError?.message === 'Invalid login credentials') {
      setEmailError(t('invalidLoginCredentials') ?? '');
      setPasswordError(t('invalidLoginCredentials') ?? '');
    } else if (authError?.message === 'Email not confirmed') {
      setEmailError(t('emailNotConfirmed') ?? '');
      setPasswordError('');
      SigninController.resendEmailConfirmationAsync(
        signInProps.email ?? '',
        () => {
          WindowController.addToast({
            key: `signin-email-confirmation-sent-${Math.random()}`,
            message: t('emailConfirmation') ?? '',
            description: t('emailConfirmationDescription') ?? '',
            type: 'loading',
          });
        }
      );
    } else {
      if (authError) {
        WindowController.addToast({
          key: `signin-${Math.random()}`,
          message: authError?.name,
          description: authError?.message,
          type: 'error',
        });
      }

      setEmailError('');
      setPasswordError('');
    }
  }, [authError, signInProps.email]);

  const suspenceComponent = (
    <>
      <ResponsiveDesktop>
        <div />
      </ResponsiveDesktop>
      <ResponsiveTablet>
        <div />
      </ResponsiveTablet>
      <ResponsiveMobile>
        <div />
      </ResponsiveMobile>
    </>
  );

  if (process.env['DEBUG_SUSPENSE'] === 'true') {
    return suspenceComponent;
  }

  return (
    <>
      <Helmet>
        <title>Sign In | Cruthology</title>
        <link rel="canonical" href={window.location.href} />
        <meta name="title" content={'Sign In | Cruthology'} />
        <meta
          name="description"
          content={
            'Sign in to your Cruthology account to continue your journey through the world of exceptional wines, gourmet experiences, and exclusive cultural events. Your palate is in for a treat!'
          }
        />
        <meta
          property="og:image"
          content={'https://cruthology.com/assets/opengraph/opengraph.jpg'}
        />
        <meta property="og:title" content={'Sign In | Cruthology'} />
        <meta
          property="og:description"
          content={
            'Sign in to your Cruthology account to continue your journey through the world of exceptional wines, gourmet experiences, and exclusive cultural events. Your palate is in for a treat!'
          }
        />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={window.location.href} />
      </Helmet>
      <React.Suspense fallback={suspenceComponent}>
        <GuestComponent>
          <ResponsiveDesktop>
            <SigninDesktopComponent
              signInProps={signInProps}
              setAuthError={setAuthError}
              emailError={emailError}
              passwordError={passwordError}
            />
          </ResponsiveDesktop>
          <ResponsiveMobile>
            <SigninMobileComponent
              signInProps={signInProps}
              setAuthError={setAuthError}
              emailError={emailError}
              passwordError={passwordError}
            />
          </ResponsiveMobile>
        </GuestComponent>
      </React.Suspense>
    </>
  );
}
