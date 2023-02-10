import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import {
  Typography,
  Button,
  IconLayout,
  IconSmartphone,
  IconPenTool,
} from '@fuoco.appdev/core-ui';
import styles from './landing.module.scss';
import { useNavigate } from 'react-router-dom';
import { RoutePaths } from '../route-paths';
import { animated, useTransition, config } from 'react-spring';
import { ResponsiveDesktop, ResponsiveMobile } from './responsive.component';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';
import WindowController from '../controllers/window.controller';
import WorldController from '../controllers/world.controller';
import { useTranslation } from 'react-i18next';

interface ServiceProps {
  title: string;
  icon: JSX.Element;
  description: string;
}

function ServiceComponent({
  title,
  icon,
  description,
}: ServiceProps): JSX.Element {
  return (
    <>
      <ResponsiveDesktop>
        <div
          className={[
            styles['service-container'],
            styles['service-container-desktop'],
          ].join(' ')}
        >
          <div
            className={[
              styles['service-top-content'],
              styles['service-top-content-desktop'],
            ].join(' ')}
          >
            <span
              className={[
                styles['service-title'],
                styles['service-title-desktop'],
              ].join(' ')}
            >
              {title}
            </span>
            <div
              className={[
                styles['service-icon-container'],
                styles['service-icon-container-desktop'],
              ].join(' ')}
            >
              {icon}
            </div>
          </div>
          <div
            className={[
              styles['service-description'],
              styles['service-description-desktop'],
            ].join(' ')}
          >
            {description}
          </div>
        </div>
      </ResponsiveDesktop>
      <ResponsiveMobile>
        <div
          className={[
            styles['service-container'],
            styles['service-container-mobile'],
          ].join(' ')}
        >
          <div
            className={[
              styles['service-top-content'],
              styles['service-top-content-mobile'],
            ].join(' ')}
          >
            <span
              className={[
                styles['service-title'],
                styles['service-title-mobile'],
              ].join(' ')}
            >
              {title}
            </span>
            <div
              className={[
                styles['service-icon-container'],
                styles['service-icon-container-mobile'],
              ].join(' ')}
            >
              {icon}
            </div>
          </div>
          <div
            className={[
              styles['service-description'],
              styles['service-description-mobile'],
            ].join(' ')}
          >
            {description}
          </div>
        </div>
      </ResponsiveMobile>
    </>
  );
}

function LandingDesktopComponent(): JSX.Element {
  const navigate = useNavigate();
  const [show, setShow] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    setShow(true);

    return () => {
      setShow(false);
    };
  }, []);

  const transitions = useTransition(show, {
    from: { opacity: 0, y: 5 },
    enter: { opacity: 1, y: 0 },
    leave: { opacity: 0, y: 5 },
    config: config.gentle,
  });

  let textIndex = 0;
  const textStyle: (index: number, delay: number) => React.CSSProperties = (
    index,
    delay
  ) => ({
    animationDelay: delay + index / 50 + 's',
  });
  return (
    <div className={[styles['root'], styles['root-desktop']].join(' ')}>
      <div className={[styles['content'], styles['content-desktop']].join(' ')}>
        {transitions(
          (style, item) =>
            item && (
              <animated.div
                className={[
                  styles['animation-container'],
                  styles['animation-container-desktop'],
                ].join(' ')}
                style={style}
              >
                <div
                  className={[
                    styles['landing-title-container'],
                    styles['landing-title-container-desktop'],
                  ].join(' ')}
                >
                  <Typography.Title
                    className={[styles['title'], styles['title-desktop']].join(
                      ' '
                    )}
                  >
                    {t('landingTitle1')
                      .split('')
                      .map((char, index) => {
                        textIndex += 1;
                        return (
                          <span
                            className={styles['title-char']}
                            aria-hidden="true"
                            key={index}
                            style={textStyle(textIndex, 0)}
                          >
                            {char}
                          </span>
                        );
                      })}
                    <br />
                    {t('landingTitle2')
                      .split('')
                      .map((char, index) => {
                        textIndex += 1;
                        return (
                          <span
                            className={styles['title-char']}
                            aria-hidden="true"
                            key={index}
                            style={textStyle(textIndex, 0.4)}
                          >
                            {char}
                          </span>
                        );
                      })}
                    <br />
                    <span
                      className={[
                        styles['title-spacing'],
                        styles['title-spacing-desktop'],
                      ].join(' ')}
                    >
                      {t('landingTitle3')
                        .split('')
                        .map((char, index) => {
                          textIndex += 1;
                          return (
                            <span
                              className={styles['title-char']}
                              aria-hidden="true"
                              key={index}
                              style={textStyle(textIndex, 0.8)}
                            >
                              {char}
                            </span>
                          );
                        })}
                    </span>
                  </Typography.Title>
                  <div
                    className={[
                      styles['landing-sub-title-container'],
                      styles['landing-sub-title-container-desktop'],
                    ].join(' ')}
                  >
                    <Typography.Text
                      className={[
                        styles['sub-title'],
                        styles['sub-title-desktop'],
                      ].join(' ')}
                      align={'center'}
                    >
                      {t('landingDescription')}
                    </Typography.Text>
                  </div>
                </div>
                <div
                  className={[
                    styles['button-container'],
                    styles['button-container-desktop'],
                  ].join(' ')}
                >
                  <Button
                    classNames={{
                      container: styles['button'],
                    }}
                    size={'xlarge'}
                    type="primary"
                    onClick={() => navigate(RoutePaths.Signup)}
                  >
                    {t('signup')}
                  </Button>
                </div>
                <div
                  className={[
                    styles['service-list'],
                    styles['service-list-desktop'],
                  ].join(' ')}
                >
                  <ServiceComponent
                    title={t('webDesign')}
                    icon={<IconLayout strokeWidth={2} stroke={'#fff'} />}
                    description={t('webDesignDescription')}
                  />
                  <ServiceComponent
                    title={t('appDevelopment')}
                    icon={<IconSmartphone strokeWidth={2} stroke={'#fff'} />}
                    description={t('appDevelopmentDescription')}
                  />
                  <ServiceComponent
                    title={t('logoAndBranding')}
                    icon={<IconPenTool strokeWidth={2} stroke={'#fff'} />}
                    description={t('logoAndBrandingDescription')}
                  />
                </div>
              </animated.div>
            )
        )}
      </div>
    </div>
  );
}

function LandingMobileComponent(): JSX.Element {
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const titleContainerRef = useRef<HTMLDivElement | null>(null);
  const isMounted = useRef<boolean>(false);
  const { t } = useTranslation();

  useEffect(() => {
    if (!isMounted.current) {
      gsap.registerPlugin(ScrollTrigger);
      const timeline = gsap.timeline({
        scrollTrigger: {
          scroller: WindowController.scrollRef,
          trigger: containerRef.current,
          start: 'top top',
          end: '+=500',
          markers: false,
          pin: titleContainerRef.current,
          pinSpacing: true,
          pinType: 'fixed',
          onUpdate: (self: ScrollTrigger) => {
            WorldController.fade(self.progress);
          },
        },
      });

      isMounted.current = true;
      return () => {
        timeline.scrollTrigger?.refresh();
      };
    }

    return;
  }, []);

  const textStyle: (index: number) => React.CSSProperties = (index) => ({
    animationDelay: index / 50 + 's',
  });
  return (
    <div className={[styles['root'], styles['root-mobile']].join(' ')}>
      <div className={[styles['content'], styles['content-mobile']].join(' ')}>
        <div
          className={[
            styles['animation-container'],
            styles['animation-container-mobile'],
          ].join(' ')}
          ref={containerRef}
        >
          <div
            className={[
              styles['text-container'],
              styles['text-container-mobile'],
            ].join(' ')}
            ref={titleContainerRef}
          >
            <div
              className={[
                styles['landing-title-container'],
                styles['landing-title-container-mobile'],
              ].join(' ')}
            >
              <Typography.Title
                className={[styles['title'], styles['title-mobile']].join(' ')}
              >
                {`${t('landingTitle1')} ${t('landingTitle2')} ${t(
                  'landingTitle3'
                )}`
                  .split('')
                  .map((char, index) => {
                    return (
                      <span
                        className={styles['title-char']}
                        aria-hidden="true"
                        key={index}
                        style={textStyle(index)}
                      >
                        {char}
                      </span>
                    );
                  })}
              </Typography.Title>
              <Typography.Text
                className={[
                  styles['sub-title'],
                  styles['sub-title-mobile'],
                ].join(' ')}
                align={'center'}
              >
                {t('landingDescription')}
              </Typography.Text>
              <div
                className={[
                  styles['button-container'],
                  styles['button-container-mobile'],
                ].join(' ')}
              >
                <Button
                  classNames={{
                    container: styles['button'],
                  }}
                  size={'xlarge'}
                  type="primary"
                  onClick={() => navigate(RoutePaths.Signup)}
                >
                  {t('signup')}
                </Button>
              </div>
            </div>
          </div>
          <div
            className={[
              styles['service-list'],
              styles['service-list-mobile'],
            ].join(' ')}
          >
            <ServiceComponent
              title={t('webDesign')}
              icon={<IconLayout strokeWidth={2} stroke={'#fff'} />}
              description={t('webDesignDescription')}
            />
            <ServiceComponent
              title={t('appDevelopment')}
              icon={<IconSmartphone strokeWidth={2} stroke={'#fff'} />}
              description={t('appDevelopmentDescription')}
            />
            <ServiceComponent
              title={t('logoAndBranding')}
              icon={<IconPenTool strokeWidth={2} stroke={'#fff'} />}
              description={t('logoAndBrandingDescription')}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LandingComponent(): JSX.Element {
  return (
    <>
      <ResponsiveDesktop>
        <LandingDesktopComponent />
      </ResponsiveDesktop>
      <ResponsiveMobile>
        <LandingMobileComponent />
      </ResponsiveMobile>
    </>
  );
}
