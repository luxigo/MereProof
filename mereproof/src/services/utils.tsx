import { NetworkId } from '@alephium/web3'
// import { loadDeployments } from '../../artifacts/ts/deployments'

export interface MereProofConfig {
  network: NetworkId
}

function getNetwork(): NetworkId {
  const network = (process.env.NEXT_PUBLIC_NETWORK ?? 'testnet') as NetworkId
  return network
}

function getMereProofConfig(): MereProofConfig {
  const network = getNetwork()
  return { network }
}

export const mereProofConfig = getMereProofConfig()
