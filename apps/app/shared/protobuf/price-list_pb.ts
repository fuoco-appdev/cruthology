// @generated by protoc-gen-es v0.3.0 with parameter "target=ts"
// @generated from file protobuf/price-list.proto (package pricelist, syntax proto3)
/* eslint-disable */
// @ts-nocheck

import type { BinaryReadOptions, FieldList, JsonReadOptions, JsonValue, PartialMessage, PlainMessage } from "@bufbuild/protobuf";
import { Message, proto3 } from "@bufbuild/protobuf";

/**
 * @generated from message pricelist.PriceListsRequest
 */
export class PriceListsRequest extends Message<PriceListsRequest> {
  /**
   * @generated from field: int32 offset = 1;
   */
  offset = 0;

  /**
   * @generated from field: int32 limit = 2;
   */
  limit = 0;

  /**
   * @generated from field: repeated string status = 3;
   */
  status: string[] = [];

  /**
   * @generated from field: repeated string customer_groups = 4;
   */
  customerGroups: string[] = [];

  /**
   * @generated from field: repeated string type = 5;
   */
  type: string[] = [];

  constructor(data?: PartialMessage<PriceListsRequest>) {
    super();
    proto3.util.initPartial(data, this);
  }

  static readonly runtime = proto3;
  static readonly typeName = "pricelist.PriceListsRequest";
  static readonly fields: FieldList = proto3.util.newFieldList(() => [
    { no: 1, name: "offset", kind: "scalar", T: 5 /* ScalarType.INT32 */ },
    { no: 2, name: "limit", kind: "scalar", T: 5 /* ScalarType.INT32 */ },
    { no: 3, name: "status", kind: "scalar", T: 9 /* ScalarType.STRING */, repeated: true },
    { no: 4, name: "customer_groups", kind: "scalar", T: 9 /* ScalarType.STRING */, repeated: true },
    { no: 5, name: "type", kind: "scalar", T: 9 /* ScalarType.STRING */, repeated: true },
  ]);

  static fromBinary(bytes: Uint8Array, options?: Partial<BinaryReadOptions>): PriceListsRequest {
    return new PriceListsRequest().fromBinary(bytes, options);
  }

  static fromJson(jsonValue: JsonValue, options?: Partial<JsonReadOptions>): PriceListsRequest {
    return new PriceListsRequest().fromJson(jsonValue, options);
  }

  static fromJsonString(jsonString: string, options?: Partial<JsonReadOptions>): PriceListsRequest {
    return new PriceListsRequest().fromJsonString(jsonString, options);
  }

  static equals(a: PriceListsRequest | PlainMessage<PriceListsRequest> | undefined, b: PriceListsRequest | PlainMessage<PriceListsRequest> | undefined): boolean {
    return proto3.util.equals(PriceListsRequest, a, b);
  }
}

/**
 * @generated from message pricelist.PriceListsResponse
 */
export class PriceListsResponse extends Message<PriceListsResponse> {
  /**
   * @generated from field: string data = 1;
   */
  data = "";

  constructor(data?: PartialMessage<PriceListsResponse>) {
    super();
    proto3.util.initPartial(data, this);
  }

  static readonly runtime = proto3;
  static readonly typeName = "pricelist.PriceListsResponse";
  static readonly fields: FieldList = proto3.util.newFieldList(() => [
    { no: 1, name: "data", kind: "scalar", T: 9 /* ScalarType.STRING */ },
  ]);

  static fromBinary(bytes: Uint8Array, options?: Partial<BinaryReadOptions>): PriceListsResponse {
    return new PriceListsResponse().fromBinary(bytes, options);
  }

  static fromJson(jsonValue: JsonValue, options?: Partial<JsonReadOptions>): PriceListsResponse {
    return new PriceListsResponse().fromJson(jsonValue, options);
  }

  static fromJsonString(jsonString: string, options?: Partial<JsonReadOptions>): PriceListsResponse {
    return new PriceListsResponse().fromJsonString(jsonString, options);
  }

  static equals(a: PriceListsResponse | PlainMessage<PriceListsResponse> | undefined, b: PriceListsResponse | PlainMessage<PriceListsResponse> | undefined): boolean {
    return proto3.util.equals(PriceListsResponse, a, b);
  }
}

