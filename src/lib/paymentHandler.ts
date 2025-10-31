import { NextRequest, NextResponse } from "next/server";
import { Address, getAddress } from "viem";
import { exact } from "x402/schemes";
import {
  findMatchingPaymentRequirements,
  processPriceToAtomicAmount,
  safeBase64Encode,
  toJsonSafe,
} from "x402/shared";
import {
  FacilitatorConfig,
  moneySchema,
  ERC20TokenAmount,
  PaymentPayload,
  PaymentRequirements,
  Resource,
  RouteConfig,
  SupportedEVMNetworks,
  SupportedSVMNetworks
} from "x402/types";
import { type VerifyResponse } from "x402/types";
import { useFacilitator } from "x402/verify";
import { SolanaAddress } from 'x402-next';
import { handlePaidContentRequest } from "./paidContentHandler";

export async function handlePaymentRoute(
  request: NextRequest,
  payTo: Address | SolanaAddress,
  routeConfig: RouteConfig,
  facilitatorUrl: `${string}://${string}`,
) {
  const facilitator: FacilitatorConfig = { url: facilitatorUrl };
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const { verify, settle, supported } = useFacilitator(facilitator);
  const x402Version = 1;

  const pathname = request.nextUrl.pathname;
  const method = request.method.toUpperCase();

  const { price, network, config = {} } = routeConfig;
  const { description, mimeType, maxTimeoutSeconds, outputSchema, customPaywallHtml, resource, discoverable, inputSchema, errorMessages } =
    config;

  const atomicAmountForAsset = processPriceToAtomicAmount(price, network);
  if ("error" in atomicAmountForAsset) {
    return new NextResponse(atomicAmountForAsset.error, { status: 500 });
  }
  const { maxAmountRequired, asset } = atomicAmountForAsset;

  const resourceUrl =
    resource || (`${request.nextUrl.protocol}//${request.nextUrl.host}${pathname}` as Resource);

  const paymentRequirements: PaymentRequirements[] = [];
  
  if (SupportedEVMNetworks.includes(network)) {
    paymentRequirements.push({
      scheme: "exact",
      network,
      maxAmountRequired,
      resource: resourceUrl,
      description: description ?? "",
      mimeType: mimeType ?? "application/json",
      payTo: getAddress(payTo),
      maxTimeoutSeconds: maxTimeoutSeconds ?? 300,
      asset: getAddress(asset.address),
      outputSchema: {
        input: {
          type: "http",
          method,
          discoverable: discoverable ?? true,
          ...inputSchema,
        },
        output: outputSchema,
      },
      extra: (asset as ERC20TokenAmount["asset"]).eip712,
    });
  }
  // svm networks
  else if (SupportedSVMNetworks.includes(network)) {
    // network call to get the supported payments from the facilitator
    const paymentKinds = await supported();

    // find the payment kind that matches the network and scheme
    let feePayer: string | undefined;
    for (const kind of paymentKinds.kinds) {
      if (kind.network === network && kind.scheme === "exact") {
        feePayer = kind?.extra?.feePayer;
        break;
      }
    }

    // svm networks require a fee payer
    if (!feePayer) {
      throw new Error(`The facilitator did not provide a fee payer for network: ${network}.`);
    }

    // build the payment requirements for svm
    paymentRequirements.push({
      scheme: "exact",
      network,
      maxAmountRequired,
      resource: resourceUrl,
      description: description ?? "",
      mimeType: mimeType ?? "",
      payTo: payTo,
      maxTimeoutSeconds: maxTimeoutSeconds ?? 60,
      asset: asset.address,
      outputSchema: {
        input: {
          type: "http",
          method,
          ...inputSchema,
        },
        output: outputSchema,
      },
      extra: {
        feePayer,
      },
    });
  } else {
    throw new Error(`Unsupported network: ${network}`);
  }

  // Check for payment header
  const paymentHeader = request.headers.get("X-PAYMENT");
  if (!paymentHeader) {
    const accept = request.headers.get("Accept");
    if (accept?.includes("text/html")) {
      const userAgent = request.headers.get("User-Agent");
      if (userAgent?.includes("Mozilla")) {
        let displayAmount: number;
        if (typeof price === "string" || typeof price === "number") {
          const parsed = moneySchema.safeParse(price);
          if (parsed.success) {
            displayAmount = parsed.data;
          } else {
            displayAmount = Number.NaN;
          }
        } else {
          displayAmount = Number(price.amount) / 10 ** price.asset.decimals;
        }

        // Lazy load paywall HTML generator to reduce bundle size
        const { getLocalPaywallHtml } = await import("../paywall/getPaywallHtml");
        const html =
          customPaywallHtml ??
          getLocalPaywallHtml({
            amount: displayAmount,
            paymentRequirements: toJsonSafe(paymentRequirements) as Parameters<
              typeof getLocalPaywallHtml
            >[0]["paymentRequirements"],
            currentUrl: request.url,
            testnet: network === "base-sepolia" || network === "avalanche-fuji" || network === "sei-testnet" || network === "polygon-amoy" || network === "solana-devnet",
          });
        return new NextResponse(html, {
          status: 402,
          headers: { "Content-Type": "text/html" },
        });
      }
    }

    return new NextResponse(
      JSON.stringify({
        x402Version,
        error: "X-PAYMENT header is required",
        accepts: paymentRequirements,
      }),
      { status: 402, headers: { "Content-Type": "application/json" } },
    );
  }

  // Verify payment
  let decodedPayment: PaymentPayload;
  try {
    decodedPayment = exact.evm.decodePayment(paymentHeader);
    decodedPayment.x402Version = x402Version;
  } catch (error) {
    return new NextResponse(
      JSON.stringify({
        x402Version,
        error: error instanceof Error ? error : "Invalid payment",
        accepts: paymentRequirements,
      }),
      { status: 402, headers: { "Content-Type": "application/json" } },
    );
  }

  const selectedPaymentRequirements = findMatchingPaymentRequirements(
    paymentRequirements,
    decodedPayment,
  );
  if (!selectedPaymentRequirements) {
    return new NextResponse(
      JSON.stringify({
        x402Version,
        error: "Unable to find matching payment requirements",
        accepts: toJsonSafe(paymentRequirements),
      }),
      { status: 402, headers: { "Content-Type": "application/json" } },
    );
  }

  // Verify payment via API route
  const verification: VerifyResponse = await verify(decodedPayment, selectedPaymentRequirements);

  if (!verification.isValid) {
    return new NextResponse(
      JSON.stringify({
        x402Version,
        error: errorMessages?.verificationFailed || verification.invalidReason,
        accepts: paymentRequirements,
        payer: verification.payer,
      }),
      { status: 402, headers: { "Content-Type": "application/json" } },
    );
  }

  // Settle payment
  try {
    const settlement = await settle(decodedPayment, selectedPaymentRequirements);

    if (settlement.success) {
      let payer: string;
      let svmContext: {
        mint: string;
        sourceTokenAccount: string;
        destinationTokenAccount: string;
        decimals: number;
        tokenProgram?: string;
      } | undefined;
      
      if (SupportedSVMNetworks.includes(settlement.network)) {
        // Lazy load Solana parser to reduce bundle size
        const { parseSolanaPayment } = await import("./solanaParser");
        const result = await parseSolanaPayment(decodedPayment, settlement.network);
        payer = result.payer;
        svmContext = result.svmContext;
      } else {
        payer = settlement.payer || "";
      }

      const responseHeaderData = {
        success: true,
        transaction: settlement.transaction,
        network: settlement.network,
        payer,
      };
      const paymentResponseHeader = safeBase64Encode(
        JSON.stringify(responseHeaderData),
      );

      if (!payer || payer === "") {
        return new NextResponse(
          JSON.stringify({ error: "Payment settled but payer information unavailable" }),
          { status: 500 }
        );
      }
      
      // refund the payment via Node API route
      const apiUrl = `${request.nextUrl.protocol}//${request.nextUrl.host}/api/facilitator/refund`;
      const refundResp = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipient: payer, selectedPaymentRequirements, svmContext }),
      });
      
      const refundTxHash = refundResp.ok ? (await refundResp.json()).refundTxHash : undefined;
      
      // Build a request for the paidContentHandler with the payment info header
      const forwardHeaders = new Headers();
      const acceptHeader = request.headers.get('accept');
      const userAgentHeader = request.headers.get('user-agent');
      if (acceptHeader) forwardHeaders.set('accept', acceptHeader);
      if (userAgentHeader) forwardHeaders.set('user-agent', userAgentHeader);
      forwardHeaders.set('x-payment-response', paymentResponseHeader);
      const handlerRequest = new NextRequest(request.url, { headers: forwardHeaders, method: 'GET' });
      
      const handlerResponse = await handlePaidContentRequest(handlerRequest, network as unknown as string, refundTxHash);
      handlerResponse.headers.set('X-PAYMENT-RESPONSE', paymentResponseHeader);
      return handlerResponse;
    } else {
      return new NextResponse(
        JSON.stringify({
          x402Version,
          error: "Settlement failed",
          accepts: paymentRequirements,
        }),
        { status: 402, headers: { "Content-Type": "application/json" } },
      );
    }
  } catch (error) {
    console.error("error", error);

    return new NextResponse(
      JSON.stringify({
        x402Version,
        error:
          errorMessages?.settlementFailed ||
          (error instanceof Error ? error.message : "Settlement failed"),
        accepts: paymentRequirements,
      }),
      { status: 402, headers: { "Content-Type": "application/json" } },
    );
  }
}

