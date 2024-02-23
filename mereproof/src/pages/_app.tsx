import React, { useState } from 'react'
import '@/styles/globals.css'
import type { AppProps } from 'next/app'
import { AlephiumWalletProvider } from '@alephium/web3-react'
import { mereProofConfig } from '@/services/utils'
import { NetworkId } from '@alephium/web3';


export default function App({ Component, pageProps }: AppProps) {

  const [networkId, setNetworkId] = useState<NetworkId>(mereProofConfig.network);

  return (
    <AlephiumWalletProvider
      theme="web95"
      network={networkId}
    >
      <Component {...pageProps} />
    </AlephiumWalletProvider>
  )
}
