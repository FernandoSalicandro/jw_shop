import axios from 'axios';

const API_KEY = process.env.gemini_api_key;

const botAnswer = (req, res) => {
    const { question, history } = req.body;
    
    if (!question) {
        return res.status(400).json({ error: 'Question is required' });
    }

    // Costruisci il prompt includendo la cronologia
    const conversationHistory = history.map(msg => 
        `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`
    ).join('\n');

    const fullPrompt = `${conversationHistory}\nUser: ${question}`;

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