import Skeleton from 'react-loading-skeleton';
import styles from '../../../modules/product.module.scss';
import { ResponsiveSuspenseMobile } from '../../responsive.component';

export function ProductSuspenseMobileComponent(): JSX.Element {
  return (
    <ResponsiveSuspenseMobile>
      <div className={[styles['root'], styles['root-mobile']].join(' ')}>
        <div
          className={[
            styles['thumbnail-container'],
            styles['thumbnail-container-mobile'],
          ].join(' ')}
        ></div>
        <div
          className={[styles['content'], styles['content-mobile']].join(' ')}
        >
          <div
            className={[
              styles['header-container'],
              styles['header-container-mobile'],
            ].join(' ')}
          >
            <div
              className={[
                styles['title-container'],
                styles['title-container-mobile'],
              ].join(' ')}
            >
              <Skeleton
                count={1}
                borderRadius={9999}
                className={[
                  styles['title-skeleton'],
                  styles['title-skeleton-mobile'],
                ].join(' ')}
              />
            </div>
            <div
              className={[
                styles['like-container'],
                styles['like-container-mobile'],
              ].join(' ')}
            >
              <Skeleton
                className={[
                  styles['like-button-skeleton'],
                  styles['like-button-skeleton-mobile'],
                ].join(' ')}
              />
              <Skeleton
                borderRadius={9999}
                className={[
                  styles['like-count-skeleton'],
                  styles['like-count-skeleton-mobile'],
                ].join(' ')}
              />
            </div>
          </div>
          <div
            className={[
              styles['tags-container'],
              styles['tags-container-mobile'],
            ].join(' ')}
          >
            {[1, 2, 3, 4].map((key) => (
              <Skeleton
                key={key}
                className={[
                  styles['tag-skeleton'],
                  styles['tag-skeleton-mobile'],
                ].join(' ')}
                borderRadius={9999}
              />
            ))}
          </div>
          <div
            className={[
              styles['description-container'],
              styles['description-container-mobile'],
            ].join(' ')}
          >
            <Skeleton
              count={6}
              borderRadius={9999}
              className={[
                styles['skeleton-description'],
                styles['skeleton-description-mobile'],
              ].join(' ')}
            />
          </div>
          <div className={[styles['price'], styles['price-mobile']].join(' ')}>
            <Skeleton
              className={[
                styles['inventory-quantity'],
                styles['inventory-quantity-mobile'],
              ].join(' ')}
              borderRadius={9999}
              count={1}
            />
          </div>
        </div>
        <div
          className={[
            styles['top-bar-container'],
            styles['top-bar-container-mobile'],
          ].join(' ')}
        ></div>
        <div
          className={[
            styles['price-container'],
            styles['price-container-mobile'],
          ].join(' ')}
        >
          <div className={[styles['price'], styles['price-mobile']].join(' ')}>
            <Skeleton
              className={[
                styles['inventory-quantity'],
                styles['inventory-quantity-mobile'],
              ].join(' ')}
              borderRadius={9999}
              count={1}
            />
          </div>
          <div
            className={[
              styles['tab-container'],
              styles['tab-container-mobile'],
            ].join(' ')}
          >
            <Skeleton
              className={[
                styles['tabs-skeleton'],
                styles['tabs-skeleton-mobile'],
              ].join(' ')}
            />
            <div
              className={[
                styles['options-container'],
                styles['options-container-mobile'],
              ].join(' ')}
            >
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((key) => (
                <div
                  key={key}
                  className={[
                    styles['option-content'],
                    styles['option-content-mobile'],
                  ].join(' ')}
                >
                  <Skeleton
                    className={[
                      styles['option-title-skeleton'],
                      styles['option-title-skeleton-mobile'],
                    ].join(' ')}
                    borderRadius={9999}
                  />
                  <Skeleton
                    className={[
                      styles['option-value-skeleton'],
                      styles['option-value-skeleton-mobile'],
                    ].join(' ')}
                    borderRadius={9999}
                  />
                </div>
              ))}
            </div>
          </div>
          <Skeleton
            className={[
              styles['add-to-cart-button-skeleton'],
              styles['add-to-cart-button-skeleton-mobile'],
            ].join(' ')}
          />
          <Skeleton
            className={[
              styles['add-to-cart-button-skeleton'],
              styles['add-to-cart-button-skeleton-mobile'],
            ].join(' ')}
          />
          <div
            className={[
              styles['tab-container'],
              styles['tab-container-mobile'],
            ].join(' ')}
          >
            <Skeleton
              className={[
                styles['tabs-skeleton'],
                styles['tabs-skeleton-mobile'],
              ].join(' ')}
            />
            <div
              className={[
                styles['details-container'],
                styles['details-container-mobile'],
              ].join(' ')}
            >
              {[1, 2, 3, 4, 5, 6].map((key) => (
                <div
                  key={key}
                  className={[
                    styles['details-item-content'],
                    styles['details-item-content-mobile'],
                  ].join(' ')}
                >
                  <Skeleton
                    className={[
                      styles['details-title-skeleton'],
                      styles['details-title-skeleton-mobile'],
                    ].join(' ')}
                    borderRadius={9999}
                  />
                  <Skeleton
                    className={[
                      styles['details-value-skeleton'],
                      styles['details-value-skeleton-mobile'],
                    ].join(' ')}
                    borderRadius={9999}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </ResponsiveSuspenseMobile>
  );
}
