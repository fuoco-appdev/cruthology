import { Order } from '@medusajs/medusa';
import { useObservable } from '@ngneat/use-observable';
import * as React from 'react';
import NotificationsController from '../../shared/controllers/notifications.controller';
import { NotificationsState } from '../../shared/models/notifications.model';
import { AccountNotificationResponse } from '../../shared/protobuf/account-notification_pb';
import { StorageFolderType } from '../../shared/protobuf/common_pb';
import { AccountData } from '../../shared/services/account-notification.service';
import BucketService from '../../shared/services/bucket.service';
import { NotificationItemSuspenseDesktopComponent } from './desktop/suspense/notification-item.suspense.desktop.component';
import { NotificationItemSuspenseMobileComponent } from './mobile/suspense/notification-item.suspense.mobile.component';

const NotificationItemDesktopComponent = React.lazy(
  () => import('./desktop/notification-item.desktop.component')
);
const NotificationItemMobileComponent = React.lazy(
  () => import('./mobile/notification-item.mobile.component')
);

const OrderNotificationItemDesktopComponent = React.lazy(
  () =>
    import(
      './desktop/notification_items/order-notification-item.desktop.component'
    )
);
const OrderNotificationItemMobileComponent = React.lazy(
  () =>
    import(
      './mobile/notification_items/order-notification-item.mobile.component'
    )
);

const AccountNotificationItemDesktopComponent = React.lazy(
  () =>
    import(
      './desktop/notification_items/account-notification-item.desktop.component'
    )
);
const AccountNotificationItemMobileComponent = React.lazy(
  () =>
    import(
      './mobile/notification_items/account-notification-item.mobile.component'
    )
);

export interface NotificationItemProps {
  notification: AccountNotificationResponse;
  notificationsProps: NotificationsState;
  fromNow: string | null;
}

export interface NotificationItemResponsiveProps
  extends NotificationItemProps {}

export interface OrderNotificationItemProps
  extends NotificationItemResponsiveProps {
  order: Order | undefined;
}

export interface AccountNotificationItemProps
  extends NotificationItemResponsiveProps {
  account: AccountData | undefined;
  publicProfileUrl: string | undefined;
  isFollowing: boolean;
  isAccepted: boolean;
  onFollow: () => void;
  onUnfollow: () => void;
  onRequested: () => void;
}

export default function NotificationItemComponent({
  notification,
  notificationsProps,
  fromNow,
}: NotificationItemProps): JSX.Element {
  const [notificationsDebugProps] = useObservable(
    NotificationsController.model.debugStore
  );
  const suspenceComponent = (
    <>
      <NotificationItemSuspenseDesktopComponent />
      <NotificationItemSuspenseMobileComponent />
    </>
  );

  if (notificationsDebugProps.suspense) {
    return suspenceComponent;
  }

  if (notification.resourceType === 'order') {
    const order = JSON.parse(notification.data) as Order | undefined;
    return (
      <React.Suspense fallback={suspenceComponent}>
        <OrderNotificationItemDesktopComponent
          notification={notification}
          notificationsProps={notificationsProps}
          fromNow={fromNow}
          order={order}
        />
        <OrderNotificationItemMobileComponent
          notification={notification}
          notificationsProps={notificationsProps}
          fromNow={fromNow}
          order={order}
        />
      </React.Suspense>
    );
  } else if (notification.resourceType === 'account') {
    const account = JSON.parse(notification.data) as AccountData | undefined;
    const [publicProfileUrl, setPublicProfileUrl] = React.useState<
      string | undefined
    >(undefined);
    const accountFollower = Object.keys(
      notificationsProps.accountFollowers
    ).includes(account?.id ?? '')
      ? notificationsProps.accountFollowers[account?.id ?? '']
      : undefined;
    React.useEffect(() => {
      BucketService.getPublicUrlAsync(
        StorageFolderType.Avatars,
        account?.profile_url ?? ''
      ).then((value) => {
        setPublicProfileUrl(value);
      });
    }, [notification]);

    return (
      <React.Suspense fallback={suspenceComponent}>
        <AccountNotificationItemDesktopComponent
          notification={notification}
          notificationsProps={notificationsProps}
          fromNow={fromNow}
          account={account}
          publicProfileUrl={publicProfileUrl}
          isAccepted={accountFollower?.accepted ?? false}
          isFollowing={accountFollower?.isFollowing ?? false}
          onFollow={() =>
            NotificationsController.requestFollowAsync(account?.id ?? '')
          }
          onRequested={() =>
            NotificationsController.requestUnfollowAsync(account?.id ?? '')
          }
          onUnfollow={() =>
            NotificationsController.requestUnfollowAsync(account?.id ?? '')
          }
        />
        <AccountNotificationItemMobileComponent
          notification={notification}
          notificationsProps={notificationsProps}
          fromNow={fromNow}
          account={account}
          publicProfileUrl={publicProfileUrl}
          isAccepted={accountFollower?.accepted ?? false}
          isFollowing={accountFollower?.isFollowing ?? false}
          onFollow={() =>
            NotificationsController.requestFollowAsync(account?.id ?? '')
          }
          onRequested={() =>
            NotificationsController.requestUnfollowAsync(account?.id ?? '')
          }
          onUnfollow={() =>
            NotificationsController.requestUnfollowAsync(account?.id ?? '')
          }
        />
      </React.Suspense>
    );
  }

  return (
    <React.Suspense fallback={suspenceComponent}>
      <NotificationItemDesktopComponent
        notification={notification}
        notificationsProps={notificationsProps}
        fromNow={fromNow}
      />
      <NotificationItemMobileComponent
        notification={notification}
        notificationsProps={notificationsProps}
        fromNow={fromNow}
      />
    </React.Suspense>
  );
}
