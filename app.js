import express from "express";
import cors from "cors";
import router from "./routes/jwRoutes.js";
import errorHandler from "./middlewares/errorHandler.js";
import notFound from "./middlewares/notFound.js";

const app = express();
const port = process.env.PORT;

// Configurazione per webhook Stripe (VA SEMPRE PRIMA DI  express.json !!!!)
app.post('/webhook', express.raw({ type: 'application/json' }));

app.use(express.json());
app.use(express.static("public"));
app.use(
  cors({
    origin: process.env.FE_URL,
  })
);

//rotta di debug
app.get("/", (req, res) => {
  res.json({ message: "Benvenuto nella rotta base" });
});


app.use("/products", router);
app.use("/orders", router);

app.use(notFound);
app.use(errorHandler);
app.listen(port, () => {
  console.log("Server in ascolto sulla porta", port);
});