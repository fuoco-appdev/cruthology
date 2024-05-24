import { lazy } from '@loadable/component';
import { Address } from '@medusajs/medusa';
import * as React from 'react';
import { AddressItemSuspenseDesktopComponent } from './desktop/suspense/address-item.suspense.desktop.component';
import { AddressItemSuspenseMobileComponent } from './mobile/suspense/address-item.suspense.mobile.component';

const AddressItemDesktopComponent = lazy(
  () => import('./desktop/address-item.desktop.component')
);
const AddressItemMobileComponent = lazy(
  () => import('./mobile/address-item.mobile.component')
);

export interface AddressItemProps {
  address: Address;
  onEdit: () => void;
  onDelete: () => void;
}

export default function AddressItemComponent(
  props: AddressItemProps
): JSX.Element {
  const suspenceComponent = (
    <>
      <AddressItemSuspenseDesktopComponent />
      <AddressItemSuspenseMobileComponent />
    </>
  );

  if (process.env['DEBUG_SUSPENSE'] === 'true') {
    return suspenceComponent;
  }

  return (
    <React.Suspense fallback={suspenceComponent}>
      <AddressItemDesktopComponent {...props} />
      <AddressItemMobileComponent {...props} />
    </React.Suspense>
  );
}
