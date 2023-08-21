import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import * as React from 'react';
import { Outlet, Route, useLocation, useNavigate } from 'react-router-dom';
import WindowController from '../../controllers/window.controller';
import styles from '../window.module.scss';
import {
  Alert,
  Avatar,
  Button,
  Dropdown,
  LanguageSwitch,
  Line,
  Tabs,
  ToastOverlay,
} from '@fuoco.appdev/core-ui';
import { RoutePaths } from '../../route-paths';
import { useTranslation } from 'react-i18next';
import SupabaseService from '../../services/supabase.service';
import { useObservable } from '@ngneat/use-observable';
import { useSpring } from 'react-spring';
import * as core from '../../protobuf/core_pb';
import {
  ResponsiveDesktop,
  ResponsiveMobile,
  ResponsiveTablet,
} from '../responsive.component';
import LoadingComponent from '../loading.component';
import { Store } from '@ngneat/elf';
import { Customer } from '@medusajs/medusa';
import AccountController from '../../controllers/account.controller';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import e from 'express';
import { WindowResponsiveProps } from '../window.component';

export function WindowDesktopComponent({
  openMore,
  isLanguageOpen,
  setOpenMore,
  setIsLanguageOpen,
}: WindowResponsiveProps): JSX.Element {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const sideBarRef = useRef<HTMLDivElement | null>(null);
  const [isSideBarOpen, setIsSideBarOpen] = useState<boolean>(true);
  const [props] = useObservable(WindowController.model.store);
  const [accountProps] = useObservable(AccountController.model.store);
  const [localProps] = useObservable(
    WindowController.model.localStore ?? Store.prototype
  );

  const account = props.account as core.Account;
  const customer = accountProps.customer as Customer;
  return (
    <div className={[styles['root'], styles['root-desktop']].join(' ')}>
      <div className={[styles['top-bar'], styles['top-bar-desktop']].join(' ')}>
        <div
          className={[
            styles['top-bar-left-content'],
            styles['top-bar-left-content-desktop'],
          ].join(' ')}
        >
          <div className={[styles['top-bar-button-container']].join(' ')}>
            <Button
              rippleProps={{
                color: 'rgba(252, 245, 227, .35)',
              }}
              floatingLabel={t('menu') ?? ''}
              onClick={() => setIsSideBarOpen(!isSideBarOpen)}
              type={'text'}
              rounded={true}
              size={'tiny'}
              icon={<Line.Menu size={24} color={'rgba(252, 245, 227, 1)'} />}
            />
          </div>
          <div
            className={[
              styles['logo-container'],
              styles['logo-container-desktop'],
            ].join(' ')}
          >
            <img src={'../assets/svg/logo.svg'} />
            <img
              className={[
                styles['logo-text'],
                styles['logo-text-desktop'],
              ].join(' ')}
              src={'../assets/svg/logo-text.svg'}
            />
          </div>
        </div>
        <div
          className={[
            styles['top-bar-right-content'],
            styles['top-bar-right-content-desktop'],
          ].join(' ')}
        >
          {!props.account && (
            <div
              className={[
                styles['top-bar-button-container'],
                styles['top-bar-button-container-mobile'],
              ].join(' ')}
            >
              <LanguageSwitch
                open={isLanguageOpen}
                onOpen={() => setIsLanguageOpen(true)}
                onClose={() => setIsLanguageOpen(false)}
                floatingLabel={t('language') ?? ''}
                supportedLanguages={[
                  { isoCode: 'en', countryCode: 'GB' },
                  { isoCode: 'fr', countryCode: 'FR' },
                ]}
                rippleProps={{
                  color: 'rgba(252, 245, 227, .35)',
                }}
                hideText={true}
                language={localProps.languageCode}
                onChange={(isoCode, info) =>
                  WindowController.updateLanguageInfo(isoCode, info)
                }
              />
            </div>
          )}
          <div
            className={[
              styles['shopping-cart-container-details'],
              styles['shopping-cart-container-details-desktop'],
            ].join(' ')}
          >
            <Button
              classNames={{
                container: [
                  styles['top-bar-button-container'],
                  styles['top-bar-button-container-desktop'],
                ].join(' '),
              }}
              rippleProps={{
                color: 'rgba(252, 245, 227, .35)',
              }}
              onClick={() => setTimeout(() => navigate(RoutePaths.Cart), 150)}
              type={'text'}
              floatingLabel={t('shoppingCart') ?? ''}
              rounded={true}
              size={'tiny'}
              icon={
                props.activeRoute !== RoutePaths.Cart ? (
                  <Line.ShoppingCart
                    size={24}
                    color={'rgba(252, 245, 227, .8)'}
                  />
                ) : (
                  <Line.ShoppingCart
                    size={24}
                    color={'rgba(252, 245, 227, 1)'}
                  />
                )
              }
            />
            {props.cartCount > 0 && (
              <div
                className={[
                  styles['cart-number-container'],
                  styles['cart-number-container-desktop'],
                ].join(' ')}
              >
                <span
                  className={[
                    styles['cart-number'],
                    styles['cart-number-desktop'],
                  ].join(' ')}
                >
                  {props.cartCount}
                </span>
              </div>
            )}
          </div>
          {!props.account && (
            <>
              <div
                className={[
                  styles['top-bar-button-container'],
                  styles['top-bar-button-container-mobile'],
                ].join(' ')}
              >
                <Button
                  rippleProps={{
                    color: 'rgba(252, 245, 227, .35)',
                  }}
                  onClick={() => navigate(RoutePaths.Signup)}
                  type={'text'}
                  floatingLabel={t('signup') ?? ''}
                  rounded={true}
                  size={'tiny'}
                  icon={
                    props.activeRoute !== RoutePaths.Signup ? (
                      <Line.PersonAdd
                        size={24}
                        color={'rgba(252, 245, 227, .8)'}
                      />
                    ) : (
                      <Line.PersonAdd
                        size={24}
                        color={'rgba(252, 245, 227, 1)'}
                      />
                    )
                  }
                />
              </div>
              <div
                className={[
                  styles['top-bar-button-container'],
                  styles['top-bar-button-container-mobile'],
                ].join(' ')}
              >
                <Button
                  rippleProps={{
                    color: 'rgba(252, 245, 227, .35)',
                  }}
                  onClick={() => navigate(RoutePaths.Signin)}
                  type={'text'}
                  floatingLabel={t('signin') ?? ''}
                  rounded={true}
                  size={'tiny'}
                  icon={
                    props.activeRoute !== RoutePaths.Signin ? (
                      <Line.Login size={24} color={'rgba(252, 245, 227, .8)'} />
                    ) : (
                      <Line.Login size={24} color={'rgba(252, 245, 227, 1)'} />
                    )
                  }
                />
              </div>
            </>
          )}
          {props.account && (
            <>
              {/* <div className={styles['tab-button-container']}>
                      <Button
                        rippleProps={{
                          color: 'rgba(252, 245, 227, .35)',
                        }}
                        onClick={() => navigate(RoutePaths.Notifications)}
                        disabled={props.activeRoute === RoutePaths.Cart}
                        type={'text'}
                        rounded={true}
                        size={'tiny'}
                        touchScreen={true}
                        icon={
                          <Line.Notifications
                            size={24}
                            color={
                              props.activeRoute === RoutePaths.Notifications
                                ? 'rgba(252, 245, 227, 1)'
                                : 'rgba(252, 245, 227, .6)'
                            }
                          />
                        }
                      />
                    </div> */}
              <div
                className={[
                  styles['top-bar-button-container'],
                  styles['top-bar-button-container-mobile'],
                ].join(' ')}
              >
                <Button
                  rippleProps={{
                    color: 'rgba(252, 245, 227, .35)',
                  }}
                  onClick={() => navigate(RoutePaths.Account)}
                  floatingLabel={
                    account?.status !== 'Incomplete'
                      ? `${customer?.first_name} ${customer?.last_name}`
                      : t('profile') ?? undefined
                  }
                  type={'text'}
                  rounded={true}
                  size={'tiny'}
                  icon={
                    account?.status === 'Incomplete' ? (
                      <Line.AccountCircle
                        size={24}
                        color={
                          props.activeRoute?.startsWith(RoutePaths.Account)
                            ? 'rgba(252, 245, 227, 1)'
                            : 'rgba(252, 245, 227, .6)'
                        }
                      />
                    ) : (
                      <div
                        className={
                          props.activeRoute?.startsWith(RoutePaths.Account)
                            ? [
                                styles['avatar-container-selected'],
                                styles['avatar-container-selected-mobile'],
                              ].join(' ')
                            : undefined
                        }
                      >
                        <Avatar
                          classNames={{
                            container: [
                              styles['avatar-container'],
                              styles['avatar-container-mobile'],
                            ].join(' '),
                          }}
                          size={'custom'}
                          text={customer?.first_name}
                          src={accountProps?.profileUrl}
                          touchScreen={true}
                        />
                      </div>
                    )
                  }
                />
              </div>
            </>
          )}
        </div>
      </div>
      <div className={[styles['content'], styles['content-desktop']].join(' ')}>
        <CSSTransition
          nodeRef={sideBarRef}
          in={isSideBarOpen && Boolean(sideBarRef.current)}
          timeout={300}
          classNames={{
            appear: styles['side-bar-appear'],
            appearActive: styles['side-bar-appear-active'],
            appearDone: styles['side-bar-appear-done'],
            enter: styles['side-bar-enter'],
            enterActive: styles['side-bar-enter-active'],
            enterDone: styles['side-bar-enter-done'],
            exit: styles['side-bar-exit'],
            exitActive: styles['side-bar-exit-active'],
            exitDone: styles['side-bar-exit-done'],
          }}
        >
          <div
            ref={sideBarRef}
            className={[styles['side-bar'], styles['side-bar-desktop']].join(
              ' '
            )}
          >
            <Tabs
              activeId={props.activeRoute}
              direction={'vertical'}
              type={'underlined'}
              onChange={(id) => navigate(id)}
              classNames={{
                tabOutline: [
                  styles['tab-outline'],
                  isSideBarOpen
                    ? styles['tab-outline-open']
                    : styles['tab-outline-close'],
                ].join(' '),
                tabSlider: styles['tab-slider'],
                tabIcon: styles['tab-icon'],
                tabButton: styles['tab-button'],
                hoveredTabIcon: styles['hovered-tab-icon'],
                hoveredTabButton: styles['hovered-tab-button'],
              }}
              tabs={[
                {
                  id: RoutePaths.Home,
                  icon: <Line.Home size={24} />,
                  label: isSideBarOpen ? t('home') ?? '' : undefined,
                },
                {
                  id: RoutePaths.Store,
                  icon: <Line.Storefront size={24} />,
                  label: isSideBarOpen ? t('store') ?? '' : undefined,
                },
              ]}
            />
          </div>
        </CSSTransition>
        <div
          className={[
            styles['right-content'],
            styles['right-content-desktop'],
          ].join(' ')}
        >
          {props.showNavigateBack && (
            <div
              className={[
                styles['navigation-back-container'],
                styles['navigation-back-container-desktop'],
              ].join(' ')}
            >
              <div
                className={[
                  styles['navigation-back-left-content'],
                  styles['navigation-back-left-content-desktop'],
                ].join(' ')}
              >
                <Button
                  classNames={{
                    button: styles['button'],
                  }}
                  rippleProps={{
                    color: 'rgba(252, 245, 227, .35)',
                  }}
                  rounded={true}
                  size={'tiny'}
                  onClick={() => navigate(-1)}
                  floatingLabel={t('goBack') ?? ''}
                  type={'text'}
                  icon={<Line.ArrowBackIos size={24} color={'#2A2A5F'} />}
                />
              </div>
              <div
                className={[
                  styles['navigation-back-center-content'],
                  styles['navigation-back-center-content-desktop'],
                ].join(' ')}
              >
                {props.activeRoute.startsWith(RoutePaths.AccountSettings) && (
                  <>
                    <Line.Settings size={24} />
                    <div
                      className={[styles['navigation-back-title']].join(' ')}
                    >
                      {t('settings')}
                    </div>
                  </>
                )}
              </div>
              <div
                className={[
                  styles['navigation-back-right-content'],
                  styles['navigation-back-right-content-desktop'],
                ].join(' ')}
              >
                {props.activeRoute.startsWith(RoutePaths.AccountSettings) && (
                  <Button
                    classNames={{
                      button: styles['button'],
                    }}
                    rippleProps={{
                      color: 'rgba(252, 245, 227, .35)',
                    }}
                    rounded={true}
                    onClick={() => AccountController.logoutAsync()}
                    floatingLabel={t('signOut') ?? ''}
                    type={'text'}
                    icon={<Line.Logout size={24} color={'#2A2A5F'} />}
                  />
                )}
              </div>
            </div>
          )}
          <TransitionGroup
            component={null}
            childFactory={(child) =>
              React.cloneElement(child, {
                classNames: {
                  enter:
                    props.transitionKeyIndex < props.prevTransitionKeyIndex
                      ? styles['in-and-out-enter']
                      : styles['out-and-in-enter'],
                  enterActive:
                    props.transitionKeyIndex < props.prevTransitionKeyIndex
                      ? styles['in-and-out-enter-active']
                      : styles['out-and-in-enter-active'],
                  exit:
                    props.transitionKeyIndex < props.prevTransitionKeyIndex
                      ? styles['in-and-out-exit']
                      : styles['out-and-in-exit'],
                  exitActive:
                    props.transitionKeyIndex < props.prevTransitionKeyIndex
                      ? styles['in-and-out-exit-active']
                      : styles['out-and-in-exit-active'],
                },
                timeout: 150,
              })
            }
          >
            <CSSTransition
              key={props.transitionKeyIndex}
              classNames={{
                enter:
                  props.transitionKeyIndex > props.prevTransitionKeyIndex
                    ? styles['in-and-out-enter']
                    : styles['out-and-in-enter'],
                enterActive:
                  props.transitionKeyIndex > props.prevTransitionKeyIndex
                    ? styles['in-and-out-enter-active']
                    : styles['out-and-in-enter-active'],
                exit:
                  props.transitionKeyIndex > props.prevTransitionKeyIndex
                    ? styles['in-and-out-exit']
                    : styles['out-and-in-exit'],
                exitActive:
                  props.transitionKeyIndex > props.prevTransitionKeyIndex
                    ? styles['in-and-out-exit-active']
                    : styles['out-and-in-exit-active'],
              }}
              timeout={150}
              unmountOnExit={true}
            >
              <Outlet />
            </CSSTransition>
          </TransitionGroup>
        </div>
      </div>
    </div>
  );
}
