import { RadioProps } from '@fuoco.appdev/web-components/dist/cjs/src/components/radio/radio';
import { Cart, Customer, PaymentSession } from '@medusajs/medusa';
import { PricedShippingOption } from '@medusajs/medusa/dist/types/pricing';
import { useObservable } from '@ngneat/use-observable';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import CartController from '../../shared/controllers/cart.controller';
import CheckoutController from '../../shared/controllers/checkout.controller';
import StoreController from '../../shared/controllers/store.controller';
import {
  CheckoutState,
  ProviderType,
  ShippingType,
} from '../../shared/models/checkout.model';
import styles from '../modules/checkout.module.scss';
// @ts-ignore
import {
  StripeCardCvcElementOptions,
  StripeCardExpiryElementOptions,
  StripeCardNumberElementOptions,
  StripeElementsOptions,
} from '@stripe/stripe-js';
import { formatAmount } from 'medusa-react';
import { Helmet } from 'react-helmet';
import { useNavigate } from 'react-router-dom';
import AccountController from '../../shared/controllers/account.controller';
import WindowController from '../../shared/controllers/window.controller';
import { AccountState } from '../../shared/models/account.model';
import { CartState } from '../../shared/models/cart.model';
import { StoreState } from '../../shared/models/store.model';
import { WindowState } from '../../shared/models/window.model';
import { RoutePathsType } from '../../shared/route-paths-type';
import { useQuery } from '../route-paths';
import { CheckoutSuspenseDesktopComponent } from './desktop/suspense/checkout.suspense.desktop.component';
import { CheckoutSuspenseMobileComponent } from './mobile/suspense/checkout.suspense.mobile.component';

const CheckoutDesktopComponent = React.lazy(
  () => import('./desktop/checkout.desktop.component')
);
const CheckoutMobileComponent = React.lazy(
  () => import('./mobile/checkout.mobile.component')
);

export interface CheckoutResponsiveProps {
  checkoutProps: CheckoutState;
  accountProps: AccountState;
  storeProps: StoreState;
  cartProps: CartState;
  windowProps: WindowState;
  shippingOptions: RadioProps[];
  providerOptions: RadioProps[];
  shippingAddressOptions: RadioProps[];
  isAddAddressOpen: boolean;
  isPayOpen: boolean;
  stripeOptions: StripeElementsOptions;
  stripeElementOptions:
    | StripeCardNumberElementOptions
    | StripeCardExpiryElementOptions
    | StripeCardCvcElementOptions;
  setIsAddAddressOpen: (value: boolean) => void;
  setIsPayOpen: (value: boolean) => void;
  onContinueToDeliveryFromShippingAddress: () => void;
  onContinueToBillingFromShippingAddress: () => void;
  onContinueToDeliveryFromBillingAddress: () => void;
  onAddAddressAsync: () => void;
}

export default function CheckoutComponent(): JSX.Element {
  const query = useQuery();
  const [checkoutProps] = useObservable(CheckoutController.model.store);
  const [checkoutDebugProps] = useObservable(
    CheckoutController.model.debugStore
  );
  const [accountProps] = useObservable(AccountController.model.store);
  const [cartProps] = useObservable(CartController.model.store);
  const [storeProps] = useObservable(StoreController.model.store);
  const [windowProps] = useObservable(WindowController.model.store);
  const [shippingOptions, setShippingOptions] = React.useState<RadioProps[]>(
    []
  );
  const [providerOptions, setProviderOptions] = React.useState<RadioProps[]>(
    []
  );
  const [shippingAddressOptions, setShippingAddressOptions] = React.useState<
    RadioProps[]
  >([]);
  const [isAddAddressOpen, setIsAddAddressOpen] =
    React.useState<boolean>(false);
  const [isPayOpen, setIsPayOpen] = React.useState<boolean>(false);
  const [stripeOptions, setStripeOptions] =
    React.useState<StripeElementsOptions>({});
  const renderCountRef = React.useRef<number>(0);
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const customer = accountProps.customer as Customer;

  React.useEffect(() => {
    renderCountRef.current += 1;
    CheckoutController.load(renderCountRef.current);

    return () => {
      CheckoutController.disposeLoad(renderCountRef.current);
    };
  }, []);

  React.useEffect(() => {
    if (
      (cartProps.cart && cartProps.cart.items.length <= 0) ||
      (cartProps.isFoodInCartRequired &&
        !CartController.isFoodRequirementInCart())
    ) {
      navigate({ pathname: RoutePathsType.Cart, search: query.toString() });
    }
  }, [cartProps.cart]);

  React.useEffect(() => {
    if (!cartProps.cart) {
      return;
    }

    const radioOptions: RadioProps[] = [];
    for (const option of checkoutProps.shippingOptions as PricedShippingOption[]) {
      const minRequirement = option.requirements?.find(
        (value) => value.type === 'min_subtotal'
      );
      const maxRequirement = option.requirements?.find(
        (value) => value.type === 'max_subtotal'
      );
      if (minRequirement && cartProps.cart.subtotal < minRequirement?.amount) {
        continue;
      }

      if (maxRequirement && cartProps.cart.subtotal > maxRequirement?.amount) {
        continue;
      }

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
  }, [checkoutProps.shippingOptions, cartProps.cart]);

  React.useEffect(() => {
    if (!cartProps.cart) {
      return;
    }

    const cart = cartProps.cart as Cart;
    let radioOptions: RadioProps[] = [];
    for (const session of cart.payment_sessions as PaymentSession[]) {
      let description = '';
      let name = '';
      if (session.provider_id === ProviderType.Manual) {
        if (import.meta.env['MODE'] === 'production') {
          continue;
        }
        name = t('manualProviderName');
        description = t('manualProviderDescription');
      } else if (session.provider_id === ProviderType.Stripe) {
        name = t('creditCardProviderName');
        description = t('creditCardProviderDescription');
      }

      radioOptions.push({
        id: session.provider_id,
        label: name,
        value: name,
        description: description,
      });
    }

    radioOptions = radioOptions.sort((a, b) => (a.label < b.label ? -1 : 1));
    setProviderOptions(radioOptions);

    if (cart.payment_session) {
      setStripeOptions({
        clientSecret: cart.payment_session.data['client_secret'] as
          | string
          | undefined,
      });
    }
  }, [cartProps.cart]);

  React.useEffect(() => {
    let radioOptions: RadioProps[] = [];
    if (!customer) {
      return;
    }

    for (const address of customer?.shipping_addresses) {
      let value = `${address.address_1}`;
      let description = `${address.first_name} ${address.last_name}, ${address.phone}`;
      if (address?.address_2) {
        value += ` ${address.address_2}, `;
      } else {
        value += ', ';
      }

      if (address?.province) {
        value += `${address.province}, `;
      }

      value += address.country_code?.toUpperCase();

      if (address.company) {
        description += `, ${address.company}`;
      }

      radioOptions.push({
        id: address.id,
        label: value,
        value: value,
        description: description,
      });
    }

    setShippingAddressOptions(radioOptions);
  }, [accountProps.customer]);

  React.useEffect(() => {
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

  const onContinueToDeliveryFromShippingAddress = async () => {
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

    const errors = await CheckoutController.getAddressFormErrorsAsync(
      checkoutProps.shippingForm
    );

    if (errors) {
      CheckoutController.updateShippingAddressErrors(errors);
      return;
    }

    CheckoutController.updateShippingFormComplete(true);
    CheckoutController.updateBillingFormComplete(true);
    CheckoutController.continueToDeliveryAsync();
  };

  const onContinueToBillingFromShippingAddress = async () => {
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

    const errors = await CheckoutController.getAddressFormErrorsAsync(
      checkoutProps.shippingForm
    );

    if (errors) {
      CheckoutController.updateShippingAddressErrors(errors);
      return;
    }

    CheckoutController.updateShippingFormComplete(true);
    CheckoutController.continueToBilling();
  };

  const onContinueToDeliveryFromBillingAddress = async () => {
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

    const errors = await CheckoutController.getAddressFormErrorsAsync(
      CheckoutController.model.billingForm
    );

    if (errors) {
      CheckoutController.updateBillingAddressErrors(errors);
      return;
    }

    CheckoutController.updateBillingFormComplete(true);
    CheckoutController.continueToDeliveryAsync();
  };

  const onAddAddressAsync = async () => {
    CheckoutController.updateAddShippingAddressErrors({
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

    const errors = await CheckoutController.getAddressFormErrorsAsync(
      checkoutProps.addShippingForm
    );
    if (errors) {
      CheckoutController.updateAddShippingAddressErrors(errors);
      return;
    }

    await CheckoutController.addShippingAddressAsync();
    setIsAddAddressOpen(false);
  };

  const suspenceComponent = (
    <>
      <CheckoutSuspenseDesktopComponent />
      <CheckoutSuspenseMobileComponent />
    </>
  );

  if (checkoutDebugProps.suspense) {
    return suspenceComponent;
  }

  const stripeElementOptions:
    | StripeCardNumberElementOptions
    | StripeCardExpiryElementOptions
    | StripeCardCvcElementOptions = React.useMemo(() => {
    return {
      classes: {
        base: styles['stripe-input-base'],
      },
      showIcon: true,
    };
  }, []);
  return (
    <>
      <Helmet>
        <title>Cruthology</title>
        <link rel="canonical" href={window.location.href} />
        <meta name="title" content={'Cruthology'} />
        <meta
          name="description"
          content={
            'An exclusive wine club offering high-end dinners, entertainment, and enchanting wine tastings, providing a gateway to extraordinary cultural experiences.'
          }
        />
        <meta
          property="og:image"
          content={'https://cruthology.com/assets/opengraph/opengraph.jpg'}
        />
        <meta property="og:title" content={'Home | fuoco.appdev'} />
        <meta
          property="og:description"
          content={
            'An exclusive wine club offering high-end dinners, entertainment, and enchanting wine tastings, providing a gateway to extraordinary cultural experiences.'
          }
        />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={window.location.href} />
      </Helmet>
      <React.Suspense fallback={suspenceComponent}>
        <CheckoutDesktopComponent
          checkoutProps={checkoutProps}
          accountProps={accountProps}
          storeProps={storeProps}
          cartProps={cartProps}
          windowProps={windowProps}
          shippingOptions={shippingOptions}
          providerOptions={providerOptions}
          shippingAddressOptions={shippingAddressOptions}
          isAddAddressOpen={isAddAddressOpen}
          isPayOpen={isPayOpen}
          stripeOptions={stripeOptions}
          stripeElementOptions={stripeElementOptions}
          setIsAddAddressOpen={setIsAddAddressOpen}
          setIsPayOpen={setIsPayOpen}
          onContinueToDeliveryFromShippingAddress={
            onContinueToDeliveryFromShippingAddress
          }
          onContinueToBillingFromShippingAddress={
            onContinueToBillingFromShippingAddress
          }
          onContinueToDeliveryFromBillingAddress={
            onContinueToDeliveryFromBillingAddress
          }
          onAddAddressAsync={onAddAddressAsync}
        />
        <CheckoutMobileComponent
          checkoutProps={checkoutProps}
          accountProps={accountProps}
          storeProps={storeProps}
          cartProps={cartProps}
          windowProps={windowProps}
          shippingOptions={shippingOptions}
          providerOptions={providerOptions}
          shippingAddressOptions={shippingAddressOptions}
          isAddAddressOpen={isAddAddressOpen}
          isPayOpen={isPayOpen}
          stripeOptions={stripeOptions}
          stripeElementOptions={stripeElementOptions}
          setIsAddAddressOpen={setIsAddAddressOpen}
          setIsPayOpen={setIsPayOpen}
          onContinueToDeliveryFromShippingAddress={
            onContinueToDeliveryFromShippingAddress
          }
          onContinueToBillingFromShippingAddress={
            onContinueToBillingFromShippingAddress
          }
          onContinueToDeliveryFromBillingAddress={
            onContinueToDeliveryFromBillingAddress
          }
          onAddAddressAsync={onAddAddressAsync}
        />
      </React.Suspense>
    </>
  );
}
