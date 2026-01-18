import { Router } from "express";
import { VendaInput, VendaBase, ItemVendaBase } from "../models/Venda";
import { realizarVenda, listarVendas, removerVenda, editarVenda, listarVendasPorCliente } from "../services/vendaService";

const router = Router();

// ====== CRIAR VENDA ======
router.post("/", async (req, res) => {
  try {
    const vendaReq: VendaBase = {
      idCliente: req.body.idCliente,
      idFormaPagamento: req.body.idFormaPagamento,
      total: req.body.total,
      itens: req.body.itens as ItemVendaBase[]
    };
    const venda = await realizarVenda(vendaReq);
    res.status(200).json(venda);

  } catch (error: any) {
    switch (error.message) {
      case "ESTOQUE_INSUFICIENTE":
        return res.status(400).json({ error: "Estoque insuficiente" });
      case "PRODUTO_NAO_EXISTE":
        return res.status(404).json({ error: "Produto não encontrado" });
      default:
        return res.status(500).json({ error: "Erro interno" });
    }
  }
});

// ====== LISTAR VENDAS ======
router.get("/", async (req, res) => {
  try {
    const idCliente = Number(req.query.clienteId);
    if (idCliente) {
      const vendas = await listarVendasPorCliente(idCliente);
      res.status(200).json(vendas);
    } else {
      const vendas = await listarVendas();
      res.status(200).json(vendas);
    }
  } catch (error: any) {
    return res.status(500).json({ error: "Erro interno" });
  }
});

// ====== REMOVER VENDA ======
router.delete("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    await removerVenda(id);
    res.status(200).json();
  } catch (error: any) {
    if (error.message === "VENDA_NAO_ENCONTRADA") {
      return res.status(404).json({ error: "Venda não encontrada" });
    }
    return res.status(500).json({ error: "Erro interno" });
  }
});

// ====== EDITAR VENDA ======
router.put("/:id", async (req, res) => {
  try {
    const id: number = Number(req.params.id);
    const vendaReq: VendaInput = {
      id: id,
      idCliente: req.body.idCliente,
      idFormaPagamento: req.body.idFormaPagamento,
      total: req.body.total,
      itens: req.body.itens as ItemVendaBase[]
    };

    const venda = await editarVenda(vendaReq);
    res.status(200).json(venda);
  } catch (error: any) {
    switch (error.message) {
      case "VENDA_NAO_ENCONTRADA":
        return res.status(404).json({ error: "Venda não encontrada" });
      case "ESTOQUE_INSUFICIENTE":
        return res.status(400).json({ error: "Estoque insuficiente" });
      default:
        return res.status(500).json({ error: error.message + "Erro interno" });
    }
  }
});

router.get("", async (req, res) => {
  const idCliente = req.query.clienteId
})

export default router;
