import { Product } from '@medusajs/medusa';
import { PricedVariant } from '@medusajs/medusa/dist/types/pricing';
import { useObservable } from '@ngneat/use-observable';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import AccountPublicController from '../../shared/controllers/account-public.controller';
import AccountController from '../../shared/controllers/account.controller';
import ProductController from '../../shared/controllers/product.controller';
import StoreController from '../../shared/controllers/store.controller';
import WindowController from '../../shared/controllers/window.controller';
import { AccountPublicState } from '../../shared/models/account-public.model';
import { AccountState } from '../../shared/models/account.model';
import { StoreState } from '../../shared/models/store.model';
import { ProductLikesMetadataResponse } from '../../shared/protobuf/product-like_pb';
import { RoutePathsType } from '../../shared/route-paths-type';
import { useQuery } from '../route-paths';
import { AccountPublicLikesSuspenseDesktopComponent } from './desktop/suspense/account-public-likes.suspense.desktop.component';
import { AccountPublicLikesSuspenseMobileComponent } from './mobile/suspense/account-public-likes.suspense.mobile.component';

const AccountPublicLikesDesktopComponent = React.lazy(
  () => import('./desktop/account-public-likes.desktop.component')
);
const AccountPublicLikesMobileComponent = React.lazy(
  () => import('./mobile/account-public-likes.mobile.component')
);

export interface AccountPublicLikesResponsiveProps {
  storeProps: StoreState;
  accountProps: AccountState;
  accountPublicProps: AccountPublicState;
  openCartVariants: boolean;
  variantQuantities: Record<string, number>;
  isPreviewLoading: boolean;
  setIsPreviewLoading: (value: boolean) => void;
  setOpenCartVariants: (value: boolean) => void;
  setVariantQuantities: (value: Record<string, number>) => void;
  onAddToCart: () => void;
  onProductPreviewClick: (
    scrollTop: number,
    product: Product,
    productLikesMetadata: ProductLikesMetadataResponse | null
  ) => void;
  onProductPreviewRest: (product: Product) => void;
  onProductPreviewAddToCart: (product: Product) => void;
  onProductPreviewLikeChanged: (isLiked: boolean, product: Product) => void;
}

export default function AccountPublicLikesComponent(): JSX.Element {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const query = useQuery();
  const [storeProps] = useObservable(StoreController.model.store);
  const [accountProps] = useObservable(AccountController.model.store);
  const [accountPublicProps] = useObservable(
    AccountPublicController.model.store
  );
  const [accountPublicDebugProps] = useObservable(
    AccountPublicController.model.debugStore
  );
  const [openCartVariants, setOpenCartVariants] =
    React.useState<boolean>(false);
  const [variantQuantities, setVariantQuantities] = React.useState<
    Record<string, number>
  >({});
  const [isPreviewLoading, setIsPreviewLoading] =
    React.useState<boolean>(false);

  const onProductPreviewClick = (
    scrollTop: number,
    _product: Product,
    _productLikesMetadata: ProductLikesMetadataResponse | null
  ) => {
    AccountPublicController.updateLikesScrollPosition(scrollTop);
  };

  const onProductPreviewRest = (product: Product) => {
    navigate({
      pathname: `${RoutePathsType.Store}/${product.id}`,
      search: query.toString(),
    });
  };

  const onProductPreviewAddToCart = (_product: Product) => {
    setOpenCartVariants(true);
    setIsPreviewLoading(true);
  };

  const onProductPreviewLikeChanged = (isLiked: boolean, product: Product) => {
    ProductController.requestProductLike(isLiked, product.id ?? '');
  };

  const onAddToCart = () => {
    for (const id in variantQuantities) {
      const quantity = variantQuantities[id];
      ProductController.addToCartAsync(
        id,
        quantity,
        () => {
          WindowController.addToast({
            key: `add-to-cart-${Math.random()}`,
            message: t('addedToCart') ?? '',
            description:
              t('addedToCartDescription', {
                item: accountPublicProps.selectedLikedProduct?.title,
              }) ?? '',
            type: 'success',
          });
          setIsPreviewLoading(false);
        },
        (error) => console.error(error)
      );
    }

    setOpenCartVariants(false);
    setVariantQuantities({});
  };

  React.useEffect(() => {
    if (!id) {
      return;
    }

    AccountPublicController.loadLikedProductsAsync(id);
  }, [id]);

  React.useEffect(() => {
    if (!accountPublicProps.selectedLikedProduct) {
      return;
    }

    const variants: PricedVariant[] =
      accountPublicProps.selectedLikedProduct?.variants;
    const quantities: Record<string, number> = {};
    for (const variant of variants) {
      if (!variant?.id) {
        continue;
      }
      quantities[variant?.id] = 0;
    }

    const purchasableVariants = variants.filter(
      (value: PricedVariant) => value.purchasable === true
    );

    if (purchasableVariants.length > 0) {
      const cheapestVariant =
        ProductController.getCheapestPrice(purchasableVariants);
      if (cheapestVariant?.id && quantities[cheapestVariant.id] <= 0) {
        quantities[cheapestVariant.id] = 1;
      }
    }

    setVariantQuantities(quantities);
  }, [accountPublicProps.selectedLikedProduct]);

  const suspenceComponent = (
    <>
      <AccountPublicLikesSuspenseDesktopComponent />
      <AccountPublicLikesSuspenseMobileComponent />
    </>
  );

  if (accountPublicDebugProps.suspense) {
    return suspenceComponent;
  }

  return (
    <React.Suspense fallback={suspenceComponent}>
      <AccountPublicLikesDesktopComponent
        storeProps={storeProps}
        accountProps={accountProps}
        accountPublicProps={accountPublicProps}
        openCartVariants={openCartVariants}
        variantQuantities={variantQuantities}
        isPreviewLoading={isPreviewLoading}
        setIsPreviewLoading={setIsPreviewLoading}
        setOpenCartVariants={setOpenCartVariants}
        setVariantQuantities={setVariantQuantities}
        onAddToCart={onAddToCart}
        onProductPreviewClick={onProductPreviewClick}
        onProductPreviewRest={onProductPreviewRest}
        onProductPreviewAddToCart={onProductPreviewAddToCart}
        onProductPreviewLikeChanged={onProductPreviewLikeChanged}
      />
      <AccountPublicLikesMobileComponent
        storeProps={storeProps}
        accountProps={accountProps}
        accountPublicProps={accountPublicProps}
        openCartVariants={openCartVariants}
        variantQuantities={variantQuantities}
        isPreviewLoading={isPreviewLoading}
        setIsPreviewLoading={setIsPreviewLoading}
        setOpenCartVariants={setOpenCartVariants}
        setVariantQuantities={setVariantQuantities}
        onAddToCart={onAddToCart}
        onProductPreviewClick={onProductPreviewClick}
        onProductPreviewRest={onProductPreviewRest}
        onProductPreviewAddToCart={onProductPreviewAddToCart}
        onProductPreviewLikeChanged={onProductPreviewLikeChanged}
      />
    </React.Suspense>
  );
}
