import { Auth, Typography, Button, Line } from '@fuoco.appdev/core-ui';
import { useObservable } from '@ngneat/use-observable';
import styles from '../help.module.scss';
import { lazy } from 'react';
import { HelpResponsiveProps } from '../help.component';
import loadable from '@loadable/component';
import { ResponsiveDesktop } from '../responsive.component';
import { useTranslation } from 'react-i18next';
import ConfigService from '../../services/config.service';
import { DiscordIcon } from '../help.component';

const ReactMarkdown = loadable(
  async () => {
    const reactMarkdown = await import('react-markdown');
    return (props: any) => <reactMarkdown.default {...props} />;
  },
  { ssr: false }
);

export default function HelpDesktopComponent({
  helpProps,
  remarkPlugins,
}: HelpResponsiveProps): JSX.Element {
  const { t, i18n } = useTranslation();

  return (
    <ResponsiveDesktop>
      <div className={[styles['root'], styles['root-desktop']].join(' ')}>
        <div
          className={[styles['content'], styles['content-desktop']].join(' ')}
        >
          <Auth.PrivacyPolicy
            privacyPolicy={
              <Typography
                tag="article"
                className={[
                  styles['typography'],
                  styles['typography-desktop'],
                ].join(' ')}
              >
                <ReactMarkdown
                  remarkPlugins={remarkPlugins}
                  children={helpProps.markdown}
                />
              </Typography>
            }
          />
          <div
            className={[
              styles['button-container'],
              styles['button-container-desktop'],
            ].join(' ')}
          >
            <Button
              classNames={{
                button: styles['outline-button'],
              }}
              rippleProps={{
                color: 'rgba(133, 38, 122, .35)',
              }}
              size={'large'}
              icon={<DiscordIcon />}
              onClick={() =>
                setTimeout(
                  () => window.location.replace(ConfigService.discord.url),
                  250
                )
              }
            >
              {t('joinUsOnDiscord')}
            </Button>
          </div>
        </div>
      </div>
    </ResponsiveDesktop>
  );
}
