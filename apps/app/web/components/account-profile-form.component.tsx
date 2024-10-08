import { CountryDataProps } from '@fuoco.appdev/web-components/dist/cjs/src/components/input-phone-number/country-data';
import { useObservable } from '@ngneat/use-observable';
import * as React from 'react';
import StoreController from '../../shared/controllers/store.controller';
import { StoreState } from '../../shared/models/store.model';
import { AccountProfileFormSuspenseDesktopComponent } from './desktop/suspense/account-profile-form.suspense.desktop.component';
import { AccountProfileFormSuspenseMobileComponent } from './mobile/suspense/account-profile-form.suspense.mobile.component';

const AccountProfileFormDesktopComponent = React.lazy(
  () => import('./desktop/account-profile-form.desktop.component')
);
const AccountProfileFormMobileComponent = React.lazy(
  () => import('./mobile/account-profile-form.mobile.component')
);

export interface ProfileFormOnChangeCallbacks {
  firstName?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  lastName?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  username?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  birthday?: (event: React.ChangeEvent<HTMLInputElement>) => void;
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
  const [storeDebugProps] = useObservable(StoreController.model.debugStore);
  const [selectedCountry, setSelectedCountry] = React.useState<string>('');
  React.useEffect(() => {
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

  if (storeDebugProps.suspense) {
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
