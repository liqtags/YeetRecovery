import { ethers } from 'ethers';
import { FlashbotsBundleProvider } from '@flashbots/ethers-provider-bundle';
import dotenv from 'dotenv';
dotenv.config();

class CustomError extends Error {
    constructor(...args: any) {
        super(...args)
        Object.setPrototypeOf(this, new.target.prototype)
    }
}

const provider = new ethers.providers.JsonRpcProvider(process.env.PROVIDER_URL);

const createBundle = async (fundingWalletTransaction, claimTransaction, withdrawTransaction, flushTransaction) => {
    return [
        fundingWalletTransaction,
        claimTransaction,
        withdrawTransaction,
        flushTransaction
    ]
}

const yeetCover = async (
    provider: ethers.providers.JsonRpcProvider,
    transactions: any
) => {
    try {
        const flashbotsProvider = await FlashbotsBundleProvider.create(provider, ethers.Wallet.createRandom())
        provider.on('block', async (blockNumber: number) => {
            const bundle = await createBundle(transactions.fund, transactions.claim, transactions.withdraw, transactions.flush)
            const flashbotsTransactionResponse = await flashbotsProvider.sendBundle(bundle, blockNumber + 1);
            // in event of error produce error msg
            if ('error' in flashbotsTransactionResponse) {
                console.warn(flashbotsTransactionResponse.error.message)
                return
            }
            // simulate transaction
            console.log(await flashbotsTransactionResponse.simulate())
        })
    } catch (error) {
        throw new CustomError(error.message)
    }
}
