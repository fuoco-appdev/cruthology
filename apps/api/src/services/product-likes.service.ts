import SupabaseService from "./supabase.service.ts";
import {
  AccountProductLikesMetadataRequest,
  ProductLikeCountMetadataResponse,
  ProductLikeRequest,
  ProductLikeResponse,
  ProductLikesMetadataRequest,
  ProductLikesMetadataResponse,
  ProductLikesMetadatasResponse,
  ProductLikesResponse,
} from "../protobuf/product-like_pb.js";

export interface ProductLikesProps {
  product_id?: string;
  account_id?: string;
}

export class ProductLikesService {
  public async getCountMetadataAsync(
    accountId: string,
  ): Promise<InstanceType<typeof ProductLikeCountMetadataResponse> | null> {
    const metadataResponse = await this.findCountMetadataAsync(accountId);
    return metadataResponse;
  }

  public async getMetadataAsync(
    request: InstanceType<typeof ProductLikesMetadataRequest>,
  ): Promise<InstanceType<typeof ProductLikesMetadatasResponse> | null> {
    const accountId = request.getAccountId();
    const productIds = request.getProductIdsList();
    const metadatasResponse = await this.findMetadataAsync(
      accountId,
      productIds,
    );
    return metadatasResponse;
  }

  public async findAccountMetadataAsync(
    accountId: string,
    offset: number,
    limit: number,
  ): Promise<InstanceType<typeof ProductLikesMetadatasResponse> | null> {
    if (accountId.length <= 0) {
      console.error("Account id cannot be empty");
      return null;
    }

    let accountProductIds: string[] = [];
    try {
      const accountProductLikesData = await SupabaseService.client
        .from("product_likes")
        .select("")
        .range(offset, offset + limit)
        .limit(limit)
        .eq("account_id", accountId);

      if (accountProductLikesData.error) {
        console.error(accountProductLikesData.error);
      }

      const data: Record<string, any>[] = accountProductLikesData.data ?? [];
      accountProductIds = data.map((value) => value.product_id);
    } catch (error: any) {
      console.error(error);
      return null;
    }

    const metadatasResponse = await this.findMetadataAsync(
      accountId,
      accountProductIds,
      true,
    );

    return metadatasResponse;
  }

  public async getAccountMetadataAsync(
    request: InstanceType<typeof AccountProductLikesMetadataRequest>,
  ): Promise<InstanceType<typeof ProductLikesMetadatasResponse> | null> {
    const accountId = request.getAccountId();
    const offset = request.getOffset();
    const limit = request.getLimit();
    const metadatasResponse = await this.findAccountMetadataAsync(
      accountId,
      offset,
      limit,
    );
    return metadatasResponse;
  }

  public async upsertAsync(
    request: InstanceType<typeof ProductLikeRequest>,
  ): Promise<InstanceType<typeof ProductLikesMetadatasResponse> | null> {
    const productId = request.getProductId();
    const accountId = request.getAccountId();

    if (!productId || productId.length <= 0) {
      console.error("Product id cannot be undefined");
      return null;
    }

    if (!accountId || accountId.length <= 0) {
      console.error("Account id cannot be undefined");
      return null;
    }

    const props: ProductLikesProps = {
      product_id: productId,
      account_id: accountId,
    };
    const { data, error } = await SupabaseService.client
      .from("product_likes")
      .upsert(props)
      .select();

    if (error) {
      console.error(error);
      return null;
    }

    const productLikeData = data.length > 0 ? data[0] : null;
    if (!productLikeData) {
      return null;
    }

    const metadatasResponse = await this.findMetadataAsync(accountId, [
      productId,
    ]);
    return metadatasResponse;
  }

  public async deleteAsync(
    request: InstanceType<typeof ProductLikeRequest>,
  ): Promise<InstanceType<typeof ProductLikesMetadatasResponse> | null> {
    const productId = request.getProductId();
    const accountId = request.getAccountId();

    if (!productId || productId.length <= 0) {
      console.error("Product id cannot be undefined");
      return null;
    }

    if (!accountId || accountId.length <= 0) {
      console.error("Account id cannot be undefined");
      return null;
    }
    const props: ProductLikesProps = {
      product_id: productId,
      account_id: accountId,
    };

    const { error } = await SupabaseService.client
      .from("product_likes")
      .delete()
      .match(props as Record<string, any>);

    if (error) {
      console.error(error);
      return null;
    }

    const metadatasResponse = await this.findMetadataAsync(accountId, [
      productId,
    ]);
    return metadatasResponse;
  }

  private async findCountMetadataAsync(
    accountId: string,
  ): Promise<InstanceType<typeof ProductLikeCountMetadataResponse> | null> {
    const metadataResponse = new ProductLikeCountMetadataResponse();

    if (accountId.length <= 0) {
      console.error("Account id cannot be empty");
      return null;
    }

    try {
      const likesData = await SupabaseService.client
        .from("product_likes")
        .select("", { count: "exact" })
        .eq("account_id", accountId);

      if (likesData.error) {
        console.error(likesData.error);
      } else {
        metadataResponse.setLikeCount(likesData.count ?? 0);
      }
    } catch (error: any) {
      console.error(error);
    }

    return metadataResponse;
  }

  private async findMetadataAsync(
    accountId: string,
    productIds: string[],
    didAccountLike?: boolean,
  ): Promise<InstanceType<typeof ProductLikesMetadatasResponse> | null> {
    const metadatasResponse = new ProductLikesMetadatasResponse();

    if (productIds.length <= 0) {
      return metadatasResponse;
    }

    for (const id of productIds) {
      const metadataResponse = new ProductLikesMetadataResponse();
      try {
        const totalLikesData = await SupabaseService.client
          .from("product_likes")
          .select("", { count: "exact" })
          .eq("product_id", id);

        if (totalLikesData.error) {
          console.error(totalLikesData.error);
        } else {
          metadataResponse.setTotalLikeCount(totalLikesData.count ?? 0);
        }
      } catch (error: any) {
        console.error(error);
      }

      if (didAccountLike === undefined) {
        if (!accountId || accountId.length <= 0) {
          metadataResponse.setDidAccountLike(false);
        } else {
          try {
            const didAccountLikeData = await SupabaseService.client
              .from("product_likes")
              .select()
              .eq("product_id", id)
              .eq("account_id", accountId);
            if (didAccountLikeData.error) {
              console.error(didAccountLikeData.error);
            } else {
              metadataResponse.setDidAccountLike(
                didAccountLikeData.data.length > 0 ?? false,
              );
            }
          } catch (error: any) {
            console.error(error);
          }
        }
      } else {
        metadataResponse.setDidAccountLike(didAccountLike ?? false);
      }

      metadataResponse.setProductId(id);
      metadatasResponse.addMetadata(metadataResponse);
    }

    return metadatasResponse;
  }
}

export default new ProductLikesService();
