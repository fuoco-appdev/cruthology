import { ResponsiveDesktop, ResponsiveMobile } from './responsive.component';
import styles from './checkout.module.scss';
import {
  Button,
  Checkbox,
  OptionProps,
  Line,
  Radio,
  Input,
  Solid,
} from '@fuoco.appdev/core-ui';
import { useTranslation } from 'react-i18next';
import { useEffect, useRef, useState } from 'react';
import { useObservable } from '@ngneat/use-observable';
import CheckoutController from '../controllers/checkout.controller';
import AddressFormComponent, {
  AddressFormErrors,
  AddressFormValues,
} from './address-form.component';
import { RadioProps } from '@fuoco.appdev/core-ui/dist/cjs/src/components/radio/radio';
import StoreController from '../controllers/store.controller';
import { PricedShippingOption } from '@medusajs/medusa/dist/types/pricing';
import { ProviderType, ShippingType } from '../models/checkout.model';
import CartController from '../controllers/cart.controller';
import { Discount, GiftCard, PaymentSession } from '@medusajs/medusa';
// @ts-ignore
import { formatAmount } from 'medusa-react';
import { useNavigate } from 'react-router-dom';
import { RoutePaths } from '../route-paths';

function CheckoutDesktopComponent(): JSX.Element {
  return <></>;
}

function CheckoutMobileComponent(): JSX.Element {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const [props] = useObservable(CheckoutController.model.store);
  const [cartProps] = useObservable(CartController.model.store);
  const [storeProps] = useObservable(StoreController.model.store);
  const [shippingOptions, setShippingOptions] = useState<RadioProps[]>([]);
  const [providerOptions, setProviderOptions] = useState<RadioProps[]>([]);
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  useEffect(() => {
    if (cartProps.cart && cartProps.cart.items.length <= 0) {
      navigate(RoutePaths.Store);
    }
  }, [cartProps.cart]);

  useEffect(() => {
    const radioOptions: RadioProps[] = [];
    for (const option of props.shippingOptions as PricedShippingOption[]) {
      let description = '';
      if (option.name === ShippingType.Standard) {
        description = t('standardShippingDescription');
      } else if (option.name === ShippingType.Express) {
        description = t('expressShippingDescription');
      }

      radioOptions.push({
        id: option.id,
        label: option.name ?? '',
        value: option.id ?? '',
        description: description,
        rightContent: () => (
          <div className={styles['radio-price-text']}>
            {storeProps.selectedRegion &&
              formatAmount({
                amount: option?.amount ?? 0,
                region: storeProps.selectedRegion,
                includeTaxes: false,
              })}
          </div>
        ),
      });
    }
    setShippingOptions(radioOptions);
  }, [props.shippingOptions]);

  useEffect(() => {
    if (!cartProps.cart) {
      return;
    }

    const radioOptions: RadioProps[] = [];
    for (const session of cartProps.cart.payment_sessions as PaymentSession[]) {
      let description = '';
      let name = '';
      if (session.provider_id === ProviderType.Manual) {
        name = t('manualProviderName');
        description = t('manualProviderDescription');
      } else if (session.provider_id === ProviderType.VisaCheckout) {
        name = t('visaCheckoutProviderName');
        description = t('visaCheckoutProviderDescription');
      }

      radioOptions.push({
        id: session.provider_id,
        label: name,
        value: name,
        description: description,
      });
    }
    setProviderOptions(radioOptions);
  }, [cartProps.cart]);

  useEffect(() => {
    CheckoutController.updateErrorStrings({
      email: t('fieldEmptyError') ?? '',
      firstName: t('fieldEmptyError') ?? '',
      lastName: t('fieldEmptyError') ?? '',
      address: t('fieldEmptyError') ?? '',
      postalCode: t('fieldEmptyError') ?? '',
      city: t('fieldEmptyError') ?? '',
      phoneNumber: t('fieldEmptyError') ?? '',
    });
  }, [i18n.language]);

  return (
    <div ref={rootRef} className={styles['root']}>
      <div className={styles['card-container']}>
        <div className={styles['card-content-container']}>
          <div className={styles['header-container']}>
            <div className={styles['step-count']}>1</div>
            <div className={styles['header-title']}>{t('shippingAddress')}</div>
          </div>
          <AddressFormComponent
            values={props.shippingForm}
            errors={props.shippingFormErrors}
            isComplete={props.shippingFormComplete}
            onEdit={() => CheckoutController.updateShippingFormComplete(false)}
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
              country: (index, id, value) =>
                CheckoutController.updateShippingAddress({
                  countryCode: id,
                }),
              region: (index, id, value) =>
                CheckoutController.updateShippingAddress({
                  region: value,
                }),
              phoneNumber: (value, event, formattedValue) =>
                CheckoutController.updateShippingAddress({
                  phoneNumber: value,
                }),
            }}
          />
          <Checkbox
            classNames={{
              container: styles['checkbox-container'],
              checkbox: styles['checkbox'],
              labelContainerLabelSpan: styles['checkbox-label'],
            }}
            label={t('sameAsBillingAddress') ?? ''}
            checked={props.sameAsBillingAddress}
            onChange={() =>
              CheckoutController.updateSameAsBillingAddress(
                !props.sameAsBillingAddress
              )
            }
          />
          {!props.shippingFormComplete && props.sameAsBillingAddress && (
            <Button
              classNames={{
                container: styles['submit-button-container'],
                button: styles['submit-button'],
              }}
              block={true}
              size={'large'}
              icon={<Line.DeliveryDining size={24} />}
              onClick={() => {
                CheckoutController.updateShippingAddressErrors({
                  email: undefined,
                  firstName: undefined,
                  lastName: undefined,
                  company: undefined,
                  address: undefined,
                  apartments: undefined,
                  postalCode: undefined,
                  city: undefined,
                  region: undefined,
                  phoneNumber: undefined,
                });

                const errors = CheckoutController.getAddressFormErrors(
                  CheckoutController.model.shippingForm
                );

                if (errors) {
                  CheckoutController.updateShippingAddressErrors(errors);
                  return;
                }

                CheckoutController.updateShippingFormComplete(true);
                CheckoutController.updateBillingFormComplete(true);
                CheckoutController.continueToDeliveryAsync();
              }}
            >
              {t('continueToDelivery')}
            </Button>
          )}
          {!props.shippingFormComplete && !props.sameAsBillingAddress && (
            <Button
              classNames={{
                container: styles['submit-button-container'],
                button: styles['submit-button'],
              }}
              block={true}
              size={'large'}
              icon={<Line.Receipt size={24} />}
              onClick={() => {
                CheckoutController.updateShippingAddressErrors({
                  email: undefined,
                  firstName: undefined,
                  lastName: undefined,
                  company: undefined,
                  address: undefined,
                  apartments: undefined,
                  postalCode: undefined,
                  city: undefined,
                  region: undefined,
                  phoneNumber: undefined,
                });

                const errors = CheckoutController.getAddressFormErrors(
                  CheckoutController.model.shippingForm
                );

                if (errors) {
                  CheckoutController.updateShippingAddressErrors(errors);
                  return;
                }

                CheckoutController.updateShippingFormComplete(true);
                CheckoutController.continueToBilling();
              }}
            >
              {t('continueToBilling')}
            </Button>
          )}
        </div>
      </div>
      {!props.sameAsBillingAddress && (
        <div className={styles['card-container']}>
          <div className={styles['card-content-container']}>
            <div className={styles['header-container']}>
              <div className={styles['step-count']}>2</div>
              <div className={styles['header-title']}>{t('billing')}</div>
            </div>
            {props.shippingFormComplete ? (
              <>
                <AddressFormComponent
                  values={props.billingForm}
                  errors={props.billingFormErrors}
                  isComplete={props.billingFormComplete}
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
                    country: (index, id) =>
                      CheckoutController.updateBillingAddress({
                        countryCode: id,
                      }),
                    region: (index, id, value) =>
                      CheckoutController.updateBillingAddress({
                        region: value,
                      }),
                    phoneNumber: (value, event, formattedValue) =>
                      CheckoutController.updateBillingAddress({
                        phoneNumber: value,
                      }),
                  }}
                />
                {!props.billingFormComplete && (
                  <Button
                    classNames={{
                      container: styles['submit-button-container'],
                      button: styles['submit-button'],
                    }}
                    block={true}
                    size={'large'}
                    icon={<Line.DeliveryDining size={24} />}
                    onClick={() => {
                      CheckoutController.updateBillingAddressErrors({
                        email: undefined,
                        firstName: undefined,
                        lastName: undefined,
                        company: undefined,
                        address: undefined,
                        apartments: undefined,
                        postalCode: undefined,
                        city: undefined,
                        region: undefined,
                        phoneNumber: undefined,
                      });

                      const errors = CheckoutController.getAddressFormErrors(
                        CheckoutController.model.billingForm
                      );

                      if (errors) {
                        CheckoutController.updateBillingAddressErrors(errors);
                        return;
                      }

                      CheckoutController.updateBillingFormComplete(true);
                      CheckoutController.continueToDeliveryAsync();
                    }}
                  >
                    {t('continueToDelivery')}
                  </Button>
                )}
              </>
            ) : (
              <div className={styles['card-description']}>
                {t('enterShippingAddressForBilling')}
              </div>
            )}
          </div>
        </div>
      )}
      <div className={styles['card-container']}>
        <div className={styles['card-content-container']}>
          <div className={styles['header-container']}>
            <div className={styles['step-count']}>
              {props.sameAsBillingAddress ? 2 : 3}
            </div>
            <div className={styles['header-title']}>{t('delivery')}</div>
          </div>
          {!props.shippingFormComplete && (
            <div className={styles['card-description']}>
              {t('enterShippingAddressForDelivery')}
            </div>
          )}
          {props.shippingFormComplete && !props.billingFormComplete && (
            <div className={styles['card-description']}>
              {t('enterBillingAddressForDelivery')}
            </div>
          )}
          {props.shippingFormComplete && props.billingFormComplete && (
            <Radio.Group
              id={''}
              activeId={props.selectedShippingOptionId ?? ''}
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
      <div className={styles['card-container']}>
        <div className={styles['card-content-container']}>
          <div className={styles['header-container']}>
            <div className={styles['header-title']}>{t('giftCard')}</div>
          </div>
          <div className={styles['apply-card-container']}>
            <div className={styles['apply-card-input-container']}>
              <Input
                classNames={{
                  formLayout: {
                    label: styles['input-form-layout-label'],
                  },
                  input: styles['input'],
                  container: styles['input-container'],
                }}
                label={t('code') ?? ''}
                value={props.giftCardCode}
                onChange={(event) =>
                  CheckoutController.updateGiftCardCodeText(event.target.value)
                }
              />
            </div>
            <div className={styles['apply-button-container']}>
              <Button
                size={'large'}
                classNames={{
                  button: styles['apply-button'],
                }}
                rippleProps={{
                  color: 'rgba(133, 38, 122, .35)',
                }}
                onClick={() => CheckoutController.updateGiftCardCodeAsync()}
              >
                {t('apply')}
              </Button>
            </div>
          </div>
          <div className={styles['tag-list-container']}>
            {cartProps.cart?.gift_cards?.map((value: GiftCard) => {
              return (
                <div key={value.id} className={styles['tag']}>
                  <div className={styles['tag-text']}>{value.code}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <div className={styles['card-container']}>
        <div className={styles['card-content-container']}>
          <div className={styles['header-container']}>
            <div className={styles['header-title']}>{t('discount')}</div>
          </div>
          <div className={styles['apply-card-container']}>
            <div className={styles['apply-card-input-container']}>
              <Input
                classNames={{
                  formLayout: {
                    label: styles['input-form-layout-label'],
                  },
                  input: styles['input'],
                  container: styles['input-container'],
                }}
                label={t('code') ?? ''}
                value={props.discountCode}
                onChange={(event) =>
                  CheckoutController.updateDiscountCodeText(event.target.value)
                }
              />
            </div>
            <div className={styles['apply-button-container']}>
              <Button
                size={'large'}
                classNames={{
                  button: styles['apply-button'],
                }}
                rippleProps={{
                  color: 'rgba(133, 38, 122, .35)',
                }}
                onClick={() => CheckoutController.updateDiscountCodeAsync()}
              >
                {t('apply')}
              </Button>
            </div>
          </div>
          <div className={styles['tag-list-container']}>
            {cartProps.cart?.discounts?.map((value: Discount) => {
              return (
                <div key={value.id} className={styles['tag']}>
                  <div className={styles['tag-text']}>{value.code}</div>
                  <div className={styles['tag-button-container']}>
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
        </div>
      </div>
      <div className={styles['card-container']}>
        <div className={styles['card-content-container']}>
          <div className={styles['header-container']}>
            <div className={styles['header-title']}>{t('payment')}</div>
          </div>
          <Radio.Group
            id={''}
            activeId={props.selectedProviderId ?? ''}
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
                event.target.value
              )
            }
          />
        </div>
        <div className={styles['pricing-container']}>
          <div className={styles['subtotal-container']}>
            <div className={styles['subtotal-text']}>{t('subtotal')}</div>
            <div className={styles['subtotal-text']}>
              {storeProps.selectedRegion &&
                formatAmount({
                  amount: cartProps.cart?.subtotal ?? 0,
                  region: storeProps.selectedRegion,
                  includeTaxes: false,
                })}
            </div>
          </div>
          <div className={styles['total-detail-container']}>
            <div className={styles['total-detail-text']}>{t('discount')}</div>
            <div className={styles['total-detail-text']}>
              {storeProps.selectedRegion &&
                formatAmount({
                  amount: -cartProps.cart?.discount_total ?? 0,
                  region: storeProps.selectedRegion,
                  includeTaxes: false,
                })}
            </div>
          </div>
          <div className={styles['total-detail-container']}>
            <div className={styles['total-detail-text']}>{t('shipping')}</div>
            <div className={styles['total-detail-text']}>
              {storeProps.selectedRegion &&
                formatAmount({
                  amount: cartProps.cart?.shipping_total ?? 0,
                  region: storeProps.selectedRegion,
                  includeTaxes: false,
                })}
            </div>
          </div>
          <div className={styles['total-detail-container']}>
            <div className={styles['total-detail-text']}>{t('taxes')}</div>
            <div className={styles['total-detail-text']}>
              {storeProps.selectedRegion &&
                formatAmount({
                  amount: cartProps.cart?.tax_total ?? 0,
                  region: storeProps.selectedRegion,
                  includeTaxes: false,
                })}
            </div>
          </div>
          <div className={styles['total-container']}>
            <div className={styles['total-text']}>{t('total')}</div>
            <div className={styles['total-text']}>
              {storeProps.selectedRegion &&
                formatAmount({
                  amount: cartProps.cart?.total ?? 0,
                  region: storeProps.selectedRegion,
                  includeTaxes: true,
                })}
            </div>
          </div>
        </div>
        <div className={styles['pay-button-container']}>
          <Button
            classNames={{
              container: styles['submit-button-container'],
              button: styles['submit-button'],
            }}
            block={true}
            disabled={!props.shippingFormComplete || !props.billingFormComplete}
            size={'large'}
            icon={<Line.Payment size={24} />}
            onClick={async () => {
              const id =
                await CheckoutController.proceedToPaymentAndGetCompleteCartIdAsync();
              navigate(`${RoutePaths.OrderConfirmed}/${id}`);
            }}
          >
            {t('proceedToPayment')}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutComponent(): JSX.Element {
  return (
    <>
      <ResponsiveDesktop>
        <CheckoutDesktopComponent />
      </ResponsiveDesktop>
      <ResponsiveMobile>
        <CheckoutMobileComponent />
      </ResponsiveMobile>
    </>
  );
}
