import { LineItem, ProductOptionValue } from '@medusajs/medusa';
import styles from '../cart-variant-item.module.scss';
import { useEffect, useState } from 'react';
import { ProductOptions } from '../../models/product.model';
import { useTranslation } from 'react-i18next';
import { Button, InputNumber, Line, Modal } from '@fuoco.appdev/core-ui';
import CartController from '../../controllers/cart.controller';
// @ts-ignore
import { formatAmount } from 'medusa-react';
import StoreController from '../../controllers/store.controller';
import { useObservable } from '@ngneat/use-observable';
import { CartItemResponsiveProps } from '../cart-item.component';
import { RoutePathsType } from '../../route-paths';
import { useNavigate } from 'react-router-dom';
import { ResponsiveDesktop, ResponsiveTablet } from '../responsive.component';
import { CartVariantItemResponsiveProps } from '../cart-variant-item.component';
import { MedusaProductTypeNames } from '../../types/medusa.type';

export default function CartVariantItemTabletComponent({
  productType,
  product,
  variant,
  storeProps,
  variantQuantities,
  setVariantQuantities,
  onQuantitiesChanged,
}: CartVariantItemResponsiveProps): JSX.Element {
  const { t, i18n } = useTranslation();

  return (
    <ResponsiveTablet>
      <div
        className={[
          styles['variant-container'],
          styles['variant-container-tablet'],
        ].join(' ')}
      >
        <div
          className={[
            styles['variant-content'],
            styles['variant-content-tablet'],
          ].join(' ')}
        >
          <div
            className={[
              styles['variant-details'],
              styles['variant-details-tablet'],
            ].join(' ')}
          >
            <div
              className={[
                styles['variant-thumbnail-container'],
                styles['variant-thumbnail-container-tablet'],
              ].join(' ')}
            >
              {product?.thumbnail &&
                productType === MedusaProductTypeNames.Wine && (
                  <img
                    className={[
                      styles['wine-thumbnail-image'],
                      styles['wine-thumbnail-image-tablet'],
                    ].join(' ')}
                    src={product?.thumbnail}
                  />
                )}
              {product?.thumbnail &&
                productType === MedusaProductTypeNames.MenuItem && (
                  <img
                    className={[
                      styles['menu-item-thumbnail-image'],
                      styles['menu-item-thumbnail-image-tablet'],
                    ].join(' ')}
                    src={product?.thumbnail}
                  />
                )}
              {product?.thumbnail &&
                productType === MedusaProductTypeNames.RequiredFood && (
                  <img
                    className={[
                      styles['required-food-thumbnail-image'],
                      styles['required-food-thumbnail-image-tablet'],
                    ].join(' ')}
                    src={product?.thumbnail}
                  />
                )}
              {!product?.thumbnail &&
                productType === MedusaProductTypeNames.Wine && (
                  <img
                    className={[
                      styles['no-thumbnail-image'],
                      styles['no-thumbnail-image-tablet'],
                    ].join(' ')}
                    src={'../../assets/images/wine-bottle.png'}
                  />
                )}
              {!product?.thumbnail &&
                productType === MedusaProductTypeNames.MenuItem && (
                  <img
                    className={[
                      styles['no-thumbnail-image'],
                      styles['no-thumbnail-image-tablet'],
                    ].join(' ')}
                    src={'../../assets/images/menu.png'}
                  />
                )}
              {!product?.thumbnail &&
                productType === MedusaProductTypeNames.RequiredFood && (
                  <Line.RestaurantMenu
                    className={[
                      styles['no-thumbnail-image'],
                      styles['no-thumbnail-image-tablet'],
                    ].join(' ')}
                  />
                )}
            </div>
            <div
              className={[
                styles['variant-title'],
                styles['variant-title-tablet'],
              ].join(' ')}
            >
              {product?.title}
            </div>
            <div
              className={[
                styles['variant-value'],
                styles['variant-value-tablet'],
              ].join(' ')}
            >
              {variant.title}
            </div>
            <div
              className={[
                styles['variant-price'],
                styles['variant-price-tablet'],
              ].join(' ')}
            >
              {storeProps.selectedRegion &&
                formatAmount({
                  amount: variant.calculated_price ?? 0,
                  region: storeProps.selectedRegion,
                  includeTaxes: false,
                })}
            </div>
          </div>

          <div
            className={[
              styles['variant-checkbox-container'],
              styles['variant-checkbox-container-tablet'],
            ].join(' ')}
            style={{
              ...(variant.id && variantQuantities[variant.id] > 0
                ? {
                    backgroundColor: '#85267A',
                    borderWidth: 0,
                  }
                : { borderWidth: 1 }),
            }}
          >
            {variant.id && variantQuantities[variant.id] > 0 && (
              <Line.Check size={18} />
            )}
          </div>
        </div>
        <InputNumber
          touchScreen={true}
          label={t('quantity') ?? ''}
          classNames={{
            formLayout: { label: styles['input-form-layout-label'] },
            input: styles['input'],
            container: styles['input-container'],
            button: {
              button: [
                styles['input-button'],
                styles['input-button-tablet'],
              ].join(' '),
            },
          }}
          iconColor={'#2A2A5F'}
          value={variant?.id && variantQuantities[variant?.id]?.toString()}
          min={0}
          max={
            !variant.allow_backorder
              ? variant?.inventory_quantity ?? 0
              : undefined
          }
          onChange={onQuantitiesChanged}
        />
      </div>
    </ResponsiveTablet>
  );
}
