import { Router, Request, Response } from "express";
import { 
  Produto, 
  ProdutoBase 
} from "../models/Produto";
import { 
  criarProduto,
  listarProdutos,
  editarProduto,
  removerProduto
} from "../services/produtoService"

const router = Router();

router.post("/", async (req: Request, res: Response) => {
  try {
    const produtoReq: ProdutoBase = { 
      ...req.body 
    };

    const produto: Produto = await criarProduto(produtoReq)
    res.status(200).json(produto);
  } catch (error: any) {
    if (error.message === "PRECO_INVALIDO") {
      return res.status(400).json({ error: "Preco invalido" });
    }

    if (error.message === "QUANTIDADE_INVALIDA") {
      return res.status(404).json({ error: "quantidade invalida" });
    }

    res.status(500).json({ error: error.message });
  }
});

router.get("/", async (_req, res) => {
  try {
    const produtos = await listarProdutos();

    res.set({
      'Cache-Control': 'no-store',
      'Pragma': 'no-cache',
      'Expires': '0'
    });

    res.status(200).json(produtos)
  } catch (erro: any) {
    return res.status(500).json({ error: "Erro interno" });
  }
});

router.put("/:id", async(req: Request, res: Response) => {
  try {
    const id: number = Number(req.params.id);
    const produtoReq: Produto = {
      id, ...req.body
    };
    const produto: Produto = await editarProduto(produtoReq)

    res.status(200).json(produto);
  } catch (error: any) {
    if (error.message === "PRECO_INVALIDO") {
      return res.status(400).json({ error: "Preco invalido" });
    }

    if (error.message === "QUANTIDADE_INVALIDA") {
      return res.status(404).json({ error: "quantidade invalida" });
    }

    res.status(500).json({ error: "Erro interno" });
  }
});

router.delete("/:id", async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    await removerProduto(id);
    return res.status(200).send();

  } catch (error: any) {
    if (error.message === "PRODUTO_NAO_ENCONTRADO") {
      return res.status(400).json({ error: "Produto nao encontrado" });
    }
    if (error.message === "ESTOQUE_NAO_ENCONTRADO") {
      return res.status(400).json({ error: "Produto nao encontrado" });
    }
    if (error.message === "ROW_IS_REFERENCED") {
      return res.status(400).json({ error: "Não é possível deletar o produto. Ele está vinculado a uma venda existente." });
    }
    return res.status(500).json({ error: "Erro interno" });
  }
});

export default router;

