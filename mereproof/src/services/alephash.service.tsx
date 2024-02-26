import { DUST_AMOUNT, NodeProvider, SignerProvider, Account, SignTransferTxResult } from '@alephium/web3'
import { getDefaultAlephiumWallet } from "@alephium/get-extension-wallet"

export const anchorHash = async (
  signerProvider: SignerProvider,
  account: Account,
  hash: string,
): Promise<SignTransferTxResult> => {

  if (!hash.match(/^[0-9a-f]+$/i)) {
    throw new Error('Hash must be a hexadecimal string.')
  }

  console.log("Tx", {
    destinations: [
      {
        address: account.address,
        attoAlphAmount: DUST_AMOUNT,
        message: hash
      }
    ],
    signerAddress: account.address
  })

  return await signerProvider.signAndSubmitTransferTx({
    destinations: [
      {
        address: account.address,
        attoAlphAmount: DUST_AMOUNT,
        message: hash
      }
    ],
    signerAddress: account.address
  })
}


