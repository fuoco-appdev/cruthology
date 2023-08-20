import styles from '../address-item.module.scss';
import { Button, Line, Modal } from '@fuoco.appdev/core-ui';
import { AddressItemProps } from '../address-item.component';
import { useTranslation } from 'react-i18next';

export function AddressItemDesktopComponent({
  address,
  onEdit,
  onDelete,
}: AddressItemProps): JSX.Element {
  const { t, i18n } = useTranslation();
  return (
    <div className={[styles['root'], styles['root-desktop']].join(' ')}>
      <div
        className={[styles['container'], styles['container-desktop']].join(' ')}
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
            <div
              className={[styles['title'], styles['title-desktop']].join(' ')}
            >
              {`${address.address_1}`}
              {address.address_2 ? ` ${address.address_2}, ` : ', '}
              {`${address.postal_code}, ${address.city}, `}
              {address.province && `${address.province}, `}
              {address.country_code?.toUpperCase()}
            </div>
            <div
              className={[styles['subtitle'], styles['subtitle-desktop']].join(
                ' '
              )}
            >
              {`${address.first_name} ${address.last_name}, ${address.phone}`}
              {address.company && `, ${address.company}`}
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
            >
              <div>
                <Button
                  block={true}
                  classNames={{
                    button: [
                      styles['edit-button'],
                      styles['edit-button-desktop'],
                    ].join(' '),
                  }}
                  floatingLabel={t('edit') ?? ''}
                  type={'text'}
                  rounded={true}
                  size={'tiny'}
                  icon={<Line.Edit size={24} />}
                  onClick={onEdit}
                />
              </div>
              <div>
                <Button
                  block={true}
                  classNames={{
                    button: [
                      styles['remove-button'],
                      styles['remove-button-desktop'],
                    ].join(' '),
                  }}
                  floatingLabel={t('remove') ?? ''}
                  type={'text'}
                  rounded={true}
                  size={'tiny'}
                  icon={<Line.Delete size={24} />}
                  onClick={onDelete}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
