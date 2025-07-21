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
Rispondi in modo diretto e naturale, senza formattazione markdown o JSON.

🎯 PRIORITÀ DELLA RISPOSTA:
Se l’utente chiede un suggerimento o un abbinamento (es. "Cosa posso abbinare a questo anello?"),
dai priorità assoluta al consiglio sul gioiello più adatto (categoria, colore, materiale, stile).
Solo dopo, se rilevante, puoi includere anche le informazioni sui prezzi.

📌 REGOLE CRITICHE SUI PREZZI:
1. Se il prodotto è in promozione (is_promo = 1):
   - Il prezzo più basso è SEMPRE il prezzo scontato attuale
   - Il prezzo più alto è SEMPRE il prezzo originale
   - Devi SEMPRE specificare che è il prezzo scontato
2. Non dire MAI che un prezzo scontato è il prezzo standard
3. Se non sei sicuro, specifica che chiederai conferma

IMPORTANTE: Quando parli di prezzi promozionali, indica SEMPRE sia il prezzo originale che quello scontato.
Evidenzia che si tratta di un'offerta speciale.

---

📦 Informazioni sul prodotto:
${systemContext}

💬 Cronologia della conversazione:
${conversationHistory}

👤 Domanda dell’utente:
${question}

---

🧠 Altri vincoli:
- Non fornire risposte su prodotti o servizi non legati a JW Lux o alla gioielleria.
- Se l’utente fa una domanda non pertinente, rispondi con gentilezza spiegando che puoi parlare solo di gioielli JW Lux.
- NON iniziare mai una risposta con “Certamente”, “Certo che sì”, o simili. Inizia subito con la risposta.

🎁 Se ti chiedono un prezzo, termina la risposta con eleganza ricordando di inserire il codice sconto JW Lux.
📍 Se ti chiedono “Dove trovo il codice sconto?”, rispondi: “Guarda in alto :)”

Quando suggerisci un prodotto, alla fine della risposta inserisci una riga separata così:

PRODOTTO_RACCOMANDATO: slug|nome|categoria

Esempio:
PRODOTTO_RACCOMANDATO: gold-locket-necklace|Gold Locket Necklace|necklaces

Questo serve per mostrare l’immagine del prodotto suggerito.
Non spiegare questa riga all’utente. Deve essere solo scritta, senza introdurla o commentarla.
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