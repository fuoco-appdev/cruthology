import { OptionProps } from '@fuoco.appdev/web-components';
import { LineItem, ProductOptionValue } from '@medusajs/medusa';
import * as React from 'react';
import { ProductOptions } from '../../shared/models/product.model';
import {
  ResponsiveDesktop,
  ResponsiveMobile,
  ResponsiveTablet,
} from './responsive.component';

const RefundItemDesktopComponent = React.lazy(
  () => import('./desktop/refund-item.desktop.component')
);
const RefundItemMobileComponent = React.lazy(
  () => import('./mobile/refund-item.mobile.component')
);

export interface RefundItemProps {
  item: LineItem;
  refundItem: {
    item_id: string;
    quantity: number;
    reason_id?: string;
    note?: string;
  };
  returnReasonOptions: OptionProps[];
  onChanged: (item: {
    item_id: string;
    quantity: number;
    reason_id?: string;
    note?: string;
  }) => void;
}

export interface RefundItemResponsiveProps extends RefundItemProps {
  vintage: string;
  incrementItemQuantity: () => void;
  decrementItemQuantity: () => void;
}

export default function RefundItemComponent({
  item,
  refundItem,
  returnReasonOptions,
  onChanged,
}: RefundItemProps): JSX.Element {
  const [vintage, setVintage] = React.useState<string>('');

  React.useEffect(() => {
    const vintageOption = item.variant.product.options.find(
      (value) => value.title === ProductOptions.Vintage
    );
    const vintageValue = item.variant.options?.find(
      (value: ProductOptionValue) => value.option_id === vintageOption?.id
    );
    setVintage(vintageValue?.value ?? '');
  }, [item]);

  const incrementItemQuantity = (): void => {
    if (!refundItem) {
      return;
    }

    if (item?.quantity && refundItem?.quantity < item.quantity) {
      onChanged?.({
        ...refundItem,
        quantity: refundItem.quantity + 1,
      });
    }
  };

  const decrementItemQuantity = (): void => {
    if (!refundItem) {
      return;
    }

    if (refundItem.quantity > 0) {
      onChanged?.({
        ...refundItem,
        quantity: refundItem.quantity - 1,
      });
    }
  };

  const suspenceComponent = (
    <>
      <ResponsiveDesktop>
        <div />
      </ResponsiveDesktop>
      <ResponsiveTablet>
        <div />
      </ResponsiveTablet>
      <ResponsiveMobile>
        <div />
      </ResponsiveMobile>
    </>
  );

  if (import.meta.env['DEBUG_SUSPENSE'] === 'true') {
    return suspenceComponent;
  }

  return (
    <React.Suspense fallback={suspenceComponent}>
      <RefundItemDesktopComponent
        item={item}
        refundItem={refundItem}
        returnReasonOptions={returnReasonOptions}
        vintage={vintage}
        incrementItemQuantity={incrementItemQuantity}
        decrementItemQuantity={decrementItemQuantity}
        onChanged={onChanged}
      />
      <RefundItemMobileComponent
        item={item}
        refundItem={refundItem}
        returnReasonOptions={returnReasonOptions}
        vintage={vintage}
        incrementItemQuantity={incrementItemQuantity}
        decrementItemQuantity={decrementItemQuantity}
        onChanged={onChanged}
      />
    </React.Suspense>
  );
}
