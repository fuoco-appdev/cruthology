/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable no-throw-literal */
import { Service } from "../service";
import {core} from '../protobuf/core';
import {BehaviorSubject, Observable} from 'rxjs';
import AuthService from "./auth.service";
import axios, { AxiosError } from 'axios';

class UserService extends Service {
    private readonly _activeUserBehaviorSubject: BehaviorSubject<core.User | null>;
    private readonly _encoder: TextEncoder;

    constructor() {
        super();

        this._activeUserBehaviorSubject = new BehaviorSubject<core.User | null>(null);
        this._encoder = new TextEncoder();
    }

    public get activeUserObservable(): Observable<core.User | null> {
        return this._activeUserBehaviorSubject.asObservable();
    }

    public clearActiveUser(): void {
        this._activeUserBehaviorSubject.next(null);
    }

    public async requestActiveUserAsync(): Promise<core.User> {
        const supabaseUser = AuthService.supabaseClient.auth.user();
        if (!supabaseUser) {
            throw new Error('No authenticated user');
        }
        const user = await this.requestUserAsync(supabaseUser.id);
        this._activeUserBehaviorSubject.next(user);
        return user;
    }

    public async requestUserAsync(supabaseId: string): Promise<core.User> {
        const response = await axios({
            method: 'post',
            url: `${this.endpointUrl}/user/${supabaseId}`,
            headers: {
                ...this.headers,
                'Session-Token': `${AuthService.supabaseClient.auth.session()?.access_token}`,
            },
            data: "",
        });

        if (response.data.status >= 400) {
            throw response.data as AxiosError;
        }

        const userResponse = core.User.deserializeBinary(this._encoder.encode(response.data));
        return userResponse;
    }

    public async requestAllUsersAsync(): Promise<core.Users> {
        const response = await axios({
            method: 'post',
            url: `${this.endpointUrl}/user/all`,
            headers: {
                ...this.headers,
                'Session-Token': `${AuthService.supabaseClient.auth.session()?.access_token}`,
            },
            data: "",
        });

        if (response.data.status >= 400) {
            throw response.data as AxiosError;
        }

        const usersResponse = core.Users.deserializeBinary(this._encoder.encode(response.data));
        return usersResponse;
    }

    public async requestCreateUserAsync(): Promise<core.User> {
        const supabaseUser = AuthService.supabaseClient.auth.user();
        if (!supabaseUser) {
            throw new Error('No authenticated user');
        }

        const user = new core.User({
            role: core.UserRole.USER,
            email: supabaseUser.email,
            request_status: core.UserRequestStatus.IDLE,
            apps: []
        });

        const response = await axios({
            method: 'post',
            url: `${this.endpointUrl}/user/create`,
            headers: {
                ...this.headers,
                'Session-Token': `${AuthService.supabaseClient.auth.session()?.access_token}`,
            },
            data: user.serialize(),
        });
        
        if (response.data.status >= 400) {
            throw response.data as AxiosError;
        }

        const userResponse = core.User.deserializeBinary(this._encoder.encode(response.data));
        this._activeUserBehaviorSubject.next(userResponse);

        return userResponse;
    }

    public async requestUpdateActiveUserAsync(props: {
        company?: string;
        email?: string;
        phone_number?: string;
        location?: core.Location;
        language?: string;
        request_status?: core.UserRequestStatus;
    }): Promise<core.User> {
        const supabaseUser = AuthService.supabaseClient.auth.user();
        if (!supabaseUser) {
            throw new Error('No authenticated user');
        }
        const user = await this.requestUpdateUserAsync(supabaseUser.id, props);
        this._activeUserBehaviorSubject.next(user);
        return user;
    }

    public async requestUpdateUserAsync(
        supabaseId: string, 
        props: {
            company?: string;
            email?: string;
            phone_number?: string;
            location?: core.Location;
            language?: string;
            request_status?: core.UserRequestStatus;
        }): Promise<core.User> {
        const user = new core.User(props);
        const response = await axios({
            method: 'post',
            url: `${this.endpointUrl}/user/update/${supabaseId}`,
            headers: {
                ...this.headers,
                'Session-Token': `${AuthService.supabaseClient.auth.session()?.access_token}`,
            },
            data: user.serialize(),
        });

        if (response.data.status >= 400) {
            throw response.data as AxiosError;
        }

        const userResponse = core.User.deserializeBinary(this._encoder.encode(response.data));
        return userResponse;
    }

    public async requestDeleteUserAsync(supabaseId: string): Promise<core.User> {
        const response = await axios({
            method: 'post',
            url: `${this.endpointUrl}/user/delete/${supabaseId}`,
            headers: {
                ...this.headers,
                'Session-Token': `${AuthService.supabaseClient.auth.session()?.access_token}`,
            },
            data: "",
        });
        
        if (response.data.status >= 400) {
            throw response.data as AxiosError;
        }

        const userResponse = core.User.deserializeBinary(this._encoder.encode(response.data));
        return userResponse;
    }
}

export default new UserService();