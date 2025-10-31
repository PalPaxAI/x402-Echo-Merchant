// Helper module for Solana transaction parsing
// This is imported only when needed to reduce middleware bundle size

import { createSolanaRpc, decompileTransactionMessageFetchingLookupTables, getCompiledTransactionMessageDecoder } from "@solana/kit";
import { parseTransferCheckedInstruction } from "@solana-program/token-2022";
import { svm } from "x402/shared";
import type { ExactSvmPayload, PaymentPayload } from "x402/types";

const { decodeTransactionFromPayload } = svm;

export async function parseSolanaPayment(
  decodedPayment: PaymentPayload,
  network: string
): Promise<{
  payer: string;
  svmContext: {
    mint: string;
    sourceTokenAccount: string;
    destinationTokenAccount: string;
    decimals: number;
    tokenProgram?: string;
  };
}> {
  const rpcUrl = network === 'solana-devnet'
    ? (process.env.SOLANA_DEVNET_RPC_URL ?? 'https://api.devnet.solana.com')
    : (process.env.SOLANA_RPC_URL ?? 'https://api.mainnet-beta.solana.com');
  const rpc = createSolanaRpc(rpcUrl);
  const encodedSolanaTx = await decodeTransactionFromPayload(decodedPayment.payload as ExactSvmPayload);
  const compiledTransactionMessage = getCompiledTransactionMessageDecoder().decode(
    encodedSolanaTx.messageBytes,
  );
  const txMessage = await decompileTransactionMessageFetchingLookupTables(
    compiledTransactionMessage,
    rpc,
  );
  type TransferCheckedIx = {
    accounts: {
      authority: { address: string };
      mint: { address: string };
      destination: { address: string };
      source: { address: string };
    };
    data: { decimals: number };
    programAddress: string;
  };
  const ixIndex = txMessage.instructions.length > 3 ? 3 : 2;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const transferIx = parseTransferCheckedInstruction(txMessage.instructions[ixIndex] as any) as unknown as TransferCheckedIx;
  const payer = transferIx.accounts.authority.address;
  
  return {
    payer,
    svmContext: {
      mint: transferIx.accounts.mint.address,
      // reverse source/destination for refund
      sourceTokenAccount: transferIx.accounts.destination.address,
      destinationTokenAccount: transferIx.accounts.source.address,
      decimals: transferIx.data.decimals,
      tokenProgram: transferIx.programAddress,
    },
  };
}

