import { useObservable } from '@ngneat/use-observable';
import * as React from 'react';
import { Helmet } from 'react-helmet';
import { useTranslation } from 'react-i18next';
import { useNavigate, useOutletContext, useParams } from 'react-router-dom';
import AccountPublicController from '../../shared/controllers/account-public.controller';
import AccountController from '../../shared/controllers/account.controller';
import StoreController from '../../shared/controllers/store.controller';
import WindowController from '../../shared/controllers/window.controller';
import { AccountPublicState } from '../../shared/models/account-public.model';
import { StoreState } from '../../shared/models/store.model';
import { WindowState } from '../../shared/models/window.model';
import { RoutePathsType } from '../../shared/route-paths-type';
import { useQuery } from '../route-paths';
import { AccountPublicSuspenseDesktopComponent } from './desktop/suspense/account-public.suspense.desktop.component';
import { AccountPublicSuspenseMobileComponent } from './mobile/suspense/account-public.suspense.mobile.component';

const AccountPublicDesktopComponent = React.lazy(
  () => import('./desktop/account-public.desktop.component')
);
const AccountPublicMobileComponent = React.lazy(
  () => import('./mobile/account-public.mobile.component')
);

export type AccountPublicOutletContextType = {
  scrollContainerRef: React.RefObject<HTMLDivElement> | undefined;
};

export function useAccountPublicOutletContext() {
  return useOutletContext<AccountPublicOutletContextType>();
}

export interface AccountPublicResponsiveProps {
  windowProps: WindowState;
  accountPublicProps: AccountPublicState;
  storeProps: StoreState;
  isFollowing: boolean;
  isAccepted: boolean;
  likeCount: string | undefined;
  followerCount: string | undefined;
  followingCount: string | undefined;
  onScroll: (e: React.UIEvent<HTMLDivElement, UIEvent>) => void;
  onScrollLoad: (e: React.SyntheticEvent<HTMLDivElement, Event>) => void;
  onFollow: () => void;
  onUnfollow: () => void;
  onRequested: () => void;
  onLikesClick: () => void;
  onFollowersClick: () => void;
  onFollowingClick: () => void;
  onMessage: () => void;
}

export default function AccountPublicComponent(): JSX.Element {
  const { i18n } = useTranslation();
  const navigate = useNavigate();
  const query = useQuery();
  const { id } = useParams();
  const [accountPublicProps] = useObservable(
    AccountPublicController.model.store
  );
  const [accountPublicDebugProps] = useObservable(
    AccountPublicController.model.debugStore
  );
  const [windowProps] = useObservable(WindowController.model.store);
  const [storeProps] = useObservable(StoreController.model.store);
  const [isFollowing, setIsFollowing] = React.useState<boolean>(false);
  const [isAccepted, setIsAccepted] = React.useState<boolean>(false);
  const [likeCount, setLikeCount] = React.useState<string | undefined>(
    undefined
  );
  const [followerCount, setFollowerCount] = React.useState<string | undefined>(
    undefined
  );
  const [followingCount, setFollowingCount] = React.useState<
    string | undefined
  >(undefined);
  const renderCountRef = React.useRef<number>(0);
  const scrollOffsetTriggerGap = 16;

  const onFollow = () => {
    setTimeout(() => {
      AccountController.requestFollowAsync(accountPublicProps.account.id);
      setIsFollowing(true);
    }, 150);
  };

  const onUnfollow = () => {
    setTimeout(() => {
      AccountController.requestUnfollowAsync(accountPublicProps.account.id);
      setIsFollowing(false);
    }, 150);
  };

  const onRequested = () => {
    setTimeout(() => {
      AccountController.requestUnfollowAsync(accountPublicProps.account.id);
      setIsFollowing(false);
      setIsAccepted(false);
    }, 150);
  };

  const onLikesClick = () => {
    if (!accountPublicProps.account) {
      return;
    }

    navigate({
      pathname: `${RoutePathsType.Account}/${accountPublicProps.account?.id}/likes`,
      search: query.toString(),
    });
  };

  const onFollowersClick = () => {
    if (!accountPublicProps.account) {
      return;
    }

    navigate({
      pathname: `${RoutePathsType.AccountStatus}/${accountPublicProps.account?.id}/followers`,
      search: query.toString(),
    });
  };

  const onFollowingClick = () => {
    if (!accountPublicProps.account) {
      return;
    }

    navigate({
      pathname: `${RoutePathsType.AccountStatus}/${accountPublicProps.account?.id}/following`,
      search: query.toString(),
    });
  };

  const onScroll = (e: React.UIEvent<HTMLDivElement, UIEvent>) => {
    const scrollTop = e.currentTarget?.scrollTop ?? 0;
    const scrollHeight = e.currentTarget?.scrollHeight ?? 0;
    const clientHeight = e.currentTarget?.clientHeight ?? 0;
    const scrollOffset = scrollHeight - scrollTop - clientHeight;

    if (
      AccountPublicController.model.activeTabId === RoutePathsType.AccountLikes
    ) {
      if (
        scrollOffset > scrollOffsetTriggerGap ||
        !AccountPublicController.model.hasMoreLikes
      ) {
        return;
      }

      AccountPublicController.onNextLikedProductScrollAsync();
    }
  };

  const onScrollLoad = (e: React.SyntheticEvent<HTMLDivElement, Event>) => {
    if (
      AccountPublicController.model.activeTabId === RoutePathsType.AccountLikes
    ) {
      if (accountPublicProps.likesScrollPosition) {
        e.currentTarget.scrollTop =
          accountPublicProps.likesScrollPosition as number;
        AccountPublicController.updateLikesScrollPosition(undefined);
      }
    }
  };

  const onMessage = () => {};

  React.useEffect(() => {
    renderCountRef.current += 1;
    AccountPublicController.load(renderCountRef.current);
    return () => {
      AccountPublicController.disposeLoad(renderCountRef.current);
    };
  }, []);

  React.useEffect(() => {
    if (!id) {
      navigate(-1);
      return;
    }

    AccountPublicController.updateAccountId(id);
  }, [id]);

  React.useEffect(() => {
    setIsFollowing(accountPublicProps.accountFollower?.isFollowing ?? false);
    setIsAccepted(accountPublicProps.accountFollower?.accepted ?? false);
  }, [accountPublicProps.accountFollower]);

  React.useEffect(() => {
    if (accountPublicProps.likeCount !== undefined) {
      setLikeCount(
        new Intl.NumberFormat(i18n.language).format(
          accountPublicProps.likeCount
        )
      );
    }

    if (accountPublicProps.followerCount !== undefined) {
      setFollowerCount(
        new Intl.NumberFormat(i18n.language).format(
          accountPublicProps.followerCount
        )
      );
    }

    if (accountPublicProps.followingCount !== undefined) {
      setFollowingCount(
        new Intl.NumberFormat(i18n.language).format(
          accountPublicProps.followingCount
        )
      );
    }
  }, [
    accountPublicProps.likeCount,
    accountPublicProps.followerCount,
    accountPublicProps.followingCount,
  ]);

  React.useEffect(() => {
    if (
      WindowController.isLocationAccountWithId(
        location.pathname,
        RoutePathsType.AccountWithIdLikes
      )
    ) {
      AccountPublicController.updateActiveTabId(
        RoutePathsType.AccountWithIdLikes
      );
    }
  }, [location.pathname]);

  const suspenceComponent = (
    <>
      <AccountPublicSuspenseDesktopComponent />
      <AccountPublicSuspenseMobileComponent />
    </>
  );

  if (accountPublicDebugProps.suspense) {
    return suspenceComponent;
  }

  return (
    <>
      <Helmet>
        <title>Cruthology</title>
        <link rel="canonical" href={window.location.href} />
        <meta name="title" content={'Cruthology'} />
        <meta
          name="description"
          content={
            'An exclusive wine club offering high-end dinners, entertainment, and enchanting wine tastings, providing a gateway to extraordinary cultural experiences.'
          }
        />
        <meta
          property="og:image"
          content={'https://cruthology.com/assets/opengraph/opengraph.jpg'}
        />
        <meta property="og:title" content={'Cruthology'} />
        <meta
          property="og:description"
          content={
            'An exclusive wine club offering high-end dinners, entertainment, and enchanting wine tastings, providing a gateway to extraordinary cultural experiences.'
          }
        />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={window.location.href} />
      </Helmet>
      <React.Suspense fallback={suspenceComponent}>
        <AccountPublicDesktopComponent
          accountPublicProps={accountPublicProps}
          windowProps={windowProps}
          storeProps={storeProps}
          isFollowing={isFollowing}
          isAccepted={isAccepted}
          likeCount={likeCount}
          followerCount={followerCount}
          followingCount={followingCount}
          onScroll={onScroll}
          onScrollLoad={onScrollLoad}
          onFollow={onFollow}
          onUnfollow={onUnfollow}
          onRequested={onRequested}
          onLikesClick={onLikesClick}
          onFollowersClick={onFollowersClick}
          onFollowingClick={onFollowingClick}
          onMessage={onMessage}
        />
        <AccountPublicMobileComponent
          accountPublicProps={accountPublicProps}
          windowProps={windowProps}
          storeProps={storeProps}
          isFollowing={isFollowing}
          isAccepted={isAccepted}
          likeCount={likeCount}
          followerCount={followerCount}
          followingCount={followingCount}
          onScroll={onScroll}
          onScrollLoad={onScrollLoad}
          onFollow={onFollow}
          onUnfollow={onUnfollow}
          onRequested={onRequested}
          onLikesClick={onLikesClick}
          onFollowersClick={onFollowersClick}
          onFollowingClick={onFollowingClick}
          onMessage={onMessage}
        />
      </React.Suspense>
    </>
  );
}
