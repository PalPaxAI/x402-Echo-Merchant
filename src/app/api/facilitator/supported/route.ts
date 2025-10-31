import { NextResponse } from 'next/server';

export async function GET() {
  // get the url and headers for the facilitator
  const url = process.env.FACILITATOR_URL as `${string}://${string}`;
  const headers = {'Content-Type': 'application/json'};

  // make the request to the facilitator
  const res = await fetch(`${url}/supported`, {
    method: "GET",
    headers: headers,
  });

  // get the response from the facilitator
  const data = await res.json();

  // forward the response from the facilitator
  return NextResponse.json(data, { status: res.status });
}

