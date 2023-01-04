/* eslint-disable @typescript-eslint/no-empty-interface */
import { useLocation, useNavigate } from 'react-router-dom';
import { Auth } from '@fuoco.appdev/core-ui';
import SigninController from '../controllers/signin.controller';
import WindowController from '../controllers/window.controller';
import styles from './signin.module.scss';
import AuthService from '../services/auth.service';
import { RoutePaths } from '../route-paths';
import { ApiError } from '@supabase/supabase-js';
import { Strings } from '../strings';
import { useState, useEffect } from 'react';
import { animated, config, useTransition } from 'react-spring';
import WorldController from '../controllers/world.controller';

export interface SigninProps {}

function AuthComponent(): JSX.Element {
  const navigate = useNavigate();
  const [error, setError] = useState<ApiError | null>(null);

  useEffect(() => {
    WorldController.updateIsError(error !== null);
  }, [error]);

  return (
    <Auth
      providers={[
        'spotify',
        'discord',
        'facebook',
        'github',
        'google',
        'twitch',
        'twitter',
      ]}
      view={'sign_in'}
      socialColors={true}
      strings={{
        signInWith: Strings.signInWith,
        orContinueWith: Strings.orContinueWith,
        emailAddress: Strings.emailAddress,
        password: Strings.password,
        rememberMe: Strings.rememberMe,
        forgotYourPassword: Strings.forgotYourPassword,
        signIn: Strings.signIn,
        doYouHaveAnAccount: Strings.doYouHaveAnAccount,
      }}
      emailErrorMessage={error ? Strings.emailErrorMessage : undefined}
      passwordErrorMessage={error ? Strings.passwordErrorMessage : undefined}
      supabaseClient={AuthService.supabaseClient}
      onForgotPasswordRedirect={() => navigate(RoutePaths.ForgotPassword)}
      onTermsOfServiceRedirect={() => navigate(RoutePaths.TermsOfService)}
      onPrivacyPolicyRedirect={() => navigate(RoutePaths.PrivacyPolicy)}
      onSigninRedirect={() => navigate(RoutePaths.Signin)}
      onSignupRedirect={() => navigate(RoutePaths.Signup)}
      onSigninError={(error: ApiError) => setError(error)}
      redirectTo={RoutePaths.User}
    />
  );
}

export default function SigninComponent(): JSX.Element {
  const location = useLocation();
  const [show, setShow] = useState(false);
  SigninController.model.location = location;

  useEffect(() => {
    setShow(true);

    return () => {
      setShow(false);
    };
  }, []);

  const transitions = useTransition(show, {
    from: { opacity: 0, y: 5 },
    enter: { opacity: 1, y: 0 },
    leave: { opacity: 0, y: 5 },
    config: config.gentle,
  });

  return (
    <div className={styles['root']}>
      <div className={styles['content']}>
        {transitions(
          (style, item) =>
            item && (
              <animated.div style={style}>
                <AuthComponent />
              </animated.div>
            )
        )}
      </div>
    </div>
  );
}
