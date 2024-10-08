/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-empty-function */
import { Customer } from '@medusajs/medusa';
import { PricedProduct } from '@medusajs/medusa/dist/types/pricing';
import { select } from '@ngneat/elf';
import { filter, firstValueFrom, Subscription, take } from 'rxjs';
import { Controller } from '../controller';
import { AccountPublicModel } from '../models/account-public.model';
import { AccountDocument } from '../models/account.model';
import { AccountResponse } from '../protobuf/account_pb';
import { StorageFolderType } from '../protobuf/common_pb';
import { ProductLikesMetadataResponse } from '../protobuf/product-like_pb';
import { RoutePathsType } from '../route-paths-type';
import AccountFollowersService from '../services/account-followers.service';
import AccountService from '../services/account.service';
import BucketService from '../services/bucket.service';
import MedusaService from '../services/medusa.service';
import ProductLikesService from '../services/product-likes.service';
import AccountController from './account.controller';

class AccountPublicController extends Controller {
  private readonly _model: AccountPublicModel;
  private readonly _limit: number;
  private _usernameTimerId: NodeJS.Timeout | number | undefined;
  private _followersTimerId: NodeJS.Timeout | number | undefined;
  private _followingTimerId: NodeJS.Timeout | number | undefined;
  private _cartSubscription: Subscription | undefined;
  private _medusaAccessTokenSubscription: Subscription | undefined;
  private _publicAccountIdSubscription: Subscription | undefined;
  private _publicAccountSubscription: Subscription | undefined;
  private _accountSubscription: Subscription | undefined;
  private _loadedAccountSubscription: Subscription | undefined;

  constructor() {
    super();

    this._model = new AccountPublicModel();
    this._limit = 10;
  }

  public get model(): AccountPublicModel {
    return this._model;
  }

  public override initialize(renderCount: number): void {
    this._medusaAccessTokenSubscription =
      MedusaService.accessTokenObservable.subscribe({
        next: (value: string | undefined) => {
          if (!value) {
            this.resetMedusaModel();
            this.initializeAsync(renderCount);
          }
        },
      });
  }

  public override load(_renderCount: number): void {}

  public override disposeInitialization(_renderCount: number): void {
    clearTimeout(this._followingTimerId as number | undefined);
    clearTimeout(this._followersTimerId as number | undefined);
    clearTimeout(this._usernameTimerId as number | undefined);
    this._publicAccountIdSubscription?.unsubscribe();
    this._loadedAccountSubscription?.unsubscribe();
    this._accountSubscription?.unsubscribe();
    this._publicAccountSubscription?.unsubscribe();
    this._medusaAccessTokenSubscription?.unsubscribe();
    this._cartSubscription?.unsubscribe();
  }

  public override disposeLoad(_renderCount: number): void {}

  public async loadLikedProductsAsync(id: string): Promise<void> {
    const account = await firstValueFrom(
      AccountController.model.store.pipe(
        select((model) => model.account),
        filter((value) => value !== undefined),
        take(1)
      )
    );
    this._model.likedProducts = [];
    this._model.likesScrollPosition = 0;
    this._model.likedProductPagination = 1;
    this._model.productLikesMetadata = {};

    await this.requestLikedProductsAsync(id, account?.id, 0, this._limit);
  }

  public async loadFollowersAsync(): Promise<void> {
    this._model.followerAccounts = [];
    this._model.followerScrollPosition = 0;
    this._model.followersPagination = 1;
    this._model.followerAccountFollowers = {};

    const publicAccount = await firstValueFrom(
      this._model.store.pipe(
        select((model) => model.account),
        filter((value) => value !== undefined),
        take(1)
      )
    );

    if (!publicAccount) {
      return;
    }

    await this.followersSearchAsync(
      this._model.followersFollowingInput,
      0,
      this._limit
    );
  }

  public async loadFollowingAsync(): Promise<void> {
    this._model.followingAccounts = [];
    this._model.followingScrollPosition = 0;
    this._model.followingPagination = 1;
    this._model.followingAccountFollowers = {};
    this._model.followingCustomers = {};

    const publicAccount = await firstValueFrom(
      this._model.store.pipe(
        select((model) => model.account),
        filter((value) => value !== undefined),
        take(1)
      )
    );

    if (!publicAccount) {
      return;
    }

    await this.followingSearchAsync(
      this._model.followersFollowingInput,
      0,
      this._limit
    );
  }

  public updateAccountId(id: string | undefined): void {
    this._model.accountId = id;
  }

  public updateFollowersInput(value: string): void {
    this._model.followersFollowingInput = value;
    this._model.followersPagination = 1;
    this._model.followerAccounts = [];
    this._model.hasMoreFollowers = true;

    clearTimeout(this._followersTimerId as number | undefined);
    this._followersTimerId = setTimeout(() => {
      this.followersSearchAsync(value, 0, this._limit);
    }, 750);
  }

  public updateFollowingInput(value: string): void {
    this._model.followersFollowingInput = value;
    this._model.followingPagination = 1;
    this._model.followingAccounts = [];
    this._model.hasMoreFollowing = true;

    clearTimeout(this._followingTimerId as number | undefined);
    this._followingTimerId = setTimeout(() => {
      this.followingSearchAsync(value, 0, this._limit);
    }, 750);
  }

  public async onNextLikedProductScrollAsync(): Promise<void> {
    if (this._model.areLikedProductsLoading || !this._model.accountId) {
      return;
    }

    this._model.likedProductPagination = this._model.likedProductPagination + 1;
    const offset = this._limit * (this._model.likedProductPagination - 1);
    await this.requestLikedProductsAsync(
      this._model.accountId,
      AccountController.model.account?.id,
      offset,
      this._limit
    );
  }

  public async onFollowersScrollAsync(): Promise<void> {
    if (this._model.areFollowersLoading) {
      return;
    }

    this._model.followersPagination = this._model.followersPagination + 1;
    const offset = this._limit * (this._model.followersPagination - 1);
    await this.followersSearchAsync(
      this._model.followersFollowingInput,
      offset,
      this._limit
    );
  }

  public async onFollowingScrollAsync(): Promise<void> {
    if (this._model.areFollowingLoading) {
      return;
    }

    this._model.followingPagination = this._model.followingPagination + 1;
    const offset = this._limit * (this._model.followingPagination - 1);
    await this.followingSearchAsync(
      this._model.followersFollowingInput,
      offset,
      this._limit
    );
  }

  public updateActiveTabId(value: string): void {
    this._model.prevTabIndex = this._model.activeTabIndex;

    switch (value) {
      case RoutePathsType.AccountWithIdLikes:
        this._model.activeTabIndex = 1;
        this._model.activeTabId = value;
        break;
      default:
        break;
    }
  }

  public updateActiveStatusTabId(value: string): void {
    this._model.prevStatusTabIndex = this._model.activeStatusTabIndex;

    switch (value) {
      case RoutePathsType.AccountStatusWithIdFollowers:
        this._model.activeStatusTabIndex = 1;
        this._model.activeStatusTabId = value;
        break;
      case RoutePathsType.AccountStatusWithIdFollowing:
        this._model.activeStatusTabIndex = 1;
        this._model.activeStatusTabId = value;
        break;
      default:
        break;
    }
  }

  public updateLikesScrollPosition(value: number | undefined) {
    this._model.likesScrollPosition = value;
  }

  public updateFollowerScrollPosition(value: number | undefined) {
    this._model.followerScrollPosition = value;
  }

  public updateFollowingScrollPosition(value: number | undefined) {
    this._model.followingScrollPosition = value;
  }

  public updateSelectedLikedProduct(value: PricedProduct | undefined): void {
    this._model.selectedLikedProduct = value;
  }

  public updateSelectedProductLikes(
    value: ProductLikesMetadataResponse | undefined
  ): void {
    this._model.selectedProductLikes = value;
  }

  public updateProductLikesMetadata(
    id: string,
    metadata: ProductLikesMetadataResponse
  ): void {
    if (!this._model.accountId) {
      return;
    }

    const productLikesMetadata = { ...this._model.productLikesMetadata };
    productLikesMetadata[id] = metadata;

    if (!metadata.didAccountLike) {
      delete productLikesMetadata[id];
    }

    this._model.productLikesMetadata = productLikesMetadata;
    this.requestLikedProductsAsync(
      this._model.accountId,
      AccountController.model.account?.id,
      0,
      this._limit
    );
  }

  public async followersSearchAsync(
    query: string,
    offset = 0,
    limit = 10,
    force = false
  ): Promise<void> {
    if (!force && this._model.areFollowersLoading) {
      return;
    }

    this._model.areFollowersLoading = true;

    const account = await firstValueFrom(
      this._model.store.pipe(
        select((model) => model.account),
        filter((value) => value !== undefined),
        take(1)
      )
    );
    let followerAccounts: AccountDocument[] = [];
    try {
      const accountsResponse = await AccountService.requestFollowersSearchAsync(
        {
          queryUsername: query,
          accountId: account?.id ?? '',
          offset: offset,
          limit: limit,
        }
      );

      if (!accountsResponse.accounts || accountsResponse.accounts.length <= 0) {
        this._model.hasMoreFollowers = false;
        this._model.areFollowersLoading = false;
        return;
      }

      if (accountsResponse.accounts.length < limit) {
        this._model.hasMoreFollowers = false;
      } else {
        this._model.hasMoreFollowers = true;
      }

      const documents = accountsResponse.accounts.map(
        (protobuf) =>
          ({
            id: protobuf.id,
            customer_id: protobuf.customerId,
            supabase_id: protobuf.supabaseId,
            profile_url: protobuf.profileUrl,
            status: protobuf.status,
            updated_at: protobuf.updateAt,
            language_code: protobuf.languageCode,
            username: protobuf.username,
            birthday: protobuf.birthday,
            sex: protobuf.sex,
            interests: protobuf.interests,
            metadata: protobuf.metadata,
          } as AccountDocument)
      );
      if (offset > 0) {
        followerAccounts = this._model.followerAccounts.concat(documents);
      } else {
        followerAccounts = documents;
      }
    } catch (error: any) {
      console.error(error);
    }

    try {
      const otherAccountIds = followerAccounts.map((value) => value.id ?? '');
      const followerResponse =
        await AccountFollowersService.requestFollowersAsync({
          accountId: account?.id ?? '',
          otherAccountIds: otherAccountIds,
        });

      const followerAccountFollowers = {
        ...this._model.followerAccountFollowers,
      };
      for (const follower of followerResponse?.followers ?? []) {
        followerAccountFollowers[follower.followerId] = follower;
      }

      this._model.followerAccountFollowers = followerAccountFollowers;
    } catch (error: any) {
      console.error(error);
    }

    try {
      const customerIds: string[] = followerAccounts.map(
        (value) => value.customer_id ?? ''
      );
      const customersResponse = await MedusaService.requestCustomersAsync({
        customerIds: customerIds,
      });
      for (let i = 0; i < followerAccounts.length; i++) {
        const customerId = followerAccounts[i].customer_id;
        const customer = customersResponse?.find(
          (value) => value.id === customerId
        );
        followerAccounts[i].customer = {
          email: customer?.email,
          first_name: customer?.firstName,
          last_name: customer?.lastName,
          billing_address_id: customer?.billingAddressId,
          phone: customer?.phone,
          has_account: customer?.hasAccount,
          metadata: customer?.metadata,
        } as Partial<Customer>;
      }
    } catch (error: any) {
      console.error(error);
    }

    this._model.followerAccounts = followerAccounts;
    this._model.areFollowersLoading = false;
  }

  public async followingSearchAsync(
    query: string,
    offset = 0,
    limit = 10,
    force = false
  ): Promise<void> {
    if (!force && this._model.areFollowingLoading) {
      return;
    }

    this._model.areFollowingLoading = true;

    const account = await firstValueFrom(
      this._model.store.pipe(
        select((model) => model.account),
        filter((value) => value !== undefined),
        take(1)
      )
    );
    let followingAccounts: AccountDocument[] = [];
    try {
      const accountsResponse = await AccountService.requestFollowingSearchAsync(
        {
          queryUsername: query,
          accountId: account?.id ?? '',
          offset: offset,
          limit: limit,
        }
      );

      if (!accountsResponse.accounts || accountsResponse.accounts.length <= 0) {
        this._model.hasMoreFollowing = false;
        this._model.areFollowingLoading = false;
        return;
      }

      if (accountsResponse.accounts.length < limit) {
        this._model.hasMoreFollowing = false;
      } else {
        this._model.hasMoreFollowing = true;
      }

      const documents = accountsResponse.accounts.map(
        (protobuf) =>
          ({
            id: protobuf.id,
            customer_id: protobuf.customerId,
            supabase_id: protobuf.supabaseId,
            profile_url: protobuf.profileUrl,
            status: protobuf.status,
            updated_at: protobuf.updateAt,
            language_code: protobuf.languageCode,
            username: protobuf.username,
            birthday: protobuf.birthday,
            sex: protobuf.sex,
            interests: protobuf.interests,
            metadata: protobuf.metadata,
          } as AccountDocument)
      );
      if (offset > 0) {
        followingAccounts = this._model.followingAccounts.concat(documents);
      } else {
        followingAccounts = documents;
      }
    } catch (error: any) {
      console.error(error);
    }

    try {
      const otherAccountIds = followingAccounts.map((value) => value.id ?? '');
      const followerResponse =
        await AccountFollowersService.requestFollowersAsync({
          accountId: account?.id ?? '',
          otherAccountIds: otherAccountIds,
        });

      const followingAccountFollowers = {
        ...this._model.followingAccountFollowers,
      };
      for (const follower of followerResponse?.followers ?? []) {
        followingAccountFollowers[follower.followerId] = follower;
        this._model.followingAccountFollowers = followingAccountFollowers;
      }
    } catch (error: any) {
      console.error(error);
    }

    try {
      const customerIds: string[] = followingAccounts.map(
        (value) => value.customer_id ?? ''
      );
      const customersResponse = await MedusaService.requestCustomersAsync({
        customerIds: customerIds,
      });
      for (let i = 0; i < followingAccounts.length; i++) {
        const customerId = followingAccounts[i].customer_id;
        const customer = customersResponse?.find(
          (value) => value.id === customerId
        );
        followingAccounts[i].customer = {
          email: customer?.email,
          first_name: customer?.firstName,
          last_name: customer?.lastName,
          billing_address_id: customer?.billingAddressId,
          phone: customer?.phone,
          has_account: customer?.hasAccount,
          metadata: customer?.metadata,
        } as Partial<Customer>;
      }
    } catch (error: any) {
      console.error(error);
    }

    this._model.followingAccounts = followingAccounts;
    this._model.areFollowingLoading = false;
  }

  public resetMedusaModel(): void {
    this._model.account = undefined;
    this._model.customerMetadata = undefined;
    this._model.accountFollower = undefined;
    this._model.showFollowButton = undefined;
    this._model.profileUrl = undefined;
    this._model.username = '';
    this._model.activeTabId = RoutePathsType.AccountLikes;
    this._model.prevTabIndex = 0;
    this._model.activeTabIndex = 0;
    this._model.likedProducts = [];
    this._model.likesScrollPosition = 0;
    this._model.likedProductPagination = 1;
    this._model.productLikesMetadata = {};
    this._model.followersFollowingInput = '';
    this._model.followerAccounts = [];
    this._model.followerScrollPosition = 0;
    this._model.followersPagination = 1;
    this._model.followerAccountFollowers = {};
    this._model.followingAccounts = [];
    this._model.followingScrollPosition = 0;
    this._model.followingPagination = 1;
    this._model.followingAccountFollowers = {};
    this._model.followingCustomers = {};
    this._model.likeCount = undefined;
    this._model.followerCount = undefined;
    this._model.followingCount = undefined;
  }

  private async requestLikedProductsAsync(
    publicAccountId: string,
    accountId: string | undefined,
    offset = 0,
    limit = 10,
    force = false
  ): Promise<void> {
    if (!publicAccountId) {
      return;
    }

    if (!force && this._model.areLikedProductsLoading) {
      return;
    }

    this._model.areLikedProductsLoading = true;

    let productIds: string[] = [];
    try {
      const publicAccountProductLikesMetadataResponse =
        await ProductLikesService.requestAccountLikesMetadataAsync({
          accountId: publicAccountId,
          offset: offset,
          limit: limit,
        });

      if (
        !publicAccountProductLikesMetadataResponse.metadata ||
        publicAccountProductLikesMetadataResponse.metadata.length <= 0
      ) {
        this._model.hasMoreLikes = false;
        this._model.areLikedProductsLoading = false;
        return;
      }

      if (publicAccountProductLikesMetadataResponse.metadata.length < limit) {
        this._model.hasMoreLikes = false;
      } else {
        this._model.hasMoreLikes = true;
      }

      const productLikesMetadata = { ...this._model.productLikesMetadata };
      for (const metadata of publicAccountProductLikesMetadataResponse.metadata) {
        productLikesMetadata[metadata.productId] = metadata;
      }

      productIds = publicAccountProductLikesMetadataResponse.metadata.map(
        (value) => value.productId
      );

      if (accountId) {
        const accountProductLikesMetadataResponse =
          await ProductLikesService.requestMetadataAsync({
            accountId: accountId,
            productIds: productIds,
          });
        const accountProductLikesMetadata =
          accountProductLikesMetadataResponse.metadata;
        for (const key in productLikesMetadata) {
          const index = accountProductLikesMetadata.findIndex(
            (value) => value.productId === key
          );
          productLikesMetadata[key].didAccountLike =
            accountProductLikesMetadata[index].didAccountLike;
        }
      }

      this._model.productLikesMetadata = productLikesMetadata;
    } catch (error: any) {
      console.error(error);
      this._model.areLikedProductsLoading = false;
      this._model.hasMoreLikes = false;
    }

    if (productIds.length <= 0) {
      this._model.areLikedProductsLoading = false;
      this._model.hasMoreLikes = false;
      this._model.productLikesMetadata = {};
      this._model.likedProducts = [];
      return;
    }

    try {
      const products = await MedusaService.requestProductsAsync(productIds);
      if (offset > 0) {
        this._model.likedProducts = this._model.likedProducts.concat(products);
      } else {
        this._model.likedProducts = products;
      }
    } catch (error: any) {
      console.error(error);
      this._model.areLikedProductsLoading = false;
      this._model.hasMoreLikes = false;
    }

    this._model.areLikedProductsLoading = false;
  }

  private async initializeAsync(_renderCount: number): Promise<void> {
    this._publicAccountIdSubscription?.unsubscribe();
    this._publicAccountIdSubscription = this._model.store
      .pipe(select((model) => model.accountId))
      .subscribe({
        next: async (id: string | undefined) => {
          if (!id) {
            return;
          }

          this.resetMedusaModel();

          try {
            const accountsResponse = await AccountService.requestAccountsAsync([
              id,
            ]);
            if (accountsResponse.accounts.length > 0) {
              this._model.account = accountsResponse.accounts[0];
            }
          } catch (error: any) {
            console.error(error);
          }

          if (!this._model.account) {
            return;
          }

          this.initializeAccountSubscription(this._model.account);

          try {
            this._model.customerMetadata =
              await MedusaService.requestCustomerMetadataAsync(
                this._model.account?.customerId ?? ''
              );
          } catch (error: any) {
            console.error(error);
          }

          try {
            await this.initializeS3BucketAsync(this._model.account);
          } catch (error: any) {
            console.error(error);
          }

          try {
            await this.requestFollowerCountMetadataAsync(id);
          } catch (error: any) {
            console.error(error);
          }

          try {
            await this.requestLikeCountAsync(id);
          } catch (error: any) {
            console.error(error);
          }
        },
      });
  }

  private initializeAccountSubscription(publicAccount: AccountResponse): void {
    this._accountSubscription?.unsubscribe();
    this._accountSubscription = AccountController.model.store
      .pipe(select((model) => model.account))
      .subscribe({
        next: async (account: AccountResponse | undefined) => {
          if (!account) {
            return;
          }

          try {
            const accountFollowerResponse =
              await AccountFollowersService.requestFollowersAsync({
                accountId: account?.id ?? '',
                otherAccountIds: [publicAccount.id],
              });
            if (
              AccountController.model.account?.id !== publicAccount.id &&
              accountFollowerResponse?.followers
            ) {
              this._model.accountFollower =
                accountFollowerResponse?.followers.length > 0
                  ? accountFollowerResponse?.followers[0]
                  : undefined;
              this._model.showFollowButton = true;
            } else {
              this._model.showFollowButton = false;
            }
          } catch (error: any) {
            console.error(error);
          }
        },
      });
  }

  public async initializeS3BucketAsync(
    publicAccount: AccountResponse | null
  ): Promise<void> {
    const s3 = await firstValueFrom(
      BucketService.s3Observable.pipe(
        filter((value) => value !== undefined),
        take(1)
      )
    );
    if (!s3) {
      return;
    }

    if (publicAccount?.profileUrl && publicAccount.profileUrl.length > 0) {
      try {
        this._model.profileUrl = await BucketService.getPublicUrlAsync(
          StorageFolderType.Avatars,
          publicAccount.profileUrl
        );
      } catch (error: any) {
        console.error(error);
      }
    }
  }

  private async requestLikeCountAsync(accountId: string): Promise<void> {
    try {
      const response = await ProductLikesService.requestCountMetadataAsync(
        accountId
      );
      this._model.likeCount = response.likeCount;
    } catch (error: any) {
      console.error(error);
    }
  }

  private async requestFollowerCountMetadataAsync(
    accountId: string
  ): Promise<void> {
    try {
      const response = await AccountFollowersService.requestCountMetadataAsync(
        accountId
      );
      this._model.followerCount = response.followersCount;
      this._model.followingCount = response.followingCount;
    } catch (error: any) {
      console.error(error);
    }
  }
}

export default new AccountPublicController();
