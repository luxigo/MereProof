import React from 'react'
import '@/styles/globals.css'
import type { AppProps } from 'next/app'
import { AlephiumWalletProvider } from '@alephium/web3-react'
import { alephashConfig } from '@/services/utils'

export default function App({ Component, pageProps }: AppProps) {
  return (
    <AlephiumWalletProvider
      //theme="web95"
      network={alephashConfig.network}
    >
      <Component {...pageProps} />
    </AlephiumWalletProvider>
  )
}
