// import { StatusBar } from 'expo-status-bar';
// import { StyleSheet, Text, View } from 'react-native';

// export default function App() {
//   return (
//     <View style={styles.container}>
//       <Text>Open up App.tsx to start working on your app!</Text>
//       <StatusBar style="auto" />
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#fff',
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
// });



import React, {useMemo, useState} from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import {
  useWalletConnectModal,
  WalletConnectModal,
} from '@walletconnect/modal-react-native';
import Clipboard from '@react-native-clipboard/clipboard';

import {
  createPublicClient,
  createWalletClient,
  custom,
  parseEther,
  PublicClient,
  WalletClient,
} from 'viem';
import {mainnet} from 'viem/chains';

import ContractUtils from './utils/ContractUtils';
import ConfigUtils from './utils/ConfigUtils';
import {RequestModal} from './components/RequestModal';

function App(): JSX.Element {
  const {isConnected, provider, open} = useWalletConnectModal();
  const [modalVisible, setModalVisible] = useState(false);
  const [rpcResponse, setRpcResponse] = useState<any>();
  const [loading, setLoading] = useState(false);

  const walletClient: WalletClient | undefined = useMemo(
    () =>
      createWalletClient({
        chain: mainnet,
        transport: custom({
          async request({method, params}) {
            return await provider?.request({method, params});
          },
        }),
      }),
    [provider],
  );

  const publicClient: PublicClient | undefined = useMemo(
    () =>
      createPublicClient({
        chain: mainnet,
        transport: custom({
          async request({method, params}) {
            return await provider?.request({method, params});
          },
        }),
      }),
    [provider],
  );

  const onConnect = () => {
    if (isConnected) {
      return provider?.disconnect();
    }
    return open();
  };

  const onCopy = (value: string) => {
    Clipboard.setString(value);
  };

  const onResponse = (response: any) => {
    setRpcResponse(response);
    setLoading(false);
  };

  const onModalClose = () => {
    setModalVisible(false);
    setLoading(false);
    setRpcResponse(undefined);
  };

  const onAction = (callback: any) => async () => {
    try {
      setLoading(true);
      setModalVisible(true);
      const response = await callback();
      onResponse(response);
    } catch (error: any) {
      onResponse({
        error: error?.message || 'error',
      });
    }
  };

  const onSendTransaction = async () => {
    if (!walletClient) {
      return;
    }
    const [address] = await walletClient.getAddresses();

    const hash = await walletClient.sendTransaction({
      chain: mainnet,
      account: address,
      to: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045', // vitalik.eth
      value: parseEther('0.001'),
    });

    return {
      method: 'send transaction',
      response: hash,
    };
  };

  const onSignMessage = async () => {
    if (!walletClient) {
      return;
    }
    const [address] = await walletClient.getAddresses();

    const signature = await walletClient.signMessage({
      account: address,
      message: 'Hello World!',
    });
    return {
      method: 'sign message',
      signature: signature,
    };
  };

  const onReadContract = async () => {
    if (!walletClient || !publicClient) {
      return;
    }
    const [account] = await walletClient.getAddresses();

    const data = await publicClient.readContract({
      account,
      address: ContractUtils.contractAddress as `0x${string}`,
      abi: ContractUtils.goerliABI,
      functionName: 'totalSupply',
    });

    return {
      method: 'read contract',
      data,
    };
  };

  const onWriteContract = async () => {
    if (!walletClient || !publicClient) {
      return;
    }

    const [account] = await walletClient.getAddresses();

    const {request} = await publicClient.simulateContract({
      account,
      address: ContractUtils.contractAddress as `0x${string}`,
      abi: ContractUtils.goerliABI,
      functionName: 'mint',
    });
    const hash = await walletClient?.writeContract(request);

    return {
      method: 'write contract',
      response: hash,
    };
  };

  const actionButtonsTemplate = () => {
    if (!isConnected) {
      return null;
    }

    return (
      <>
        <TouchableOpacity
          style={[styles.button, !isConnected && styles.buttonDisabled]}
          disabled={!isConnected}
          onPress={onAction(onSendTransaction)}>
          <Text style={styles.buttonText}>Send Transaction</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, !isConnected && styles.buttonDisabled]}
          disabled={!isConnected}
          onPress={onAction(onSignMessage)}>
          <Text style={styles.buttonText}>Sign Message</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, !isConnected && styles.buttonDisabled]}
          disabled={!isConnected}
          onPress={onAction(onReadContract)}>
          <Text style={styles.buttonText}>Read Contract</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, !isConnected && styles.buttonDisabled]}
          disabled={!isConnected}
          onPress={onAction(onWriteContract)}>
          <Text style={styles.buttonText}>Write Contract</Text>
        </TouchableOpacity>
      </>
    );
  };

  return (
    <SafeAreaView>
      <View style={styles.container}>
        <Text style={styles.title}>WalletConnectModal + Viem</Text>
        <TouchableOpacity style={styles.button} onPress={onConnect}>
          <Text style={styles.buttonText}>
            {isConnected ? 'Disconnect' : 'Connect'}
          </Text>
        </TouchableOpacity>
        {actionButtonsTemplate()}
      </View>
      <WalletConnectModal
        projectId={ConfigUtils.ENV_PROJECT_ID}
        providerMetadata={ConfigUtils.providerMetadata}
        sessionParams={ConfigUtils.sessionParams}
        onCopyClipboard={onCopy}
      />
      <RequestModal
        isVisible={modalVisible}
        onClose={onModalClose}
        isLoading={loading}
        rpcResponse={rpcResponse}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    alignItems: 'center',
    height: '100%',
    justifyContent: 'center',
  },
  button: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#3396FF',
    borderRadius: 20,
    width: 150,
    height: 40,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
    marginTop: 4,
  },
  buttonDisabled: {
    backgroundColor: '#999',
  },
  buttonText: {
    color: 'white',
    fontWeight: '500',
  },
  title: {
    fontSize: 26,
    color: '#333',
    fontWeight: 'bold',
    marginBottom: 30,
  },
});

export default App;
