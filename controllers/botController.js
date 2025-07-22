import axios from 'axios';

const API_KEY = process.env.gemini_api_key;

const botAnswer = (req, res) => {
    const { question, history } = req.body;

    if (!question) {
        return res.status(400).json({ error: 'Question is required' });
    }

    // Separiamo il contesto di sistema dal resto della conversazione
    const systemContext = history.find(msg => msg.role === 'system')?.content || '';
    const conversationHistory = history
        .filter(msg => msg.role !== 'system')
        .map(msg => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`)
        .join('\n');

    const fullPrompt = `
Sei un assistente specializzato in gioielleria di lusso.
Rispondi in modo diretto, elegante e naturale, senza usare markdown o JSON.

🎯 PRIORITÀ DELLA RISPOSTA:
- Se l'utente chiede un abbinamento, NON parlare di prezzi (a meno che non richiesti).
- Concentrati su: stile, categoria, colore, forma e raffinatezza.
- DEVI SEMPRE includere almeno 2 prodotti consigliati con il formato tecnico.

📌 REGOLE PREZZI:
- Prodotto in promozione (is_promo = 1):
  • Prezzo più basso = prezzo scontato attuale
  • Prezzo più alto = prezzo originale
  • Specifica SEMPRE che è scontato
- NON parlare mai di prezzi negli abbinamenti (se non richiesti)

📦 Informazioni sul prodotto:
${systemContext}

💬 Conversazione precedente:
${conversationHistory}

👤 Domanda:
${question}

🧠 REGOLE CRITICHE:
1. Parla SOLO di gioielli JW Lux
2. NON iniziare con "Certamente" o simili
3. Se chiedono del codice sconto: "Guarda in alto :)"
4. NON consigliare prodotti della stessa categoria del gioiello visualizzato (salvo richiesta esplicita)

📝 FORMATO OBBLIGATORIO RISPOSTA:
1. "Puoi abbinare questo/questa [nome] con i seguenti gioielli:" (massimo 8 parole)
2. Breve descrizione dell'abbinamento (max 2 righe)
3. Per OGNI prodotto consigliato (minimo 2) DEVI scrivere:
   PRODOTTO_RACCOMANDATO: slug|nome|categoria|image_url

⚠️ IMPORTANTE:
- La riga PRODOTTO_RACCOMANDATO è OBBLIGATORIA per ogni consiglio
- Deve essere esattamente in quel formato
- Senza questa riga, i prodotti non saranno visualizzati
- Non spiegare o commentare questa riga tecnica
`;


    axios.post(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`, {
        contents: [{
            parts: [{
                text: fullPrompt
            }]
        }]
    })
        .then(response => {
            console.log('Response:', response.data);
            res.json({
                answers: [{
                    answer: response.data.candidates[0].content.parts[0].text
                }]
            });
        })
        .catch(error => {
            console.error('Error details:', error.response?.data || error.message);
            res.status(500).json({ error: 'Something went wrong' });
        });
}

export default { botAnswer };