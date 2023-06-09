import { Subscription } from 'rxjs';
import {
  AddressFormErrors,
  AddressFormValues,
} from '../components/address-form.component';
import { Controller } from '../controller';
import { CheckoutModel } from '../models/checkout.model';
import MedusaService from '../services/medusa.service';
import CartController from './cart.controller';
import { AddressPayload, Cart } from '@medusajs/medusa';
import { select } from '@ngneat/elf';

class CheckoutController extends Controller {
  private readonly _model: CheckoutModel;
  private _cartSubscription: Subscription | undefined;

  constructor() {
    super();

    this._model = new CheckoutModel();
    this.onCartChanged = this.onCartChanged.bind(this);
  }

  public get model(): CheckoutModel {
    return this._model;
  }

  public initialize(renderCount: number): void {
    this._cartSubscription = CartController.model.store
      .pipe(select((model) => model.cart))
      .subscribe({
        next: this.onCartChanged,
      });
  }

  public dispose(renderCount: number): void {
    this._cartSubscription?.unsubscribe();
  }

  public initializeAsync(renderCount: number): void {}

  public updateShippingAddress(value: AddressFormValues): void {
    this._model.shippingForm = { ...this._model.shippingForm, ...value };
  }

  public updateShippingAddressErrors(value: AddressFormErrors): void {
    this._model.shippingFormErrors = value;
  }

  public updateBillingAddress(value: AddressFormValues): void {
    this._model.billingForm = { ...this._model.billingForm, ...value };
  }

  public updateBillingAddressErrors(value: AddressFormErrors): void {
    this._model.billingFormErrors = value;
  }

  public updateSameAsBillingAddress(value: boolean): void {
    this._model.sameAsBillingAddress = value;
    this._model.billingFormComplete = value;
  }

  public updateShippingFormComplete(value: boolean): void {
    this._model.shippingFormComplete = value;
  }

  public updateBillingFormComplete(value: boolean): void {
    this._model.billingFormComplete = value;
  }

  public async continueToDeliveryAsync(): Promise<void> {
    if (!CartController.model.cartId) {
      return;
    }

    if (this._model.sameAsBillingAddress) {
      this._model.billingForm = this._model.shippingForm;
    }

    const shippingAddressPayload: AddressPayload = {
      first_name: this._model.shippingForm.firstName,
      last_name: this._model.shippingForm.lastName,
      phone: this._model.shippingForm.phoneNumber,
      company: this._model.shippingForm.company,
      address_1: this._model.shippingForm.address,
      address_2: this._model.shippingForm.apartments,
      city: this._model.shippingForm.city,
      country_code: this._model.shippingForm.countryCode,
      province: this._model.shippingForm.region,
      postal_code: this._model.shippingForm.postalCode,
    };

    const billingAddressPayload: AddressPayload = {
      first_name: this._model.billingForm.firstName,
      last_name: this._model.billingForm.lastName,
      phone: this._model.billingForm.phoneNumber,
      company: this._model.billingForm.company,
      address_1: this._model.billingForm.address,
      address_2: this._model.billingForm.apartments,
      city: this._model.billingForm.city,
      country_code: this._model.billingForm.countryCode,
      province: this._model.billingForm.region,
      postal_code: this._model.billingForm.postalCode,
    };

    const cartResponse = await MedusaService.medusa.carts.update(
      CartController.model.cartId,
      {
        email: this._model.shippingForm.email,
        shipping_address: this._model.shippingFormComplete
          ? shippingAddressPayload
          : undefined,
        billing_address: this._model.shippingFormComplete
          ? billingAddressPayload
          : undefined,
      }
    );
    await CartController.updateLocalCartAsync(cartResponse.cart);
  }

  public continueToBilling(): void {
    this._model.shippingFormComplete = true;
  }

  private onCartChanged(value: Cart | undefined): void {
    this._model.shippingForm = {
      email: value?.email,
      firstName: value?.shipping_address?.first_name ?? '',
      lastName: value?.shipping_address?.last_name ?? '',
      company: value?.shipping_address?.company ?? '',
      address: value?.shipping_address?.address_1 ?? '',
      apartments: value?.shipping_address?.address_2 ?? '',
      postalCode: value?.shipping_address?.postal_code ?? '',
      city: value?.shipping_address?.city ?? '',
      countryCode: value?.shipping_address?.country_code ?? '',
      region: value?.shipping_address?.province ?? '',
      phoneNumber: value?.shipping_address?.phone ?? '',
    };
    this._model.billingForm = {
      email: value?.email,
      firstName: value?.billing_address?.first_name ?? '',
      lastName: value?.billing_address?.last_name ?? '',
      company: value?.billing_address?.company ?? '',
      address: value?.billing_address?.address_1 ?? '',
      apartments: value?.billing_address?.address_2 ?? '',
      postalCode: value?.billing_address?.postal_code ?? '',
      city: value?.billing_address?.city ?? '',
      countryCode: value?.billing_address?.country_code ?? '',
      region: value?.billing_address?.province ?? '',
      phoneNumber: value?.billing_address?.phone ?? '',
    };

    if (
      value?.shipping_address &&
      Object.keys(value?.shipping_address).length > 0
    ) {
      this._model.shippingFormComplete = true;
    }

    if (
      value?.billing_address &&
      Object.keys(value?.billing_address).length > 0
    ) {
      this._model.billingFormComplete = true;
    }
  }
}

export default new CheckoutController();
