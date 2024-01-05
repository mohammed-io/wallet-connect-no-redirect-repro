import {IProviderMetadata} from '@walletconnect/modal-react-native';

const EXPO_PUBLIC_PROJECT_ID = process.env.EXPO_PUBLIC_PROJECT_ID

if (!EXPO_PUBLIC_PROJECT_ID) {
  throw new Error('EXPO_PUBLIC_PROJECT_ID is not defined')
}

const providerMetadata: IProviderMetadata = {
  name: 'Modal with Viem',
  description: 'RN example using Viem by WalletConnect',
  url: 'https://walletconnect.com/',
  icons: ['https://avatars.githubusercontent.com/u/37784886'],
  redirect: {
    native: 'com.anonymous.testwalletconnect://',
  },
};

const sessionParams = {
  namespaces: {
    eip155: {
      methods: ['eth_sendTransaction', 'personal_sign'],
      chains: ['eip155:137'],
      events: ['chainChanged', 'accountsChanged'],
      rpcMap: {},
    },
  },
};

export default {
  EXPO_PUBLIC_PROJECT_ID,
  providerMetadata,
  sessionParams,
};
