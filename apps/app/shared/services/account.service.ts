import { RealtimeChannel, Session } from '@supabase/supabase-js';
import axios from 'axios';
import { BehaviorSubject, Observable } from 'rxjs';
import {
  AccountExistsRequest,
  AccountExistsResponse,
  AccountLikeRequest,
  AccountPresenceRequest,
  AccountPresenceResponse,
  AccountPresencesResponse,
  AccountRequest,
  AccountResponse,
  AccountsRequest,
  AccountsResponse,
} from '../protobuf/account_pb';
import { Service } from '../service';
import SupabaseService from './supabase.service';

class AccountService extends Service {
  private readonly _activeAccountBehaviorSubject: BehaviorSubject<AccountResponse | null>;
  private readonly _accountsBehaviorSubject: BehaviorSubject<AccountResponse[]>;

  constructor() {
    super();

    this._activeAccountBehaviorSubject =
      new BehaviorSubject<AccountResponse | null>(null);
    this._accountsBehaviorSubject = new BehaviorSubject<AccountResponse[]>([]);
  }

  public get activeAccountObservable(): Observable<AccountResponse | null> {
    return this._activeAccountBehaviorSubject.asObservable();
  }

  public get accountsObservable(): Observable<AccountResponse[]> {
    return this._accountsBehaviorSubject.asObservable();
  }

  public get activeAccount(): AccountResponse | null {
    return this._activeAccountBehaviorSubject.getValue();
  }

  public clearActiveAccount(): void {
    this._activeAccountBehaviorSubject.next(null);
  }

  public async requestActiveAsync(session: Session): Promise<AccountResponse> {
    const account = await this.requestAsync(session, session.user.id);
    this._activeAccountBehaviorSubject.next(account);
    return account;
  }

  public async requestAsync(
    session: Session,
    supabaseId: string
  ): Promise<AccountResponse> {
    const response = await axios({
      method: 'post',
      url: `${this.endpointUrl}/account/${supabaseId}`,
      headers: {
        ...this.headers,
        'Session-Token': `${session?.access_token}`,
      },
      data: '',
      responseType: 'arraybuffer',
    });

    const arrayBuffer = new Uint8Array(response.data);
    this.assertResponse(arrayBuffer);

    const accountResponse = AccountResponse.fromBinary(arrayBuffer);
    return accountResponse;
  }

  public async requestAccountsAsync(
    accountIds: string[]
  ): Promise<AccountsResponse> {
    const session = await SupabaseService.requestSessionAsync();
    const request = new AccountsRequest({
      accountIds: accountIds,
    });
    const response = await axios({
      method: 'post',
      url: `${this.endpointUrl}/account/accounts`,
      headers: {
        ...this.headers,
        'Session-Token': `${session?.access_token}`,
      },
      data: request.toBinary(),
      responseType: 'arraybuffer',
    });

    const arrayBuffer = new Uint8Array(response.data);
    this.assertResponse(arrayBuffer);

    const accountsResponse = AccountsResponse.fromBinary(arrayBuffer);
    return accountsResponse;
  }

  public async requestCreateAsync(session: Session): Promise<AccountResponse> {
    const account = new AccountRequest({
      supabaseId: session.user.id,
    });
    const response = await axios({
      method: 'post',
      url: `${this.endpointUrl}/account/create`,
      headers: {
        ...this.headers,
        'Session-Token': `${session?.access_token}`,
      },
      data: account.toBinary(),
      responseType: 'arraybuffer',
    });

    const arrayBuffer = new Uint8Array(response.data);
    this.assertResponse(arrayBuffer);

    const accountResponse = AccountResponse.fromBinary(arrayBuffer);
    if (this.activeAccount?.toJsonString() !== accountResponse.toJsonString()) {
      this._activeAccountBehaviorSubject.next(accountResponse);
    }

    return accountResponse;
  }

  public async requestExistsAsync(
    username: string
  ): Promise<AccountExistsResponse> {
    const session = await SupabaseService.requestSessionAsync();
    const request = new AccountExistsRequest({
      username: username,
    });
    const response = await axios({
      method: 'post',
      url: `${this.endpointUrl}/account/exists`,
      headers: {
        ...this.headers,
        'Session-Token': `${session?.access_token}`,
      },
      data: request.toBinary(),
      responseType: 'arraybuffer',
    });

    const arrayBuffer = new Uint8Array(response.data);
    this.assertResponse(arrayBuffer);

    const accountExistsResponse = AccountExistsResponse.fromBinary(arrayBuffer);
    return accountExistsResponse;
  }

  public async requestUpdateActiveAsync(props: {
    customerId?: string;
    profileUrl?: string;
    status?: 'Incomplete' | 'Complete';
    languageCode?: string;
    username?: string;
    birthday?: string;
    sex?: 'male' | 'female';
    interests?: string[];
    metadata?: string;
  }): Promise<AccountResponse> {
    const supabaseUser = await SupabaseService.requestUserAsync();
    if (!supabaseUser) {
      throw new Error('No user');
    }

    const account = await this.requestUpdateAsync(supabaseUser.id, props);
    if (this.activeAccount?.toJsonString() !== account.toJsonString()) {
      this._activeAccountBehaviorSubject.next(account);
    }
    return account;
  }

  public async requestUpdateAsync(
    supabaseId: string,
    props: {
      customerId?: string;
      profileUrl?: string;
      status?: 'Incomplete' | 'Complete';
      languageCode?: string;
      username?: string;
      birthday?: string;
      sex?: 'male' | 'female';
      interests?: string[];
      metadata?: string;
    }
  ): Promise<AccountResponse> {
    const session = await SupabaseService.requestSessionAsync();
    const user = new AccountRequest({
      customerId: props.customerId,
      profileUrl: props.profileUrl,
      status: props.status,
      languageCode: props.languageCode,
      username: props.username,
      birthday: props.birthday,
      sex: props.sex,
      interests: props.interests,
      metadata: props.metadata,
    });

    const response = await axios({
      method: 'post',
      url: `${this.endpointUrl}/account/update/${supabaseId}`,
      headers: {
        ...this.headers,
        'Session-Token': `${session?.access_token}`,
      },
      data: user.toBinary(),
      responseType: 'arraybuffer',
    });

    const arrayBuffer = new Uint8Array(response.data);
    this.assertResponse(arrayBuffer);

    const accountResponse = AccountResponse.fromBinary(arrayBuffer);
    return accountResponse;
  }

  public async requestActiveDeleteAsync(): Promise<void> {
    const supabaseUser = await SupabaseService.requestUserAsync();
    if (!supabaseUser) {
      throw new Error('No user');
    }

    await this.requestDeleteAsync(supabaseUser.id);
  }

  public async requestDeleteAsync(supabaseId: string): Promise<void> {
    const session = await SupabaseService.requestSessionAsync();
    const response = await axios({
      method: 'post',
      url: `${this.endpointUrl}/account/delete/${supabaseId}`,
      headers: {
        ...this.headers,
        'Session-Token': `${session?.access_token}`,
      },
      data: '',
    });

    if (response.status > 400) {
      throw new response.data();
    }
  }

  public async requestSearchAsync(props: {
    queryUsername: string;
    accountId: string;
    offset?: number;
    limit?: number;
  }): Promise<AccountsResponse> {
    const session = await SupabaseService.requestSessionAsync();
    const request = new AccountLikeRequest({
      queryUsername: props.queryUsername,
      accountId: props.accountId,
      offset: props.offset,
      limit: props.limit,
    });
    const response = await axios({
      method: 'post',
      url: `${this.endpointUrl}/account/search`,
      headers: {
        ...this.headers,
        'Session-Token': `${session?.access_token}`,
      },
      data: request.toBinary(),
      responseType: 'arraybuffer',
    });

    const arrayBuffer = new Uint8Array(response.data);
    this.assertResponse(arrayBuffer);

    const accountsResponse = AccountsResponse.fromBinary(arrayBuffer);
    this._accountsBehaviorSubject.next(accountsResponse.accounts);
    return accountsResponse;
  }

  public async requestFollowersSearchAsync(props: {
    queryUsername: string;
    accountId: string;
    offset?: number;
    limit?: number;
  }): Promise<AccountsResponse> {
    const session = await SupabaseService.requestSessionAsync();
    const request = new AccountLikeRequest({
      queryUsername: props.queryUsername,
      accountId: props.accountId,
      offset: props.offset,
      limit: props.limit,
    });
    const response = await axios({
      method: 'post',
      url: `${this.endpointUrl}/account/followers/search`,
      headers: {
        ...this.headers,
        'Session-Token': `${session?.access_token}`,
      },
      data: request.toBinary(),
      responseType: 'arraybuffer',
    });

    const arrayBuffer = new Uint8Array(response.data);
    this.assertResponse(arrayBuffer);

    const accountsResponse = AccountsResponse.fromBinary(arrayBuffer);
    return accountsResponse;
  }

  public async requestFollowingSearchAsync(props: {
    queryUsername: string;
    accountId: string;
    offset?: number;
    limit?: number;
  }): Promise<AccountsResponse> {
    const session = await SupabaseService.requestSessionAsync();
    const request = new AccountLikeRequest({
      queryUsername: props.queryUsername,
      accountId: props.accountId,
      offset: props.offset,
      limit: props.limit,
    });
    const response = await axios({
      method: 'post',
      url: `${this.endpointUrl}/account/following/search`,
      headers: {
        ...this.headers,
        'Session-Token': `${session?.access_token}`,
      },
      data: request.toBinary(),
      responseType: 'arraybuffer',
    });

    const arrayBuffer = new Uint8Array(response.data);
    this.assertResponse(arrayBuffer);

    const accountsResponse = AccountsResponse.fromBinary(arrayBuffer);
    return accountsResponse;
  }

  public async requestPresenceAsync(props: {
    accountIds: string[]
  }): Promise<AccountPresenceResponse[]> {
    const session = await SupabaseService.requestSessionAsync();
    const request = new AccountPresenceRequest({
      accountIds: props.accountIds
    });
    const response = await axios({
      method: 'post',
      url: `${this.endpointUrl}/account/presence`,
      headers: {
        ...this.headers,
        'Session-Token': `${session?.access_token}`,
      },
      data: request.toBinary(),
      responseType: 'arraybuffer',
    });

    const arrayBuffer = new Uint8Array(response.data);
    this.assertResponse(arrayBuffer);

    const accountPresencesResponse = AccountPresencesResponse.fromBinary(arrayBuffer);
    return accountPresencesResponse.accountPresences;
  }

  public async requestUpsertAccountPresenceAsync(
    accountId: string,
    isOnline: boolean
  ): Promise<void> {
    const date = new Date(Date.now());
    const response = await SupabaseService.supabaseClient
      ?.from('account_presence')
      .upsert({
        account_id: accountId,
        is_online: isOnline,
        last_seen: date.toUTCString(),
      });

    if (response?.error) {
      console.error("Can't upsert account presence:", response.error);
    }
  }

  public subscribeAccountPresence(accountIds: string[], onPayload: (payload: Record<string, any>) => void): RealtimeChannel | undefined {
    return SupabaseService.supabaseClient?.channel('account-presence-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'account_presence',
          filter: `account_id=in.(${accountIds.join(',')})`
        },
        onPayload,
      )
      .subscribe();
  }
}

export default new AccountService();
