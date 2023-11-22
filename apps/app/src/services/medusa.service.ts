import Medusa from '@medusajs/medusa-js';
import { Customer, Order, CustomerGroup, PriceList } from '@medusajs/medusa';
import ConfigService from './config.service';
import axios, { AxiosError } from 'axios';
import { Service } from '../service';
import SupabaseService from './supabase.service';
import * as core from '../protobuf/core_pb';
import { PricedProduct } from '@medusajs/medusa/dist/types/pricing';
import { BehaviorSubject, Observable } from 'rxjs';
import Cookies from 'js-cookie';

class MedusaService extends Service {
  private _medusa: Medusa | undefined;
  private _accessToken: string | undefined;
  private _accessTokenBehaviorSubject: BehaviorSubject<string | undefined>;

  constructor() {
    super();

    this._accessTokenBehaviorSubject = new BehaviorSubject<string | undefined>(
      undefined
    );
    this._accessToken = undefined;
  }

  public get medusa(): Medusa | undefined {
    return this._medusa;
  }

  public get accessToken(): string | undefined {
    return this._accessTokenBehaviorSubject.getValue();
  }

  public get accessTokenObservable(): Observable<string | undefined> {
    return this._accessTokenBehaviorSubject.asObservable();
  }

  public intializeMedusa(publicKey: string): void {
    this._medusa = new Medusa({
      baseUrl: ConfigService.medusa.url,
      apiKey: publicKey,
      maxRetries: 3,
    });
  }

  public async requestProductAsync(
    productId: string
  ): Promise<PricedProduct | undefined> {
    const response = await axios({
      method: 'post',
      url: `${this.endpointUrl}/medusa/products/${productId}`,
      headers: {
        ...this.headers,
      },
      data: '',
      responseType: 'arraybuffer',
    });
    const arrayBuffer = new Uint8Array(response.data);
    this.assertResponse(arrayBuffer);

    const productResponse = core.ProductResponse.fromBinary(arrayBuffer);
    return JSON.parse(productResponse.data) as PricedProduct | undefined;
  }

  public async requestProductCountAsync(type: string): Promise<number> {
    const productCountRequest = new core.ProductCountRequest({ type: type });
    const response = await axios({
      method: 'post',
      url: `${this.endpointUrl}/medusa/products/count`,
      headers: {
        ...this.headers,
      },
      data: productCountRequest.toBinary(),
      responseType: 'arraybuffer',
    });
    const arrayBuffer = new Uint8Array(response.data);
    this.assertResponse(arrayBuffer);

    const productCountResponse =
      core.ProductCountResponse.fromBinary(arrayBuffer);
    return productCountResponse.count;
  }

  public async requestCustomerAccountAsync(
    supabaseId: string
  ): Promise<Customer | undefined> {
    const session = await SupabaseService.requestSessionAsync();
    const response = await axios({
      method: 'post',
      url: `${this.endpointUrl}/medusa/customer/${supabaseId}`,
      headers: {
        ...this.headers,
        'Session-Token': `${session?.access_token}`,
      },
      data: '',
      responseType: 'arraybuffer',
    });
    const arrayBuffer = new Uint8Array(response.data);
    this.assertResponse(arrayBuffer);

    const customerResponse = core.CustomerResponse.fromBinary(arrayBuffer);
    if (customerResponse.data.length <= 0) {
      return undefined;
    }

    const customerData = JSON.parse(customerResponse.data);
    if (customerData.has_account) {
      try {
        if (customerResponse.password.length > 0 && session?.user.email) {
          const authResponse = await this.medusa?.auth.getToken({
            email: session?.user.email,
            password: customerResponse.password,
          });
          this._accessToken = authResponse?.access_token;
          this._accessTokenBehaviorSubject.next(this._accessToken);
        }
      } catch (error: any) {
        console.error(error);
        return undefined;
      }

      return customerData;
    }

    return undefined;
  }

  public async requestUpdateCustomerAccountAsync(props: {
    email?: string;
    first_name?: string;
    last_name?: string;
    phone?: string;
    metadata?: string;
  }): Promise<Customer | undefined> {
    const session = await SupabaseService.requestSessionAsync();
    const customerRequest = new core.CustomerRequest({
      email: props.email,
      firstName: props.first_name,
      lastName: props.last_name,
      phone: props.phone,
      metadata: props.metadata,
    });
    const response = await axios({
      method: 'post',
      url: `${this.endpointUrl}/medusa/customer/update-account`,
      headers: {
        ...this.headers,
        'Session-Token': `${session?.access_token}`,
      },
      data: customerRequest.toBinary(),
      responseType: 'arraybuffer',
    });
    const arrayBuffer = new Uint8Array(response.data);
    this.assertResponse(arrayBuffer);

    const customerResponse = core.CustomerResponse.fromBinary(arrayBuffer);
    if (customerResponse.data.length <= 0) {
      return undefined;
    }

    try {
      if (customerResponse.password.length > 0 && props.email) {
        const authResponse = await this.medusa?.auth.getToken({
          email: props.email,
          password: customerResponse.password,
        });
        this._accessToken = authResponse?.access_token;
        this._accessTokenBehaviorSubject.next(this._accessToken);
      }
    } catch (error: any) {
      console.error(error);
      return undefined;
    }

    return JSON.parse(customerResponse.data);
  }

  public async requestCustomerGroupAsync(
    salesLocationId: string
  ): Promise<CustomerGroup | undefined> {
    const session = await SupabaseService.requestSessionAsync();
    const response = await axios({
      method: 'post',
      url: `${this.endpointUrl}/medusa/customer-group/${salesLocationId}`,
      headers: {
        ...this.headers,
        'Session-Token': `${session?.access_token}`,
      },
      data: '',
      responseType: 'arraybuffer',
    });
    const arrayBuffer = new Uint8Array(response.data);
    this.assertResponse(arrayBuffer);

    const customerGroupResponse =
      core.CustomerGroupResponse.fromBinary(arrayBuffer);
    if (customerGroupResponse.data.length <= 0) {
      return undefined;
    }

    const customerGroupData = JSON.parse(customerGroupResponse.data);
    return customerGroupData;
  }

  public async requestAddCustomerToGroupAsync(props: {
    customerGroupId: string;
    customerId: string;
  }): Promise<CustomerGroup | undefined> {
    const session = await SupabaseService.requestSessionAsync();
    const addCustomerToGroupRequest = new core.AddCustomerToGroupRequest({
      customerGroupId: props.customerGroupId,
      customerId: props.customerId,
    });
    const response = await axios({
      method: 'post',
      url: `${this.endpointUrl}/medusa/customer-group/add-customer`,
      headers: {
        ...this.headers,
        'Session-Token': `${session?.access_token}`,
      },
      data: addCustomerToGroupRequest.toBinary(),
      responseType: 'arraybuffer',
    });
    const arrayBuffer = new Uint8Array(response.data);
    this.assertResponse(arrayBuffer);

    const customerGroupResponse =
      core.CustomerGroupResponse.fromBinary(arrayBuffer);
    if (customerGroupResponse.data.length <= 0) {
      return undefined;
    }

    const customerGroupData = JSON.parse(customerGroupResponse.data);
    return customerGroupData;
  }

  public async requestRemoveCustomerFromGroupAsync(props: {
    customerGroupId: string;
    customerId: string;
  }): Promise<CustomerGroup | undefined> {
    const session = await SupabaseService.requestSessionAsync();
    const removeCustomerFromGroupRequest =
      new core.RemoveCustomerFromGroupRequest({
        customerGroupId: props.customerGroupId,
        customerId: props.customerId,
      });
    const response = await axios({
      method: 'post',
      url: `${this.endpointUrl}/medusa/customer-group/remove-customer`,
      headers: {
        ...this.headers,
        'Session-Token': `${session?.access_token}`,
      },
      data: removeCustomerFromGroupRequest.toBinary(),
      responseType: 'arraybuffer',
    });
    const arrayBuffer = new Uint8Array(response.data);
    this.assertResponse(arrayBuffer);

    const customerGroupResponse =
      core.CustomerGroupResponse.fromBinary(arrayBuffer);
    if (customerGroupResponse.data.length <= 0) {
      return undefined;
    }

    const customerGroupData = JSON.parse(customerGroupResponse.data);
    return customerGroupData;
  }

  public async requestGetPriceListsAsync(props: {
    customerGroups: string[];
    offset?: number;
    limit?: number;
    status?: string[];
    type?: string[];
  }): Promise<PriceList[]> {
    const session = await SupabaseService.requestSessionAsync();
    const priceListsRequest = new core.PriceListsRequest({
      offset: props.offset,
      limit: props.limit,
      status: props.status,
      customerGroups: props.customerGroups,
      type: props.type,
    });
    const response = await axios({
      method: 'post',
      url: `${this.endpointUrl}/medusa/price-lists`,
      headers: {
        ...this.headers,
        'Session-Token': `${session?.access_token}`,
      },
      data: priceListsRequest.toBinary(),
      responseType: 'arraybuffer',
    });
    const arrayBuffer = new Uint8Array(response.data);
    this.assertResponse(arrayBuffer);

    const priceListsResponse = core.PriceListsResponse.fromBinary(arrayBuffer);
    const priceListsData =
      priceListsResponse.data.length > 0
        ? JSON.parse(priceListsResponse.data)
        : {};
    if (Object.keys(priceListsData).length > 0) {
      return priceListsData?.['price_lists'] ?? [];
    }

    return [];
  }

  public async requestStockLocationsAsync(): Promise<any[]> {
    const response = await axios({
      method: 'post',
      url: `${this.endpointUrl}/medusa/stock-locations`,
      headers: {
        ...this.headers,
      },
      data: '',
      responseType: 'arraybuffer',
    });
    const arrayBuffer = new Uint8Array(response.data);
    this.assertResponse(arrayBuffer);

    const stockLocationsResponse =
      core.StockLocationsResponse.fromBinary(arrayBuffer);
    const locations: any[] = [];
    for (const stockLocation of stockLocationsResponse.locations) {
      const json = JSON.parse(stockLocation);
      if (!json) {
        continue;
      }

      locations.push(json);
    }

    return locations;
  }

  public async requestOrdersAsync(
    customerId: string,
    props: {
      offset: number;
      limit: number;
    }
  ): Promise<Order[] | undefined> {
    const session = await SupabaseService.requestSessionAsync();
    const ordersRequest = new core.OrdersRequest({
      offset: props.offset,
      limit: props.limit,
    });
    const response = await axios({
      method: 'post',
      url: `${this.endpointUrl}/medusa/orders/${customerId}`,
      headers: {
        ...this.headers,
        'Session-Token': `${session?.access_token}`,
      },
      data: ordersRequest.toBinary(),
      responseType: 'arraybuffer',
    });
    const arrayBuffer = new Uint8Array(response.data);
    this.assertResponse(arrayBuffer);

    const ordersResponse = core.OrdersResponse.fromBinary(arrayBuffer);
    return ordersResponse.data && JSON.parse(ordersResponse.data);
  }

  public async deleteSessionAsync(): Promise<void> {
    try {
      await this._medusa?.auth.deleteSession();
      this._accessTokenBehaviorSubject.next(undefined);
      window.location.reload();
    } catch (error: any) {
      console.error(error);
    }
  }
}

export default new MedusaService();
