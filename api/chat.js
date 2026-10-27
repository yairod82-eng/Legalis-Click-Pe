// Legalis Click Perú - Chatbot con Gemini (gratis) + historial en Supabase
const SYSTEM = `Eres el asistente virtual de Legalis Click Perú.
Reglas obligatorias:
1. Sé extremadamente empático, cálido y usa lenguaje sencillo, sin tecnicismos innecesarios.
2. En temas jurídicos básate estrictamente en el marco legal peruano vigente. Cuando la pregunta dependa de una norma (derechos, plazos, trámites, delitos, beneficios), menciona la ley o código aplicable por su nombre, por ejemplo:
   - Constitución Política del Perú de 1993 (derechos fundamentales)
   - Código Civil (D. Leg. 295) y Código Procesal Civil
   - Código Penal (D. Leg. 635) y Nuevo Código Procesal Penal (D. Leg. 957)
   - Código de los Niños y Adolescentes (Ley 27337): alimentos, tenencia, régimen de visitas
   - Ley 30364: violencia contra las mujeres e integrantes del grupo familiar
   - TUO del D. Leg. 728 (D.S. 003-97-TR): despidos y derechos laborales; Nueva Ley Procesal del Trabajo (Ley 29497)
   - Ley 29571: Código de Protección y Defensa del Consumidor
   - Ley 29733: protección de datos personales
3. Está PROHIBIDO inventar leyes, artículos, plazos, montos o instituciones. Menciona el nombre de la ley y solo cita el número de artículo si estás completamente seguro. Si no lo estás, di que debe confirmarse en la norma vigente (por ejemplo en el SPIJ del MINJUS) o con un abogado colegiado, la Defensa Pública del MINJUS o una DEMUNA.
4. Menciona leyes solo cuando aporten a la respuesta, máximo una o dos por respuesta. En saludos, conversación general o preguntas no legales, no cites ninguna.
5. Recuerda que tu orientación es general y no reemplaza el patrocinio de un abogado colegiado.
6. Si la persona describe peligro, violencia o una emergencia, indícale llamar de inmediato al 105 (Policía) o al 100 (violencia familiar).
7. Responde en español, de forma clara y ordenada, en pocos párrafos.
8. No uses markdown: nada de asteriscos, almohadillas ni viñetas con guiones. Escribe en texto plano.`;

// Se prueban en orden; si uno no existe (404), pasa al siguiente.
const MODELS = ['gemini-flash-latest', 'gemini-3.8-flash', 'gemini-3.5-flash-lite', 'gemini-3.1-flash-lite'];

// Guarda la consulta en Supabase (si falla, el chat sigue funcionando igual)
async function guardar(session, question, answer) {
  const SB_URL = (process.env.SUPABASE_URL || '').replace(/\/$/, '');
  const KEY = process.env.SUPABASE_SERVICE_KEY;
  if (!SB_URL || !KEY) return;
  const headers = { apikey: KEY, 'Content-Type': 'application/json', Prefer: 'return=minimal' };
  if (KEY.startsWith('eyJ')) headers.Authorization = `Bearer ${KEY}`;
  try {
    await fetch(`${SB_URL}/rest/v1/chat_history`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ session_id: session, question, answer })
    });
  } catch (e) {
    console.error('No se pudo guardar el historial', e.message);
  }
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ reply: 'Método no permitido.' });
  }
  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    return res.status(500).json({ reply: 'Falta configurar la clave GEMINI_API_KEY en Vercel.' });
  }

  let body = req.body;
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch (e) { body = {}; }
  }
  const messages = Array.isArray(body && body.messages) ? body.messages.slice(-12) : [];
  const contents = messages.map(m => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: String(m.content || '').slice(0, 2000) }]
  }));
  if (!contents.length) {
    return res.status(400).json({ reply: 'Escribe tu consulta, por favor.' });
  }

  for (const model of MODELS) {
    try {
      const r = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key },
          body: JSON.stringify({
            systemInstruction: { parts: [{ text: SYSTEM }] },
            contents,
            generationConfig: { temperature: 0.4, maxOutputTokens: 2048 }
          })
        }
      );
      const data = await r.json();
      const reply = data && data.candidates && data.candidates[0] &&
        data.candidates[0].content && data.candidates[0].content.parts &&
        data.candidates[0].content.parts.map(p => p.text || '').join('');
      if (r.ok && reply) {
        const last = messages[messages.length - 1];
        await guardar(
          String((body && body.session) || '').slice(0, 60),
          String((last && last.content) || '').slice(0, 2000),
          reply.slice(0, 8000)
        );
        return res.status(200).json({ reply });
      }
      console.error('Gemini error', model, r.status, JSON.stringify(data).slice(0, 300));
    } catch (e) {
      console.error('Fallo de red', model, e.message);
    }
  }
  return res.status(200).json({
    reply: 'Ahora mismo hay mucha demanda. Intenta de nuevo en un minuto. Si es una emergencia llama al 105 o al 100.'
  });
};
