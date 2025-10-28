type RequestLike = {
  method?: string;
  headers: Record<string, string | string[] | undefined>;
};

type ResponseLike = {
  status: (code: number) => ResponseLike;
  json: (body: unknown) => void;
};

function getHeader(req: RequestLike, name: string): string | undefined {
  const value = req.headers[name] ?? req.headers[name.toLowerCase()];
  if (Array.isArray(value)) return value[0];
  return value as string | undefined;
}

export default async function handler(req: RequestLike, res: ResponseLike) {
  try {
    // Optional simple auth for cron invocations
    const token = process.env.AUTOMATION_TRIGGER_TOKEN;
    if (token) {
      const incoming = getHeader(req, 'x-automation-trigger');
      if (incoming !== token) {
        res.status(401).json({ ok: false, error: 'unauthorized' });
        return;
      }
    }

    const functionUrl = process.env.SUPABASE_FUNCTION_AUTOMATION_URL; // e.g. https://<ref>.functions.supabase.co/automation-runner
    const secret = process.env.AUTOMATION_RUNNER_SECRET; // same one configured in the edge function
    if (!functionUrl || !secret) {
      res.status(500).json({ ok: false, error: 'missing env SUPABASE_FUNCTION_AUTOMATION_URL or AUTOMATION_RUNNER_SECRET' });
      return;
    }

    const response = await fetch(functionUrl, {
      method: 'POST',
      headers: { 'x-automation-secret': secret },
    });
    const body = await response.text();
    let json: unknown;
    try { json = JSON.parse(body); } catch { json = { raw: body }; }
    res.status(response.status).json({ ok: response.ok, ...((typeof json === 'object' && json) || {}) });
  } catch (e) {
    res.status(500).json({ ok: false, error: (e as Error).message });
  }
}

