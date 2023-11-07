import React, { useEffect, useLayoutEffect, useState } from 'react';
import {
  Typography,
  Button,
  Accordion,
  Input,
  InputPhoneNumber,
  Listbox,
  InputGeocoding,
  OptionProps,
  Modal,
  LanguageSwitch,
  Line,
  Avatar,
  Tabs,
} from '@fuoco.appdev/core-ui';
import styles from '../account.module.scss';
import AccountController from '../../controllers/account.controller';
import WindowController from '../../controllers/window.controller';
import { animated, useTransition, config } from 'react-spring';
import { useObservable } from '@ngneat/use-observable';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { RoutePathsType } from '../../route-paths';
import { useTranslation } from 'react-i18next';
import * as core from '../../protobuf/core_pb';
import AccountProfileFormComponent from '../account-profile-form.component';
import { Customer } from '@medusajs/medusa';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import Skeleton from 'react-loading-skeleton';
import { ResponsiveMobile, useMobileEffect } from '../responsive.component';
import { AccountResponsiveProps } from '../account.component';
import StoreController from 'src/controllers/store.controller';
import { createPortal } from 'react-dom';

export default function AccountMobileComponent({
  windowProps,
  accountProps,
  storeProps,
  onCompleteProfile,
}: AccountResponsiveProps): JSX.Element {
  const { t } = useTranslation();
  const navigate = useNavigate();

  useMobileEffect(() => {
    if (windowProps.activeRoute === RoutePathsType.Account) {
      navigate(RoutePathsType.AccountOrderHistory);
    }
  }, [windowProps.activeRoute]);

  useMobileEffect(() => {
    const loadedLocation = windowProps.loadedLocationPath as string | undefined;
    if (loadedLocation && loadedLocation !== RoutePathsType.Account) {
      if (
        loadedLocation.startsWith(RoutePathsType.Account) &&
        !loadedLocation.startsWith(RoutePathsType.AccountSettings)
      ) {
        AccountController.updateActiveTabId(loadedLocation);
      }
      WindowController.updateLoadedLocationPath(undefined);
    } else {
      if (!loadedLocation?.startsWith(RoutePathsType.AccountSettings)) {
        navigate(accountProps.activeTabId);
      }
    }
  }, [windowProps.loadedLocationPath]);

  const account = accountProps.account as core.Account;
  const customer = accountProps.customer as Customer;
  return (
    <ResponsiveMobile>
      <div className={[styles['root'], styles['root-mobile']].join(' ')}>
        <div
          className={[styles['top-bar'], styles['top-bar-mobile']].join(' ')}
        >
          <div
            className={[
              styles['left-tab-container'],
              styles['left-tab-container-mobile'],
            ].join(' ')}
          ></div>
          <div
            className={[
              styles['right-tab-container'],
              styles['right-tab-container-mobile'],
            ].join(' ')}
          >
            <div
              className={[
                styles['tab-button-container'],
                styles['tab-button-container-mobile'],
              ].join(' ')}
            >
              <Button
                rippleProps={{
                  color: 'rgba(88, 40, 109, .35)',
                }}
                onClick={() =>
                  setTimeout(() => navigate(RoutePathsType.AccountHelp), 150)
                }
                type={'text'}
                rounded={true}
                size={'tiny'}
                touchScreen={true}
                icon={<Line.HelpOutline size={24} color={'#2A2A5F'} />}
              />
            </div>
            <div
              className={[
                styles['tab-button-container'],
                styles['tab-button-container-mobile'],
              ].join(' ')}
            >
              <Button
                rippleProps={{
                  color: 'rgba(88, 40, 109, .35)',
                }}
                onClick={() =>
                  setTimeout(
                    () => navigate(RoutePathsType.AccountSettings),
                    150
                  )
                }
                type={'text'}
                rounded={true}
                size={'tiny'}
                touchScreen={true}
                icon={<Line.Settings size={24} color={'#2A2A5F'} />}
              />
            </div>
          </div>
        </div>
        {account?.status === 'Incomplete' && (
          <div
            className={[
              styles['incomplete-profile-container'],
              styles['incomplete-profile-container-mobile'],
            ].join(' ')}
          >
            <div
              className={[
                styles['complete-profile-title'],
                styles['complete-profile-title-mobile'],
              ].join(' ')}
            >
              {t('completeProfile')}
            </div>
            <div
              className={[
                styles['form-container'],
                styles['form-container-mobile'],
              ].join(' ')}
            >
              <AccountProfileFormComponent
                storeProps={storeProps}
                values={accountProps.profileForm}
                errors={accountProps.profileFormErrors}
                onChangeCallbacks={{
                  firstName: (event) =>
                    AccountController.updateProfile({
                      firstName: event.target.value,
                    }),
                  lastName: (event) =>
                    AccountController.updateProfile({
                      lastName: event.target.value,
                    }),
                  phoneNumber: (value, event, formattedValue) =>
                    AccountController.updateProfile({
                      phoneNumber: value,
                    }),
                }}
              />
            </div>
            <div>
              <Button
                classNames={{
                  container: [
                    styles['submit-button-container'],
                    styles['submit-button-container-mobile'],
                  ].join(' '),
                  button: [
                    styles['submit-button'],
                    styles['submit-button-mobile'],
                  ].join(' '),
                }}
                block={true}
                size={'large'}
                icon={<Line.Done size={24} />}
                onClick={onCompleteProfile}
              >
                {t('complete')}
              </Button>
            </div>
          </div>
        )}
        {account?.status === 'Complete' && (
          <>
            <div
              className={[
                styles['avatar-container'],
                styles['avatar-container-mobile'],
              ].join(' ')}
            >
              <Avatar
                classNames={{
                  button: {
                    button: [
                      styles['avatar-button'],
                      styles['avatar-button-mobile'],
                    ].join(' '),
                  },
                  cropImage: {
                    overlay: {
                      background: [
                        styles['avatar-overlay-background'],
                        styles['avatar-overlay-background-mobile'],
                      ].join(' '),
                    },
                  },
                }}
                text={customer?.first_name}
                src={accountProps.profileUrl}
                editMode={true}
                onChange={AccountController.uploadAvatarAsync}
                size={'large'}
                touchScreen={true}
              />
            </div>
            <div
              className={[styles['username'], styles['username-mobile']].join(
                ' '
              )}
            >
              {customer ? (
                `${customer?.first_name} ${customer?.last_name}`
              ) : (
                <Skeleton
                  count={1}
                  borderRadius={9999}
                  className={[
                    styles['skeleton-user'],
                    styles['skeleton-user-mobile'],
                  ].join(' ')}
                />
              )}
            </div>
            <div
              className={[
                styles['tabs-container'],
                styles['tabs-container-mobile'],
              ].join(' ')}
            >
              <Tabs
                flex={true}
                touchScreen={true}
                activeId={accountProps.activeTabId}
                classNames={{
                  tabButton: [
                    styles['tab-button'],
                    styles['tab-button-mobile'],
                  ].join(''),
                  tabOutline: [
                    styles['tab-outline'],
                    styles['tab-outline-mobile'],
                  ].join(' '),
                }}
                onChange={(id) => {
                  AccountController.updateActiveTabId(id);
                  navigate(id);
                }}
                type={'underlined'}
                tabs={[
                  {
                    id: RoutePathsType.AccountOrderHistory,
                    icon: <Line.History size={24} />,
                  },
                  {
                    id: RoutePathsType.AccountAddresses,
                    icon: <Line.LocationOn size={24} />,
                  },
                  {
                    id: RoutePathsType.AccountEdit,
                    icon: <Line.Edit size={24} />,
                  },
                ]}
              />
            </div>
            <div
              className={[
                styles['outlet-container'],
                styles['outlet-container-mobile'],
              ].join(' ')}
            >
              <TransitionGroup
                component={null}
                childFactory={(child) =>
                  React.cloneElement(child, {
                    classNames: {
                      enter:
                        accountProps.activeTabIndex > accountProps.prevTabIndex
                          ? styles['left-to-right-enter']
                          : styles['right-to-left-enter'],
                      enterActive:
                        accountProps.activeTabIndex > accountProps.prevTabIndex
                          ? styles['left-to-right-enter-active']
                          : styles['right-to-left-enter-active'],
                      exit:
                        accountProps.activeTabIndex > accountProps.prevTabIndex
                          ? styles['left-to-right-exit']
                          : styles['right-to-left-exit'],
                      exitActive:
                        accountProps.activeTabIndex > accountProps.prevTabIndex
                          ? styles['left-to-right-exit-active']
                          : styles['right-to-left-exit-active'],
                    },
                    timeout: 250,
                  })
                }
              >
                <CSSTransition
                  key={accountProps.activeTabIndex}
                  classNames={{
                    enter:
                      accountProps.activeTabIndex < accountProps.prevTabIndex
                        ? styles['left-to-right-enter']
                        : styles['right-to-left-enter'],
                    enterActive:
                      accountProps.activeTabIndex < accountProps.prevTabIndex
                        ? styles['left-to-right-enter-active']
                        : styles['right-to-left-enter-active'],
                    exit:
                      accountProps.activeTabIndex < accountProps.prevTabIndex
                        ? styles['left-to-right-exit']
                        : styles['right-to-left-exit'],
                    exitActive:
                      accountProps.activeTabIndex < accountProps.prevTabIndex
                        ? styles['left-to-right-exit-active']
                        : styles['right-to-left-exit-active'],
                  }}
                  timeout={250}
                  unmountOnExit={false}
                >
                  <div style={{ minWidth: '100%', minHeight: '100%' }}>
                    <Outlet />
                  </div>
                </CSSTransition>
              </TransitionGroup>
            </div>
          </>
        )}
        {createPortal(
          accountProps.isCreateCustomerLoading && (
            <div
              className={[
                styles['loading-container'],
                styles['loading-container-mobile'],
              ].join(' ')}
            >
              <img
                src={'../assets/svg/ring-resize-light.svg'}
                className={[
                  styles['loading-ring'],
                  styles['loading-ring-mobile'],
                ].join(' ')}
              />
            </div>
          ),
          document.body
        )}
      </div>
    </ResponsiveMobile>
  );
}
