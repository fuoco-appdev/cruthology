/* eslint-disable @typescript-eslint/no-empty-interface */
import { useLocation, useNavigate } from "react-router-dom";
import {Auth} from '@fuoco.appdev/core-ui';
import SigninController from '../controllers/signin.controller';
import styles from './signin.module.scss';
import AuthService from '../services/auth.service';
import { RoutePaths } from '../route-paths';
import { ApiError } from "@supabase/supabase-js";
import { Strings } from "../localization";
import { useState } from "react";

export interface SigninProps {}

function AuthComponent(): JSX.Element {
  const navigate = useNavigate();
  const [error, setError] = useState<ApiError | null>(null)
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
        doYouHaveAnAccount: Strings.doYouHaveAnAccount
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
  SigninController.model.location = location;
  
  return (
    <div className={styles["root"]}>
      <div className={styles["content"]}>
          <AuthComponent />
      </div>
    </div>
  );
}