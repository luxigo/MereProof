import React, { useEffect } from 'react'
import Head from 'next/head'
import styles from '@/styles/Home.module.css'
import { AlephashDapp } from '@/components/AlephashDapp'
import { AlephiumConnectButton, useWallet } from '@alephium/web3-react'
import { alephashConfig } from '@/services/utils'
import { anchorHash } from '@/services/alephash.service'
import { SignTransferTxResult } from '@alephium/web3'
import { web3 } from '@alephium/web3'

interface AnchorHashCallback {
  type: string,
  hash: string,
  error?: string,
  txResult?: string
}
export default function Home() {

  useEffect(() => {
    if (window && window.focus) window.focus();
    if (window && window.parent && (window.parent as any).alephashLoaded) { // should be window.frameElement but it's undefined
      console.log((window.parent as any).alephashLoaded())
    }
  }, [])

  const { connectionStatus, signer, account, nodeProvider } = useWallet()

  useEffect(() => {
    function handleMessage(msg: any) {
      if (msg.origin != window.document.location.origin) {
        console.log('rejected message from ' + msg.origin, msg);
        return;
      }
      if (msg.data && msg.data.type) {
        switch (msg.data.type) {
          case "alph.anchorHash":
            {
              const reply: AnchorHashCallback = {
                type: "alph.anchorHashCallback",
                hash: msg.data.hash
              };
              if (nodeProvider) web3.setCurrentNodeProvider(nodeProvider)
              if (connectionStatus !== "connected") {
                reply.error = "E_NOTCONNECTED"
                window.parent && window.parent.postMessage(reply)
              } else {
                window.focus();
                anchorHash(signer, account, msg.data.hash)
                  .then((result: SignTransferTxResult) => {
                    reply.txResult = JSON.stringify(result);
                    window.parent && window.parent.postMessage(reply)
                  })
                  .catch((err) => {
                    console.log(err)
                    reply.error = err.message;
                    window.parent && window.parent.postMessage(reply)
                  })
              }
            }
            break
          default:
            console.log('unhandled message:', msg);
            break
        }
      }
    }
    window.addEventListener('message', handleMessage);

    window.parent && window.parent.postMessage({
       type: "alph.state",
       data: {
        connectionStatus: connectionStatus,
        signer: JSON.stringify(signer),
        account: JSON.stringify(account),
        nodeProvider: JSON.stringify(nodeProvider)
       }
    })

    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [connectionStatus, signer, account, nodeProvider]);

  useEffect(() => {
    if (window.parent) {
      window.parent.postMessage({ type: 'alph.connectionStatus', status: connectionStatus });
    }
  }, [connectionStatus]);

  return (
    <>
      <div className={styles.container}>
        <div id="alephiumConnectButton"><AlephiumConnectButton /></div>
        {alephashConfig.showUI &&
          <Head>
            <title>Alephash</title>
            <meta name="description" content="Anchor a hash on Alephium" />
            <meta name="viewport" content="width=device-width, initial-scale=1" />
            <link rel="icon" href="/favicon.ico" />
          </Head>
        }
        {alephashConfig.showUI && <AlephashDapp config={alephashConfig} />}
      </div>
    </>
  )
}
