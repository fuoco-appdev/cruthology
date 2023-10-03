import {
  ResponsiveDesktop,
  ResponsiveMobile,
  ResponsiveTablet,
} from './responsive.component';
import { useParams } from 'react-router-dom';
import { useObservable } from '@ngneat/use-observable';
import OrderConfirmedController from '../controllers/order-confirmed.controller';
import StoreController from '../controllers/store.controller';
import { useEffect, useRef, useState } from 'react';
import { OptionProps } from '@fuoco.appdev/core-ui';
import { LineItem, ShippingMethod, ReturnReason } from '@medusajs/medusa';
import styles from './order-confirmed.module.scss';
import { StoreState } from '../models/store.model';
import { lazy } from '@loadable/component';
import React from 'react';

const OrderConfirmedDesktopComponent = lazy(
  () => import('./desktop/order-confirmed.desktop.component')
);
const OrderConfirmedMobileComponent = lazy(
  () => import('./mobile/order-confirmed.mobile.component')
);

export interface OrderConfirmedProps {}

export interface OrderConfirmedResponsiveProps {
  storeProps: StoreState;
  quantity: number;
  openRefund: boolean;
  returnReasonOptions: OptionProps[];
  setOpenRefund: (value: boolean) => void;
  formatStatus: (value: string) => string;
}

export default function OrderConfirmedComponent(): JSX.Element {
  const { id } = useParams();
  const [props] = useObservable(OrderConfirmedController.model.store);
  const [storeProps] = useObservable(StoreController.model.store);
  const [quantity, setQuantity] = useState<number>(0);
  const [openRefund, setOpenRefund] = useState<boolean>(false);
  const [returnReasonOptions, setReturnReasonOptions] = useState<OptionProps[]>(
    []
  );
  const isRenderedRef = useRef<boolean>(false);

  useEffect(() => {
    if (!isRenderedRef.current) {
      isRenderedRef.current = true;
      OrderConfirmedController.requestOrderAsync(id ?? '');
    }
  }, []);

  useEffect(() => {
    const options = [];
    for (const returnReason of props.returnReasons as ReturnReason[]) {
      options.push({
        id: returnReason.id,
        value: returnReason.label,
        children: () => (
          <div className={styles['option-name']}>{returnReason.label}</div>
        ),
      });
    }

    setReturnReasonOptions(options);
  }, [props.returnReasons]);

  useEffect(() => {
    if (!props.order || !props.returnReasons) {
      return;
    }

    setQuantity(
      props.order.items.reduce(
        (current: number, next: LineItem) => current + next.quantity,
        0
      )
    );

    for (const item of props.order.items as LineItem[]) {
      OrderConfirmedController.updateRefundItem(item.id, {
        item_id: item.id,
        quantity: item.quantity,
        reason_id: props.returnReasons[0].id ?? '',
        note: '',
      });
    }
  }, [props.order, props.returnReasons]);

  const formatStatus = (str: string) => {
    const formatted = str.split('_').join(' ');

    return formatted.slice(0, 1).toUpperCase() + formatted.slice(1);
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

  if (process.env['DEBUG_SUSPENSE'] === 'true') {
    return suspenceComponent;
  }

  return (
    <React.Suspense fallback={suspenceComponent}>
      <ResponsiveDesktop>
        <OrderConfirmedDesktopComponent
          storeProps={storeProps}
          quantity={quantity}
          openRefund={openRefund}
          returnReasonOptions={returnReasonOptions}
          setOpenRefund={setOpenRefund}
          formatStatus={formatStatus}
        />
      </ResponsiveDesktop>
      <ResponsiveMobile>
        <OrderConfirmedMobileComponent
          storeProps={storeProps}
          quantity={quantity}
          openRefund={openRefund}
          returnReasonOptions={returnReasonOptions}
          setOpenRefund={setOpenRefund}
          formatStatus={formatStatus}
        />
      </ResponsiveMobile>
    </React.Suspense>
  );
}
