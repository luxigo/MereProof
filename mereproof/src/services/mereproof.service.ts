import { DUST_AMOUNT, NodeProvider, ExplorerProvider, SignerProvider, Account, SignTransferTxResult } from '@alephium/web3'

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
