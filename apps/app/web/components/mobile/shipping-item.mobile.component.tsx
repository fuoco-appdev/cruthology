import { useTranslation } from 'react-i18next';
import styles from '../../modules/shipping-item.module.scss';
// @ts-ignore
import { formatAmount } from 'medusa-react';
import { ResponsiveMobile } from '../responsive.component';
import { ShippingItemResponsiveProps } from '../shipping-item.component';

export default function ShippingItemMobileComponent({
  storeProps,
  item,
  hasReducedPrice,
  discountPercentage,
}: ShippingItemResponsiveProps): JSX.Element {
  const { t } = useTranslation();

  return (
    <ResponsiveMobile>
      <div
        key={item.variant_id}
        className={[styles['container'], styles['container-mobile']].join(' ')}
      >
        <div
          className={[styles['details'], styles['details-mobile']].join(' ')}
        >
          <div
            className={[styles['thumbnail'], styles['thumbnail-mobile']].join(
              ' '
            )}
          >
            {!item?.thumbnail && (
              <img
                className={[
                  styles['no-thumbnail-image'],
                  styles['no-thumbnail-image-mobile'],
                ].join(' ')}
                src={'../assets/images/wine-bottle.png'}
              />
            )}
            {item?.thumbnail && (
              <img
                className={[
                  styles['thumbnail-image'],
                  styles['thumbnail-image-mobile'],
                ].join(' ')}
                src={item?.thumbnail}
              />
            )}
          </div>
          <div
            className={[
              styles['title-container'],
              styles['title-container-mobile'],
            ].join(' ')}
          >
            <div
              className={[styles['title'], styles['title-mobile']].join(' ')}
            >
              {item.title}
            </div>
            <div
              className={[styles['variant'], styles['variant-mobile']].join(
                ' '
              )}
            >
              {item.variant.title}
            </div>
          </div>
          <div
            className={[
              styles['quantity-details-container'],
              styles['quantity-details-container-mobile'],
            ].join(' ')}
          >
            <div
              className={[
                styles['quantity-container'],
                styles['quantity-container-mobile'],
              ].join(' ')}
            >
              <div
                className={[
                  styles['quantity-text'],
                  styles['quantity-text-mobile'],
                ].join(' ')}
              >
                {t('quantity')}
              </div>
              <div
                className={[
                  styles['quantity-buttons'],
                  styles['quantity-buttons-mobile'],
                ].join(' ')}
              >
                <div
                  className={[
                    styles['quantity'],
                    styles['quantity-mobile'],
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
            styles['pricing-details-container-mobile'],
          ].join(' ')}
        >
          <div
            className={[
              styles['pricing'],
              styles['pricing-mobile'],
              hasReducedPrice
                ? [
                    styles['pricing-canceled'],
                    styles['pricing-canceled-mobile'],
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
                  styles['discount-pricing-mobile'],
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
                  styles['discount-percentage-mobile'],
                ].join(' ')}
              >
                -{discountPercentage}%
              </div>
            </>
          )}
        </div>
      </div>
    </ResponsiveMobile>
  );
}
