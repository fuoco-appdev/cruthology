/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { AuthChangeEvent, Session } from '@supabase/supabase-js';
import { Subscription } from 'rxjs';
import { Controller } from '../controller';
import { WindowModel } from '../models/window.model';
import { RoutePaths } from '../route-paths';
import SupabaseService from '../services/supabase.service';
import WorldController from './world.controller';
import { Location } from 'react-router-dom';
import UserService from '../services/user.service';
import CustomerService from '../services/customer.service';
import * as core from '../protobuf/core_pb';
import SecretsService from '../services/secrets.service';
import { LanguageCode, ToastProps } from '@fuoco.appdev/core-ui';
import AccountService from '../services/account.service';

class WindowController extends Controller {
  private readonly _model: WindowModel;
  private _scrollRef: HTMLDivElement | null;
  private _userSubscription: Subscription | undefined;
  private _customerSubscription: Subscription | undefined;

  constructor() {
    super();

    this._model = new WindowModel();
    this._scrollRef = null;

    this.onAuthStateChanged = this.onAuthStateChanged.bind(this);

    SupabaseService.supabaseClient.auth.onAuthStateChange(
      this.onAuthStateChanged
    );
  }

  public get model(): WindowModel {
    return this._model;
  }

  public get scrollRef(): HTMLDivElement | null {
    return this._scrollRef;
  }

  public set scrollRef(value: HTMLDivElement | null) {
    if (this._scrollRef !== value) {
      this._scrollRef = value;
    }
  }

  public initialize(): void {
    this._userSubscription = UserService.activeUserObservable.subscribe({
      next: (user: core.User | null) => {
        this._model.isAuthenticated = user ? true : false;
        this._model.user = user;
      },
    });

    this._customerSubscription =
      CustomerService.activeCustomerObservable.subscribe({
        next: (customer: core.Customer | null) => {
          this._model.isAuthenticated = customer ? true : false;
          this._model.customer = customer;
        },
      });
  }

  public async checkUserIsAuthenticatedAsync(): Promise<void> {
    this._model.isLoading = true;
    const supabaseUser = await SupabaseService.requestUserAsync();
    if (!supabaseUser) {
      this._model.isLoading = false;
    }
  }

  public dispose(): void {
    this._userSubscription?.unsubscribe();
    this._customerSubscription?.unsubscribe();
  }

  public updateIsLoading(value: boolean): void {
    this._model.isLoading = value;
  }

  public updateAuthState(value: AuthChangeEvent): void {
    this._model.authState = value;
  }

  public updateIsSigninVisible(isVisible: boolean): void {
    this._model.isSigninVisible = isVisible;
  }

  public updateIsSignupVisible(isVisible: boolean): void {
    this._model.isSignupVisible = isVisible;
  }

  public updateShowConfirmEmailAlert(show: boolean): void {
    this._model.showConfirmEmailAlert = show;
  }

  public updateShowPasswordResetAlert(show: boolean): void {
    this._model.showPasswordResetAlert = show;
  }

  public updateToasts(toasts: ToastProps[]): void {
    this._model.toasts = toasts;
  }

  public updateLanguage(language: LanguageCode): void {
    this._model.language = language;
  }

  public updateOnLocationChanged(location: Location): void {
    switch (location.pathname) {
      case RoutePaths.Landing:
        this._model.isSigninVisible = true;
        this._model.isSignupVisible = false;
        this._model.isSignoutVisible = false;
        this._model.isTabBarVisible = false;
        this._model.activeRoute = RoutePaths.Landing;
        break;
      case RoutePaths.Signin:
        this._model.isSigninVisible = false;
        this._model.isSignupVisible = true;
        this._model.isSignoutVisible = false;
        this._model.isTabBarVisible = false;
        this._model.activeRoute = RoutePaths.Signin;
        break;
      case RoutePaths.Signup:
        this._model.isSigninVisible = true;
        this._model.isSignupVisible = false;
        this._model.isSignoutVisible = false;
        this._model.isTabBarVisible = false;
        this._model.activeRoute = RoutePaths.Signup;
        break;
      case RoutePaths.ForgotPassword:
        this._model.isSigninVisible = false;
        this._model.isSignupVisible = true;
        this._model.isSignoutVisible = false;
        this._model.isTabBarVisible = false;
        this._model.activeRoute = RoutePaths.ForgotPassword;
        break;
      case RoutePaths.ResetPassword:
        this._model.isSigninVisible = false;
        this._model.isSignupVisible = UserService.activeUser === null;
        this._model.isSignoutVisible = UserService.activeUser !== null;
        this._model.isTabBarVisible = false;
        this._model.activeRoute = RoutePaths.ResetPassword;
        break;
      case RoutePaths.TermsOfService:
        this._model.isSigninVisible = false;
        this._model.isSignupVisible = true;
        this._model.isSignoutVisible = false;
        this._model.isTabBarVisible = false;
        this._model.activeRoute = RoutePaths.TermsOfService;
        break;
      case RoutePaths.PrivacyPolicy:
        this._model.isSigninVisible = false;
        this._model.isSignupVisible = true;
        this._model.isSignoutVisible = false;
        this._model.isTabBarVisible = false;
        this._model.activeRoute = RoutePaths.PrivacyPolicy;
        break;
      case RoutePaths.User:
        this._model.isSignoutVisible = true;
        this._model.isSigninVisible = false;
        this._model.isSignupVisible = false;
        this._model.isTabBarVisible = false;
        this._model.activeRoute = RoutePaths.User;
        break;
      case RoutePaths.GetStarted:
        this._model.isSignoutVisible = true;
        this._model.isSigninVisible = false;
        this._model.isSignupVisible = false;
        this._model.isTabBarVisible = false;
        this._model.activeRoute = RoutePaths.GetStarted;
        break;
      case RoutePaths.Account:
        this._model.isSignoutVisible = true;
        this._model.isSigninVisible = false;
        this._model.isSignupVisible = false;
        this._model.isTabBarVisible = true;
        this._model.activeRoute = RoutePaths.Account;
        break;
      case RoutePaths.Apps:
        this._model.isSignoutVisible = true;
        this._model.isSigninVisible = false;
        this._model.isSignupVisible = false;
        this._model.isTabBarVisible = true;
        this._model.activeRoute = RoutePaths.Apps;
        break;
      case RoutePaths.Billing:
        this._model.isSignoutVisible = true;
        this._model.isSigninVisible = false;
        this._model.isSignupVisible = false;
        this._model.isTabBarVisible = true;
        this._model.activeRoute = RoutePaths.Billing;
        break;
      case RoutePaths.Admin:
        this._model.isSignoutVisible = true;
        this._model.isSigninVisible = false;
        this._model.isSignupVisible = false;
        this._model.isTabBarVisible = true;
        this._model.activeRoute = RoutePaths.Admin;
        break;
      case RoutePaths.AdminAccount:
        this._model.isSignoutVisible = true;
        this._model.isSigninVisible = false;
        this._model.isSignupVisible = false;
        this._model.isTabBarVisible = true;
        this._model.activeRoute = RoutePaths.AdminAccount;
        break;
      case RoutePaths.AdminAccounts:
        this._model.isSignoutVisible = true;
        this._model.isSigninVisible = false;
        this._model.isSignupVisible = false;
        this._model.isTabBarVisible = true;
        this._model.activeRoute = RoutePaths.AdminAccounts;
        break;
      case RoutePaths.AdminApps:
        this._model.isSignoutVisible = true;
        this._model.isSigninVisible = false;
        this._model.isSignupVisible = false;
        this._model.isTabBarVisible = true;
        this._model.activeRoute = RoutePaths.AdminApps;
        break;
      default:
        this._model.isSigninVisible = UserService.activeUser === null;
        this._model.isSignupVisible = false;
        this._model.isSignoutVisible = UserService.activeUser !== null;
        this._model.isTabBarVisible = false;
        this._model.activeRoute = RoutePaths.Default;
        break;
    }
  }

  private async onAuthStateChanged(
    event: AuthChangeEvent,
    session: Session | null
  ): Promise<void> {
    if (session) {
      await SecretsService.requestAllAsync();
    }

    if (event === 'SIGNED_IN') {
      WorldController.updateIsError(false);

      // Request admin, member or developer
      const user = await this.requestActiveUserAsync();
      if (!user) {
        // Request customer
        const customer = await this.requestActiveCustomerAsync();
        if (customer) {
          await this.requestActiveAccountAsync(customer.id);
        }
      } else {
        await this.requestActiveAccountAsync(user.id);
      }
    } else if (event === 'SIGNED_OUT') {
      UserService.clearActiveUser();
      CustomerService.clearActiveCustomer();
      AccountService.clearActiveAccount();
      SecretsService.clearSecrets();
    } else if (event === 'USER_DELETED') {
      UserService.clearActiveUser();
      CustomerService.clearActiveCustomer();
      AccountService.clearActiveAccount();
      SecretsService.clearSecrets();
    }

    this._model.authState = event;
    this._model.isLoading = false;
  }

  private async requestActiveUserAsync(): Promise<core.User | null> {
    try {
      return await UserService.requestActiveAsync();
    } catch (error: any) {
      if (error.status !== 404) {
        console.error(error);
      }

      return null;
    }
  }

  private async requestActiveCustomerAsync(): Promise<core.Customer | null> {
    try {
      return await CustomerService.requestActiveAsync();
    } catch (error: any) {
      if (error.status !== 404) {
        console.error(error);
        return null;
      }

      try {
        return await CustomerService.requestCreateAsync();
      } catch (error: any) {
        console.error(error);
        return null;
      }
    }
  }

  private async requestActiveAccountAsync(
    userId: string
  ): Promise<core.Account | null> {
    try {
      return await AccountService.requestActiveAsync();
    } catch (error: any) {
      if (error.status !== 404) {
        console.error(error);
        return null;
      }

      try {
        return await AccountService.requestCreateAsync(userId);
      } catch (error: any) {
        console.error(error);
        return null;
      }
    }
  }
}

export default new WindowController();
