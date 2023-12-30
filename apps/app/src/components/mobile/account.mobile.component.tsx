import React, {
  createRef,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
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
  isCropImageModalVisible,
  likeCount,
  followerCount,
  followingCount,
  setIsCropImageModalVisible,
  onUsernameChanged,
  onCompleteProfile,
  onScroll,
  onScrollLoad,
  onAvatarChanged,
  onLikesClick,
  onFollowersClick,
  onFollowingClick,
}: AccountResponsiveProps): JSX.Element {
  const scrollContainerRef = createRef<HTMLDivElement>();
  const topBarRef = useRef<HTMLDivElement | null>(null);
  const { t } = useTranslation();
  const navigate = useNavigate();
  let prevPreviewScrollTop = 0;
  let yPosition = 0;

  const account = accountProps.account as core.AccountResponse;
  const customer = accountProps.customer as Customer;
  return (
    <ResponsiveMobile>
      <div className={[styles['root'], styles['root-mobile']].join(' ')}>
        <div
          ref={topBarRef}
          className={[styles['top-bar'], styles['top-bar-mobile']].join(' ')}
        >
          <div
            className={[
              styles['left-tab-container'],
              styles['left-tab-container-mobile'],
            ].join(' ')}
          >
            <div
              className={[
                styles['username-container'],
                styles['username-container-mobile'],
              ].join(' ')}
            >
              <div
                className={[styles['username'], styles['username-mobile']].join(
                  ' '
                )}
              >
                {accountProps.account?.username}
              </div>
            </div>
          </div>
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
            {account?.status === 'Complete' && (
              <div
                className={[
                  styles['tab-button-container'],
                  styles['tab-button-container-mobile'],
                ].join(' ')}
              >
                <Button
                  touchScreen={true}
                  classNames={{
                    button: styles['button'],
                  }}
                  rippleProps={{
                    color: 'rgba(88, 40, 109, .35)',
                  }}
                  onClick={() =>
                    setTimeout(
                      () => navigate(RoutePathsType.AccountAddFriends),
                      75
                    )
                  }
                  type={'text'}
                  rounded={true}
                  floatingLabel={t('addFriends') ?? ''}
                  size={'tiny'}
                  icon={<Line.PersonAddAlt1 size={24} color={'#2A2A5F'} />}
                />
              </div>
            )}
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
        <div
          className={[
            styles['scroll-container'],
            styles['scroll-container-mobile'],
          ].join(' ')}
          style={{ height: window.innerHeight }}
          onScroll={(e) => {
            onScroll(e);
            const elementHeight = topBarRef.current?.clientHeight ?? 0;
            const scrollTop = e.currentTarget.scrollTop;
            if (prevPreviewScrollTop > scrollTop) {
              yPosition += prevPreviewScrollTop - scrollTop;
              if (yPosition >= 0) {
                yPosition = 0;
              }

              topBarRef.current!.style.transform = `translateY(${yPosition}px)`;
            } else {
              yPosition -= scrollTop - prevPreviewScrollTop;
              if (yPosition <= -elementHeight) {
                yPosition = -elementHeight;
              }

              topBarRef.current!.style.transform = `translateY(${yPosition}px)`;
            }

            prevPreviewScrollTop = e.currentTarget.scrollTop;
          }}
          onLoad={onScrollLoad}
          ref={scrollContainerRef}
        >
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
                    username: (event) => {
                      AccountController.updateProfile({
                        username: event.target.value,
                      });
                      onUsernameChanged(event);
                    },
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
                  loading={accountProps.isCreateCustomerLoading}
                  loadingComponent={
                    <img
                      src={'../assets/svg/ring-resize-light.svg'}
                      className={[
                        styles['loading-ring'],
                        styles['loading-ring-mobile'],
                      ].join(' ')}
                    />
                  }
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
                  styles['top-content'],
                  styles['top-content-mobile'],
                ].join(' ')}
              >
                <div
                  className={[
                    styles['status-container'],
                    styles['status-container-mobile'],
                  ].join(' ')}
                >
                  <div
                    className={[
                      styles['avatar-content'],
                      styles['avatar-content-mobile'],
                    ].join(' ')}
                  >
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
                            topBar: [styles['avatar-top-bar']].join(' '),
                            topBarTitle: [styles['avatar-top-bar-title']].join(
                              ' '
                            ),
                            closeButton: {
                              button: [styles['avatar-close-button']].join(' '),
                            },
                            saveButton: {
                              button: [styles['avatar-save-button']].join(' '),
                            },
                          },
                        }}
                        text={customer?.first_name}
                        src={accountProps.profileUrl}
                        editMode={true}
                        onChange={onAvatarChanged}
                        loading={accountProps.isAvatarUploadLoading}
                        loadingComponent={
                          <img
                            src={'../assets/svg/ring-resize-light.svg'}
                            className={[
                              styles['loading-ring'],
                              styles['loading-ring-mobile'],
                            ].join(' ')}
                          />
                        }
                        onLoading={(value) =>
                          AccountController.updateIsAvatarUploadLoading(value)
                        }
                        size={'large'}
                        touchScreen={true}
                        isModalVisible={isCropImageModalVisible}
                        onModalVisible={(value) =>
                          setIsCropImageModalVisible(value)
                        }
                      />
                    </div>
                  </div>
                  <div
                    className={[
                      styles['followers-status-container'],
                      styles['followers-status-container-mobile'],
                    ].join(' ')}
                  >
                    {likeCount !== undefined && (
                      <div
                        className={[
                          styles['followers-status-item'],
                          styles['followers-status-item-mobile'],
                        ].join(' ')}
                        onClick={onLikesClick}
                      >
                        <div
                          className={[
                            styles['followers-status-value'],
                            styles['followers-status-value-mobile'],
                          ].join(' ')}
                        >
                          {likeCount}
                        </div>
                        <div
                          className={[
                            styles['followers-status-name'],
                            styles['followers-status-name-mobile'],
                          ].join(' ')}
                        >
                          {t('likes')}
                        </div>
                      </div>
                    )}
                    {likeCount === undefined && (
                      <div
                        className={[
                          styles['followers-status-item'],
                          styles['followers-status-item-mobile'],
                        ].join(' ')}
                      >
                        <div
                          className={[
                            styles['followers-status-value'],
                            styles['followers-status-value-mobile'],
                          ].join(' ')}
                        >
                          <Skeleton width={30} height={19} borderRadius={19} />
                        </div>
                        <div
                          className={[
                            styles['followers-status-name'],
                            styles['followers-status-name-mobile'],
                          ].join(' ')}
                        >
                          <Skeleton width={80} height={19} borderRadius={19} />
                        </div>
                      </div>
                    )}
                    {followerCount !== undefined && (
                      <div
                        className={[
                          styles['followers-status-item'],
                          styles['followers-status-item-mobile'],
                        ].join(' ')}
                        onClick={onFollowersClick}
                      >
                        <div
                          className={[
                            styles['followers-status-value'],
                            styles['followers-status-value-mobile'],
                          ].join(' ')}
                        >
                          {followerCount}
                        </div>
                        <div
                          className={[
                            styles['followers-status-name'],
                            styles['followers-status-name-mobile'],
                          ].join(' ')}
                        >
                          {t('followers')}
                        </div>
                      </div>
                    )}
                    {followerCount === undefined && (
                      <div
                        className={[
                          styles['followers-status-item'],
                          styles['followers-status-item-mobile'],
                        ].join(' ')}
                      >
                        <div
                          className={[
                            styles['followers-status-value'],
                            styles['followers-status-value-mobile'],
                          ].join(' ')}
                        >
                          <Skeleton width={30} height={19} borderRadius={19} />
                        </div>
                        <div
                          className={[
                            styles['followers-status-name'],
                            styles['followers-status-name-mobile'],
                          ].join(' ')}
                        >
                          <Skeleton width={80} height={19} borderRadius={19} />
                        </div>
                      </div>
                    )}
                    {followingCount !== undefined && (
                      <div
                        className={[
                          styles['followers-status-item'],
                          styles['followers-status-item-mobile'],
                        ].join(' ')}
                        onClick={onFollowingClick}
                      >
                        <div
                          className={[
                            styles['followers-status-value'],
                            styles['followers-status-value-mobile'],
                          ].join(' ')}
                        >
                          {followingCount}
                        </div>
                        <div
                          className={[
                            styles['followers-status-name'],
                            styles['followers-status-name-mobile'],
                          ].join(' ')}
                        >
                          {t('following')}
                        </div>
                      </div>
                    )}
                    {followingCount === undefined && (
                      <div
                        className={[
                          styles['followers-status-item'],
                          styles['followers-status-item-mobile'],
                        ].join(' ')}
                      >
                        <div
                          className={[
                            styles['followers-status-value'],
                            styles['followers-status-value-mobile'],
                          ].join(' ')}
                        >
                          <Skeleton width={30} height={19} borderRadius={19} />
                        </div>
                        <div
                          className={[
                            styles['followers-status-name'],
                            styles['followers-status-name-mobile'],
                          ].join(' ')}
                        >
                          <Skeleton width={80} height={19} borderRadius={19} />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <div
                  className={[
                    styles['username'],
                    styles['username-mobile'],
                  ].join(' ')}
                >
                  {customer ? (
                    `${customer?.first_name} ${customer?.last_name}`
                  ) : (
                    <Skeleton
                      count={1}
                      borderRadius={9999}
                      width={120}
                      className={[
                        styles['skeleton-user'],
                        styles['skeleton-user-mobile'],
                      ].join(' ')}
                    />
                  )}
                </div>
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
                    nav: [styles['tab-nav'], styles['tab-nav-mobile']].join(
                      ' '
                    ),
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
                      id: RoutePathsType.AccountLikes,
                      icon: <Line.FavoriteBorder size={24} />,
                    },
                    {
                      id: RoutePathsType.AccountOrderHistory,
                      icon: <Line.History size={24} />,
                    },
                    {
                      id: RoutePathsType.AccountAddresses,
                      icon: <Line.LocationOn size={24} />,
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
                          accountProps.activeTabIndex >
                          accountProps.prevTabIndex
                            ? styles['left-to-right-enter']
                            : styles['right-to-left-enter'],
                        enterActive:
                          accountProps.activeTabIndex >
                          accountProps.prevTabIndex
                            ? styles['left-to-right-enter-active']
                            : styles['right-to-left-enter-active'],
                        exit:
                          accountProps.activeTabIndex >
                          accountProps.prevTabIndex
                            ? styles['left-to-right-exit']
                            : styles['right-to-left-exit'],
                        exitActive:
                          accountProps.activeTabIndex >
                          accountProps.prevTabIndex
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
                      <Outlet context={{ scrollContainerRef }} />
                    </div>
                  </CSSTransition>
                </TransitionGroup>
              </div>
            </>
          )}
        </div>
      </div>
    </ResponsiveMobile>
  );
}
