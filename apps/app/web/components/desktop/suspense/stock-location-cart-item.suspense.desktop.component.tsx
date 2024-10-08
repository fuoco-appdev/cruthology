import Skeleton from 'react-loading-skeleton';
import styles from '../../../modules/stock-location-cart-item.module.scss';
import { ResponsiveSuspenseDesktop } from '../../responsive.component';

export function StockLocationCartItemSuspenseDesktopComponent(): JSX.Element {
  return (
    <ResponsiveSuspenseDesktop inheritStyles={false}>
      <div className={[styles['root'], styles['root-desktop']].join(' ')}>
        <div
          className={[styles['container'], styles['container-desktop']].join(
            ' '
          )}
        >
          <div
            className={[styles['details'], styles['details-desktop']].join(' ')}
          >
            <div
              className={[
                styles['title-container'],
                styles['title-container-desktop'],
              ].join(' ')}
            >
              <Skeleton width={40} height={40} borderRadius={40} />
              <div
                className={[styles['title'], styles['title-desktop']].join(' ')}
              >
                <Skeleton width={140} borderRadius={20} />
              </div>
            </div>
            <div
              className={[
                styles['right-details-container'],
                styles['right-details-container-desktop'],
              ].join(' ')}
            >
              <div
                className={[
                  styles['right-details-content'],
                  styles['right-details-content-desktop'],
                ].join(' ')}
              ></div>
            </div>
          </div>
        </div>
      </div>
    </ResponsiveSuspenseDesktop>
  );
}
