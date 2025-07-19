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
        Rispondi in modo naturale e diretto, senza formattazione markdown o JSON.
        
        REGOLE CRITICHE SUI PREZZI:
        1. Se il prodotto è in promozione (is_promo = 1):
           - Il prezzo più basso è SEMPRE il prezzo scontato attuale
           - Il prezzo più alto è SEMPRE il prezzo originale
           - Devi SEMPRE specificare che è il prezzo scontato
        2. Non dire MAI che un prezzo scontato è il prezzo standard
        3. Se non sei sicuro, specifica che chiederai conferma

        IMPORTANTE: Quando parli dei prezzi, se il prodotto è in promozione,
        specifica SEMPRE sia il prezzo originale che quello scontato,
        enfatizzando che si tratta di un'offerta speciale.

        Informazioni sul prodotto:
        ${systemContext}

        Cronologia conversazione:
        ${conversationHistory}

        User: ${question}

        Ricorda: Se il prodotto è in promozione, menziona SEMPRE entrambi i prezzi
        nella tua risposta, specificando quale è il prezzo attuale scontato.
        Ricorda inoltre di non dare mai risposte che non siano inerenti il prodotto in questione.
        Se ti viene fatta una o più domande che non sono legate al prodotto o al sito jw lux o ai gioielli allora rispondi sempre con garbo ed educazione che non hai informazioni su altri tipi di prodotti o servizi al di fuori di jw lux.

        non cominciare mai una risposta con "Certamente" o simili. Semplicemente dai la risposta richiesta

        RICORDA : se ti viene fatta una domanda sul prezzo , a fine risposta ricorda con chiarezza, eleganza e persuasione di ricordarsi di inserire il codice sconto fornito da jw lux attualmente.

        RICORDA : se ti chiedono "Dove trovo il codice sconto" tu rispondi : "Guarda in alto :)"
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