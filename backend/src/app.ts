import express from "express";
import clientesRoutes from "./routes/cliente";
import produtosRoutes from "./routes/produto";
import pagamentosRoutes from "./routes/pagamento";
import vendas from "./routes/venda"
import cors from 'cors';

const app = express();

app.use(express());
app.use(express.json());

// app.set('etag', false)

app.use(cors({
  origin: 'http://localhost:5173'
}))

app.use("/cliente", clientesRoutes);
app.use("/produto", produtosRoutes);
app.use("/pagamento", pagamentosRoutes);
app.use("/venda", vendas)

export default app;
