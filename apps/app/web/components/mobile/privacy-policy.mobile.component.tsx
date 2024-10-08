import { Auth, Typography } from '@fuoco.appdev/web-components';
import loadable from '@loadable/component';
import styles from '../../modules/privacy-policy.module.scss';
import { PrivacyPolicyResponsiveProps } from '../privacy-policy.component';
import { ResponsiveMobile } from '../responsive.component';
const ReactMarkdown = loadable(
  async () => {
    const reactMarkdown = await import('react-markdown');
    return (props: any) => <reactMarkdown.default {...props} />;
  },
  { ssr: false }
);

export default function PrivacyPolicyMobileComponent({
  privacyPolicyProps,
  remarkPlugins,
}: PrivacyPolicyResponsiveProps): JSX.Element {
  return (
    <ResponsiveMobile>
      <div className={[styles['root'], styles['root-mobile']].join(' ')}>
        <div
          className={[styles['content'], styles['content-mobile']].join(' ')}
        >
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
                  children={privacyPolicyProps.markdown}
                />
              </Typography>
            }
          />
        </div>
      </div>
    </ResponsiveMobile>
  );
}
