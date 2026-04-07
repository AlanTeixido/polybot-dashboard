import { NextResponse } from "next/server";

export async function GET() {
  const key = process.env.SIMMER_API_KEY;
  const base = "https://api.simmer.markets/api/sdk";
  const headers = { Authorization: `Bearer ${key}` };

  const results: Record<string, unknown> = {};

  try {
    const posRes = await fetch(`${base}/positions`, { headers, cache: "no-store" });
    results.positions_status = posRes.status;
    results.positions_raw = await posRes.json();
  } catch (e) {
    results.positions_error = String(e);
  }

  try {
    const oppRes = await fetch(`${base}/markets/opportunities?limit=5`, { headers, cache: "no-store" });
    results.opportunities_status = oppRes.status;
    results.opportunities_raw = await oppRes.json();
  } catch (e) {
    results.opportunities_error = String(e);
  }

  return NextResponse.json(results);
}
