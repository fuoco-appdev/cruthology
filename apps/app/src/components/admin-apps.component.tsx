import React, { useEffect, useState } from 'react';
import {
  Typography,
  Button,
  IconPlus,
  Modal,
  OptionProps,
} from '@fuoco.appdev/core-ui';
import styles from './admin-apps.module.scss';
import { animated, useTransition, config } from 'react-spring';
import AdminAppsController from '../controllers/admin-apps.controller';
import BucketService from '../services/bucket.service';
import { useObservable } from '@ngneat/use-observable';
import AppCardComponent, { AppCardData } from './app-card.component';
import * as core from '../protobuf/core_pb';
import { useTranslation } from 'react-i18next';

export default function AdminAppsComponent(): JSX.Element {
  const [show, setShow] = useState(false);
  const [props] = useObservable(AdminAppsController.model.store);
  const [cards, setCards] = useState<React.ReactElement[]>([]);
  const { t } = useTranslation();

  useEffect(() => {
    setShow(true);

    return () => {
      setShow(false);
    };
  }, []);

  useEffect(() => {
    const appCards: React.ReactElement[] = [];
    const companyOptions: OptionProps[] = [];
    for (const account of props.accounts) {
      const status = (account as core.Account).requestStatus;
      if (
        status !== core.RequestStatus.ACCEPTED &&
        status !== core.RequestStatus.UPDATE_REQUESTED
      ) {
        continue;
      }

      companyOptions.push({
        id: account.userId,
        value: account.company,
        children: () => (
          <span className={styles['dropdown-label']}>{account.company}</span>
        ),
      });
    }

    props.apps.map((value: core.App) => {
      let avatarUrl: string | undefined;
      if (value.avatarImage) {
        avatarUrl =
          BucketService.getPublicUrl(
            core.BucketType.AVATARS,
            value.avatarImage
          ) ?? undefined;
      }
      const coverImages: string[] = [];
      for (const url of value.coverImages) {
        coverImages.push(
          BucketService.getPublicUrl(core.BucketType.COVER_IMAGES, url) ?? ''
        );
      }
      appCards.push(
        <AppCardComponent
          id={value.id}
          editMode={true}
          profilePicture={avatarUrl}
          company={value.company}
          name={value.name}
          progressType={value.status}
          companyOptions={companyOptions}
          coverImages={coverImages}
          onProfilePictureChanged={(index: number, blob: Blob) => {
            AdminAppsController.uploadAvatarAsync(value.id, blob);
          }}
          onCoverImagesChanged={(blobs: Blob[]) => {
            AdminAppsController.uploadCoverImagesAsync(value.id, blobs);
          }}
          onSaveClicked={(id: string, data: AppCardData) =>
            AdminAppsController.updateAppAsync(id, {
              user_id: data.userId,
              company: data.company,
              name: data.name,
              status: data.status,
              links: data.links,
            })
          }
          onDeleteClicked={(id: string) =>
            AdminAppsController.showDeleteModal(id)
          }
        />
      );
    });
    setCards(appCards);
  }, [props]);

  const transitions = useTransition(show, {
    from: { opacity: 0, y: 5 },
    enter: { opacity: 1, y: 0 },
    leave: { opacity: 0, y: 5 },
    config: config.gentle,
  });

  return (
    <div className={styles['root']}>
      {transitions(
        (style, item) =>
          item && (
            <animated.div style={style} className={styles['animated-content']}>
              <div className={styles['content']}>
                <div className={styles['header-bar']}>
                  <Typography.Title className={styles['apps-title']} level={2}>
                    {t('adminApps')}
                  </Typography.Title>
                  <div className={styles['header-button-container']}>
                    <Button
                      classNames={{
                        container: styles['header-button'],
                      }}
                      type={'primary'}
                      size={'tiny'}
                      icon={<IconPlus strokeWidth={2} />}
                      onClick={() => AdminAppsController.createAppAsync()}
                    >
                      <span className={styles['button-text']}>
                        {t('createApp')}
                      </span>
                    </Button>
                  </div>
                </div>
                <div className={styles['apps-container']}>{cards}</div>
              </div>
            </animated.div>
          )
      )}
      <Modal
        title={t('deleteApp') ?? ''}
        description={t('deleteAppDescription') ?? ''}
        confirmText={t('delete') ?? ''}
        cancelText={t('cancel') ?? ''}
        variant={'danger'}
        size={'small'}
        visible={props.showDeleteModal}
        onCancel={() => AdminAppsController.hideDeleteModal()}
        onConfirm={() => AdminAppsController.deleteSelectedAppAsync()}
      ></Modal>
    </div>
  );
}
