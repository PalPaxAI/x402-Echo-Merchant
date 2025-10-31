import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const POST = async (request: NextRequest) => {
  try {
    // Dynamic import to avoid evaluating refund.ts during build
    const { refund } = await import('../../../../refund');
    const { recipient, selectedPaymentRequirements, svmContext } = await request.json();
    if (!recipient || !selectedPaymentRequirements) {
      return NextResponse.json({ error: 'Missing recipient or payment requirements' }, { status: 400 });
    }

    const refundTxHash = await refund(recipient, selectedPaymentRequirements, svmContext);
    return NextResponse.json({ refundTxHash });
  } catch (error) {
    console.error('Refund API error:', error);
    return NextResponse.json({ error: 'Refund failed' }, { status: 500 });
  }
};


