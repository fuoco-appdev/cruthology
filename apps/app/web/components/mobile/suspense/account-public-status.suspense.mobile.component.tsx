import Skeleton from 'react-loading-skeleton';
import { Outlet } from 'react-router-dom';
import styles from '../../../modules/account-public-status.module.scss';
import { ResponsiveSuspenseMobile } from '../../responsive.component';

export function AccountPublicStatusSuspenseMobileComponent(): JSX.Element {
  return (
    <ResponsiveSuspenseMobile>
      <div className={[styles['root'], styles['root-mobile']].join(' ')}>
        <div
          className={[
            styles['tabs-container-skeleton'],
            styles['tabs-container-skeleton-mobile'],
          ].join(' ')}
        >
          <div style={{ display: 'flex', flexDirection: 'row' }}>
            <div
              className={[
                styles['tab-button-skeleton'],
                styles['tab-button-skeleton-mobile'],
              ].join('')}
            >
              <Skeleton style={{ height: 48 }} borderRadius={6} />
            </div>
            <div
              className={[
                styles['tab-button-skeleton'],
                styles['tab-button-skeleton-mobile'],
              ].join('')}
            >
              <Skeleton style={{ height: 48 }} borderRadius={6} />
            </div>
          </div>
          <Skeleton height={46} width={'100%'} borderRadius={46} />
        </div>
        <div
          className={[
            styles['outlet-container'],
            styles['outlet-container-mobile'],
          ].join(' ')}
        >
          <div style={{ minWidth: '100%', minHeight: '100%' }}>
            <Outlet />
          </div>
        </div>
      </div>
    </ResponsiveSuspenseMobile>
  );
}
