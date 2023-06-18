import { createStore, withProps } from '@ngneat/elf';
import { Model } from '../model';
import {
  AddressFormErrors,
  AddressFormValues,
} from '../components/address-form.component';
import { PricedShippingOption } from '@medusajs/medusa/dist/types/pricing';

export enum ShippingType {
  Standard = 'Standard',
  Express = 'Express',
}

export enum ProviderType {
  Manual = 'manual',
  VisaCheckout = 'visa-checkout',
}

export interface CheckoutState {
  shippingForm: AddressFormValues;
  shippingFormErrors: AddressFormErrors;
  shippingFormComplete: boolean;
  billingForm: AddressFormValues;
  billingFormErrors: AddressFormErrors;
  billingFormComplete: boolean;
  errorStrings: AddressFormErrors;
  sameAsBillingAddress: boolean;
  shippingOptions: PricedShippingOption[];
  selectedShippingOptionId: string | undefined;
  giftCardCode: string;
  discountCode: string;
  selectedProviderId: ProviderType | undefined;
}

export class CheckoutModel extends Model {
  constructor() {
    super(
      createStore(
        { name: 'checkout' },
        withProps<CheckoutState>({
          shippingForm: {
            email: '',
            firstName: '',
            lastName: '',
            company: '',
            address: '',
            apartments: '',
            postalCode: '',
            city: '',
            countryCode: '',
            region: '',
            phoneNumber: '',
          },
          shippingFormErrors: {},
          shippingFormComplete: false,
          billingForm: {
            email: '',
            firstName: '',
            lastName: '',
            company: '',
            address: '',
            apartments: '',
            postalCode: '',
            city: '',
            countryCode: '',
            region: '',
            phoneNumber: '',
          },
          billingFormErrors: {},
          billingFormComplete: true,
          errorStrings: {},
          sameAsBillingAddress: true,
          shippingOptions: [],
          selectedShippingOptionId: undefined,
          giftCardCode: '',
          discountCode: '',
          selectedProviderId: undefined,
        })
      )
    );
  }

  public get shippingForm(): AddressFormValues {
    return this.store.getValue().shippingForm;
  }

  public set shippingForm(value: AddressFormValues) {
    if (JSON.stringify(this.shippingForm) !== JSON.stringify(value)) {
      this.store.update((state) => ({ ...state, shippingForm: value }));
    }
  }

  public get shippingFormErrors(): AddressFormErrors {
    return this.store.getValue().shippingFormErrors;
  }

  public set shippingFormErrors(value: AddressFormErrors) {
    if (JSON.stringify(this.shippingFormErrors) !== JSON.stringify(value)) {
      this.store.update((state) => ({ ...state, shippingFormErrors: value }));
    }
  }

  public get shippingFormComplete(): boolean {
    return this.store.getValue().shippingFormComplete;
  }

  public set shippingFormComplete(value: boolean) {
    if (this.shippingFormComplete !== value) {
      this.store.update((state) => ({ ...state, shippingFormComplete: value }));
    }
  }

  public get billingForm(): AddressFormValues {
    return this.store.getValue().billingForm;
  }

  public set billingForm(value: AddressFormValues) {
    if (JSON.stringify(this.billingForm) !== JSON.stringify(value)) {
      this.store.update((state) => ({ ...state, billingForm: value }));
    }
  }

  public get billingFormErrors(): AddressFormErrors {
    return this.store.getValue().billingFormErrors;
  }

  public set billingFormErrors(value: AddressFormErrors) {
    if (JSON.stringify(this.billingFormErrors) !== JSON.stringify(value)) {
      this.store.update((state) => ({ ...state, billingFormErrors: value }));
    }
  }

  public get billingFormComplete(): boolean {
    return this.store.getValue().billingFormComplete;
  }

  public set billingFormComplete(value: boolean) {
    if (this.billingFormComplete !== value) {
      this.store.update((state) => ({ ...state, billingFormComplete: value }));
    }
  }

  public get errorStrings(): AddressFormErrors {
    return this.store.getValue().errorStrings;
  }

  public set errorStrings(value: AddressFormErrors) {
    if (JSON.stringify(this.errorStrings) !== JSON.stringify(value)) {
      this.store.update((state) => ({ ...state, errorStrings: value }));
    }
  }

  public get sameAsBillingAddress(): boolean {
    return this.store.getValue().sameAsBillingAddress;
  }

  public set sameAsBillingAddress(value: boolean) {
    if (this.sameAsBillingAddress !== value) {
      this.store.update((state) => ({ ...state, sameAsBillingAddress: value }));
    }
  }

  public get shippingOptions(): PricedShippingOption[] {
    return this.store.getValue().shippingOptions;
  }

  public set shippingOptions(value: PricedShippingOption[]) {
    if (JSON.stringify(this.shippingOptions) !== JSON.stringify(value)) {
      this.store.update((state) => ({ ...state, shippingOptions: value }));
    }
  }

  public get selectedShippingOptionId(): string | undefined {
    return this.store.getValue().selectedShippingOptionId;
  }

  public set selectedShippingOptionId(value: string | undefined) {
    if (this.selectedShippingOptionId !== value) {
      this.store.update((state) => ({
        ...state,
        selectedShippingOptionId: value,
      }));
    }
  }

  public get giftCardCode(): string {
    return this.store.getValue().giftCardCode;
  }

  public set giftCardCode(value: string) {
    if (this.giftCardCode !== value) {
      this.store.update((state) => ({
        ...state,
        giftCardCode: value,
      }));
    }
  }

  public get discountCode(): string {
    return this.store.getValue().discountCode;
  }

  public set discountCode(value: string) {
    if (this.discountCode !== value) {
      this.store.update((state) => ({
        ...state,
        discountCode: value,
      }));
    }
  }

  public get selectedProviderId(): ProviderType | undefined {
    return this.store.getValue().selectedProviderId;
  }

  public set selectedProviderId(value: ProviderType | undefined) {
    if (this.selectedProviderId !== value) {
      this.store.update((state) => ({
        ...state,
        selectedProviderId: value,
      }));
    }
  }
}
