import { LineItem, ProductOptionValue } from '@medusajs/medusa';
import styles from '../shipping-item.module.scss';
import { useEffect, useState } from 'react';
import { ProductOptions } from '../../models/product.model';
import { useTranslation } from 'react-i18next';
import { Button, Line, Modal } from '@fuoco.appdev/core-ui';
import CartController from '../../controllers/cart.controller';
// @ts-ignore
import { formatAmount } from 'medusa-react';
import { useObservable } from '@ngneat/use-observable';
import { ShippingItemResponsiveProps } from '../shipping-item.component';

export default function ShippingItemDesktopComponent({
  storeProps,
  item,
  vintage,
  hasReducedPrice,
  discountPercentage,
}: ShippingItemResponsiveProps): JSX.Element {
  const { t } = useTranslation();

  return (
    <div
      key={item.variant_id}
      className={[styles['container'], styles['container-desktop']].join(' ')}
    >
      <div className={[styles['details'], styles['details-desktop']].join(' ')}>
        <div
          className={[styles['thumbnail'], styles['thumbnail-desktop']].join(
            ' '
          )}
        >
          <img
            className={[
              styles['thumbnail-image'],
              styles['thumbnail-image-desktop'],
            ].join(' ')}
            src={item.thumbnail || '../assets/svg/wine-bottle.svg'}
          />
        </div>
        <div
          className={[
            styles['title-container'],
            styles['title-container-desktop'],
          ].join(' ')}
        >
          <div className={[styles['title'], styles['title-desktop']].join(' ')}>
            {item.title}
          </div>
          <div
            className={[styles['variant'], styles['variant-desktop']].join(' ')}
          >{`${t('vintage')}: ${vintage}`}</div>
        </div>
        <div
          className={[
            styles['quantity-details-container'],
            styles['quantity-details-container-desktop'],
          ].join(' ')}
        >
          <div
            className={[
              styles['quantity-container'],
              styles['quantity-container-desktop'],
            ].join(' ')}
          >
            <div
              className={[
                styles['quantity-text'],
                styles['quantity-text-desktop'],
              ].join(' ')}
            >
              {t('quantity')}
            </div>
            <div
              className={[
                styles['quantity-buttons'],
                styles['quantity-buttons-desktop'],
              ].join(' ')}
            >
              <div
                className={[
                  styles['quantity'],
                  styles['quantity-desktop'],
                ].join(' ')}
              >
                {item.quantity}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div
        className={[
          styles['pricing-details-container'],
          styles['pricing-details-container-desktop'],
        ].join(' ')}
      >
        <div
          className={[
            styles['pricing'],
            styles['pricing-desktop'],
            hasReducedPrice
              ? [
                  styles['pricing-canceled'],
                  styles['pricing-canceled-desktop'],
                ].join(' ')
              : '',
          ].join(' ')}
        >
          {hasReducedPrice && `${t('original')}:`} &nbsp;
          {storeProps.selectedRegion &&
            formatAmount({
              amount: item.subtotal ?? 0,
              region: storeProps.selectedRegion,
              includeTaxes: false,
            })}
        </div>
        {hasReducedPrice && (
          <>
            <div
              className={[
                styles['discount-pricing'],
                styles['discount-pricing-desktop'],
              ].join(' ')}
            >
              {storeProps.selectedRegion &&
                formatAmount({
                  amount: (item.subtotal ?? 0) - (item.discount_total ?? 0),
                  region: storeProps.selectedRegion,
                  includeTaxes: false,
                })}
            </div>
            <div
              className={[
                styles['discount-percentage'],
                styles['discount-percentage-desktop'],
              ].join(' ')}
            >
              -{discountPercentage}%
            </div>
          </>
        )}
      </div>
    </div>
  );
}
