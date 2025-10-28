import { createClient } from '@supabase/supabase-js';

type RequestLike = {
  method?: string;
  headers: Record<string, string | string[] | undefined>;
};

type ResponseLike = {
  status: (code: number) => ResponseLike;
  json: (body: unknown) => void;
};

function extractHeader(req: RequestLike, name: string): string | undefined {
  const value = req.headers[name] ?? req.headers[name.toLowerCase()];
  if (Array.isArray(value)) return value[0];
  return value as string | undefined;
}

export default async function handler(req: RequestLike, res: ResponseLike) {
  if (process.env.AFF_CRON_TOKEN) {
    const token = extractHeader(req, 'x-aff-cron-token');
    if (token !== process.env.AFF_CRON_TOKEN) {
      res.status(401).json({ ok: false, error: 'unauthorized' });
      return;
    }
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE ?? process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceKey) {
    res.status(500).json({ ok: false, error: 'missing supabase credentials' });
    return;
  }

  const supabase = createClient(supabaseUrl, serviceKey);
  const now = new Date();
  const prev = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 1, 1));
  const year = prev.getUTCFullYear();
  const month = prev.getUTCMonth() + 1;

  const { error } = await supabase.rpc('generate_monthly_commissions', {
    p_year: year,
    p_month: month,
  });

  if (error) {
    res.status(500).json({ ok: false, error });
    return;
  }

  res.status(200).json({ ok: true, year, month });
}
