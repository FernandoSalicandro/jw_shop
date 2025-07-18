import express from "express";
import cors from "cors";
import router from "./routes/jwRoutes.js";
import errorHandler from "./middlewares/errorHandler.js";
import notFound from "./middlewares/notFound.js";

const app = express();
const port = process.env.PORT;

// Configurazione per webhook Stripe (VA SEMPRE PRIMA DI express.json !!!!)
app.post('/webhook', express.raw({ type: 'application/json' }));

app.use(express.json());
app.use(express.static("public"));
app.use(
  cors({
    origin: process.env.FE_URL,
  })
);

// Rotta di debug
app.get("/", (req, res) => {
  res.json({ message: "Benvenuto nella rotta base" });
});

// Usa un solo prefisso per tutte le rotte
app.use("/products", router);

// Log delle rotte registrate
console.log('Routes registered:', 
  router.stack
    .filter(r => r.route)
    .map(r => ({
      path: r.route.path,
      methods: Object.keys(r.route.methods)
    }))
);

// Middleware per gestione errori
app.use(notFound);
app.use(errorHandler);

// Avvio server
app.listen(port, () => {
  console.log("Server in ascolto sulla porta", port);
});