/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-empty-interface */
import React, {useEffect} from 'react';
import { BrowserRouter, Routes, Route, Navigate} from "react-router-dom";
import WorldController from '../controllers/world.controller';
import WindowController from '../controllers/window.controller';
import SigninController from '../controllers/signin.controller';
import SignupController from '../controllers/signup.controller';
import TermsOfServiceController from '../controllers/terms-of-service.controller';
import PrivacyPolicyController from '../controllers/privacy-policy.controller';
import LoadingController from '../controllers/loading.controller';
import ResetPasswordController from '../controllers/reset-password.controller';
import GetStartedController from '../controllers/get-started.controller';
import AccountController from '../controllers/account.controller';
import AdminAccountController from '../controllers/admin-account.controller';
import AdminUsersController from '../controllers/admin-users.controller';
import UserController from '../controllers/user.controller';
import WindowComponent from './window.component';
import LandingComponent from './landing.component';
import SigninComponent from './signin.component';
import SignupComponent from './signup.component';
import ForgotPasswordComponent from './forgot-password.component';
import ResetPasswordComponent from './reset-password.component';
import TermsOfServiceComponent from './terms-of-service.component';
import PrivacyPolicyComponent from './privacy-policy.component';
import GetStartedComponent from './get-started.component';
import AccountComponent from './account.component';
import { RoutePaths } from '../route-paths';
import UserService from '../services/user.service';
import UserComponent from './user.component';
import { useObservable } from '@ngneat/use-observable';
import { core } from '../protobuf/core';
import AppsComponent from './apps.component';
import BillingComponent from './billing.component';
import AdminComponent from './admin.component';
import AdminAccountComponent from './admin-account.component';
import AdminUsersComponent from './admin-users.component';
import AdminAppsComponent from './admin-apps.component';

interface RouteElementProps {
  element: JSX.Element;
}

function GuestComponent({element}: RouteElementProps): React.ReactElement {
  const [user] = useObservable(UserService.activeUserObservable);
  return (!user ? element : <Navigate to={RoutePaths.User}/>);
}

function AuthenticatedComponent({element}: RouteElementProps): React.ReactElement {
  const [user] = useObservable(UserService.activeUserObservable);
  return (user ? element : <Navigate to={RoutePaths.Signin}/>);
}

function UserRoleComponent({element}: RouteElementProps): React.ReactElement {
  const [user] = useObservable(UserService.activeUserObservable);
  return (user?.role === core.UserRole.USER ? <AuthenticatedComponent element={element} /> : <Navigate to={RoutePaths.Admin}/>);
}

function AdminRoleComponent({element}: RouteElementProps): React.ReactElement {
  const [user] = useObservable(UserService.activeUserObservable);
  return (user?.role === core.UserRole.ADMIN ? <AuthenticatedComponent element={element} /> : <Navigate to={RoutePaths.User}/>);
}

export default function AppComponent(): JSX.Element {
  const unloadCallback = (event: BeforeUnloadEvent) => {
    if (!AccountController.model.isSaveDisabled) {
      event.preventDefault();
      event.returnValue = "";
      return "";
    }

    return null;
  };
  
  useEffect(() => {
    SigninController.initialize();
    SignupController.initialize();
    WorldController.initialize();
    WindowController.initialize();
    TermsOfServiceController.initialize();
    PrivacyPolicyController.initialize();
    LoadingController.initialize();
    ResetPasswordController.initialize();
    UserController.initialize();
    GetStartedController.initialize();
    AccountController.initialize();
    AdminAccountController.initialize();
    AdminUsersController.initialize();
    window.addEventListener("beforeunload", unloadCallback);

    return () => {
      SigninController.dispose();
      SignupController.dispose();
      WorldController.dispose();
      WindowController.dispose();
      TermsOfServiceController.dispose();
      PrivacyPolicyController.dispose();
      LoadingController.dispose();
      ResetPasswordController.dispose();
      UserController.dispose();
      GetStartedController.dispose();
      AccountController.dispose();
      AdminAccountController.dispose();
      AdminUsersController.dispose();
      window.removeEventListener("beforeunload", unloadCallback);
    } 
  }, []);
  return (
    <BrowserRouter>
      <Routes>
        <Route path={RoutePaths.Default} element={<WindowComponent />}>
          <Route index element={<GuestComponent element={<LandingComponent />}/>}/>
          <Route path={RoutePaths.Landing} element={<GuestComponent element={<LandingComponent />}/>}/>
          <Route path={RoutePaths.Signin} element={<GuestComponent element={<SigninComponent />} />}/>
          <Route path={RoutePaths.Signup} element={<GuestComponent element={<SignupComponent />}/> }/>
          <Route path={RoutePaths.ForgotPassword} element={<GuestComponent element={<ForgotPasswordComponent />}/>} />
          <Route path={RoutePaths.TermsOfService} element={<GuestComponent element={<TermsOfServiceComponent />}/> }/>
          <Route path={RoutePaths.PrivacyPolicy} element={<GuestComponent element={<PrivacyPolicyComponent />}/> }/>
          <Route path={RoutePaths.ResetPassword} element={<ResetPasswordComponent />} />
          <Route path={RoutePaths.User} element={<AuthenticatedComponent element={<UserComponent/>}/>}>
            <Route path={RoutePaths.GetStarted} element={<UserRoleComponent element={<GetStartedComponent />} />} />
            <Route path={RoutePaths.Account} element={<UserRoleComponent element={<AccountComponent />} />} />
            <Route path={RoutePaths.Apps} element={<UserRoleComponent element={<AppsComponent />} />} />
            <Route path={RoutePaths.Billing} element={<UserRoleComponent element={<BillingComponent />} />} />
          </Route>
          <Route path={RoutePaths.Admin} element={<AuthenticatedComponent element={<AdminComponent/>}/>}>
            <Route path={RoutePaths.AdminAccount} element={<AdminRoleComponent element={<AdminAccountComponent />} />} />
            <Route path={RoutePaths.AdminUsers} element={<AdminRoleComponent element={<AdminUsersComponent />} />} />
            <Route path={RoutePaths.AdminApps} element={<AdminRoleComponent element={<AdminAppsComponent />} />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
