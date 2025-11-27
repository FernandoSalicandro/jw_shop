# JW LUX - E-Commerce Gioielleria di Lusso

- [github frontend](https://github.com/FernandoSalicandro/jw-front-end)
- [github backend](https://github.com/FernandoSalicandro/jw_shop)



## 📖 Indice
- [Panoramica Progetto](#panoramica-progetto)
- [Architettura](#architettura)
- [Tecnologie Utilizzate](#tecnologie-utilizzate)
- [Funzionalità Implementate](#funzionalità-implementate)
- [Backend - API REST](#backend---api-rest)
- [Frontend - Interfaccia Utente](#frontend---interfaccia-utente)
- [Database](#database)
- [Installazione e Configurazione](#installazione-e-configurazione)
- [Struttura del Progetto](#struttura-del-progetto)

---

## 🎯 Panoramica Progetto

**JW LUX** è un e-commerce completo per una gioielleria di lusso che offre un'esperienza di shopping premium con funzionalità avanzate. Il progetto è stato sviluppato come applicazione full-stack con separazione tra frontend e backend, implementando tutte le funzionalità richieste per un negozio online moderno e professionale.

### Obiettivi del Progetto
- Creare un'esperienza utente elegante e intuitiva per l'acquisto di gioielli di lusso
- Implementare un sistema di e-commerce completo con gestione carrello, checkout e pagamenti
- Integrare funzionalità avanzate come AI assistant, wishlist e prodotti correlati
- Garantire la gestione accurata dello stock e degli ordini

---

## 🏗️ Architettura

Il progetto segue un'architettura **client-server** con separazione completa tra:

- **Frontend (jw-fe)**: Single Page Application (SPA) sviluppata in React con Vite
- **Backend (jw_shop)**: API REST sviluppata in Node.js con Express
- **Database**: MySQL per la persistenza dei dati

### Flusso di Dati
```
Cliente → Frontend React → API REST → Database MySQL
                ↓
        Stripe Payment Gateway
                ↓
        Email Service (Nodemailer)
                ↓
        AI Assistant (Google Gemini)
```

---

## 💻 Tecnologie Utilizzate

### Backend (`jw_shop`)
- **Node.js** (v20+) - Runtime JavaScript
- **Express.js** (v5.1.0) - Framework web
- **MySQL2** (v3.14.1) - Driver database
- **Stripe** (v18.3.0) - Sistema di pagamento
- **Nodemailer** (v7.0.5) - Invio email
- **Axios** (v1.10.0) - Client HTTP per API esterne
- **Cors** (v2.8.5) - Cross-Origin Resource Sharing
- **Slugify** (v1.6.6) - Generazione URL-friendly

### Frontend (`jw-fe`)
- **React** (v19.1.0) - Libreria UI
- **Vite** (v7.0.4) - Build tool e dev server
- **React Router DOM** (v7.6.3) - Routing SPA
- **Bootstrap** (v5.3.7) - Framework CSS
- **Framer Motion** (v12.23.2) - Animazioni
- **Stripe React** (@stripe/react-stripe-js v3.7.0) - Integrazione pagamenti
- **Axios** (v1.10.0) - Client HTTP
- **Font Awesome** (v6.7.2) - Icone

### Database
- **MySQL** (v8.4.5) - Database relazionale

### Servizi Esterni
- **Stripe** - Gateway di pagamento
- **Google Gemini AI** - Chatbot assistente

---

## ✨ Funzionalità Implementate

### 1. 🏠 Homepage
**Caratteristiche:**
- **Hero Section** con video di sfondo ad alta qualità
- Carosello orizzontale di prodotti navigabile con pulsanti freccia
- Visualizzazione prodotti in promozione con badge distintivo
- Sezioni multiple per storytelling del brand:
  - Our Workshop
  - We Are JW LUX
  - Our Boutique
- Animazioni fluide con Framer Motion
- Auto-scroll to top su cambio pagina

**Componenti:**
- `Homepage.jsx` - Pagina principale
- `ProductsCarousel.jsx` - Carosello prodotti
- `Quotes.jsx` - Citazioni e contenuti testuali

**Funzionalità Tecniche:**
- Lazy loading immagini
- Stato di caricamento iniziale con loader personalizzato
- Gestione responsive per tutti i dispositivi

---

### 2. 🔍 Pagina di Ricerca
**Caratteristiche:**
- **Barra di ricerca dinamica** nell'header, sempre accessibile
- Ricerca in tempo reale (attivata con minimo 3 caratteri)
- **Filtri avanzati:**
  - Sort by Price (prezzo decrescente)
  - Sort by Relevance (ordine alfabetico)
  - Filter by Promo (solo prodotti in promozione)
- Visualizzazione numero risultati trovati/mostrati
- Preservazione dei filtri nell'URL (query parameters)

**Logica Implementata:**
```javascript
// Ricerca nel backend filtra per nome e descrizione
WHERE name LIKE ? OR description LIKE ?

// Frontend gestisce ordinamento e filtri
- Promo filter: product.is_promo === 1
- Price sort: ordinamento decrescente
- Relevance: ordinamento alfabetico
```

**File:**
- `SearchPage.jsx` - UI e logica filtri
- `SearchContext.jsx` - State management risultati ricerca

---

### 3. 📦 Pagina Dettaglio Prodotto
**Caratteristiche:**
- **Informazioni complete del prodotto:**
  - Nome, descrizione dettagliata
  - Prezzo (con distinzione prezzo originale/scontato per promo)
  - Stock disponibile in tempo reale
  - Categoria di appartenenza
- **Gestione Quantità:**
  - Verifica stock disponibile
  - Impedisce aggiunta se quantità in carrello supera stock
  - Messaggio "Maximum stock limit reached"
  - Disabilitazione bottone se prodotto esaurito
- **Pulsanti Azione:**
  - Add to Cart (con validazione stock)
  - Add to Wishlist (con controllo duplicati)
- **Accordion Informazioni:**
  - Details (descrizione estesa)
  - Shipping & Returns (politiche)
- **Prodotti Correlati:**
  - Carosello di prodotti della stessa categoria
  - Navigazione tra prodotti correlati

**Validazioni Implementate:**
```javascript
// Controllo stock prima di aggiungere al carrello
const currentQuantity = getQuantityInCart(product);
if (currentQuantity >= product.stock_quantity) {
  setLimitReached(true);
  return;
}

// Verifica prodotto esaurito
const isOutOfStock = product.stock_quantity === 0;
```

**File:**
- `ProductPage.jsx` - Pagina dettaglio
- `relatedController.js` - API prodotti correlati

---

### 4. 🛒 Carrello
**Implementazione Double:**
Il carrello è implementato in due modalità:

#### A. CartModal (Sidebar)
- **Apertura automatica** dopo aggiunta prodotto
- Visualizzazione prodotti con immagine, nome, prezzo
- **Gestione quantità inline:**
  - Pulsanti +/- per modificare quantità
  - Limiti: minimo 1, massimo stock disponibile
  - Disabilitazione bottoni ai limiti
- Rimozione singoli prodotti
- Calcolo totale in tempo reale
- Link rapido a "View Full Cart"
- Animazione slide-in laterale (Framer Motion)

#### B. CartPage (Pagina Completa)
- Vista griglia responsive di tutti i prodotti
- Maggior spazio per informazioni
- Bottone "Clear Cart" per svuotare
- Bottone "Go to Checkout" per procedere
- Calcolo totale carrello
- Navigazione rapida ai dettagli prodotto

**Persistenza:**
```javascript
// Salvataggio automatico in localStorage
useEffect(() => {
  localStorage.setItem("cart", JSON.stringify(cart));
}, [cart]);

// Caricamento all'avvio
const [cart, setCart] = useState(() => {
  const stored = localStorage.getItem("cart");
  return stored ? JSON.parse(stored) : [];
});
```

**Context API:**
- `CartContext.jsx` - State management carrello globale
- `CartModal.jsx` - Componente modale
- `CartPage.jsx` - Pagina completa carrello

---

### 5. 💳 Checkout
**CheckoutPage - Raccolta Dati:**
- **Modulo completo con validazione:**
  - Email (con regex validation)
  - Nome e Cognome
  - Indirizzo, Appartamento, Città, CAP
  - Telefono
  - Paese (dropdown con 250+ paesi)
  - Regione/Provincia (dropdown dinamico basato su paese)
- **Order Summary collapsibile:**
  - Visualizzazione prodotti nel carrello
  - Modifica quantità inline
  - Rimozione prodotti con long-press gesture
  - Progress bar visiva durante long-press
  - Totale carrello
- **Validazioni pre-checkout:**
  - Tutti i campi obbligatori
  - Email formato valido
  - Stock disponibile per tutti i prodotti

**Funzionalità Avanzate:**
```javascript
// Long-press per rimuovere prodotto
const handleLongPressStart = (id) => {
  let currentProgress = 0;
  const interval = setInterval(() => {
    currentProgress += 10;
    if (currentProgress >= 100) {
      removeFromCart(id); // Rimozione dopo 600ms
    }
  }, 60);
};
```

**File:**
- `CheckoutPage.jsx` - Pagina checkout
- `countryRegionData.js/json` - Database paesi/regioni

---

### 6. 💰 Payment Page (Stripe Integration)
**Caratteristiche:**
- **Integrazione completa Stripe:**
  - Payment Intent creato server-side
  - Payment Element UI di Stripe embedded
  - Supporto carte, wallet digitali, altri metodi
- **Redeem Discount Code:**
  - Input per codice sconto
  - Validazione server-side con date di validità
  - Applicazione sconto in tempo reale
  - Aggiornamento Payment Intent con nuovo importo
  - Persistenza in localStorage
- **Riepilogo finale:**
  - Dati cliente confermati
  - Lista prodotti con prezzi (originali e scontati)
  - Visualizzazione sconto applicato
  - Totale finale
- **Processo di pagamento:**
  1. Conferma pagamento con Stripe
  2. Scala stock prodotti dal database
  3. Crea ordine completo
  4. Aggiorna stato pagamento
  5. Invia email conferma
  6. Svuota carrello
  7. Redirect a Thank You page

**Gestione Payment Intent:**
```javascript
// Creazione iniziale
POST /products/create-payment-intent
{
  amount: subtotal,
  customerEmail,
  items: cart
}

// Update con sconto
POST /products/create-payment-intent
{
  amount: subtotal - discountValue,
  originalPaymentIntentId // Mantiene traccia dell'intent originale
}
```

**File:**
- `PaymentPage.jsx` - UI pagamento e logica sconto
- `StripeForm.jsx` - Form integrato Stripe
- `stripeControllers.js` - API creazione/update Payment Intent
- `discountCodeController.js` - API validazione codici sconto

---

### 7. 📧 Sistema Email
**Implementazione Nodemailer:**
- **Email Cliente:**
  - Template HTML personalizzato con brand styling
  - Riepilogo ordine completo
  - Dettagli prodotti (nome, quantità, prezzo)
  - Totale ordine
  - Dati spedizione
  - ID ordine (Payment Intent ID)
  - Link centro assistenza
- **Email Venditore:**
  - Notifica nuovo ordine
  - Informazioni cliente complete
  - Dettagli prodotti ordinati
  - Importo totale
  - Priorità richiesta (alta per ordini > €500)

**Template Email:**
```html
<!-- Design elegante con sfondo nero e accenti oro -->
<table bgcolor="black">
  <tr>
    <td style="color: gold;">
      <h1>JW LUX</h1>
      <h2>Grazie per il tuo ordine!</h2>
      <!-- Dettagli ordine -->
    </td>
  </tr>
</table>
```

**Configurazione SMTP:**
```javascript
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});
```

**File:**
- `emailController.js` - Logica invio email
- `mailer.js` - Configurazione transporter

---

### 8. 🎁 Redeem Code (Codici Sconto)
**Sistema Completo:**
- **Tabella Database `discount_codes`:**
  - `code` (VARCHAR) - Codice univoco
  - `description` (TEXT) - Descrizione sconto
  - `value` (DECIMAL) - Percentuale sconto
  - `type` (VARCHAR) - Tipo sconto
  - `start_date` (DATETIME) - Data inizio validità
  - `end_date` (DATETIME) - Data fine validità
  - `min_order` (DECIMAL) - Ordine minimo

**Funzionalità:**
- **Banner Header:**
  - Fetch automatico codici attivi
  - Visualizzazione rotante con animazione
  - Nascondi su certe pagine (thankyou, payment)
- **Applicazione Checkout:**
  - Input dedicato in Payment Page
  - Bottone "Redeem" con feedback visivo
  - Validazione server-side:
    - Codice esistente
    - Data corrente tra start_date e end_date
    - Ordine minimo soddisfatto
  - Applicazione immediata sconto
  - Aggiornamento Payment Intent
  - Salvataggio in localStorage

**Logica Validazione:**
```javascript
// Server-side validation
SELECT * FROM discount_codes
WHERE code = ?
AND ? BETWEEN start_date AND end_date

// Calcolo sconto
const discountValue = (subtotal * discount.value) / 100;
const finalTotal = subtotal - discountValue;
```

**Persistenza:**
```javascript
// Salva sconto applicato
localStorage.setItem("sconto", JSON.stringify({
  code: discount.code,
  value: discount.value,
  amount: discountValue
}));

// Recupera su reload/navigazione
const discountData = localStorage.getItem("sconto");
```

**File:**
- `discountCodeController.js` - API gestione sconti
- `PaymentPage.jsx` - UI redeem code
- `AppHeader.jsx` - Banner codici attivi

---

### 9. 🔥 Prodotti in Promozione
**Sistema Flag-Based:**
- Campo database `is_promo` (TINYINT 1/0)
- Campo `discount_price` per prezzo scontato
- Mantenimento `price` originale per visualizzazione

**Visualizzazione UI:**
- **Badge "Discount"** su card prodotto
- **Logo JW Discount** sovrapposto all'immagine
- **Prezzi barrati:**
  - Prezzo originale barrato
  - Prezzo scontato evidenziato in verde
- **Filtro ricerca:** checkbox "In Promo" in SearchPage

**Logica Display:**
```javascript
// Determina prezzo da mostrare
const displayPrice = product.is_promo === 1 
  ? product.discount_price 
  : product.price;

// Calcolo totale carrello con promo
const total = cart.reduce((acc, item) => 
  acc + (item.is_promo === 1 ? item.discount_price : item.price) * item.quantity
, 0);
```

**Filtro Ricerca:**
```javascript
// Filter in SearchPage
if (inPromoFilterIsOn) {
  results = results.filter(product => product.is_promo === 1);
}
```

**Styling:**
```css
.no-promo { 
  text-decoration: line-through; 
  color: #999; 
}
.promo { 
  color: #28a745; 
  font-weight: bold; 
}
```

---

### 10. ❤️ Wishlist
**Implementazione Completa:**

#### WishListModal (Sidebar)
- Apertura automatica dopo aggiunta prodotto
- Visualizzazione prodotti salvati
- Rimozione singoli prodotti
- Pulsante "Add to Cart" diretto
- Animazione slide-in
- Contatore badge nell'header

#### WishListPage
- Vista completa griglia prodotti
- Gestione quantità prima di aggiungere al carrello
- Bottone "Clear Wishlist"
- Bottone "Add All to Cart"
- Messaggio se wishlist vuota

**Persistenza localStorage:**
```javascript
const [wishList, setWishList] = useState(() => {
  const stored = localStorage.getItem("wishList");
  return stored ? JSON.parse(stored) : [];
});

useEffect(() => {
  localStorage.setItem("wishList", JSON.stringify(wishList));
}, [wishList]);
```

**Validazioni:**
- Controllo duplicati prima di aggiungere
- Messaggio "Already in wishlist"
- Disabilitazione bottone se già presente

**Context API:**
- `WishListContext.jsx` - State management globale
- Funzioni: `addToWishList`, `removeFromWishList`, `clearWishList`

**File:**
- `WishListContext.jsx` - Context
- `WishListModal.jsx` - Componente modale
- `WishListPage.jsx` - Pagina completa

---

### 11. 🔗 Prodotti Correlati
**Sistema Basato su Categorie:**
- Ogni prodotto appartiene a una o più categorie via tabella pivot
- Query relazionale per trovare prodotti correlati

**Implementazione:**
```sql
-- Step 1: Trova categoria del prodotto corrente
SELECT categories.id
FROM product
JOIN product_categories ON product.id = product_categories.product_id
JOIN categories ON product_categories.category_id = categories.id
WHERE product.slug = ?

-- Step 2: Trova altri prodotti nella stessa categoria
SELECT product.*
FROM product
JOIN product_categories ON product.id = product_categories.product_id
WHERE product_categories.category_id = ?
AND product.slug != ? -- Escludi prodotto corrente
```

**Visualizzazione:**
- **ProductPage:** Carosello prodotti correlati sotto dettagli
- **Homepage:** Selezione random di 4 prodotti
- Click su prodotto correlato → navigazione a ProductPage

**Logica Frontend:**
```javascript
// Fetch prodotti correlati
axios.get(`http://localhost:3000/products/related/${slug}`)
  .then(response => setRelatedProducts(response.data));

// Carosello navigabile
const [currentIndex, setCurrentIndex] = useState(0);
const handleNext = () => setCurrentIndex(prev => 
  (prev + 1) % relatedProducts.length
);
```

**File:**
- `relatedController.js` - API prodotti correlati
- `ProductsCarousel.jsx` - Componente carosello

---

### 12. 📊 Gestione Quantità e Stock
**Sistema Multi-Livello:**

#### Database
- Tabella `product`:
  - `stock_quantity` (INT) - Quantità disponibile
- Aggiornamento atomico dello stock

#### Frontend Validations
**ProductPage:**
```javascript
// Impedisce aggiunta se stock insufficiente
const currentQuantity = getQuantityInCart(product);
if (currentQuantity >= product.stock_quantity) {
  setLimitReached(true);
  return;
}

// Disabilita bottone se esaurito
<button disabled={isOutOfStock}>
  {isOutOfStock ? "OUT OF STOCK" : "ADD TO CART"}
</button>
```

**CartModal/CartPage:**
```javascript
// Limita incremento quantità
const increaseQuantity = (id) => {
  setCart(prevCart => prevCart.map(item =>
    item.id === id ? {
      ...item,
      quantity: item.quantity < item.stock_quantity 
        ? item.quantity + 1 
        : item.quantity
    } : item
  ));
};
```

**CheckoutPage:**
```javascript
// Verifica stock prima di procedere
const hasOutOfStock = cart.some(item => item.stock_quantity === 0);
if (hasOutOfStock) {
  alert("Some products are out of stock");
  return;
}
```

#### Backend - Scala Stock
**Endpoint: POST /products/scale-stock**
```javascript
// Aggiornamento atomico con verifica stock
UPDATE product 
SET stock_quantity = stock_quantity - ? 
WHERE id = ? 
AND stock_quantity - ? >= 0

// Rollback se stock insufficiente
if (results.affectedRows === 0) {
  reject(`Stock insufficiente per prodotto ${id}`);
}
```

**Timing:** Eseguito PRIMA della conferma pagamento per prevenire overselling

**File:**
- `stockController.js` - API gestione stock
- `StripeForm.jsx` - Chiamata scala stock prima di confermare pagamento

---

### 13. 💳 Sistema di Pagamento (Stripe)
**Integrazione Completa:**

#### Setup Iniziale
```javascript
// Frontend - Caricamento Stripe.js
const stripePromise = loadStripe('pk_test_...');

// Backend - Inizializzazione Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
```

#### Flusso Pagamento
1. **Creazione Payment Intent (Backend):**
```javascript
POST /products/create-payment-intent
{
  amount: total * 100, // Converti in centesimi
  currency: 'eur',
  receipt_email: customerEmail,
  automatic_payment_methods: { enabled: true },
  metadata: {
    itemCount: items.length,
    totalAmount: amount
  }
}
```

2. **Rendering Payment Element (Frontend):**
```jsx
<Elements stripe={stripePromise} options={{ clientSecret }}>
  <PaymentElement />
  <button type="submit">Pay Now</button>
</Elements>
```

3. **Conferma Pagamento:**
```javascript
const result = await stripe.confirmPayment({
  elements,
  redirect: "if_required"
});

if (result.error) {
  // Gestione errore
  updatePaymentStatus(paymentIntentId, "failed");
} else {
  // Successo
  updatePaymentStatus(paymentIntentId, "succeeded");
}
```

#### Gestione Stati Pagamento
**Tabella `orders`:**
- `payment_status` (VARCHAR):
  - `pending` - In attesa
  - `succeeded` - Completato
  - `failed` - Fallito
- `stripe_payment_intent_id` - ID transazione Stripe
- `original_payment_intent_id` - ID originale (per update con sconti)

**Update con Discount:**
```javascript
// Aggiorna Payment Intent esistente invece di crearne uno nuovo
if (originalPaymentIntentId) {
  paymentIntent = await stripe.paymentIntents.update(
    originalPaymentIntentId,
    { amount: newAmount * 100 }
  );
}
```

#### Sicurezza
- Chiavi API in variabili d'ambiente
- Validazione server-side di tutti gli importi
- Webhook endpoint per notifiche Stripe (preparato ma non attivo)
- Gestione errori completa

**File:**
- `stripeControllers.js` - API Stripe backend
- `StripeForm.jsx` - Form pagamento frontend
- `PaymentPage.jsx` - Pagina pagamento

---

### 14. 🤖 Assistente AI (Chatbot)
**Integrazione Google Gemini AI:**

#### Caratteristiche
- **Chatbot contestuale** disponibile su tutte le pagine
- **Floating button** "JW AI" in basso a destra
- **Chat popup** con cronologia conversazione
- **Risposte personalizzate** in base al contesto:
  - ProductPage: info sul prodotto visualizzato
  - Altre pagine: info generali catalogo

#### Funzionalità AI
**Product-Aware Context:**
```javascript
// Context dinamico inviato al bot
const promptContext = productInfo ? `
  PRODOTTO VISUALIZZATO:
  Nome: ${productInfo.name}
  Prezzo: ${productInfo.price}€
  ${productInfo.is_promo ? 
    `Sconto: ${productInfo.discount_price}€` : ''}
  Descrizione: ${productInfo.description}
  Stock: ${productInfo.stockQuantity}
  Categoria: ${productInfo.category}
  
  PRODOTTI CORRELATI PER ABBINAMENTI:
  ${relatedProducts}
` : `Catalogo completo: ${allProducts}`;
```

**Specializzazioni Bot:**
- **Abbinamenti gioielli:** suggerisce prodotti complementari
- **Info prezzi:** gestisce prezzi normali e scontati
- **Disponibilità stock:** informa su prodotti disponibili/esauriti
- **Codici sconto:** suggerisce di guardare banner header

**Parsing Risposta:**
```javascript
// Bot può rispondere con formato speciale per prodotti raccomandati
PRODOTTO_RACCOMANDATO: slug|nome|categoria|image_url

// Frontend parsifica e renderizza card prodotto cliccabile
```

#### Implementazione Tecnica
**Backend API:**
```javascript
POST /products/bot
{
  question: "Come posso abbinare questo anello?",
  history: [
    { role: 'system', content: productContext },
    { role: 'user', content: 'domanda precedente' },
    { role: 'assistant', content: 'risposta precedente' }
  ]
}

// Chiamata a Google Gemini
axios.post(
  `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`,
  { contents: [{ parts: [{ text: fullPrompt }] }] }
);
```

**Frontend UI:**
- Container chat scrollabile
- Input messaggio con submit
- Loader durante risposta
- Auto-scroll a nuovi messaggi
- Preservazione cronologia nella sessione

**Prompt Engineering:**
```javascript
const fullPrompt = `
Sei un assistente specializzato in gioielleria di lusso.

PRIORITÀ RISPOSTA:
- Concentrati su stile, categoria, colore, forma
- Se prodotto in promozione, specifica sempre il prezzo scontato
- Per abbinamenti, suggerisci almeno 2 prodotti

FORMATO RISPOSTA:
1. Breve introduzione (max 8 parole)
2. Descrizione abbinamento (max 2 righe)
3. Per ogni prodotto:
   PRODOTTO_RACCOMANDATO: slug|nome|categoria|image_url

${productContext}
${conversationHistory}
Domanda: ${question}
`;
```

**File:**
- `botController.js` - API backend con Gemini
- `AiAssistantProva.jsx` - UI chatbot
- `.env` - `gemini_api_key`

---

## 🗄️ Backend - API REST

### Struttura Server
**File principale: `app.js`**
```javascript
// Setup Express
const app = express();
app.use(express.json());
app.use(cors({ origin: process.env.FE_URL }));
app.use(express.static("public"));

// Webhook Stripe (PRIMA di express.json)
app.post('/webhook', express.raw({ type: 'application/json' }));

// Routes
app.use("/products", router);

// Error handling
app.use(notFound);
app.use(errorHandler);
```

### Endpoints Implementati

#### Prodotti
```
GET  /products                  - Lista tutti i prodotti
GET  /products?search={query}   - Ricerca prodotti
GET  /products?category={cat}   - Filtra per categoria
GET  /products/:slug            - Dettaglio prodotto
GET  /products/related/:slug    - Prodotti correlati
```

#### Ordini
```
POST /products/orders           - Crea nuovo ordine
POST /products/update-payment-status - Aggiorna stato pagamento
```

#### Pagamenti
```
POST /products/create-payment-intent - Crea/Aggiorna Payment Intent
```

#### Stock
```
POST /products/scale-stock      - Decrementa stock prodotti
```

#### Codici Sconto
```
GET  /products/discount-code    - Ottieni codici attivi
POST /products/verify-discount  - Valida codice sconto
```

#### Email
```
POST /products/send-order-emails - Invia email conferma ordine
```

#### AI Bot
```
POST /products/bot              - Ottieni risposta chatbot
```

### Controllers

**jwController.js** - Gestione prodotti
- `index()` - Lista/ricerca prodotti con query parametrizzate
- `show()` - Dettaglio singolo prodotto per slug

**orderController.js** - Gestione ordini
- `confirmOrder()` - Crea ordine con tutti i dettagli
- `updatePaymentStatus()` - Aggiorna stato dopo pagamento

**stripeControllers.js** - Integrazione Stripe
- `createPaymentIntent()` - Crea o aggiorna Payment Intent

**stockController.js** - Gestione magazzino
- `scaleStock()` - Decrementa stock con validazione

**discountCodeController.js** - Codici sconto
- `discount()` - Ottieni codici attivi per data
- `verifyDiscount()` - Valida e restituisce dettagli sconto

**emailController.js** - Servizio email
- `sendOrderEmails()` - Invia email a cliente e venditore

**relatedController.js** - Prodotti correlati
- `related()` - Ottieni prodotti stessa categoria

**botController.js** - AI Assistant
- `botAnswer()` - Integrazione Google Gemini per risposte

### Middleware

**errorHandler.js** - Gestione errori centralizzata
```javascript
export default (err, req, res, next) => {
  console.error(err.stack);
  res.status(err.statusCode || 500).json({
    error: err.message
  });
};
```

**notFound.js** - 404 Handler
```javascript
export default (req, res, next) => {
  res.status(404).json({ 
    message: "Risorsa non trovata" 
  });
};
```

### Database Connection
**jw_db.js**
```javascript
const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE
});
```

---

## 🎨 Frontend - Interfaccia Utente

### Routing
**App.jsx** - Configurazione React Router
```jsx
<BrowserRouter>
  <Routes>
    <Route element={<GuestLayout />}>
      <Route path="/" element={<HomePage />} />
      <Route path="/productDetails/:slug" element={<ProductPage />} />
      <Route path="/rings" element={<RingPage />} />
      <Route path="/earrings" element={<EarringsPage />} />
      <Route path="/bracelets" element={<BraceletsPage />} />
      <Route path="/necklaces" element={<NecklacesPage />} />
      <Route path="/search" element={<SearchPage />} />
      <Route path="/cart" element={<CartPage />} />
      <Route path="/wishlist" element={<WishListPage />} />
      <Route path="/checkout" element={<CheckoutPage />} />
      <Route path="/payment" element={<PaymentPage />} />
      <Route path="/thankyou" element={<ThankYouPage />} />
      <Route path="/about-us" element={<AboutUs />} />
      <Route path="/contact" element={<ContactUs />} />
      <Route path="/customer-service" element={<CustomerService />} />
      <Route path="/careers" element={<Careers />} />
      <Route path="/shipping-and-returns" element={<ShippingAndReturns />} />
      <Route path="/*" element={<PageNotFound />} />
    </Route>
  </Routes>
</BrowserRouter>
```

### Layout
**GuestLayout.jsx** - Layout wrapper
```jsx
<>
  <AppHeader isHomePage={location.pathname === '/'} />
  <Outlet /> {/* Pagine specifiche */}
  <AppFooter />
</>
```

### Context API - State Management

**ProductContext.jsx** - Catalogo prodotti globale
```javascript
const ProductContext = createContext();

export function ProductProvider({ children }) {
  const [products, setProducts] = useState([]);
  
  const requestProducts = () => {
    return axios.get('http://localhost:3000/products')
      .then(res => setProducts(res.data));
  };

  useEffect(() => { requestProducts(); }, []);

  return (
    <ProductContext.Provider value={{ products, requestProducts }}>
      {children}
    </ProductContext.Provider>
  );
}
```

**CartContext.jsx** - Carrello globale
- State: `cart`, `isCartOpen`
- Actions: `addToCart`, `removeFromCart`, `clearCart`, `setCart`
- Persistenza localStorage automatica

**WishListContext.jsx** - Wishlist globale
- State: `wishList`, `isWishListOpen`
- Actions: `addToWishList`, `removeFromWishList`, `clearWishList`
- Persistenza localStorage automatica

**SearchContext.jsx** - Risultati ricerca
- State: `searchResults`
- Actions: `setSearchResults`

### Componenti Principali

**AppHeader.jsx** - Navigazione principale
- Logo JW LUX
- Menu navigazione (Rings, Earrings, Necklaces, Bracelets)
- Barra ricerca con dropdown risultati
- Icone carrello/wishlist con contatore badge
- Banner codici sconto
- Header dinamico: trasparente su homepage, nero su altre pagine
- Animazioni scroll con Framer Motion

**AppFooter.jsx** - Footer informativo
- Link rapidi (About, Contact, Careers, Customer Service)
- Social media links
- Copyright

**CartModal.jsx** - Sidebar carrello
- Slide-in animation
- Lista prodotti con thumbnail
- Gestione quantità inline
- Totale carrello
- Quick actions

**WishListModal.jsx** - Sidebar wishlist
- Simile a CartModal
- Pulsante "Add to Cart" diretto

**ProductsCarousel.jsx** - Carosello prodotti
- Navigazione con frecce
- Responsive grid
- Smooth scroll

**StripeForm.jsx** - Form pagamento
- Payment Element integrato
- Gestione stati pagamento
- Error handling

**Loader.jsx** - Loading indicator
- Spinner animato
- Usato durante caricamenti

**ButtonUnderLine.jsx** - Pulsante con animazione underline

**MotionLink.jsx** - Link con animazioni Framer Motion

**Quotes.jsx** - Citazioni brand

**autoScrollTop.jsx** - Scroll to top automatico su navigazione

### Pagine

**Homepage.jsx**
- Hero video
- Carosello prodotti
- Sezioni brand story
- Toggle tra sezioni workshop/about/boutique

**ProductPage.jsx**
- Dettaglio prodotto completo
- Gestione quantità e stock
- Add to cart/wishlist
- Accordion info
- Prodotti correlati

**SearchPage.jsx**
- Risultati ricerca
- Filtri e ordinamento
- Grid responsive

**CartPage.jsx**
- Vista completa carrello
- Gestione prodotti
- Totale e checkout

**WishListPage.jsx**
- Vista completa wishlist
- Gestione prodotti
- Add all to cart

**CheckoutPage.jsx**
- Form dati cliente
- Order summary
- Validazioni

**PaymentPage.jsx**
- Dati riepilogo
- Redeem discount code
- Stripe payment form

**ThankYouPage.jsx**
- Conferma ordine
- Riepilogo acquisto
- Messaggio di ringraziamento

**RingPage.jsx / EarringsPage.jsx / BraceletsPage.jsx / NecklacesPage.jsx**
- Filtro per categoria specifica
- Grid prodotti categoria
- Hero image categoria

**AboutUs.jsx** - Chi siamo

**ContactUs.jsx** - Contatti

**CustomerService.jsx** - Assistenza clienti

**Careers.jsx** - Lavora con noi

**ShippingAndReturns.jsx** - Spedizioni e resi

**PageNotFound.jsx** - 404 personalizzata

### Stili e Animazioni

**Bootstrap 5.3.7**
- Grid system responsive
- Componenti UI (buttons, cards, forms, modals)
- Utility classes

**Framer Motion**
```jsx
// Animazione fade-in
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.5 }}
>
  {content}
</motion.div>

// Animazione slide
<motion.div
  initial={{ x: 300 }}
  animate={{ x: 0 }}
  exit={{ x: 300 }}
>
  {sidebar}
</motion.div>
```

**CSS Custom**
- `index.css` - Stili globali
- Variabili colore: oro (#FFD700), nero (#000), bianco (#FFF)
- Font eleganti per luxury feel
- Hover effects su immagini prodotti
- Smooth transitions

---

## 🗄️ Database

### Schema MySQL

#### Tabella: `product`
```sql
CREATE TABLE `product` (
  `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `slug` VARCHAR(255) UNIQUE,
  `name` VARCHAR(255) NOT NULL,
  `description` TEXT NOT NULL,
  `price` DECIMAL(8,2) NOT NULL,
  `discount_price` DECIMAL(8,2) NOT NULL,
  `is_promo` TINYINT(1) NOT NULL,
  `relevant` TINYINT(1),
  `image_url` TEXT NOT NULL,
  `stock_quantity` INT NOT NULL,
  `created_at` DATETIME NOT NULL,
  `updated_at` DATETIME NOT NULL
);
```
**40 prodotti** (10 anelli, 10 orecchini, 10 bracciali, 10 collane)

#### Tabella: `categories`
```sql
CREATE TABLE `categories` (
  `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100) UNIQUE NOT NULL
);
```
Categorie: `rings`, `earrings`, `bracelets`, `necklaces`

#### Tabella: `product_categories` (Pivot)
```sql
CREATE TABLE `product_categories` (
  `product_id` BIGINT UNSIGNED NOT NULL,
  `category_id` BIGINT UNSIGNED NOT NULL,
  PRIMARY KEY (`product_id`, `category_id`),
  FOREIGN KEY (`product_id`) REFERENCES `product`(`id`),
  FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`)
);
```

#### Tabella: `orders`
```sql
CREATE TABLE `orders` (
  `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `total_price` DECIMAL(8,2),
  `subtotal_price` DECIMAL(8,2) DEFAULT 0.00,
  `shipping_cost` DECIMAL(8,2) DEFAULT 0.00,
  `discount_code` VARCHAR(255),
  `discount_value` DECIMAL(8,2) DEFAULT 0.00,
  `payment_method` VARCHAR(255) NOT NULL,
  `billing_address` TEXT NOT NULL,
  `shipping_address` TEXT,
  `email` VARCHAR(255) NOT NULL,
  `first_name` VARCHAR(255) NOT NULL,
  `last_name` VARCHAR(255) NOT NULL,
  `phone_number` VARCHAR(255) NOT NULL,
  `stripe_session_id` VARCHAR(255),
  `stripe_payment_intent_id` VARCHAR(255),
  `original_payment_intent_id` VARCHAR(255),
  `payment_status` VARCHAR(50) DEFAULT 'pending',
  `order_status` VARCHAR(50) DEFAULT 'pending',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_stripe_payment` (`stripe_payment_intent_id`),
  INDEX `idx_payment_status` (`payment_status`)
);
```

#### Tabella: `order_product` (Pivot)
```sql
CREATE TABLE `order_product` (
  `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `order_id` BIGINT NOT NULL,
  `product_id` BIGINT NOT NULL,
  `product_name` VARCHAR(255),
  `quantity` INT NOT NULL,
  `price` DECIMAL(8,2),
  `subtotal` DECIMAL(8,2),
  `price_at_time` DECIMAL(8,2),
  `name_at_time` VARCHAR(255),
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX `order_product_order_id_product_id_index` (`order_id`, `product_id`)
);
```
**Nota:** Salva `price_at_time` e `name_at_time` per storicizzare dati al momento dell'ordine

#### Tabella: `discount_codes`
```sql
CREATE TABLE `discount_codes` (
  `code` VARCHAR(255) PRIMARY KEY,
  `description` TEXT NOT NULL,
  `value` DECIMAL(8,2) NOT NULL,
  `type` VARCHAR(255) NOT NULL,
  `start_date` DATETIME NOT NULL,
  `end_date` DATETIME NOT NULL,
  `min_order` DECIMAL(8,2) NOT NULL
);
```

### Relazioni
```
product 1 ←→ N product_categories N ←→ 1 categories
orders 1 ←→ N order_product N ←→ 1 product
orders 1 ←→ 1 discount_codes (via discount_code)
```

### File SQL
- `jw_db.sql` - Schema iniziale
- `jw_db_updated.sql` - Schema completo aggiornato
- `seeder_jw.sql` - Dati di esempio (40 prodotti, categorie)

---

## ⚙️ Installazione e Configurazione

### Prerequisiti
- **Node.js** v20+
- **npm** v10+
- **MySQL** v8+
- **Git**

### 1. Clone Repository
```bash
git clone <repository-url>
cd project-work
```

### 2. Setup Backend (jw_shop)
```bash
cd jw_shop/jw_shop

# Installa dipendenze
npm install

# Crea file .env
copy example.env .env
# Oppure su Linux/Mac: cp example.env .env

# Configura variabili d'ambiente in .env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_DATABASE=jw_db
PORT=3000
FE_URL=http://localhost:5173
STRIPE_SECRET_KEY=sk_test_...
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
gemini_api_key=your_gemini_api_key
```

### 3. Setup Database
```bash
# Accedi a MySQL
mysql -u root -p

# Crea database
CREATE DATABASE jw_db;
USE jw_db;

# Importa schema e dati
SOURCE data/jw_db_updated.sql;
# Oppure
mysql -u root -p jw_db < data/jw_db_updated.sql

# Verifica tabelle
SHOW TABLES;
SELECT COUNT(*) FROM product; -- Dovrebbe restituire 40
```

### 4. Setup Frontend (jw-fe)
```bash
cd ../../jw-fe

# Installa dipendenze
npm install
```

### 5. Configurazione Stripe
1. Crea account su https://stripe.com
2. Ottieni chiavi da Dashboard → Developers → API keys
3. **Backend:** Aggiungi `STRIPE_SECRET_KEY` in `.env`
4. **Frontend:** Aggiungi `publishable_key` in `PaymentPage.jsx`:
```javascript
const stripePromise = loadStripe('pk_test_...');
```

### 6. Configurazione Email
**Gmail Setup:**
1. Vai su Account Google → Sicurezza
2. Attiva "Verifica in due passaggi"
3. Crea "Password per le app"
4. Usa la password generata in `EMAIL_PASSWORD` in `.env`

### 7. Configurazione Google Gemini
1. Vai su https://ai.google.dev/
2. Crea progetto e ottieni API key
3. Aggiungi `gemini_api_key` in `.env`

### 8. Avvio Applicazione
```bash
# Terminale 1 - Backend
cd jw_shop/jw_shop
npm run dev
# Server su http://localhost:3000

# Terminale 2 - Frontend
cd jw-fe
npm run dev
# App su http://localhost:5173
```

### 9. Verifica Installazione
- Apri browser su `http://localhost:5173`
- Dovresti vedere homepage con 40 prodotti
- Verifica funzionamento:
  - ✅ Ricerca prodotti
  - ✅ Aggiunta al carrello
  - ✅ Chatbot AI
  - ✅ Checkout completo

---

## 📁 Struttura del Progetto

```
project-work/
├── jw_shop/                      # Backend Node.js/Express
│   └── jw_shop/
│       ├── app.js                # Entry point server
│       ├── package.json
│       ├── example.env           # Template variabili ambiente
│       ├── controllers/          # Logica business
│       │   ├── jwController.js
│       │   ├── orderController.js
│       │   ├── stripeControllers.js
│       │   ├── emailController.js
│       │   ├── discountCodeController.js
│       │   ├── stockController.js
│       │   ├── relatedController.js
│       │   └── botController.js
│       ├── routes/
│       │   └── jwRoutes.js       # Definizione endpoints
│       ├── middlewares/
│       │   ├── errorHandler.js
│       │   └── notFound.js
│       ├── data/
│       │   ├── jw_db.js          # Connessione MySQL
│       │   ├── jw_db.sql         # Schema database
│       │   ├── jw_db_updated.sql
│       │   └── seeder_jw.sql     # Dati di esempio
│       ├── utils/
│       │   └── mailer.js         # Configurazione email
│       └── public/               # Immagini prodotti
│           └── img/
│               ├── diamond-eternity-ring.png
│               ├── ruby-halo-ring.png
│               └── ... (40 immagini)
│
├── jw-fe/                        # Frontend React/Vite
│   ├── package.json
│   ├── vite.config.js
│   ├── eslint.config.js
│   ├── index.html
│   ├── public/                   # Asset statici
│   │   └── img/
│   │       ├── jw_logo.png
│   │       ├── jw_logo_discount.png
│   │       ├── hero-homepage.png
│   │       ├── video-hero.mp4
│   │       └── ... (hero images)
│   └── src/
│       ├── main.jsx              # Entry point React
│       ├── App.jsx               # Router principale
│       ├── index.css             # Stili globali
│       ├── Context/              # State management
│       │   ├── ProductContext.jsx
│       │   ├── CartContext.jsx
│       │   ├── WishListContext.jsx
│       │   └── SearchContext.jsx
│       ├── components/           # Componenti riusabili
│       │   ├── AppHeader.jsx
│       │   ├── AppFooter.jsx
│       │   ├── CartModal.jsx
│       │   ├── WishListModal.jsx
│       │   ├── StripeForm.jsx
│       │   ├── ProductsCarousel.jsx
│       │   ├── Loader.jsx
│       │   ├── autoScrollTop.jsx
│       │   ├── ButtonUnderLine.jsx
│       │   ├── MotionLink.jsx
│       │   └── Quotes.jsx
│       ├── Pages/                # Pagine applicazione
│       │   ├── Homepage.jsx
│       │   ├── ProductPage.jsx
│       │   ├── SearchPage.jsx
│       │   ├── CartPage.jsx
│       │   ├── WishListPage.jsx
│       │   ├── CheckoutPage.jsx
│       │   ├── PaymentPage.jsx
│       │   ├── ThankyouPage.jsx
│       │   ├── AiAssistantProva.jsx
│       │   ├── RingPage.jsx
│       │   ├── EarringsPage.jsx
│       │   ├── BraceletsPage.jsx
│       │   ├── NecklacesPage.jsx
│       │   ├── AboutUs.jsx
│       │   ├── ContactUs.jsx
│       │   ├── CustomerService.jsx
│       │   ├── Careers.jsx
│       │   ├── ShippingAndReturns.jsx
│       │   └── PageNotFound.jsx
│       ├── layout/
│       │   └── GuestLayout.jsx
│       └── data/
│           ├── countryRegionData.js
│           └── countryRegionData.json
│
└── README.md                     # Questa documentazione
```

---

## 🔒 Variabili d'Ambiente

### Backend (.env)
```env
# Database
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_DATABASE=jw_db

# Server
PORT=3000
FE_URL=http://localhost:5173

# Stripe
STRIPE_SECRET_KEY=sk_test_51...

# Email
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_gmail_app_password

# AI
gemini_api_key=AIzaSy...
```

### Frontend
**Hardcoded in PaymentPage.jsx:**
```javascript
const stripePromise = loadStripe('pk_test_51...');
```

**API URL:**
```javascript
// Impostato in ogni chiamata axios
const API_URL = 'http://localhost:3000/products';
```

---

## 🚀 Script NPM

### Backend
```bash
npm run dev   # Avvia server con watch mode (--watch flag)
```

### Frontend
```bash
npm run dev      # Avvia dev server Vite (port 5173)
npm run build    # Build per produzione
npm run preview  # Preview build produzione
npm run lint     # ESLint check
```

---

## 🔧 Configurazioni Speciali

### CORS
```javascript
// Backend app.js
app.use(cors({
  origin: process.env.FE_URL  // Solo frontend autorizzato
}));
```

### Stripe Webhook (Preparato)
```javascript
// app.js
app.post('/webhook', express.raw({ type: 'application/json' }));
// VA PRIMA di express.json() per ricevere raw body
```

### MySQL Connection Pooling
Attualmente usa `createConnection`, può essere migliorato con:
```javascript
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});
```

---

## 📊 Statistiche Progetto

- **Totale Pagine**: 19 pagine React
- **Totale Componenti**: 11 componenti riusabili
- **API Endpoints**: 11 endpoints REST
- **Controllers Backend**: 8 controllers
- **Context Providers**: 4 context globali
- **Prodotti Catalogo**: 40 prodotti
- **Categorie**: 4 categorie
- **Tabelle Database**: 6 tabelle
- **Linee Codice**: ~8000+ linee (stimato)

---

## 🎨 Design e UX

### Palette Colori
- **Primary**: Oro (#FFD700)
- **Secondary**: Nero (#000000)
- **Background**: Bianco (#FFFFFF)
- **Accent**: Grigio (#CCCCCC)

### Typography
- **Headings**: Serif elegante
- **Body**: Sans-serif moderna
- **Size Scale**: 12px - 48px

### Responsive Breakpoints
```css
/* Mobile */
@media (max-width: 576px) { ... }

/* Tablet */
@media (min-width: 768px) { ... }

/* Desktop */
@media (min-width: 992px) { ... }

/* Large Desktop */
@media (min-width: 1200px) { ... }
```

### Animazioni Chiave
- **Fade In**: Prodotti, modali
- **Slide In**: Sidebar carrello/wishlist
- **Hover Effects**: Immagini prodotti
- **Scroll Animations**: Header trasparente → opaco

---

### Bug Noti
- Nessun bug critico noto al momento
- Gestione errori rete da migliorare con retry logic
- Validazione lato client da rafforzare

---

## 👥 Sviluppatori

Progetto sviluppato come **Project Work** per corso di formazione Full-Stack Developer di Boolean da FernandoAlberto Salicandro,Geani Pintillie e Francesco Moretti, in team.

---





## 📚 Risorse Utili

### Documentazione
- [React Docs](https://react.dev)
- [Express.js](https://expressjs.com)
- [Stripe Docs](https://stripe.com/docs)
- [MySQL Docs](https://dev.mysql.com/doc)
- [Bootstrap](https://getbootstrap.com)
- [Framer Motion](https://www.framer.com/motion)

### Tools
- [Postman](https://www.postman.com) - Test API
- [MySQL Workbench](https://www.mysql.com/products/workbench) - GUI Database
- [VS Code](https://code.visualstudio.com) - IDE
- [Git](https://git-scm.com) - Version Control

---
