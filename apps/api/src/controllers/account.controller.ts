import { readAll } from 'https://deno.land/std@0.105.0/io/util.ts';
import * as HttpError from 'https://deno.land/x/http_errors@3.0.0/mod.ts';
import * as Oak from 'https://deno.land/x/oak@v11.1.0/mod.ts';
import { AdminGuard } from '../guards/admin.guard.ts';
import { AuthGuard } from '../guards/index.ts';
import { ContentType, Controller, Guard, Post } from '../index.ts';
import {
  AccountExistsRequest,
  AccountLikeRequest,
  AccountPresenceRequest,
  AccountRequest,
  AccountsRequest
} from '../protobuf/account_pb.js';
import AccountService from '../services/account.service.ts';
import SupabaseService from '../services/supabase.service.ts';

@Controller('/account')
export class AccountController {
  @Post('/webhook/document')
  @ContentType('application/json')
  public async handleWebhookDocumentAsync(
    context: Oak.RouterContext<
      string,
      Oak.RouteParams<string>,
      Record<string, any>
    >
  ): Promise<void> {
    const body = await context.request.body().value;
    const type = body['type'];
    const account = body['record'];
    if (type === 'INSERT') {
      await AccountService.addDocumentAsync(account);
    } else if (type === 'UPDATE') {
      await AccountService.updateDocumentAsync(account);
    } else if (type === 'DELETE') {
      await AccountService.deleteDocumentAsync(account);
    }

    context.response.status = 200;
  }

  @Post('/indexing')
  @Guard(AdminGuard)
  @ContentType('application/json')
  public async handleIndexingAsync(
    context: Oak.RouterContext<
      string,
      Oak.RouteParams<string>,
      Record<string, any>
    >
  ): Promise<void> {
    const data = await context.request.body().value;
    await AccountService.indexDocumentsAsync(data);
    context.response.status = 200;
  }

  @Post('/accounts')
  @Guard(AuthGuard)
  @ContentType('application/x-protobuf')
  public async getAccountsAsync(
    context: Oak.RouterContext<
      string,
      Oak.RouteParams<string>,
      Record<string, any>
    >
  ): Promise<void> {
    const body = await context.request.body({ type: 'reader' });
    const requestValue = await readAll(body.value);
    const request = AccountsRequest.deserializeBinary(requestValue);
    const response = await AccountService.findAccountsAsync(request);
    if (!response) {
      console.error('Cannot find accounts');
      return;
    }
    context.response.type = 'application/x-protobuf';
    context.response.body = response.serializeBinary();
  }

  @Post('/create')
  @Guard(AuthGuard)
  @ContentType('application/x-protobuf')
  public async createAccountAsync(
    context: Oak.RouterContext<
      string,
      Oak.RouteParams<string>,
      Record<string, any>
    >
  ): Promise<void> {
    const token = context.request.headers.get('session-token') ?? '';
    const supabaseUser = await SupabaseService.client.auth.getUser(token);
    if (!supabaseUser.data.user) {
      throw HttpError.createError(404, `Supabase user not found`);
    }

    const body = await context.request.body({ type: 'reader' });
    const requestValue = await readAll(body.value);
    const request = AccountRequest.deserializeBinary(requestValue);
    const data = await AccountService.createAsync(request);
    if (!data) {
      throw HttpError.createError(409, `Cannot create account`);
    }

    const response = AccountService.assignAndGetAccountProtocol(data);
    context.response.type = 'application/x-protobuf';
    context.response.body = response.serializeBinary();
  }

  @Post('/exists')
  @Guard(AuthGuard)
  @ContentType('application/x-protobuf')
  public async checkAccountExistsAsync(
    context: Oak.RouterContext<
      string,
      Oak.RouteParams<string>,
      Record<string, any>
    >
  ): Promise<void> {
    const body = await context.request.body({ type: 'reader' });
    const requestValue = await readAll(body.value);
    const accountExists = AccountExistsRequest.deserializeBinary(requestValue);
    const response = await AccountService.checkExistsAsync(accountExists);
    if (!response) {
      console.error('Cannot check if account exists.');
      return;
    }

    context.response.type = 'application/x-protobuf';
    context.response.body = response.serializeBinary();
  }

  @Post('/search')
  @Guard(AuthGuard)
  @ContentType('application/x-protobuf')
  public async getSearchAsync(
    context: Oak.RouterContext<
      string,
      Oak.RouteParams<string>,
      Record<string, any>
    >
  ): Promise<void> {
    const body = await context.request.body({ type: 'reader' });
    const requestValue = await readAll(body.value);
    const accountLikeRequest =
      AccountLikeRequest.deserializeBinary(requestValue);
    const response = await AccountService.findLikeAsync(accountLikeRequest);
    if (!response) {
      throw HttpError.createError(404, `No accounts were found`);
    }

    context.response.type = 'application/x-protobuf';
    context.response.body = response.serializeBinary();
  }

  @Post('/presence')
  @Guard(AuthGuard)
  @ContentType('application/x-protobuf')
  public async getPresenceAsync(
    context: Oak.RouterContext<
      string,
      Oak.RouteParams<string>,
      Record<string, any>
    >
  ): Promise<void> {
    const body = await context.request.body({ type: 'reader' });
    const requestValue = await readAll(body.value);
    const accountPresenceRequest =
      AccountPresenceRequest.deserializeBinary(requestValue);
    const response = await AccountService.findPresenceAsync(accountPresenceRequest);
    if (!response) {
      throw HttpError.createError(404, `No account presence were found`);
    }

    context.response.type = 'application/x-protobuf';
    context.response.body = response.serializeBinary();
  }

  @Post('/followers/search')
  @Guard(AuthGuard)
  @ContentType('application/x-protobuf')
  public async getFollowersSearchAsync(
    context: Oak.RouterContext<
      string,
      Oak.RouteParams<string>,
      Record<string, any>
    >
  ): Promise<void> {
    const body = await context.request.body({ type: 'reader' });
    const requestValue = await readAll(body.value);
    const accountLikeRequest =
      AccountLikeRequest.deserializeBinary(requestValue);
    const response = await AccountService.findFollowersLikeAsync(
      accountLikeRequest
    );
    if (!response) {
      throw HttpError.createError(404, `No accounts were found`);
    }

    context.response.type = 'application/x-protobuf';
    context.response.body = response.serializeBinary();
  }

  @Post('/following/search')
  @Guard(AuthGuard)
  @ContentType('application/x-protobuf')
  public async getFollowingSearchAsync(
    context: Oak.RouterContext<
      string,
      Oak.RouteParams<string>,
      Record<string, any>
    >
  ): Promise<void> {
    const body = await context.request.body({ type: 'reader' });
    const requestValue = await readAll(body.value);
    const accountLikeRequest =
      AccountLikeRequest.deserializeBinary(requestValue);
    const response = await AccountService.findFollowingLikeAsync(
      accountLikeRequest
    );
    if (!response) {
      throw HttpError.createError(404, `No accounts were found`);
    }

    context.response.type = 'application/x-protobuf';
    context.response.body = response.serializeBinary();
  }

  @Post('/update/:id')
  @Guard(AuthGuard)
  @ContentType('application/x-protobuf')
  public async updateAccountAsync(
    context: Oak.RouterContext<
      string,
      Oak.RouteParams<string>,
      Record<string, any>
    >
  ): Promise<void> {
    const paramsId = context.params['id'];
    const body = await context.request.body({ type: 'reader' });
    const requestValue = await readAll(body.value);
    const request = AccountRequest.deserializeBinary(requestValue);
    const data = await AccountService.updateAsync(paramsId, request);
    if (!data) {
      throw HttpError.createError(404, `Account data not found`);
    }

    const responseAccount = AccountService.assignAndGetAccountProtocol(data);
    context.response.type = 'application/x-protobuf';
    context.response.body = responseAccount.serializeBinary();
  }

  @Post('/delete/:id')
  @Guard(AuthGuard)
  @ContentType('application/x-protobuf')
  public async deleteAccountAsync(
    context: Oak.RouterContext<
      string,
      Oak.RouteParams<string>,
      Record<string, any>
    >
  ): Promise<void> {
    const paramsId = context.params['id'];
    await AccountService.deleteAsync(paramsId);

    const supabaseUser = await SupabaseService.client.auth.admin.deleteUser(
      paramsId
    );
    if (supabaseUser.error) {
      throw HttpError.createError(
        supabaseUser.error.status ?? 0,
        supabaseUser.error.message
      );
    }

    context.response.status = Oak.Status.OK;
  }

  @Post('/:id')
  @Guard(AuthGuard)
  @ContentType('application/x-protobuf')
  public async getAccountAsync(
    context: Oak.RouterContext<
      string,
      Oak.RouteParams<string>,
      Record<string, any>
    >
  ): Promise<void> {
    const paramsId = context.params['id'];
    const data = await AccountService.findAsync(paramsId);
    if (!data) {
      throw HttpError.createError(
        404,
        `Account with supabase id ${paramsId} not found`
      );
    }

    const account = AccountService.assignAndGetAccountProtocol(data);
    context.response.type = 'application/x-protobuf';
    context.response.body = account.serializeBinary();
  }
}
