import styles from '../order-confirmed.module.scss';
import { useTranslation } from 'react-i18next';
import { LineItem, ShippingMethod, ReturnReason } from '@medusajs/medusa';
import OrderConfirmedController from '../../controllers/order-confirmed.controller';
import StoreController from '../../controllers/store.controller';
import { useObservable } from '@ngneat/use-observable';
import ShippingItemComponent from '../shipping-item.component';
// @ts-ignore
import { formatAmount } from 'medusa-react';
import { Button, Dropdown, Modal, OptionProps } from '@fuoco.appdev/core-ui';
import RefundItemComponent from '../refund-item.component';
import { RefundItem } from '../../models/order-confirmed.model';
import WindowController from '../../controllers/window.controller';
import { OrderConfirmedResponsiveProps } from '../order-confirmed.component';

export default function OrderConfirmedDesktopComponent({
  storeProps,
  quantity,
  openRefund,
  returnReasonOptions,
  setOpenRefund,
  formatStatus,
}: OrderConfirmedResponsiveProps): JSX.Element {
  const { t } = useTranslation();
  const [props] = useObservable(OrderConfirmedController.model.store);

  return (
    props.order && (
      <div className={[styles['root'], styles['root-desktop']].join(' ')}>
        <div
          className={[
            styles['left-content'],
            styles['left-content-desktop'],
          ].join(' ')}
        >
          <div
            className={[
              styles['card-container'],
              styles['card-container-desktop'],
            ].join(' ')}
          >
            <div
              className={[
                styles['thankyou-text'],
                styles['thankyou-text-desktop'],
              ].join(' ')}
            >
              {t('thankyouForOrder')}
            </div>
            <div
              className={[
                styles['order-number-text'],
                styles['order-number-text-desktop'],
              ].join(' ')}
            >
              {`#${props.order?.display_id}`}
            </div>
            <div
              className={[
                styles['order-id-text'],
                styles['order-id-text-desktop'],
              ].join(' ')}
            >
              {props.order?.id}
            </div>
            <div
              className={[
                styles['date-container'],
                styles['date-container-desktop'],
              ].join(' ')}
            >
              <div
                className={[
                  styles['date-content'],
                  styles['date-content-desktop'],
                ].join(' ')}
              >
                <div
                  className={[
                    styles['date-text'],
                    styles['date-text-desktop'],
                  ].join(' ')}
                >
                  {new Date(props.order?.created_at).toDateString()}
                </div>
                <div
                  className={[
                    styles['item-count-text'],
                    styles['item-count-text-desktop'],
                  ].join(' ')}
                >{`${quantity} ${
                  quantity !== 1 ? t('items') : t('item')
                }`}</div>
              </div>
              <div>
                <Button
                  classNames={{ button: styles['button'] }}
                  type={'text'}
                  size={'small'}
                  rippleProps={{ color: 'rgba(133, 38, 122, .35)' }}
                  onClick={() => setOpenRefund(true)}
                >
                  {t('refund')}
                </Button>
              </div>
            </div>
            <div
              className={[
                styles['shipping-items'],
                styles['shipping-items-desktop'],
              ].join(' ')}
            >
              {props.order?.items
                .sort((current: LineItem, next: LineItem) => {
                  return (
                    new Date(current.created_at).valueOf() -
                    new Date(next.created_at).valueOf()
                  );
                })
                .map((item: LineItem) => (
                  <ShippingItemComponent
                    key={item.id}
                    item={item}
                    storeProps={storeProps}
                  />
                ))}
            </div>
          </div>
        </div>
        <div
          className={[
            styles['right-content'],
            styles['right-content-desktop'],
          ].join(' ')}
        >
          <div
            className={[
              styles['card-container'],
              styles['card-container-desktop'],
            ].join(' ')}
          >
            <div
              className={[
                styles['content-container'],
                styles['content-container-desktop'],
              ].join(' ')}
            >
              <div
                className={[
                  styles['header-container'],
                  styles['header-container-desktop'],
                ].join(' ')}
              >
                <div
                  className={[
                    styles['header-title'],
                    styles['header-title-desktop'],
                  ].join(' ')}
                >
                  {t('status')}
                </div>
              </div>
              <div
                className={[
                  styles['subheader-title'],
                  styles['subheader-title-desktop'],
                ].join(' ')}
              >
                {t('shipping')}
              </div>
              <div
                className={[
                  styles['detail-text'],
                  styles['detail-text-desktop'],
                ].join(' ')}
              >
                {formatStatus(props.order?.fulfillment_status)}
              </div>
            </div>
            <div
              className={[
                styles['content-container'],
                styles['content-container-desktop'],
              ].join(' ')}
            >
              <div
                className={[
                  styles['subheader-title'],
                  styles['subheader-title-desktop'],
                ].join(' ')}
              >
                {t('payment')}
              </div>
              <div className={styles['detail-text']}>
                {formatStatus(props.order?.payment_status)}
              </div>
            </div>
            <div
              className={[
                styles['content-container'],
                styles['content-container-desktop'],
              ].join(' ')}
            >
              <div
                className={[
                  styles['header-container'],
                  styles['header-container-desktop'],
                ].join(' ')}
              >
                <div
                  className={[
                    styles['header-title'],
                    styles['header-title-desktop'],
                  ].join(' ')}
                >
                  {t('delivery')}
                </div>
              </div>
              <div
                className={[
                  styles['subheader-title'],
                  styles['subheader-title-desktop'],
                ].join(' ')}
              >
                {t('address')}
              </div>
              <div
                className={[
                  styles['detail-text'],
                  styles['detail-text-desktop'],
                ].join(' ')}
              >{`${props.order?.shipping_address.first_name} ${props.order?.shipping_address.last_name}`}</div>
              <div
                className={[
                  styles['detail-text'],
                  styles['detail-text-desktop'],
                ].join(' ')}
              >{`${props.order?.shipping_address.address_1}${
                props.order?.shipping_address.address_2 &&
                ', ' + props.order?.shipping_address.address_2
              }`}</div>
              <div
                className={[
                  styles['detail-text'],
                  styles['detail-text-desktop'],
                ].join(' ')}
              >{`${props.order?.shipping_address.city}, ${props.order?.shipping_address.province} ${props.order?.shipping_address.postal_code}`}</div>
              <div
                className={[
                  styles['detail-text'],
                  styles['detail-text-desktop'],
                ].join(' ')}
              >
                {props.order?.shipping_address.country_code?.toUpperCase()}
              </div>
            </div>
            <div
              className={[
                styles['content-container'],
                styles['content-container-desktop'],
              ].join(' ')}
            >
              <div
                className={[
                  styles['subheader-title'],
                  styles['subheader-title-desktop'],
                ].join(' ')}
              >
                {t('deliveryMethod')}
              </div>
              {props.order?.shipping_methods.map((value: ShippingMethod) => {
                return (
                  <div
                    className={[
                      styles['detail-text'],
                      styles['detail-text-desktop'],
                    ].join(' ')}
                    key={value.id}
                  >
                    {value.shipping_option.name}
                  </div>
                );
              })}
            </div>
          </div>
          <div
            className={[
              styles['card-container'],
              styles['card-container-desktop'],
            ].join(' ')}
          >
            <div
              className={[
                styles['content-container'],
                styles['content-container-desktop'],
              ].join(' ')}
            >
              <div
                className={[
                  styles['header-container'],
                  styles['header-container-desktop'],
                ].join(' ')}
              >
                <div
                  className={[
                    styles['header-title'],
                    styles['header-title-desktop'],
                  ].join(' ')}
                >
                  {t('orderSummary')}
                </div>
              </div>
              <div
                className={[
                  styles['pricing-container'],
                  styles['pricing-container-desktop'],
                ].join(' ')}
              >
                <div
                  className={[
                    styles['subtotal-container'],
                    styles['subtotal-container-desktop'],
                  ].join(' ')}
                >
                  <div
                    className={[
                      styles['subtotal-text'],
                      styles['subtotal-text-desktop'],
                    ].join(' ')}
                  >
                    {t('subtotal')}
                  </div>
                  <div
                    className={[
                      styles['subtotal-text'],
                      styles['subtotal-text-desktop'],
                    ].join(' ')}
                  >
                    {storeProps.selectedRegion &&
                      formatAmount({
                        amount: props.order?.subtotal ?? 0,
                        region: storeProps.selectedRegion,
                        includeTaxes: false,
                      })}
                  </div>
                </div>
                <div
                  className={[
                    styles['total-detail-container'],
                    styles['total-detail-container-desktop'],
                  ].join(' ')}
                >
                  <div
                    className={[
                      styles['total-detail-text'],
                      styles['total-detail-text-desktop'],
                    ].join(' ')}
                  >
                    {t('discount')}
                  </div>
                  <div
                    className={[
                      styles['total-detail-text'],
                      styles['total-detail-text-desktop'],
                    ].join(' ')}
                  >
                    {storeProps.selectedRegion &&
                      formatAmount({
                        amount: -props.order?.discount_total ?? 0,
                        region: storeProps.selectedRegion,
                        includeTaxes: false,
                      })}
                  </div>
                </div>
                <div
                  className={[
                    styles['total-detail-container'],
                    styles['total-detail-container-desktop'],
                  ].join(' ')}
                >
                  <div
                    className={[
                      styles['total-detail-text'],
                      styles['total-detail-text-desktop'],
                    ].join(' ')}
                  >
                    {t('shipping')}
                  </div>
                  <div
                    className={[
                      styles['total-detail-text'],
                      styles['total-detail-text-desktop'],
                    ].join(' ')}
                  >
                    {storeProps.selectedRegion &&
                      formatAmount({
                        amount: props.order?.shipping_total ?? 0,
                        region: storeProps.selectedRegion,
                        includeTaxes: false,
                      })}
                  </div>
                </div>
                <div
                  className={[
                    styles['total-detail-container'],
                    styles['total-detail-container-desktop'],
                  ].join(' ')}
                >
                  <div
                    className={[
                      styles['total-detail-text'],
                      styles['total-detail-text-desktop'],
                    ].join(' ')}
                  >
                    {t('taxes')}
                  </div>
                  <div
                    className={[
                      styles['total-detail-text'],
                      styles['total-detail-text-desktop'],
                    ].join(' ')}
                  >
                    {storeProps.selectedRegion &&
                      formatAmount({
                        amount: props.order?.tax_total ?? 0,
                        region: storeProps.selectedRegion,
                        includeTaxes: false,
                      })}
                  </div>
                </div>
                <div
                  className={[
                    styles['total-container'],
                    styles['total-container-desktop'],
                  ].join(' ')}
                >
                  <div
                    className={[
                      styles['total-text'],
                      styles['total-text-desktop'],
                    ].join(' ')}
                  >
                    {t('total')}
                  </div>
                  <div
                    className={[
                      styles['total-text'],
                      styles['total-text-desktop'],
                    ].join(' ')}
                  >
                    {storeProps.selectedRegion &&
                      formatAmount({
                        amount: props.order?.total ?? 0,
                        region: storeProps.selectedRegion,
                        includeTaxes: true,
                      })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <Modal
          classNames={{
            overlay: styles['modal-overlay'],
          }}
          visible={openRefund}
          hideFooter={true}
          onCancel={() => setOpenRefund(false)}
        >
          <div
            className={[
              styles['refund-items-container'],
              styles['refund-items-container-desktop'],
            ].join(' ')}
          >
            {props.order?.items.map((item: LineItem) => (
              <RefundItemComponent
                item={item}
                refundItem={props.refundItems[item.id]}
                returnReasonOptions={returnReasonOptions}
                onChanged={(value) =>
                  OrderConfirmedController.updateRefundItem(item.id, value)
                }
              />
            ))}
          </div>
          <div
            className={[
              styles['request-refund-button-container'],
              styles['request-refund-button-container-desktop'],
            ].join(' ')}
          >
            <Button
              block={true}
              size={'large'}
              classNames={{
                button: styles['refund-button'],
              }}
              rippleProps={{
                color: 'rgba(233, 33, 66, .35)',
              }}
              disabled={
                Object.values(props.refundItems as RefundItem[]).find(
                  (value: RefundItem) => value.quantity > 0
                ) === undefined
              }
              onClick={async () => {
                await OrderConfirmedController.createReturnAsync();
                setOpenRefund(false);
                WindowController.addToast({
                  key: `refund-request-success-${Math.random()}`,
                  message: t('requestRefund') ?? '',
                  description: t('requestRefundSuccessMessage') ?? '',
                  type: 'success',
                });
              }}
            >
              {t('requestRefund')}
            </Button>
          </div>
        </Modal>
      </div>
    )
  );
}
