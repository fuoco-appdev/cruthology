import { useEffect, ChangeEvent, useState } from 'react';
import { useObservable } from '@ngneat/use-observable';
import {
  ResponsiveDesktop,
  ResponsiveMobile,
  ResponsiveTablet,
} from './responsive.component';
import StoreController from '../controllers/store.controller';
import { CountryDataProps } from '@fuoco.appdev/core-ui/dist/cjs/src/components/input-phone-number/country-data';
import { StoreState } from '../models/store.model';
import { lazy } from '@loadable/component';
import { AccountProfileFormSuspenseDesktopComponent } from './desktop/suspense/account-profile-form.suspense.desktop.component';
import React from 'react';
import { AccountProfileFormSuspenseMobileComponent } from './mobile/suspense/account-profile-form.suspense.mobile.component';

const AccountProfileFormDesktopComponent = lazy(
  () => import('./desktop/account-profile-form.desktop.component')
);
const AccountProfileFormTabletComponent = lazy(
  () => import('./tablet/account-profile-form.tablet.component')
);
const AccountProfileFormMobileComponent = lazy(
  () => import('./mobile/account-profile-form.mobile.component')
);

export interface ProfileFormOnChangeCallbacks {
  firstName?: (event: ChangeEvent<HTMLInputElement>) => void;
  lastName?: (event: ChangeEvent<HTMLInputElement>) => void;
  username?: (event: ChangeEvent<HTMLInputElement>) => void;
  birthday?: (event: ChangeEvent<HTMLInputElement>) => void;
  sex?: (value: 'male' | 'female') => void;
  phoneNumber?: (
    value: string,
    data: {} | CountryDataProps,
    event:
      | React.ChangeEvent<HTMLInputElement>
      | React.MouseEvent<HTMLButtonElement, MouseEvent>,
    formattedValue: string
  ) => void;
}

export interface ProfileFormErrors {
  firstName?: string;
  lastName?: string;
  username?: string;
  birthday?: string;
  sex?: string;
  phoneNumber?: string;
}

export interface ProfileFormValues {
  firstName?: string;
  lastName?: string;
  username?: string;
  birthday?: string;
  sex?: 'male' | 'female';
  phoneNumber?: string;
}

export interface AccountProfileFormProps {
  storeProps: StoreState;
  values?: ProfileFormValues;
  errors?: ProfileFormErrors;
  onChangeCallbacks?: ProfileFormOnChangeCallbacks;
}

export interface AccountProfileFormResponsiveProps
  extends AccountProfileFormProps {
  selectedCountry: string;
}

export default function AccountProfileFormComponent({
  storeProps,
  values,
  errors,
  onChangeCallbacks,
}: AccountProfileFormProps): JSX.Element {
  const [selectedCountry, setSelectedCountry] = useState<string>('');

  useEffect(() => {
    if (!storeProps.selectedRegion) {
      return;
    }

    for (const country of storeProps.selectedRegion.countries) {
      setSelectedCountry(country?.iso_2);
    }
  }, [storeProps.selectedRegion]);

  const suspenceComponent = (
    <>
      <AccountProfileFormSuspenseDesktopComponent />
      <AccountProfileFormSuspenseMobileComponent />
    </>
  );

  if (process.env['DEBUG_SUSPENSE'] === 'true') {
    return suspenceComponent;
  }

  return (
    <React.Suspense fallback={suspenceComponent}>
      <AccountProfileFormDesktopComponent
        storeProps={storeProps}
        values={values}
        errors={errors}
        onChangeCallbacks={onChangeCallbacks}
        selectedCountry={selectedCountry}
      />
      <AccountProfileFormTabletComponent
        storeProps={storeProps}
        values={values}
        errors={errors}
        onChangeCallbacks={onChangeCallbacks}
        selectedCountry={selectedCountry}
      />
      <AccountProfileFormMobileComponent
        storeProps={storeProps}
        values={values}
        errors={errors}
        onChangeCallbacks={onChangeCallbacks}
        selectedCountry={selectedCountry}
      />
    </React.Suspense>
  );
}
