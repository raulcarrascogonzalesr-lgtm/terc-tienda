// Gasto en publicidad de Meta (Facebook e Instagram) para el panel, solo lectura.
// META_ADS_TOKEN: token de un usuario del sistema con permiso ads_read.
// META_AD_ACCOUNT_ID: número de la cuenta publicitaria (con o sin "act_").
const GRAPH = "https://graph.facebook.com/v23.0";

function credentials() {
  const token = process.env.META_ADS_TOKEN;
  const account = process.env.META_AD_ACCOUNT_ID?.replace(/^act_/, "").trim();
  return token && account ? { token, account } : null;
}

export function metaAdsConnected() {
  return credentials() !== null;
}

export type AdCampaign = { name: string; spend: number; impressions: number; clicks: number };
export type AdSpend = { spend: number; impressions: number; clicks: number; campaigns: AdCampaign[] };

// Fechas en formato AAAA-MM-DD. El gasto viene en la moneda de la cuenta (CLP) y sin IVA.
export async function getAdSpend(since: string, until: string): Promise<AdSpend | null> {
  const creds = credentials();
  if (!creds) return null;
  const params = new URLSearchParams({
    level: "campaign",
    fields: "campaign_name,spend,impressions,clicks",
    time_range: JSON.stringify({ since, until }),
    limit: "100",
    access_token: creds.token,
  });
  const res = await fetch(`${GRAPH}/act_${creds.account}/insights?${params}`, {
    cache: "no-store",
    signal: AbortSignal.timeout(15_000),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error?.message ?? "Meta no respondió");
  const campaigns: AdCampaign[] = (data.data ?? []).map((r: Record<string, string>) => ({
    name: r.campaign_name,
    spend: Math.round(Number(r.spend ?? 0)),
    impressions: Number(r.impressions ?? 0),
    clicks: Number(r.clicks ?? 0),
  }));
  campaigns.sort((a, b) => b.spend - a.spend);
  return {
    spend: campaigns.reduce((s, c) => s + c.spend, 0),
    impressions: campaigns.reduce((s, c) => s + c.impressions, 0),
    clicks: campaigns.reduce((s, c) => s + c.clicks, 0),
    campaigns,
  };
}
