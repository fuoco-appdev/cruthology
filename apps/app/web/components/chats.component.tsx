import { useObservable } from '@ngneat/use-observable';
import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { useNavigate, useParams } from 'react-router-dom';
import AccountController from '../../shared/controllers/account.controller';
import ChatController from '../../shared/controllers/chat.controller';
import { AccountDocument } from '../../shared/models/account.model';
import { ChatDocument, ChatState } from '../../shared/models/chat.model';
import { RoutePathsType } from '../../shared/route-paths-type';
import AccountService from '../../shared/services/account.service';
import ChatService from '../../shared/services/chat.service';
import { AuthenticatedComponent } from './authenticated.component';
import { ChatsSuspenseDesktopComponent } from './desktop/suspense/chats.suspense.desktop.component';
import { ChatsSuspenseMobileComponent } from './mobile/suspense/chats.suspense.mobile.component';

const ChatsDesktopComponent = React.lazy(
  () => import('./desktop/chats.desktop.component')
);
const ChatsMobileComponent = React.lazy(
  () => import('./mobile/chats.mobile.component')
);

export interface ChatsResponsiveProps {
  chatProps: ChatState;
  openEditDropdown: boolean;
  openNewPrivate: boolean;
  chatAccounts: Record<string, AccountDocument[]>;
  setOpenNewPrivate: (value: boolean) => void;
  setOpenEditDropdown: (value: boolean) => void;
  onNewPrivateClick: () => void;
  onAccountMessageItemClick: (account: AccountDocument) => void;
  onPrivateMessageClick: (account: AccountDocument) => void;
}

export default function ChatsComponent(): JSX.Element {
  const { id } = useParams();
  const navigate = useNavigate();
  const [chatProps] = useObservable(ChatController.model.store);
  const [chatDebugProps] = useObservable(ChatController.model.debugStore);
  const [accountProps] = useObservable(AccountController.model.store);
  const [openEditDropdown, setOpenEditDropdown] = useState<boolean>(false);
  const [openNewPrivate, setOpenNewPrivate] = useState<boolean>(false);
  const [chatAccounts, setChatAccounts] = useState<
    Record<string, AccountDocument[]>
  >({});

  const onNewPrivateClick = () => {
    setOpenEditDropdown(false);
    setOpenNewPrivate(true);
    ChatController.loadSearchedAccountsAsync();
  };

  const onAccountMessageItemClick = (account: AccountDocument) => {
    setOpenNewPrivate(false);
    setTimeout(() => navigate(`${RoutePathsType.Account}/${account.id}`), 150);
  };

  const onPrivateMessageClick = async (account: AccountDocument) => {
    await ChatController.createPrivateMessageAsync(account);
    setOpenNewPrivate(false);
  };

  const suspenceComponent = (
    <>
      <ChatsSuspenseDesktopComponent />
      <ChatsSuspenseMobileComponent />
    </>
  );

  if (chatDebugProps.suspense) {
    return suspenceComponent;
  }

  useEffect(() => {
    ChatController.loadChatsAsync();
  }, []);

  useEffect(() => {
    const account = accountProps.account;
    if (!account) {
      return;
    }

    const chatAccountRecord: Record<string, AccountDocument[]> = {};
    const accounts = Object.values(chatProps.accounts) as AccountDocument[];
    const chats = chatProps.chats as ChatDocument[];
    for (const chat of chats) {
      if (chat.type === 'private') {
        const privateChat = chat.private;
        const privateAccounts = accounts.filter(
          (value) =>
            privateChat?.account_ids?.includes(value?.id ?? '') &&
            value.id !== account.id
        );
        chatAccountRecord[chat.id ?? ''] = privateAccounts;
      }
    }

    setChatAccounts(chatAccountRecord);
  }, [chatProps.accounts, chatProps.chats, accountProps.account]);

  useEffect(() => {
    const accounts = chatProps.accounts as Record<string, AccountDocument>;
    const accountIds =
      Object.values(accounts)?.map((value) => value.id ?? '') ?? [];
    const subscription = AccountService.subscribeAccountPresence(
      accountIds,
      (payload: Record<string, any>) => {
        ChatController.updateAccountPresence(payload['new']);
      }
    );

    return () => {
      subscription?.unsubscribe();
    };
  }, [chatProps.accounts]);

  useEffect(() => {
    const chatIds = Object.keys(chatProps.chatSubscriptions);
    const chatSubscription = ChatService.subscribeToChats(
      chatIds,
      (payload) => {
        ChatController.onChatChangedAsync(payload);
      }
    );
    const seenMessageSubscription = ChatService.subscribeToSeenMessage(
      chatIds,
      (payload) => {
        ChatController.onSeenMessageChangedAsync(payload);
      }
    );
    return () => {
      chatSubscription?.unsubscribe();
      seenMessageSubscription?.unsubscribe();
    };
  }, [chatProps.chatSubscriptions]);

  return (
    <>
      <Helmet>
        <title>Chats | fuoco.appdev</title>
        <link rel="canonical" href={window.location.href} />
        <meta name="title" content={'Chats | fuoco.appdev'} />
        <meta
          name="description"
          content={
            'An exclusive wine club offering high-end dinners, entertainment, and enchanting wine tastings, providing a gateway to extraordinary cultural experiences.'
          }
        />
        <meta
          property="og:image"
          content={'https://cruthology.com/assets/opengraph/opengraph.jpg'}
        />
        <meta property="og:title" content={'Chats | fuoco.appdev'} />
        <meta
          property="og:description"
          content={
            'An exclusive wine club offering high-end dinners, entertainment, and enchanting wine tastings, providing a gateway to extraordinary cultural experiences.'
          }
        />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={window.location.href} />
      </Helmet>
      <React.Suspense fallback={suspenceComponent}>
        <AuthenticatedComponent>
          <ChatsDesktopComponent
            chatProps={chatProps}
            openEditDropdown={openEditDropdown}
            openNewPrivate={openNewPrivate}
            chatAccounts={chatAccounts}
            setOpenNewPrivate={setOpenNewPrivate}
            setOpenEditDropdown={setOpenEditDropdown}
            onNewPrivateClick={onNewPrivateClick}
            onAccountMessageItemClick={onAccountMessageItemClick}
            onPrivateMessageClick={onPrivateMessageClick}
          />
          <ChatsMobileComponent
            chatProps={chatProps}
            openEditDropdown={openEditDropdown}
            openNewPrivate={openNewPrivate}
            chatAccounts={chatAccounts}
            setOpenNewPrivate={setOpenNewPrivate}
            setOpenEditDropdown={setOpenEditDropdown}
            onNewPrivateClick={onNewPrivateClick}
            onAccountMessageItemClick={onAccountMessageItemClick}
            onPrivateMessageClick={onPrivateMessageClick}
          />
        </AuthenticatedComponent>
      </React.Suspense>
    </>
  );
}
