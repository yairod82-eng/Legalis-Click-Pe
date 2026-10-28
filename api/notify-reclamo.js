const esc = (s) =>
  String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]));

const oneLine = (s) => String(s == null ? '' : s).replace(/[\r\n]+/g, ' ').slice(0, 120);

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const secret = process.env.WEBHOOK_SECRET;
  if (!secret || req.headers['x-webhook-secret'] !== secret) {
    return res.status(401).json({ error: 'No autorizado' });
  }

  const r = (req.body && req.body.record) || {};
  if (!r.nombres) {
    return res.status(200).json({ ok: true, skipped: true });
  }

  let fecha = '';
  try {
    fecha = new Date(r.creado_en || Date.now()).toLocaleString('es-PE', {
      timeZone: 'America/Lima'
    });
  } catch (e) {}

  const filas = [
    ['Tipo', r.tipo],
    ['Nombres y apellidos', r.nombres],
    ['Documento', r.documento],
    ['Domicilio', r.domicilio],
    ['Teléfono', r.telefono],
    ['Correo', r.email],
    ['Servicio contratado', r.servicio],
    ['Monto reclamado', r.monto],
    ['Detalle', r.detalle],
    ['Pedido del consumidor', r.pedido],
    ['Fecha (hora de Lima)', fecha]
  ]
    .map(
      ([k, v]) =>
        '<tr><td style="padding:6px 12px;border:1px solid #ddd;background:#f5f5f5"><b>' +
        esc(k) +
        '</b></td><td style="padding:6px 12px;border:1px solid #ddd">' +
        esc(v || '—') +
        '</td></tr>'
    )
    .join('');

  const html =
    '<h2>Nuevo ' + esc(r.tipo || 'reclamo') + ' en el Libro de Reclamaciones</h2>' +
    '<table style="border-collapse:collapse;font-family:Arial,sans-serif;font-size:14px">' +
    filas +
    '</table>' +
    '<p style="font-family:Arial,sans-serif;font-size:12px;color:#666">' +
    'Respóndelo en un plazo máximo de 15 días calendario.</p>';

  const payload = {
    from: 'Legalis Click Perú <onboarding@resend.dev>',
    to: [process.env.NOTIFY_EMAIL],
    subject: 'Nuevo ' + oneLine(r.tipo || 'reclamo') + ': ' + oneLine(r.nombres),
    html: html
  };
  if (r.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(r.email)) {
    payload.reply_to = r.email;
  }

  try {
    const resp = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + process.env.RESEND_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    if (!resp.ok) {
      console.error('Resend error', resp.status, await resp.text());
      return res.status(502).json({ error: 'No se pudo enviar el correo' });
    }
    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('Fallo al enviar correo', err);
    return res.status(500).json({ error: 'Error interno' });
  }
};
