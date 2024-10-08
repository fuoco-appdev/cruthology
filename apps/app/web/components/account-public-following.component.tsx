import { useObservable } from '@ngneat/use-observable';
import * as React from 'react';
import { Helmet } from 'react-helmet';
import { useNavigate } from 'react-router-dom';
import AccountPublicController from '../../shared/controllers/account-public.controller';
import AccountController from '../../shared/controllers/account.controller';
import { AccountPublicState } from '../../shared/models/account-public.model';
import { AccountState } from '../../shared/models/account.model';
import { RoutePathsType } from '../../shared/route-paths-type';
import { useQuery } from '../route-paths';
import { AccountPublicFollowingSuspenseDesktopComponent } from './desktop/suspense/account-public-following.suspense.desktop.component';
import { AccountPublicFollowingSuspenseMobileComponent } from './mobile/suspense/account-public-following.suspense.mobile.component';

const AccountPublicFollowingDesktopComponent = React.lazy(
  () => import('./desktop/account-public-following.desktop.component')
);
const AccountPublicFollowingMobileComponent = React.lazy(
  () => import('./mobile/account-public-following.mobile.component')
);

export interface AccountPublicFollowingResponsiveProps {
  accountPublicProps: AccountPublicState;
  accountProps: AccountState;
  onItemClick: (followerId: string) => void;
}

export default function AccountPublicFollowingComponent(): JSX.Element {
  const navigate = useNavigate();
  const query = useQuery();
  const [accountPublicProps] = useObservable(
    AccountPublicController.model.store
  );
  const [accountPublicDebugProps] = useObservable(
    AccountPublicController.model.debugStore
  );
  const [accountProps] = useObservable(AccountController.model.store);

  const onItemClick = (followerId: string) => {
    if (AccountController.model.account?.id !== followerId) {
      navigate({
        pathname: `${RoutePathsType.Account}/${followerId}/likes`,
        search: query.toString(),
      });
    } else {
      navigate({
        pathname: RoutePathsType.AccountLikes,
        search: query.toString(),
      });
    }
  };

  React.useEffect(() => {
    AccountPublicController.loadFollowingAsync();
  }, []);

  const suspenceComponent = (
    <>
      <AccountPublicFollowingSuspenseDesktopComponent />
      <AccountPublicFollowingSuspenseMobileComponent />
    </>
  );

  if (accountPublicDebugProps.suspense) {
    return suspenceComponent;
  }

  return (
    <>
      <Helmet>
        <title>Following | fuoco.appdev</title>
        <link rel="canonical" href={window.location.href} />
        <meta name="title" content={'Following | fuoco.appdev'} />
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
        <meta property="og:title" content={'Following | fuoco.appdev'} />
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
        <AccountPublicFollowingDesktopComponent
          accountPublicProps={accountPublicProps}
          accountProps={accountProps}
          onItemClick={onItemClick}
        />
        <AccountPublicFollowingMobileComponent
          accountPublicProps={accountPublicProps}
          accountProps={accountProps}
          onItemClick={onItemClick}
        />
      </React.Suspense>
    </>
  );
}
