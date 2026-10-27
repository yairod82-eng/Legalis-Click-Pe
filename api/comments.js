// Legalis Click Perú - Comentarios (Supabase)
module.exports = async (req, res) => {
  const SB_URL = (process.env.SUPABASE_URL || '').replace(/\/$/, '');
  const KEY = process.env.SUPABASE_SERVICE_KEY;
  if (!SB_URL || !KEY) {
    return res.status(500).json({ error: 'Falta configurar Supabase en Vercel.' });
  }
  const headers = { apikey: KEY, 'Content-Type': 'application/json' };
  if (KEY.startsWith('eyJ')) headers.Authorization = `Bearer ${KEY}`;

  try {
    if (req.method === 'GET') {
      const r = await fetch(
        `${SB_URL}/rest/v1/comments?select=name,text,created_at&approved=eq.true&order=created_at.desc&limit=50`,
        { headers }
      );
      const data = await r.json();
      if (!r.ok) throw new Error(JSON.stringify(data).slice(0, 200));
      return res.status(200).json(data);
    }

    if (req.method === 'POST') {
      let b = req.body;
      if (typeof b === 'string') { try { b = JSON.parse(b); } catch (e) { b = {}; } }
      const name = String((b && b.name) || '').trim().slice(0, 40);
      const text = String((b && b.text) || '').trim().slice(0, 400);
      if (!name || !text) return res.status(400).json({ error: 'Faltan datos.' });
      const r = await fetch(`${SB_URL}/rest/v1/comments`, {
        method: 'POST',
        headers: { ...headers, Prefer: 'return=minimal' },
        body: JSON.stringify({ name, text })
      });
      if (!r.ok) throw new Error(await r.text());
      return res.status(201).json({ ok: true });
    }

    return res.status(405).json({ error: 'Método no permitido.' });
  } catch (e) {
    console.error('comments', String(e.message).slice(0, 300));
    return res.status(500).json({ error: 'No se pudo procesar la solicitud.' });
  }
};
