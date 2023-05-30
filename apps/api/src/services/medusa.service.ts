import axiod from 'https://deno.land/x/axiod@0.26.2/mod.ts';
import {
  StockLocations,
  StockLocation,
  Address,
  SalesChannel,
} from '../protobuf/core_pb.js';
import 'https://deno.land/x/dotenv@v3.2.0/load.ts';

class MedusaService {
  private _url: string | undefined;
  private _token: string | undefined;
  constructor() {
    this._url = Deno.env.get('MEDUSA_BACKEND_URL');
    this._token = Deno.env.get('MEDUSA_API_TOKEN');
    if (!this._url) {
      throw new Error("MEDUSA_BACKEND_URL doesn't exist");
    }

    if (!this._token) {
      throw new Error("MEDUSA_API_TOKEN doesn't exist");
    }
  }
  public async getStockLocationsAsync(): Promise<
    InstanceType<typeof StockLocations>
  > {
    const params = new URLSearchParams({
      expand: 'address,sales_channels',
    }).toString();
    const stockLocationsResponse = await axiod.get(
      `${this._url}/admin/stock-locations?${params}`,
      {
        headers: {
          Authorization: `Bearer ${this._token}`,
        },
      }
    );

    const stockLocations = new StockLocations();
    const data = stockLocationsResponse.data['stock_locations'];
    for (const location of data) {
      const stockLocation = new StockLocation();
      stockLocation.setId(location['id']);
      stockLocation.setCreatedAt(location['created_at']);
      stockLocation.setUpdatedAt(location['updated_at']);
      stockLocation.setName(location['name']);
      stockLocation.setAddressId(location['address_id']);

      const address = new Address();
      const addressData = location['address'];
      if (addressData) {
        address.setId(addressData['id']);
        address.setCreatedAt(addressData['created_at']);
        address.setUpdatedAt(addressData['updated_at']);
        address.setDeletedAt(addressData['deleted_at']);
        address.setAddress1(addressData['address_1']);
        address.setAddress2(addressData['address_2']);
        address.setCompany(addressData['company']);
        address.setCity(addressData['city']);
        address.setCountryCode(addressData['country_code']);
        address.setPhone(addressData['phone']);
        address.setProvince(addressData['province']);
        address.setPostalCode(addressData['postal_code']);
      }

      stockLocation.setAddress(address);

      for (const channel of location['sales_channels']) {
        const salesChannel = new SalesChannel();
        const channelId = channel['id'];
        const channelName = channel['name'];
        const channelDescription = channel['description'];
        const channelIsDisabled = channel['is_disabled'];
        const channelCreatedAt = channel['created_at'];
        const channelUpdatedAt = channel['updated_at'];
        const channelDeletedAt = channel['deleted_at'];
        channelId && salesChannel.setId(channelId);
        channelName && salesChannel.setName(channelName);
        channelDescription && salesChannel.setDescription(channelDescription);
        channelIsDisabled && salesChannel.setIsDisabled(channelIsDisabled);
        channelCreatedAt && salesChannel.setCreatedAt(channelCreatedAt);
        channelUpdatedAt && salesChannel.setUpdatedAt(channelUpdatedAt);
        channelDeletedAt && salesChannel.setDeletedAt(channelDeletedAt);
        stockLocation.addSalesChannels(salesChannel);
      }

      stockLocations.addLocations(stockLocation);
    }

    return stockLocations;
  }
}

export default new MedusaService();
