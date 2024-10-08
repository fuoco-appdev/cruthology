import Skeleton from 'react-loading-skeleton';
import styles from '../../../modules/store.module.scss';
import { ResponsiveSuspenseMobile } from '../../responsive.component';
import { ProductPreviewSuspenseMobileComponent } from './product-preview.suspense.mobile.component';

export function StoreSuspenseMobileComponent(): JSX.Element {
  return (
    <ResponsiveSuspenseMobile>
      <div className={[styles['root'], styles['root-mobile']].join(' ')}>
        <div
          className={[
            styles['top-bar-container'],
            styles['top-bar-container-mobile'],
          ].join(' ')}
        >
          <div
            className={[
              styles['search-container'],
              styles['search-container-mobile'],
            ].join(' ')}
          >
            <div
              className={[
                styles['search-input-root'],
                styles['search-input-root-mobile'],
              ].join(' ')}
            >
              <Skeleton
                className={[
                  styles['search-input-container-skeleton'],
                  styles['search-input-container-skeleton-mobile'],
                ].join(' ')}
                height={46}
                borderRadius={46}
              />
            </div>
            <div>
              <Skeleton style={{ width: 46, height: 46 }} borderRadius={48} />
            </div>
            <div>
              <Skeleton style={{ width: 46, height: 46 }} borderRadius={48} />
            </div>
          </div>
          <div
            className={[
              styles['tab-container-skeleton'],
              styles['tab-container-skeleton-mobile'],
            ].join(' ')}
          >
            <Skeleton style={{ width: 80, height: 24 }} borderRadius={24} />
            <Skeleton style={{ width: 80, height: 24 }} borderRadius={24} />
            <Skeleton style={{ width: 80, height: 24 }} borderRadius={24} />
            <Skeleton style={{ width: 80, height: 24 }} borderRadius={24} />
          </div>
        </div>
        <div
          className={[
            styles['scroll-content-skeleton'],
            styles['scroll-content-skeleton-mobile'],
          ].join(' ')}
        >
          {[1, 2, 3, 4, 5, 6, 7, 8].map(() => (
            <ProductPreviewSuspenseMobileComponent />
          ))}
        </div>
      </div>
    </ResponsiveSuspenseMobile>
  );
}
