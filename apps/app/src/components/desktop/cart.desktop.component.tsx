import { useEffect, useLayoutEffect, useRef } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import CartController from '../../controllers/cart.controller';
import styles from '../cart.module.scss';
import { Button, Input, Line, Modal, Solid, Tabs } from '@fuoco.appdev/core-ui';
import { RoutePathsType, useQuery } from '../../route-paths';
import { useTranslation } from 'react-i18next';
import { useObservable } from '@ngneat/use-observable';
import { LineItem, ProductVariant, Discount, Cart } from '@medusajs/medusa';
import CartItemComponent from '../cart-item.component';
import ExploreController from '../../controllers/explore.controller';
// @ts-ignore
import { formatAmount } from 'medusa-react';
import { CartResponsiveProps } from '../cart.component';
import { Store } from '@ngneat/elf';
import { ResponsiveDesktop } from '../responsive.component';
import CartVariantItemComponent from '../cart-variant-item.component';
import { MedusaProductTypeNames } from 'src/types/medusa.type';
import { createPortal } from 'react-dom';

export default function CartDesktopComponent({
  cartProps,
  exploreProps,
  exploreLocalProps,
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
  const query = useQuery();
  const { t, i18n } = useTranslation();

  return (
    <ResponsiveDesktop>
      <div className={[styles['root'], styles['root-desktop']].join(' ')}>
        {!windowProps.isAuthenticated && (
          <div
            className={[
              styles['account-container'],
              styles['account-container-desktop'],
            ].join(' ')}
          >
            <div
              className={[
                styles['already-have-an-account-title'],
                styles['already-have-an-account-title-desktop'],
              ].join(' ')}
            >
              {t('alreadyHaveAnAccount')}
            </div>
            <div
              className={[
                styles['already-have-an-account-description'],
                styles['already-have-an-account-description-desktop'],
              ].join(' ')}
            >
              {t('alreadyHaveAnAccountDescription')}
            </div>
            <div
              className={[
                styles['sign-in-button-container'],
                styles['sign-in-button-container-desktop'],
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
                  navigate({
                    pathname: RoutePathsType.Signin,
                    search: query.toString(),
                  })
                }
              >
                {t('signIn')}
              </Button>
            </div>
          </div>
        )}
        <div
          className={[styles['content'], styles['content-desktop']].join(' ')}
        >
          <div
            className={[
              styles['card-container'],
              styles['card-container-desktop'],
            ].join(' ')}
          >
            <div
              className={[
                styles['shopping-cart-container'],
                styles['shopping-cart-container-desktop'],
              ].join(' ')}
            >
              <div
                className={[
                  styles['shopping-cart-title'],
                  styles['shopping-cart-title-desktop'],
                ].join(' ')}
              >
                {t('shoppingCart')}
              </div>
              <div
                className={[
                  styles['shopping-cart-items'],
                  styles['shopping-cart-items-desktop'],
                ].join(' ')}
              >
                {salesChannelTabs.length > 0 && (
                  <div
                    className={[
                      styles['tab-container'],
                      styles['tab-container-desktop'],
                    ].join(' ')}
                  >
                    <Tabs
                      flex={true}
                      classNames={{
                        nav: styles['tab-nav'],
                        tabButton: styles['tab-button'],
                        selectedTabButton: styles['selected-tab-button'],
                        tabSliderPill: styles['tab-slider-pill'],
                      }}
                      type={'pills'}
                      activeId={exploreLocalProps.selectedInventoryLocationId}
                      onChange={(id: string) =>
                        ExploreController.updateSelectedInventoryLocationId(id)
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
                        styles['no-items-text-desktop'],
                      ].join(' ')}
                    >
                      {t('chooseASalesChannel')}
                    </div>
                    <div
                      className={[
                        styles['no-items-container'],
                        styles['no-items-container-desktop'],
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
                        onClick={() =>
                          setTimeout(
                            () =>
                              navigate({
                                pathname: RoutePathsType.Explore,
                                search: query.toString(),
                              }),
                            75
                          )
                        }
                      >
                        {t('explore')}
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
                          styles['no-items-text-desktop'],
                        ].join(' ')}
                      >
                        {t('noCartItems')}
                      </div>
                      <div
                        className={[
                          styles['no-items-container'],
                          styles['no-items-container-desktop'],
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
                          onClick={() =>
                            setTimeout(
                              () =>
                                navigate({
                                  pathname: RoutePathsType.Store,
                                  search: query.toString(),
                                }),
                              75
                            )
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
              styles['card-container-desktop'],
            ].join(' ')}
          >
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
                      amount: cartProps.cart?.subtotal ?? 0,
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
                      amount: -(cartProps.cart?.discount_total ?? 0),
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
                      amount: cartProps.cart?.shipping_total ?? 0,
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
                      amount: cartProps.cart?.tax_total ?? 0,
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
                styles['discount-container-desktop'],
              ].join(' ')}
            >
              <div
                className={[
                  styles['discount-input-container'],
                  styles['discount-input-container-desktop'],
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
                  styles['apply-button-container-desktop'],
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
                styles['discount-list-container-desktop'],
              ].join(' ')}
            >
              {cartProps.cart?.discounts?.map((value: Discount) => {
                return (
                  <div
                    key={value.id}
                    className={[
                      styles['discount-code-tag'],
                      styles['discount-code-tag-desktop'],
                    ].join(' ')}
                  >
                    <div
                      className={[
                        styles['discount-code-tag-text'],
                        styles['discount-code-tag-text-desktop'],
                      ].join(' ')}
                    >
                      {value.code}
                    </div>
                    <div
                      className={[
                        styles['discount-code-tag-button-container'],
                        styles['discount-code-tag-button-container-desktop'],
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
                styles['go-to-checkout-container-desktop'],
              ].join(' ')}
            >
              <Button
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
              styles['modal-overlay-desktop'],
            ].join(' '),
            modal: [styles['modal'], styles['modal-desktop']].join(' '),
            title: [styles['modal-title'], styles['modal-title-desktop']].join(
              ' '
            ),
            description: [
              styles['modal-description'],
              styles['modal-description-desktop'],
            ].join(' '),
            footerButtonContainer: [
              styles['modal-footer-button-container'],
              styles['modal-footer-button-container-desktop'],
              styles['modal-address-footer-button-container-desktop'],
            ].join(' '),
            cancelButton: {
              button: [
                styles['modal-cancel-button'],
                styles['modal-cancel-button-desktop'],
              ].join(' '),
            },
            confirmButton: {
              button: [
                styles['modal-confirm-button'],
                styles['modal-confirm-button-desktop'],
              ].join(' '),
            },
          }}
          hideFooter={true}
          title={t('foodRequirement') ?? ''}
          description={
            t('foodRequirementDescription', {
              region: exploreProps?.selectedInventoryLocation?.region,
            }) ?? ''
          }
          visible={isFoodRequirementOpen}
          onCancel={() => setIsFoodRequirementOpen(false)}
        >
          <div
            className={[
              styles['add-variants-container'],
              styles['add-variants-container-desktop'],
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
                  styles['add-to-cart-button-container-desktop'],
                ].join(' '),
                button: [
                  styles['add-to-cart-button'],
                  styles['add-to-cart-button-desktop'],
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
    </ResponsiveDesktop>
  );
}
