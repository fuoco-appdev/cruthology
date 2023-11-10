import styles from '../checkout.module.scss';
import {
  Button,
  Checkbox,
  Line,
  Radio,
  Input,
  Solid,
  Dropdown,
  FormLayout,
} from '@fuoco.appdev/core-ui';
import { useTranslation } from 'react-i18next';
import { useRef } from 'react';
import { useObservable } from '@ngneat/use-observable';
import CheckoutController from '../../controllers/checkout.controller';
import AddressFormComponent from '../address-form.component';
import StoreController from '../../controllers/store.controller';
import { ProviderType } from '../../models/checkout.model';
import CartController from '../../controllers/cart.controller';
import { Discount, GiftCard, Customer } from '@medusajs/medusa';
// @ts-ignore
import { formatAmount } from 'medusa-react';
import AccountController from '../../controllers/account.controller';
import {
  Elements,
  CardCvcElement,
  CardExpiryElement,
  CardNumberElement,
} from '@stripe/react-stripe-js';
import StripePayButtonComponent from '../stripe-pay-button.component';
import { CheckoutResponsiveProps } from '../checkout.component';
import { useNavigate } from 'react-router-dom';
import { RoutePathsType } from '../../route-paths';
import { ResponsiveMobile } from '../responsive.component';
import { loadStripe } from '@stripe/stripe-js';
import SecretsService from '../../services/secrets.service';
import { createPortal } from 'react-dom';

export default function CheckoutMobileComponent({
  checkoutProps,
  accountProps,
  storeProps,
  cartProps,
  windowProps,
  shippingOptions,
  providerOptions,
  shippingAddressOptions,
  isAddAddressOpen,
  isPayOpen,
  stripeOptions,
  stripeElementOptions,
  setIsAddAddressOpen,
  setIsPayOpen,
  onContinueToDeliveryFromShippingAddress,
  onContinueToBillingFromShippingAddress,
  onContinueToDeliveryFromBillingAddress,
  onAddAddressAsync,
}: CheckoutResponsiveProps): JSX.Element {
  const stripePromise = loadStripe(SecretsService.stripePublishableKey ?? '');
  const rootRef = useRef<HTMLDivElement | null>(null);
  const navigate = useNavigate();
  const { t } = useTranslation();

  const customer = accountProps.customer as Customer;
  return (
    <ResponsiveMobile>
      <div
        ref={rootRef}
        className={[styles['root'], styles['root-mobile']].join(' ')}
      >
        <div
          className={[
            styles['card-container'],
            styles['card-container-mobile'],
          ].join(' ')}
        >
          <div
            className={[
              styles['card-content-container'],
              styles['card-content-container-mobile'],
            ].join(' ')}
          >
            <div
              className={[
                styles['header-container'],
                styles['header-container-mobile'],
              ].join(' ')}
            >
              <div
                className={[
                  styles['step-count'],
                  styles['step-count-mobile'],
                ].join(' ')}
              >
                1
              </div>
              <div
                className={[
                  styles['header-title'],
                  styles['header-title-mobile'],
                ].join(' ')}
              >
                {t('shippingAddress')}
              </div>
              <div
                className={[
                  styles['header-right-content'],
                  styles['header-right-content-mobile'],
                ].join(' ')}
              >
                {windowProps.isAuthenticated && (
                  <div>
                    <Button
                      rounded={true}
                      icon={<Line.Add size={24} color={'#2A2A5F'} />}
                      type={'text'}
                      rippleProps={{
                        color: 'rgba(42, 42, 95, .35)',
                      }}
                      touchScreen={true}
                      onClick={() => setIsAddAddressOpen(true)}
                    />
                  </div>
                )}
              </div>
            </div>
            {!windowProps.isAuthenticated && (
              <AddressFormComponent
                values={checkoutProps.shippingForm}
                errors={checkoutProps.shippingFormErrors}
                isComplete={checkoutProps.shippingFormComplete}
                onEdit={() =>
                  CheckoutController.updateShippingFormComplete(false)
                }
                onChangeCallbacks={{
                  email: (event) =>
                    CheckoutController.updateShippingAddress({
                      email: event.target.value,
                    }),
                  firstName: (event) =>
                    CheckoutController.updateShippingAddress({
                      firstName: event.target.value,
                    }),
                  lastName: (event) =>
                    CheckoutController.updateShippingAddress({
                      lastName: event.target.value,
                    }),
                  company: (event) =>
                    CheckoutController.updateShippingAddress({
                      company: event.target.value,
                    }),
                  address: (event) =>
                    CheckoutController.updateShippingAddress({
                      address: event.target.value,
                    }),
                  apartments: (event) =>
                    CheckoutController.updateShippingAddress({
                      apartments: event.target.value,
                    }),
                  postalCode: (event) =>
                    CheckoutController.updateShippingAddress({
                      postalCode: event.target.value,
                    }),
                  city: (event) =>
                    CheckoutController.updateShippingAddress({
                      city: event.target.value,
                    }),
                  country: (id, value) =>
                    CheckoutController.updateShippingAddress({
                      countryCode: id,
                    }),
                  region: (id, value) =>
                    CheckoutController.updateShippingAddress({
                      region: value,
                    }),
                  phoneNumber: (value, event, formattedValue) =>
                    CheckoutController.updateShippingAddress({
                      phoneNumber: value,
                    }),
                }}
              />
            )}
            {windowProps.isAuthenticated &&
              customer?.shipping_addresses?.length > 0 && (
                <Radio.Group
                  id={''}
                  activeId={checkoutProps.selectedShippingAddressOptionId ?? ''}
                  rippleProps={{
                    color: 'rgba(42, 42, 95, .35)',
                  }}
                  classNames={{
                    radio: {
                      containerCard: styles['radio-container-card'],
                      labelText: styles['radio-label-text'],
                      labelDescription: styles['radio-label-description-text'],
                      containerCardActive:
                        styles['radio-container-card-active'],
                    },
                  }}
                  options={shippingAddressOptions}
                  type={'cards'}
                  onChange={(event) =>
                    CheckoutController.updateSelectedShippingAddressOptionIdAsync(
                      event.target.id
                    )
                  }
                />
              )}
            {windowProps.isAuthenticated &&
              customer?.shipping_addresses?.length <= 0 && (
                <div
                  className={[
                    styles['card-description'],
                    styles['card-description-mobile'],
                  ].join(' ')}
                >
                  {t('noAddressAddedDescription')}
                </div>
              )}
            <Checkbox
              classNames={{
                container: styles['checkbox-container'],
                checkbox: styles['checkbox'],
                labelContainerLabelSpan: styles['checkbox-label'],
              }}
              label={t('sameAsBillingAddress') ?? ''}
              checked={checkoutProps.sameAsBillingAddress}
              onChange={() =>
                CheckoutController.updateSameAsBillingAddress(
                  !checkoutProps.sameAsBillingAddress
                )
              }
            />
            {!accountProps.customer &&
              !checkoutProps.shippingFormComplete &&
              checkoutProps.sameAsBillingAddress && (
                <Button
                  classNames={{
                    container: styles['submit-button-container'],
                    button: styles['submit-button'],
                  }}
                  block={true}
                  size={'large'}
                  touchScreen={true}
                  icon={<Line.DeliveryDining size={24} />}
                  onClick={onContinueToDeliveryFromShippingAddress}
                >
                  {t('continueToDelivery')}
                </Button>
              )}
            {!checkoutProps.shippingFormComplete &&
              !checkoutProps.sameAsBillingAddress && (
                <Button
                  classNames={{
                    container: styles['submit-button-container'],
                    button: styles['submit-button'],
                  }}
                  block={true}
                  size={'large'}
                  icon={<Line.Receipt size={24} />}
                  onClick={onContinueToBillingFromShippingAddress}
                >
                  {t('continueToBilling')}
                </Button>
              )}
          </div>
        </div>
        {!checkoutProps.sameAsBillingAddress && (
          <div
            className={[
              styles['card-container'],
              styles['card-container-mobile'],
            ].join(' ')}
          >
            <div
              className={[
                styles['card-content-container'],
                styles['card-content-container-mobile'],
              ].join(' ')}
            >
              <div
                className={[
                  styles['header-container'],
                  styles['header-container-mobile'],
                ].join(' ')}
              >
                <div
                  className={[
                    styles['step-count'],
                    styles['step-count-mobile'],
                  ].join(' ')}
                >
                  2
                </div>
                <div
                  className={[
                    styles['header-title'],
                    styles['header-title-mobile'],
                  ].join(' ')}
                >
                  {t('billing')}
                </div>
              </div>
              {checkoutProps.shippingFormComplete ? (
                <>
                  <AddressFormComponent
                    values={checkoutProps.billingForm}
                    errors={checkoutProps.billingFormErrors}
                    isComplete={checkoutProps.billingFormComplete}
                    onEdit={() =>
                      CheckoutController.updateBillingFormComplete(false)
                    }
                    onChangeCallbacks={{
                      email: (event) =>
                        CheckoutController.updateBillingAddress({
                          email: event.target.value,
                        }),
                      firstName: (event) =>
                        CheckoutController.updateBillingAddress({
                          firstName: event.target.value,
                        }),
                      lastName: (event) =>
                        CheckoutController.updateBillingAddress({
                          lastName: event.target.value,
                        }),
                      company: (event) =>
                        CheckoutController.updateBillingAddress({
                          company: event.target.value,
                        }),
                      address: (event) =>
                        CheckoutController.updateBillingAddress({
                          address: event.target.value,
                        }),
                      apartments: (event) =>
                        CheckoutController.updateBillingAddress({
                          apartments: event.target.value,
                        }),
                      postalCode: (event) =>
                        CheckoutController.updateBillingAddress({
                          postalCode: event.target.value,
                        }),
                      city: (event) =>
                        CheckoutController.updateBillingAddress({
                          city: event.target.value,
                        }),
                      country: (id, value) =>
                        CheckoutController.updateBillingAddress({
                          countryCode: id,
                        }),
                      region: (id, value) =>
                        CheckoutController.updateBillingAddress({
                          region: value,
                        }),
                      phoneNumber: (value, event, formattedValue) =>
                        CheckoutController.updateBillingAddress({
                          phoneNumber: value,
                        }),
                    }}
                  />
                  {!checkoutProps.billingFormComplete && (
                    <Button
                      classNames={{
                        container: styles['submit-button-container'],
                        button: styles['submit-button'],
                      }}
                      block={true}
                      touchScreen={true}
                      size={'large'}
                      icon={<Line.DeliveryDining size={24} />}
                      onClick={onContinueToDeliveryFromBillingAddress}
                    >
                      {t('continueToDelivery')}
                    </Button>
                  )}
                </>
              ) : (
                <div
                  className={[
                    styles['card-description'],
                    styles['card-description-mobile'],
                  ].join(' ')}
                >
                  {t('enterShippingAddressForBilling')}
                </div>
              )}
            </div>
          </div>
        )}
        <div
          className={[
            styles['card-container'],
            styles['card-container-mobile'],
          ].join(' ')}
        >
          <div
            className={[
              styles['card-content-container'],
              styles['card-content-container-mobile'],
            ].join(' ')}
          >
            <div
              className={[
                styles['header-container'],
                styles['header-container-mobile'],
              ].join(' ')}
            >
              <div
                className={[
                  styles['step-count'],
                  styles['step-count-mobile'],
                ].join(' ')}
              >
                {checkoutProps.sameAsBillingAddress ? 2 : 3}
              </div>
              <div
                className={[
                  styles['header-title'],
                  styles['header-title-mobile'],
                ].join(' ')}
              >
                {t('delivery')}
              </div>
            </div>
            {!checkoutProps.shippingFormComplete && (
              <div
                className={[
                  styles['card-description'],
                  styles['card-description-mobile'],
                ].join(' ')}
              >
                {t('enterShippingAddressForDelivery')}
              </div>
            )}
            {checkoutProps.shippingFormComplete &&
              !checkoutProps.billingFormComplete && (
                <div
                  className={[
                    styles['card-description'],
                    styles['card-description-mobile'],
                  ].join(' ')}
                >
                  {t('enterBillingAddressForDelivery')}
                </div>
              )}
            {checkoutProps.shippingFormComplete &&
              checkoutProps.billingFormComplete && (
                <Radio.Group
                  id={''}
                  activeId={checkoutProps.selectedShippingOptionId ?? ''}
                  rippleProps={{
                    color: 'rgba(42, 42, 95, .35)',
                  }}
                  classNames={{
                    radio: {
                      containerCard: styles['radio-container-card'],
                      labelText: styles['radio-label-text'],
                      labelDescription: styles['radio-label-description-text'],
                      containerCardActive:
                        styles['radio-container-card-active'],
                    },
                  }}
                  options={shippingOptions}
                  type={'cards'}
                  onChange={(event) =>
                    CheckoutController.updateSelectedShippingOptionIdAsync(
                      event.target.value
                    )
                  }
                />
              )}
          </div>
        </div>
        <div
          className={[
            styles['card-container'],
            styles['card-container-mobile'],
          ].join(' ')}
        >
          <div
            className={[
              styles['card-content-container'],
              styles['card-content-container-mobile'],
            ].join(' ')}
          >
            <div
              className={[
                styles['header-container'],
                styles['header-container-mobile'],
              ].join(' ')}
            >
              <div
                className={[
                  styles['header-title'],
                  styles['header-title-mobile'],
                ].join(' ')}
              >
                {t('giftCard')}
              </div>
            </div>
            <div
              className={[
                styles['apply-card-container'],
                styles['apply-card-container-mobile'],
              ].join(' ')}
            >
              <div
                className={[
                  styles['apply-card-input-container'],
                  styles['apply-card-input-container-mobile'],
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
                  label={t('code') ?? ''}
                  value={checkoutProps.giftCardCode}
                  onChange={(event) =>
                    CheckoutController.updateGiftCardCodeText(
                      event.target.value
                    )
                  }
                />
              </div>
              <div
                className={[
                  styles['apply-button-container'],
                  styles['apply-button-container-mobile'],
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
                  touchScreen={true}
                  onClick={() => CheckoutController.updateGiftCardCodeAsync()}
                >
                  {t('apply')}
                </Button>
              </div>
            </div>
            {cartProps.cart?.gift_cards &&
              cartProps.cart?.gift_cards.length > 0 && (
                <div
                  className={[
                    styles['tag-list-container'],
                    styles['tag-list-container-mobile'],
                  ].join(' ')}
                >
                  {cartProps.cart?.gift_cards?.map((value: GiftCard) => {
                    return (
                      <div
                        key={value.id}
                        className={[styles['tag'], styles['tag-mobile']].join(
                          ' '
                        )}
                      >
                        <div
                          className={[
                            styles['tag-text'],
                            styles['tag-text-mobile'],
                          ].join(' ')}
                        >
                          {value.code}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
          </div>
        </div>
        <div
          className={[
            styles['card-container'],
            styles['card-container-mobile'],
          ].join(' ')}
        >
          <div
            className={[
              styles['card-content-container'],
              styles['card-content-container-mobile'],
            ].join(' ')}
          >
            <div
              className={[
                styles['header-container'],
                styles['header-container-mobile'],
              ].join(' ')}
            >
              <div
                className={[
                  styles['header-title'],
                  styles['header-title-mobile'],
                ].join(' ')}
              >
                {t('discount')}
              </div>
            </div>
            <div
              className={[
                styles['apply-card-container'],
                styles['apply-card-container-mobile'],
              ].join(' ')}
            >
              <div
                className={[
                  styles['apply-card-input-container'],
                  styles['apply-card-input-container-mobile'],
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
                  label={t('code') ?? ''}
                  value={checkoutProps.discountCode}
                  onChange={(event) =>
                    CheckoutController.updateDiscountCodeText(
                      event.target.value
                    )
                  }
                />
              </div>
              <div
                className={[
                  styles['apply-button-container'],
                  styles['apply-button-container-mobile'],
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
                  touchScreen={true}
                  onClick={() => CheckoutController.updateDiscountCodeAsync()}
                >
                  {t('apply')}
                </Button>
              </div>
            </div>
            {cartProps.cart?.discounts &&
              cartProps.cart?.discounts.length > 0 && (
                <div
                  className={[
                    styles['tag-list-container'],
                    styles['tag-list-container-mobile'],
                  ].join(' ')}
                >
                  {cartProps.cart?.discounts?.map((value: Discount) => {
                    return (
                      <div
                        key={value.id}
                        className={[styles['tag'], styles['tag-mobile']].join(
                          ' '
                        )}
                      >
                        <div
                          className={[
                            styles['tag-text'],
                            styles['tag-text-mobile'],
                          ].join(' ')}
                        >
                          {value.code}
                        </div>
                        <div
                          className={[
                            styles['tag-button-container'],
                            styles['tag-button-container-mobile'],
                          ].join(' ')}
                        >
                          <Button
                            classNames={{
                              button: styles['tag-button'],
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
              )}
          </div>
        </div>
        <div
          className={[
            styles['card-container'],
            styles['card-container-mobile'],
          ].join(' ')}
        >
          <div
            className={[
              styles['card-content-container'],
              styles['card-content-container-mobile'],
            ].join(' ')}
          >
            <div
              className={[
                styles['header-container'],
                styles['header-container-mobile'],
              ].join(' ')}
            >
              <div
                className={[
                  styles['header-title'],
                  styles['header-title-mobile'],
                ].join(' ')}
              >
                {t('payment')}
              </div>
            </div>
            {checkoutProps.billingFormComplete && (
              <Radio.Group
                id={''}
                activeId={checkoutProps.selectedProviderId ?? ''}
                rippleProps={{
                  color: 'rgba(42, 42, 95, .35)',
                }}
                classNames={{
                  radio: {
                    containerCard: styles['radio-container-card'],
                    labelText: styles['radio-label-text'],
                    labelDescription: styles['radio-label-description-text'],
                    containerCardActive: styles['radio-container-card-active'],
                  },
                }}
                options={providerOptions}
                type={'cards'}
                onChange={(event) =>
                  CheckoutController.updateSelectedProviderIdAsync(
                    event.target.id as ProviderType
                  )
                }
              />
            )}
            {!checkoutProps.billingFormComplete && (
              <div
                className={[
                  styles['card-description'],
                  styles['card-description-mobile'],
                ].join(' ')}
              >
                {t('enterBillingAddressForPayment')}
              </div>
            )}
          </div>
          <div
            className={[
              styles['pricing-container'],
              styles['pricing-container-mobile'],
            ].join(' ')}
          >
            <div
              className={[
                styles['subtotal-container'],
                styles['subtotal-container-mobile'],
              ].join(' ')}
            >
              <div
                className={[
                  styles['subtotal-text'],
                  styles['subtotal-text-mobile'],
                ].join(' ')}
              >
                {t('subtotal')}
              </div>
              <div
                className={[
                  styles['subtotal-text'],
                  styles['subtotal-text-mobile'],
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
                styles['total-detail-container-mobile'],
              ].join(' ')}
            >
              <div
                className={[
                  styles['total-detail-text'],
                  styles['total-detail-text-mobile'],
                ].join(' ')}
              >
                {t('discount')}
              </div>
              <div
                className={[
                  styles['total-detail-text'],
                  styles['total-detail-text-mobile'],
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
                styles['total-detail-container-mobile'],
              ].join(' ')}
            >
              <div
                className={[
                  styles['total-detail-text'],
                  styles['total-detail-text-mobile'],
                ].join(' ')}
              >
                {t('shipping')}
              </div>
              <div
                className={[
                  styles['total-detail-text'],
                  styles['total-detail-text-mobile'],
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
                styles['total-detail-container-mobile'],
              ].join(' ')}
            >
              <div
                className={[
                  styles['total-detail-text'],
                  styles['total-detail-text-mobile'],
                ].join(' ')}
              >
                {t('taxes')}
              </div>
              <div
                className={[
                  styles['total-detail-text'],
                  styles['total-detail-text-mobile'],
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
                styles['total-container-mobile'],
              ].join(' ')}
            >
              <div
                className={[
                  styles['total-text'],
                  styles['total-text-mobile'],
                ].join(' ')}
              >
                {t('total')}
              </div>
              <div
                className={[
                  styles['total-text'],
                  styles['total-text-mobile'],
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
              styles['is-legal-age-container'],
              styles['is-legal-age-container-mobile'],
            ].join(' ')}
          >
            <Checkbox
              classNames={{
                checkbox: styles['checkbox'],
                labelContainerLabel: styles['checkbox-label'],
              }}
              label={t('isLegalAgeDescription') ?? ''}
              checked={checkoutProps.isLegalAge}
              onChange={() =>
                CheckoutController.updateIsLegalAge(!checkoutProps.isLegalAge)
              }
            />
          </div>
          <div
            className={[
              styles['pay-button-container'],
              styles['pay-button-container-mobile'],
            ].join(' ')}
          >
            <Button
              classNames={{
                container: styles['submit-button-container'],
                button: styles['submit-button'],
              }}
              block={true}
              touchScreen={true}
              disabled={
                !checkoutProps.shippingFormComplete ||
                !checkoutProps.billingFormComplete ||
                !checkoutProps.selectedShippingOptionId ||
                !checkoutProps.isLegalAge
              }
              size={'large'}
              icon={<Line.Payment size={24} />}
              onClick={() => setIsPayOpen(true)}
            >
              {t('proceedToPayment')}
            </Button>
          </div>
        </div>
        {createPortal(
          <>
            <Dropdown
              classNames={{
                touchscreenOverlay: styles['dropdown-touchscreen-overlay'],
              }}
              open={isAddAddressOpen}
              touchScreen={true}
              onClose={() => setIsAddAddressOpen(false)}
            >
              <div
                className={[
                  styles['add-address-container'],
                  styles['add-address-container-mobile'],
                ].join(' ')}
              >
                <AddressFormComponent
                  isAuthenticated={true}
                  values={checkoutProps.addShippingForm}
                  errors={checkoutProps.addShippingFormErrors}
                  onChangeCallbacks={{
                    firstName: (event) =>
                      CheckoutController.updateAddShippingAddress({
                        firstName: event.target.value,
                      }),
                    lastName: (event) =>
                      CheckoutController.updateAddShippingAddress({
                        lastName: event.target.value,
                      }),
                    company: (event) =>
                      CheckoutController.updateAddShippingAddress({
                        company: event.target.value,
                      }),
                    address: (event) =>
                      CheckoutController.updateAddShippingAddress({
                        address: event.target.value,
                      }),
                    apartments: (event) =>
                      CheckoutController.updateAddShippingAddress({
                        apartments: event.target.value,
                      }),
                    postalCode: (event) =>
                      CheckoutController.updateAddShippingAddress({
                        postalCode: event.target.value,
                      }),
                    city: (event) =>
                      CheckoutController.updateAddShippingAddress({
                        city: event.target.value,
                      }),
                    country: (id, value) =>
                      CheckoutController.updateAddShippingAddress({
                        countryCode: id,
                      }),
                    region: (id, value) =>
                      CheckoutController.updateAddShippingAddress({
                        region: value,
                      }),
                    phoneNumber: (value, event, formattedValue) =>
                      CheckoutController.updateAddShippingAddress({
                        phoneNumber: value,
                      }),
                  }}
                />
                <div
                  className={[
                    styles['add-address-button-container'],
                    styles['add-address-button-container-mobile'],
                  ].join(' ')}
                >
                  <Button
                    classNames={{
                      button: styles['add-address-button'],
                    }}
                    rippleProps={{
                      color: 'rgba(233, 33, 66, .35)',
                    }}
                    touchScreen={true}
                    block={true}
                    size={'large'}
                    onClick={onAddAddressAsync}
                  >
                    {t('addAddress')}
                  </Button>
                </div>
              </div>
            </Dropdown>
            <Dropdown
              classNames={{
                touchscreenOverlay: styles['dropdown-touchscreen-overlay'],
              }}
              open={isPayOpen}
              touchScreen={true}
              onClose={() => setIsPayOpen(false)}
            >
              <div
                className={[
                  styles['pay-container'],
                  styles['pay-container-mobile'],
                ].join(' ')}
              >
                {checkoutProps.selectedProviderId === ProviderType.Manual && (
                  <>
                    <div
                      className={[
                        styles['manual-provider-text'],
                        styles['manual-provider-text-mobile'],
                      ].join(' ')}
                    >
                      {t('manualProviderDescription')}
                    </div>
                    <Button
                      classNames={{
                        button: styles['pay-button'],
                      }}
                      rippleProps={{
                        color: 'rgba(233, 33, 66, .35)',
                      }}
                      block={true}
                      size={'large'}
                      icon={<Line.Lock size={24} />}
                      onClick={async () => {
                        setIsPayOpen(false);
                        const id =
                          await CheckoutController.proceedToManualPaymentAsync();
                        navigate(`${RoutePathsType.OrderConfirmed}/${id}`);
                      }}
                    >
                      {t('pay')}
                    </Button>
                  </>
                )}
                {checkoutProps.selectedProviderId === ProviderType.Stripe && (
                  <Elements stripe={stripePromise} options={stripeOptions}>
                    <FormLayout
                      label={t('creditCardNumber') ?? ''}
                      error={''}
                      classNames={{
                        label: styles['input-form-layout-label'],
                      }}
                    >
                      <CardNumberElement options={stripeElementOptions} />
                    </FormLayout>
                    <div className={styles['horizontal-input-container']}>
                      <FormLayout
                        label={t('expirationDate') ?? ''}
                        error={''}
                        classNames={{
                          root: styles['input-form-root'],
                          label: styles['input-form-layout-label'],
                        }}
                      >
                        <CardExpiryElement options={stripeElementOptions} />
                      </FormLayout>
                      <FormLayout
                        label={t('cvc') ?? ''}
                        error={''}
                        classNames={{
                          root: styles['input-form-root'],
                          label: styles['input-form-layout-label'],
                        }}
                      >
                        <CardCvcElement options={stripeElementOptions} />
                      </FormLayout>
                    </div>
                    <StripePayButtonComponent
                      stripeOptions={stripeOptions}
                      onPaymentClick={() => setIsPayOpen(false)}
                    />
                  </Elements>
                )}
              </div>
            </Dropdown>
            {checkoutProps.isPaymentLoading && (
              <div
                className={[
                  styles['loading-container'],
                  styles['loading-container-mobile'],
                ].join(' ')}
              >
                <img
                  src={'../assets/svg/ring-resize-light.svg'}
                  className={[
                    styles['loading-ring'],
                    styles['loading-ring-mobile'],
                  ].join(' ')}
                />
              </div>
            )}
          </>,
          document.body
        )}
      </div>
    </ResponsiveMobile>
  );
}
