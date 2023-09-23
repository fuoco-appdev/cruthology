import { Auth, Typography, Button, Line } from '@fuoco.appdev/core-ui';
import { useObservable } from '@ngneat/use-observable';
import styles from '../privacy-policy.module.scss';
import PrivacyPolicyController from '../../controllers/privacy-policy.controller';
import { lazy } from 'react';
import { PrivacyPolicyResponsiveProps } from '../privacy-policy.component';
import loadable from '@loadable/component';
const ReactMarkdown = loadable(async () => {
  const reactMarkdown = await import('react-markdown');
  return (props: any) => <reactMarkdown.default {...props} />;
});

export function PrivacyPolicyMobileComponent({
  remarkPlugins,
}: PrivacyPolicyResponsiveProps): JSX.Element {
  const [props] = useObservable(PrivacyPolicyController.model.store);

  return (
    <div className={[styles['root'], styles['root-mobile']].join(' ')}>
      <div className={[styles['content'], styles['content-mobile']].join(' ')}>
        <Auth.PrivacyPolicy
          privacyPolicy={
            <Typography
              tag="article"
              className={[
                styles['typography'],
                styles['typography-mobile'],
              ].join(' ')}
            >
              <ReactMarkdown
                remarkPlugins={remarkPlugins}
                children={props.markdown}
              />
            </Typography>
          }
        />
      </div>
    </div>
  );
}
