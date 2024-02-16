import { DUST_AMOUNT, NodeProvider, SignerProvider, Account, SignTransferTxResult } from '@alephium/web3'
import { getDefaultAlephiumWallet } from "@alephium/get-extension-wallet"

export const anchorHash = async (
  signerProvider: SignerProvider,
  account: Account,
  hash: string,
): Promise<SignTransferTxResult> => {
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

