import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import AccountController from '../controllers/account.controller';
import styles from './account-settings-security.module.scss';
import {
  Accordion,
  Alert,
  Auth,
  Button,
  Line,
  Modal,
  AccordionItemClasses,
} from '@fuoco.appdev/core-ui';
import { RoutePaths } from '../route-paths';
import { useTranslation } from 'react-i18next';
import SupabaseService from '../services/supabase.service';
import { useObservable } from '@ngneat/use-observable';
import { useSpring } from 'react-spring';
import * as core from '../protobuf/core_pb';
import { ResponsiveDesktop, ResponsiveMobile } from './responsive.component';
import LoadingComponent from './loading.component';
import { Store } from '@ngneat/elf';
import Ripples from 'react-ripples';
import { AuthError } from '@supabase/supabase-js';
import windowController from '../controllers/window.controller';

function AccountSettingsSecurityDesktopComponent(): JSX.Element {
  const navigate = useNavigate();
  const [props] = useObservable(AccountController.model.store);

  return <></>;
}

function AccountSettingsSecurityMobileComponent(): JSX.Element {
  const navigate = useNavigate();
  const [props] = useObservable(AccountController.model.store);
  const [updatePasswordError, setUpdatePasswordError] = useState<
    string | undefined
  >(undefined);
  const [confirmPasswordError, setConfirmPasswordError] = useState<
    string | undefined
  >(undefined);
  const { t, i18n } = useTranslation();

  const accordionItemClassNames: AccordionItemClasses = {
    topBar: styles['accordion-top-bar'],
    panel: styles['accordion-panel'],
    topBarLabel: styles['accordion-top-bar-label'],
    button: {
      button: styles['accordion-button'],
    },
  };
  return (
    <div className={styles['root']}>
      <Accordion defaultActiveId={['password-reset']}>
        <Accordion.Item
          id={'password-reset'}
          label={t('passwordReset')}
          classNames={accordionItemClassNames}
          touchScreen={true}
        >
          <Auth.UpdatePassword
            supabaseClient={SupabaseService.supabaseClient}
            defaultIconColor={'#2A2A5F'}
            litIconColor={'#2A2A5F'}
            passwordErrorMessage={updatePasswordError}
            confirmPasswordErrorMessage={confirmPasswordError}
            classNames={{
              input: {
                formLayout: {
                  label: styles['auth-input-form-layout-label'],
                },
                input: styles['auth-input'],
                container: styles['auth-input-container'],
              },
              button: {
                button: styles['auth-button'],
              },
            }}
            strings={{
              newPassword: t('newPassword') ?? '',
              enterYourNewPassword: t('enterYourNewPassword') ?? '',
              updatePassword: t('updatePassword') ?? '',
              confirmNewPassword: t('confirmPassword') ?? '',
            }}
            onUpdatePasswordError={(error: AuthError) => {
              if (error.status === 422) {
                setUpdatePasswordError(t('passwordLengthError') ?? '');
              } else if (error.status === 401) {
                setConfirmPasswordError(t('confirmPasswordErrorMessage') ?? '');
              }
            }}
            onPasswordUpdated={() => {
              windowController.addToast({
                key: `update-password-${Math.random()}`,
                message: t('successfullyUpdatedPassword') ?? '',
                description: t('successfullyUpdatedPasswordDescription') ?? '',
                type: 'success',
              });
            }}
          />
        </Accordion.Item>
      </Accordion>
    </div>
  );
}

export default function AccountSettingsSecurityComponent(): JSX.Element {
  return (
    <>
      <ResponsiveDesktop>
        <AccountSettingsSecurityDesktopComponent />
      </ResponsiveDesktop>
      <ResponsiveMobile>
        <AccountSettingsSecurityMobileComponent />
      </ResponsiveMobile>
    </>
  );
}
