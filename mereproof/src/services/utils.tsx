import { NetworkId } from '@alephium/web3'

export interface AlephashConfig {
  network: NetworkId
  showUI: boolean
  slave: boolean
}

function getNetwork(): NetworkId {
  const network = (process.env.NEXT_PUBLIC_NETWORK ?? 'devnet') as NetworkId
  return network
}

function getAlephashConfig(): AlephashConfig {
  const network = getNetwork()
  const showUI = false
  const slave = true
  return { network, showUI, slave }
}

export const glob: any={}

export const alephashConfig = getAlephashConfig()
