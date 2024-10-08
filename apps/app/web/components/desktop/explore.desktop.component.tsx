import {
  Button,
  Input,
  Line,
  Scroll,
  Tabs,
} from '@fuoco.appdev/web-components';
import { StockLocation } from '@medusajs/stock-location/dist/models';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import Map, { Marker, Popup } from 'react-map-gl';
import Slider from 'react-slick';
import ExploreController from '../../../shared/controllers/explore.controller';
import {
  ExploreTabs,
  InventoryLocation,
  InventoryLocationType,
} from '../../../shared/models/explore.model';
import ConfigService from '../../../shared/services/config.service';
import styles from '../../modules/explore.module.scss';
import { ExploreResponsiveProps } from '../explore.component';
import { ResponsiveDesktop } from '../responsive.component';
import StockLocationItemComponent from '../stock-location-item.component';

export default function ExploreDesktopComponent({
  exploreProps,
  mapRef,
  selectedPoint,
  setMapStyleLoaded,
  setSelectedPoint,
  onScrollLoad,
  onStockLocationClicked,
  onGoToStore,
}: ExploreResponsiveProps): JSX.Element {
  const { t } = useTranslation();
  const topBarRef = React.useRef<HTMLDivElement | null>(null);
  const scrollContainerRef = React.createRef<HTMLDivElement>();
  let prevScrollTop = 0;
  let yPosition = 0;

  return (
    <ResponsiveDesktop>
      <div className={[styles['root'], styles['root-desktop']].join(' ')}>
        <div
          className={[
            styles['search-root'],
            styles['search-root-desktop'],
          ].join(' ')}
        >
          <div
            ref={topBarRef}
            className={[
              styles['top-bar-container'],
              styles['top-bar-container-desktop'],
            ].join(' ')}
          >
            <div
              className={[
                styles['top-bar-left-content'],
                styles['top-bar-left-content-desktop'],
              ].join(' ')}
            >
              <div
                className={[
                  styles['search-container'],
                  styles['search-container-desktop'],
                ].join(' ')}
              >
                <div
                  className={[
                    styles['search-input-root'],
                    styles['search-input-root-desktop'],
                  ].join(' ')}
                >
                  <Input
                    value={exploreProps.input}
                    classNames={{
                      container: [
                        styles['search-input-container'],
                        styles['search-input-container-desktop'],
                      ].join(' '),
                      input: [
                        styles['search-input'],
                        styles['search-input-desktop'],
                      ].join(' '),
                    }}
                    placeholder={t('search') ?? ''}
                    icon={<Line.Search size={24} color={'#2A2A5F'} />}
                    onChange={(event) =>
                      ExploreController.updateInput(event.target.value)
                    }
                  />
                </div>
              </div>
              <div
                className={[
                  styles['tab-container'],
                  styles['tab-container-desktop'],
                ].join(' ')}
              >
                <Tabs
                  classNames={{
                    nav: styles['tab-nav'],
                    tabButton: styles['tab-button'],
                    selectedTabButton: styles['selected-tab-button'],
                    tabSliderPill: styles['tab-slider-pill'],
                  }}
                  removable={true}
                  type={'pills'}
                  activeId={exploreProps.selectedTab}
                  onChange={(id: string) =>
                    ExploreController.updateSelectedTabAsync(
                      id.length > 0 ? (id as ExploreTabs) : undefined
                    )
                  }
                  tabs={[
                    {
                      id: ExploreTabs.Cellar,
                      label: t('cellar') ?? 'Cellar',
                    },
                    {
                      id: ExploreTabs.Restaurant,
                      label: t('restaurant') ?? 'Restaurant',
                    },
                  ]}
                />
              </div>
            </div>
          </div>
          <Scroll
            loadComponent={
              <img
                src={'../assets/svg/ring-resize-dark.svg'}
                className={styles['loading-ring']}
              />
            }
            loadingHeight={56}
            showIndicatorThreshold={56}
            reloadThreshold={96}
            pullIndicatorComponent={
              <div className={[styles['pull-indicator-container']].join(' ')}>
                <Line.ArrowDownward size={24} />
              </div>
            }
            isLoadable={exploreProps.hasMoreSearchedStockLocations}
            isLoading={exploreProps.areSearchedStockLocationsLoading}
            onLoad={() => ExploreController.onNextScrollAsync()}
            onScroll={(progress, scrollRef, contentRef) => {
              const elementHeight = topBarRef.current?.clientHeight ?? 0;
              const scrollTop =
                contentRef.current?.getBoundingClientRect().top ?? 0;
              if (prevScrollTop <= scrollTop) {
                yPosition -= prevScrollTop - scrollTop;
                if (yPosition >= 0) {
                  yPosition = 0;
                }

                topBarRef.current!.style.transform = `translateY(${yPosition}px)`;
              } else {
                yPosition += scrollTop - prevScrollTop;
                if (yPosition <= -elementHeight) {
                  yPosition = -elementHeight;
                }

                topBarRef.current!.style.transform = `translateY(${yPosition}px)`;
              }

              prevScrollTop = scrollTop;
            }}
          >
            <div
              className={[
                styles['scroll-content'],
                styles['scroll-content-desktop'],
              ].join(' ')}
              ref={scrollContainerRef}
              onLoad={onScrollLoad}
            >
              {exploreProps.searchedStockLocations.map(
                (stockLocation: StockLocation, _index: number) => {
                  return (
                    <StockLocationItemComponent
                      key={stockLocation.id}
                      stockLocation={stockLocation}
                      onClick={async () =>
                        onStockLocationClicked(
                          await ExploreController.getInventoryLocationAsync(
                            stockLocation
                          )
                        )
                      }
                    />
                  );
                }
              )}
              {!exploreProps.areSearchedStockLocationsLoading &&
                !exploreProps.areSearchedStockLocationsReloading &&
                exploreProps.searchedStockLocations.length <= 0 && (
                  <div
                    className={[
                      styles['no-searched-stock-locations-container'],
                      styles['no-searched-stock-locations-container-desktop'],
                    ].join(' ')}
                  >
                    <div
                      className={[
                        styles['no-items-text'],
                        styles['no-items-text-desktop'],
                      ].join(' ')}
                    >
                      {t('noStockLocationsFound')}
                    </div>
                  </div>
                )}
            </div>
          </Scroll>
        </div>
        <div
          className={[
            styles['map-container'],
            styles['map-container-desktop'],
          ].join(' ')}
        >
          {exploreProps.isSelectedInventoryLocationLoaded && (
            <Map
              style={{
                minWidth: '100%',
                minHeight: '100%',
                width: '100%',
                height: '100%',
                borderRadius: '6px',
              }}
              mapboxAccessToken={import.meta.env['MAPBOX_ACCESS_TOKEN']}
              ref={mapRef}
              interactive={true}
              initialViewState={{
                longitude: exploreProps.longitude ?? 0,
                latitude: exploreProps.latitude ?? 0,
                zoom: 15,
              }}
              longitude={exploreProps.longitude ?? 0}
              latitude={exploreProps.latitude ?? 0}
              zoom={exploreProps.zoom ?? 15}
              mapStyle={ConfigService.mapbox.style_url}
              onMove={(e) => ExploreController.onMapMove(e.viewState)}
              onLoad={(e) => {
                setMapStyleLoaded(e.target ? true : false);
                e.target.resize();
              }}
            >
              {exploreProps.inventoryLocations?.map(
                (point: InventoryLocation, index: number) => (
                  <Marker
                    key={`marker-${index}`}
                    latitude={point.coordinates.lat}
                    longitude={point.coordinates.lng}
                    anchor={'right'}
                    onClick={(e) => {
                      e.originalEvent.stopPropagation();
                      setSelectedPoint(point);
                    }}
                  >
                    {point.type === InventoryLocationType.Cellar && (
                      <img
                        src={
                          exploreProps.selectedInventoryLocation?.id !==
                          point.id
                            ? '../assets/images/unselected-cellar.png'
                            : '../assets/images/selected-cellar.png'
                        }
                        className={[
                          styles['marker'],
                          styles['marker-desktop'],
                        ].join(' ')}
                      />
                    )}
                    {point.type === InventoryLocationType.Restaurant && (
                      <img
                        src={
                          exploreProps.selectedInventoryLocation?.id !==
                          point.id
                            ? '../assets/images/unselected-restaurant.png'
                            : '../assets/images/selected-restaurant.png'
                        }
                        className={[
                          styles['marker'],
                          styles['marker-desktop'],
                        ].join(' ')}
                      />
                    )}
                  </Marker>
                )
              )}
              {selectedPoint && (
                <Popup
                  anchor={'left'}
                  onClose={() => setSelectedPoint(null)}
                  closeButton={false}
                  maxWidth={'auto'}
                  latitude={selectedPoint.coordinates.lat}
                  longitude={selectedPoint.coordinates.lng}
                >
                  <div
                    className={[
                      styles['marker-popup'],
                      styles['marker-popup-desktop'],
                    ].join(' ')}
                  >
                    {selectedPoint.thumbnails &&
                      selectedPoint.thumbnails.length > 0 && (
                        <div style={{ width: 423, height: 282 }}>
                          <Slider
                            dots={true}
                            speed={250}
                            slidesToShow={1}
                            slidesToScroll={1}
                            className={[
                              styles['slider'],
                              styles['slider-desktop'],
                            ].join(' ')}
                          >
                            {selectedPoint.thumbnails.map((value) => (
                              <img src={value} height={282} />
                            ))}
                          </Slider>
                        </div>
                      )}
                    <div
                      className={[
                        styles['info-container'],
                        styles['info-container-desktop'],
                      ].join(' ')}
                    >
                      <div
                        className={[
                          styles['company'],
                          styles['company-desktop'],
                        ].join(' ')}
                      >
                        {selectedPoint.company}
                      </div>
                      <div
                        className={[
                          styles['address'],
                          styles['address-desktop'],
                        ].join(' ')}
                      >
                        <Line.Place size={18} />
                        {t(selectedPoint.type as string)}
                        &nbsp;
                        {selectedPoint.placeName}
                      </div>
                      <div
                        className={[
                          styles['description'],
                          styles['description-desktop'],
                        ].join(' ')}
                      >
                        {selectedPoint.description}
                      </div>
                      <div
                        className={[
                          styles['go-to-store-button-container'],
                          styles['go-to-store-button-container-desktop'],
                        ].join(' ')}
                      >
                        <div>
                          <Button
                            classNames={{
                              button: styles['go-to-store-button'],
                            }}
                            rippleProps={{
                              color: 'rgba(133, 38, 122, .35)',
                            }}
                            icon={<Line.Store size={24} />}
                            block={true}
                            size={'large'}
                            type={'primary'}
                            onClick={() => onGoToStore(selectedPoint)}
                          >
                            {t('goToStore')}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </Popup>
              )}
            </Map>
          )}
        </div>
      </div>
    </ResponsiveDesktop>
  );
}
