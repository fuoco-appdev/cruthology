import { useEffect, useLayoutEffect, useRef } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import CartController from '../../controllers/cart.controller';
import styles from '../cart.module.scss';
import { Button, Input, Line, Modal, Solid, Tabs } from '@fuoco.appdev/core-ui';
import { RoutePathsType } from '../../route-paths';
import { useTranslation } from 'react-i18next';
import { useObservable } from '@ngneat/use-observable';
import { LineItem, ProductVariant, Discount, Cart } from '@medusajs/medusa';
import CartItemComponent from '../cart-item.component';
import StoreController from '../../controllers/store.controller';
// @ts-ignore
import { formatAmount } from 'medusa-react';
import WindowController from '../../controllers/window.controller';
import { CartResponsiveProps } from '../cart.component';
import HomeController from '../../controllers/home.controller';
import { Store } from '@ngneat/elf';
import { ResponsiveMobile, ResponsiveTablet } from '../responsive.component';
import CartVariantItemComponent from '../cart-variant-item.component';
import { MedusaProductTypeNames } from 'src/types/medusa.type';
import { createPortal } from 'react-dom';

export default function CartTabletComponent({
  cartProps,
  homeProps,
  homeLocalProps,
  storeProps,
  windowProps,
  salesChannelTabs,
  foodVariantQuantities,
  isFoodRequirementOpen,
  setIsFoodRequirementOpen,
  setFoodVariantQuantities,
  onCheckout,
  onAddFoodToCart,
}: CartResponsiveProps): JSX.Element {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  return (
    <ResponsiveTablet>
      <div className={[styles['root'], styles['root-tablet']].join(' ')}>
        {!windowProps.isAuthenticated && (
          <div
            className={[
              styles['account-container'],
              styles['account-container-tablet'],
            ].join(' ')}
          >
            <div
              className={[
                styles['already-have-an-account-title'],
                styles['already-have-an-account-title-tablet'],
              ].join(' ')}
            >
              {t('alreadyHaveAnAccount')}
            </div>
            <div
              className={[
                styles['already-have-an-account-description'],
                styles['already-have-an-account-description-tablet'],
              ].join(' ')}
            >
              {t('alreadyHaveAnAccountDescription')}
            </div>
            <div
              className={[
                styles['sign-in-button-container'],
                styles['sign-in-button-container-tablet'],
              ].join(' ')}
            >
              <Button
                classNames={{
                  button: styles['outline-button'],
                }}
                rippleProps={{
                  color: 'rgba(133, 38, 122, .35)',
                }}
                size={'large'}
                touchScreen={true}
                onClick={() => navigate(RoutePathsType.Signin)}
              >
                {t('signIn')}
              </Button>
            </div>
          </div>
        )}
        <div
          className={[styles['content'], styles['content-tablet']].join(' ')}
        >
          <div
            className={[
              styles['card-container'],
              styles['card-container-tablet'],
            ].join(' ')}
          >
            <div
              className={[
                styles['shopping-cart-container'],
                styles['shopping-cart-container-tablet'],
              ].join(' ')}
            >
              <div
                className={[
                  styles['shopping-cart-title'],
                  styles['shopping-cart-title-tablet'],
                ].join(' ')}
              >
                {t('shoppingCart')}
              </div>
              <div
                className={[
                  styles['shopping-cart-items'],
                  styles['shopping-cart-items-tablet'],
                ].join(' ')}
              >
                {salesChannelTabs.length > 0 && (
                  <div
                    className={[
                      styles['tab-container'],
                      styles['tab-container-tablet'],
                    ].join(' ')}
                  >
                    <Tabs
                      flex={true}
                      touchScreen={true}
                      classNames={{
                        nav: styles['tab-nav'],
                        tabButton: styles['tab-button'],
                        selectedTabButton: styles['selected-tab-button'],
                        tabSliderPill: styles['tab-slider-pill'],
                      }}
                      type={'pills'}
                      activeId={homeLocalProps.selectedInventoryLocationId}
                      onChange={(id: string) =>
                        HomeController.updateSelectedInventoryLocationId(id)
                      }
                      tabs={salesChannelTabs}
                    />
                  </div>
                )}
                {cartProps.cart?.items
                  .sort((current: LineItem, next: LineItem) => {
                    return (
                      new Date(current.created_at).valueOf() -
                      new Date(next.created_at).valueOf()
                    );
                  })
                  .map((item: LineItem) => (
                    <CartItemComponent
                      key={item.id}
                      item={item}
                      storeProps={storeProps}
                      onQuantityChanged={(quantity) => {
                        CartController.updateLineItemQuantityAsync(
                          quantity,
                          item
                        );
                      }}
                      onRemove={() => CartController.removeLineItemAsync(item)}
                    />
                  ))}
                {salesChannelTabs.length <= 0 && (
                  <>
                    <div
                      className={[
                        styles['no-items-text'],
                        styles['no-items-text-tablet'],
                      ].join(' ')}
                    >
                      {t('chooseASalesChannel')}
                    </div>
                    <div
                      className={[
                        styles['no-items-container'],
                        styles['no-items-container-tablet'],
                      ].join(' ')}
                    >
                      <Button
                        classNames={{
                          button: styles['outline-button'],
                        }}
                        rippleProps={{
                          color: 'rgba(133, 38, 122, .35)',
                        }}
                        size={'large'}
                        touchScreen={true}
                        onClick={() =>
                          setTimeout(() => navigate(RoutePathsType.Home), 75)
                        }
                      >
                        {t('home')}
                      </Button>
                    </div>
                  </>
                )}
                {salesChannelTabs.length > 0 &&
                  (!cartProps.cart || cartProps.cart?.items.length <= 0) && (
                    <>
                      <div
                        className={[
                          styles['no-items-text'],
                          styles['no-items-text-tablet'],
                        ].join(' ')}
                      >
                        {t('noCartItems')}
                      </div>
                      <div
                        className={[
                          styles['no-items-container'],
                          styles['no-items-container-tablet'],
                        ].join(' ')}
                      >
                        <Button
                          classNames={{
                            button: styles['outline-button'],
                          }}
                          rippleProps={{
                            color: 'rgba(133, 38, 122, .35)',
                          }}
                          size={'large'}
                          touchScreen={true}
                          onClick={() =>
                            setTimeout(() => navigate(RoutePathsType.Store), 75)
                          }
                        >
                          {t('shopNow')}
                        </Button>
                      </div>
                    </>
                  )}
              </div>
            </div>
          </div>
          <div
            className={[
              styles['card-container'],
              styles['card-container-tablet'],
            ].join(' ')}
          >
            <div
              className={[
                styles['pricing-container'],
                styles['pricing-container-tablet'],
              ].join(' ')}
            >
              <div
                className={[
                  styles['subtotal-container'],
                  styles['subtotal-container-tablet'],
                ].join(' ')}
              >
                <div
                  className={[
                    styles['subtotal-text'],
                    styles['subtotal-text-tablet'],
                  ].join(' ')}
                >
                  {t('subtotal')}
                </div>
                <div
                  className={[
                    styles['subtotal-text'],
                    styles['subtotal-text-tablet'],
                  ].join(' ')}
                >
                  {storeProps.selectedRegion &&
                    formatAmount({
                      amount: cartProps.cart?.subtotal ?? 0,
                      region: storeProps.selectedRegion,
                      includeTaxes: false,
                    })}
                </div>
              </div>
              <div
                className={[
                  styles['total-detail-container'],
                  styles['total-detail-container-tablet'],
                ].join(' ')}
              >
                <div
                  className={[
                    styles['total-detail-text'],
                    styles['total-detail-text-tablet'],
                  ].join(' ')}
                >
                  {t('discount')}
                </div>
                <div
                  className={[
                    styles['total-detail-text'],
                    styles['total-detail-text-tablet'],
                  ].join(' ')}
                >
                  {storeProps.selectedRegion &&
                    formatAmount({
                      amount: -(cartProps.cart?.discount_total ?? 0),
                      region: storeProps.selectedRegion,
                      includeTaxes: false,
                    })}
                </div>
              </div>
              <div
                className={[
                  styles['total-detail-container'],
                  styles['total-detail-container-tablet'],
                ].join(' ')}
              >
                <div
                  className={[
                    styles['total-detail-text'],
                    styles['total-detail-text-tablet'],
                  ].join(' ')}
                >
                  {t('shipping')}
                </div>
                <div
                  className={[
                    styles['total-detail-text'],
                    styles['total-detail-text-tablet'],
                  ].join(' ')}
                >
                  {storeProps.selectedRegion &&
                    formatAmount({
                      amount: cartProps.cart?.shipping_total ?? 0,
                      region: storeProps.selectedRegion,
                      includeTaxes: false,
                    })}
                </div>
              </div>
              <div
                className={[
                  styles['total-detail-container'],
                  styles['total-detail-container-tablet'],
                ].join(' ')}
              >
                <div
                  className={[
                    styles['total-detail-text'],
                    styles['total-detail-text-tablet'],
                  ].join(' ')}
                >
                  {t('taxes')}
                </div>
                <div
                  className={[
                    styles['total-detail-text'],
                    styles['total-detail-text-tablet'],
                  ].join(' ')}
                >
                  {storeProps.selectedRegion &&
                    formatAmount({
                      amount: cartProps.cart?.tax_total ?? 0,
                      region: storeProps.selectedRegion,
                      includeTaxes: false,
                    })}
                </div>
              </div>
              <div
                className={[
                  styles['total-container'],
                  styles['total-container-tablet'],
                ].join(' ')}
              >
                <div
                  className={[
                    styles['total-text'],
                    styles['total-text-tablet'],
                  ].join(' ')}
                >
                  {t('total')}
                </div>
                <div
                  className={[
                    styles['total-text'],
                    styles['total-text-tablet'],
                  ].join(' ')}
                >
                  {storeProps.selectedRegion &&
                    formatAmount({
                      amount: cartProps.cart?.total ?? 0,
                      region: storeProps.selectedRegion,
                      includeTaxes: true,
                    })}
                </div>
              </div>
            </div>
            <div
              className={[
                styles['discount-container'],
                styles['discount-container-tablet'],
              ].join(' ')}
            >
              <div
                className={[
                  styles['discount-input-container'],
                  styles['discount-input-container-tablet'],
                ].join(' ')}
              >
                <Input
                  classNames={{
                    formLayout: {
                      label: styles['input-form-layout-label'],
                    },
                    input: styles['input'],
                    container: styles['input-container'],
                  }}
                  label={t('discount') ?? ''}
                  value={cartProps.discountCode}
                  onChange={(event) =>
                    CartController.updateDiscountCodeText(event.target.value)
                  }
                />
              </div>
              <div
                className={[
                  styles['apply-button-container'],
                  styles['apply-button-container-tablet'],
                ].join(' ')}
              >
                <Button
                  size={'large'}
                  classNames={{
                    button: styles['apply-button'],
                  }}
                  rippleProps={{
                    color: 'rgba(133, 38, 122, .35)',
                  }}
                  onClick={() => CartController.updateDiscountCodeAsync()}
                >
                  {t('apply')}
                </Button>
              </div>
            </div>
            <div
              className={[
                styles['discount-list-container'],
                styles['discount-list-container-tablet'],
              ].join(' ')}
            >
              {cartProps.cart?.discounts?.map((value: Discount) => {
                return (
                  <div
                    key={value.id}
                    className={[
                      styles['discount-code-tag'],
                      styles['discount-code-tag-tablet'],
                    ].join(' ')}
                  >
                    <div
                      className={[
                        styles['discount-code-tag-text'],
                        styles['discount-code-tag-text-tablet'],
                      ].join(' ')}
                    >
                      {value.code}
                    </div>
                    <div
                      className={[
                        styles['discount-code-tag-button-container'],
                        styles['discount-code-tag-button-container-tablet'],
                      ].join(' ')}
                    >
                      <Button
                        classNames={{
                          button: styles['discount-code-tag-button'],
                        }}
                        onClick={() =>
                          CartController.removeDiscountCodeAsync(value.code)
                        }
                        rippleProps={{}}
                        touchScreen={true}
                        block={true}
                        rounded={true}
                        type={'primary'}
                        size={'tiny'}
                        icon={<Solid.Cancel size={14} />}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
            <div
              className={[
                styles['go-to-checkout-container'],
                styles['go-to-checkout-container-tablet'],
              ].join(' ')}
            >
              <Button
                touchScreen={true}
                classNames={{
                  button: styles['checkout-button'],
                }}
                rippleProps={{
                  color: 'rgba(233, 33, 66, .35)',
                }}
                block={true}
                disabled={!cartProps.cart || cartProps.cart?.items?.length <= 0}
                size={'large'}
                icon={<Line.ShoppingCart size={24} />}
                onClick={onCheckout}
              >
                {t('goToCheckout')}
              </Button>
            </div>
          </div>
        </div>
      </div>
      {createPortal(
        <Modal
          classNames={{
            overlay: [
              styles['modal-overlay'],
              styles['modal-overlay-tablet'],
            ].join(' '),
            modal: [styles['modal'], styles['modal-tablet']].join(' '),
            title: [styles['modal-title'], styles['modal-title-tablet']].join(
              ' '
            ),
            description: [
              styles['modal-description'],
              styles['modal-description-tablet'],
            ].join(' '),
            footerButtonContainer: [
              styles['modal-footer-button-container'],
              styles['modal-footer-button-container-tablet'],
              styles['modal-address-footer-button-container-tablet'],
            ].join(' '),
            cancelButton: {
              button: [
                styles['modal-cancel-button'],
                styles['modal-cancel-button-tablet'],
              ].join(' '),
            },
            confirmButton: {
              button: [
                styles['modal-confirm-button'],
                styles['modal-confirm-button-tablet'],
              ].join(' '),
            },
          }}
          hideFooter={true}
          title={t('foodRequirement') ?? ''}
          description={
            t('foodRequirementDescription', {
              region: homeProps?.selectedInventoryLocation?.region,
            }) ?? ''
          }
          visible={isFoodRequirementOpen}
          onCancel={() => setIsFoodRequirementOpen(false)}
        >
          <div
            className={[
              styles['add-variants-container'],
              styles['add-variants-container-tablet'],
            ].join(' ')}
          >
            {cartProps.requiredFoodProducts.map((product) => {
              return product?.variants.map((variant) => {
                return (
                  <CartVariantItemComponent
                    productType={MedusaProductTypeNames.RequiredFood}
                    key={variant.id}
                    product={product}
                    variant={variant}
                    storeProps={storeProps}
                    variantQuantities={foodVariantQuantities}
                    setVariantQuantities={setFoodVariantQuantities}
                  />
                );
              });
            })}
            <Button
              classNames={{
                container: [
                  styles['add-to-cart-button-container'],
                  styles['add-to-cart-button-container-tablet'],
                ].join(' '),
                button: [
                  styles['add-to-cart-button'],
                  styles['add-to-cart-button-tablet'],
                ].join(' '),
              }}
              block={true}
              size={'full'}
              rippleProps={{
                color: 'rgba(233, 33, 66, .35)',
              }}
              icon={<Line.AddShoppingCart size={24} />}
              disabled={
                Object.values(foodVariantQuantities).reduce((current, next) => {
                  return current + next;
                }, 0) <= 0
              }
              onClick={onAddFoodToCart}
            >
              {t('addToCart')}
            </Button>
          </div>
        </Modal>,
        document.body
      )}
    </ResponsiveTablet>
  );
}
