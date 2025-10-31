import { NextRequest, NextResponse } from 'next/server';
import { handlePaymentRoute } from '@/lib/paymentHandler';
import { getDynamicConfig, getPayToAddress } from '@/lib/networkConfig';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const facilitatorUrl = process.env.FACILITATOR_URL as `${string}://${string}`;
  const network = 'polygon';
  const payTo = getPayToAddress(network);
  const config = await getDynamicConfig(request, network);
  
  if (!payTo || !config) {
    return NextResponse.json({ error: 'Configuration error' }, { status: 500 });
  }

  return handlePaymentRoute(request, payTo as `0x${string}`, config, facilitatorUrl);
}
