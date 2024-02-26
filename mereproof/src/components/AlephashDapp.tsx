import React, { useCallback } from 'react'
import { FC, useState, useEffect } from 'react'
import styles from '../styles/Home.module.css'
import { TxStatus } from './TxStatus'
import { useWallet } from '@alephium/web3-react'
import { web3, node, ExplorerProvider } from '@alephium/web3'
import { AlephashConfig, alephashConfig } from '@/services/utils'
import { anchorHash } from '@/services/alephash.service'
import configuration from '../../alephium.config'


export const AlephashDapp: FC<{
  config: AlephashConfig
}> = ({ config }) => {
  const { signer, account, explorerProvider, nodeProvider } = useWallet()

  const [hash, setHash] = useState('de1ec7ab1e5e1ec7edc0ffee')
  const [ongoingTxId, setOngoingTxId] = useState<string>()

  const handleHashSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (nodeProvider) web3.setCurrentNodeProvider(nodeProvider)

    if (signer) {
      const result = await anchorHash(signer, account, hash)
      console.log(result)
      setOngoingTxId(result.txId)
    }
  }

  const txStatusCallback = useCallback(
    async (status: node.TxStatus, numberOfChecks: number): Promise<any> => {
      if ((status.type === 'Confirmed' && numberOfChecks > 2) || (status.type === 'TxNotFound' && numberOfChecks > 3)) {
        setOngoingTxId(undefined)
        console.log(status.type);
      }

      return Promise.resolve()
    },
    [setOngoingTxId]
  )

  console.log('ongoing..', ongoingTxId)
  return (
    <>
      {ongoingTxId && <TxStatus txId={ongoingTxId} txStatusCallback={txStatusCallback} />}

      <div className="columns">
        <form onSubmit={handleHashSubmit}>
          <>
            <h2 className={styles.title}>Anchor hash on Alephium {config.network}</h2>
            <p>PublicKey: {account?.publicKey ?? '???'}</p>
            <label htmlFor="hash">Hash</label>
            <input
              type="string"
              id="hash"
              name="hash"
              value={hash}
              onChange={(e) => setHash(e.target.value)}
              disabled={alephashConfig.slave || !!ongoingTxId}
            />
            <br />
            {alephashConfig.slave || <input type="submit" disabled={!!ongoingTxId} value="Anchor hash" />}
          </>
        </form>
      </div>
    </>
  )
}
