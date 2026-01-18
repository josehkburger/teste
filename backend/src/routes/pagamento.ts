import { Router, Request, Response } from "express";
import { FormaPagamento, FormaPagamentoBase } from "../models/FormaPagamento";
import { 
  criarFormaPagamento,
  listarFormasPagamento,
  atualizarFormaPagamento,
  removerFormaPagamento 
} from "../services/formaPagamentoService"

const router = Router();

router.post("/", async (req: Request, res: Response) => {
  try {
    const pagamentoReq: FormaPagamentoBase = {
        ...req.body
      };
    const pagamento: FormaPagamento = await criarFormaPagamento(pagamentoReq)
       res.status(200).json(pagamento);
  } catch(error: any){
    if (error.message === "PARCELAS_INVALIDAS") {
      return res.status(400).json({ error: "Parcelas invalidas" });
    }
    return res.status(500).json({ error: "Erro interno" });
  }
});

router.get("/", async (_req: Request, res: Response) => {
  try {
    const pagamento = await listarFormasPagamento();
    res.status(200).json(pagamento)
  } catch (erro: any) {
    return res.status(500).json({ error: "Erro interno" });
  }
});

router.put("/:id", async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const clienteReq: FormaPagamentoBase = req.body;

    const clienteAtualizado: FormaPagamento = await atualizarFormaPagamento(id, clienteReq);
    return res.status(200).json(clienteAtualizado);

  } catch (error: any) {
    if (error.message === "FORMA_PAGAMENTO_NAO_ENCONTRADA") {
      return res.status(404).json({ error: "Forma de pagamento não encontrada" });
    }
    return res.status(500).json({ error: "Erro interno" });
  }
});

router.delete("/:id", async (req: Request, res: Response) => {
  try {
      const id = Number(req.params.id);
      await removerFormaPagamento(id);
    res.status(200).end();
  } catch( error: any) {
    if (error.message === "FORMA_PAGAMENTO_NAO_ENCONTRADA") {
      return res.status(400).json({ error: "Parcelas invalidas" });
    }
    if (error.message === "ROW_IS_REFERENCED") {
      return res.status(400).json({ error: "Não é possível deletar a forma de pagamento. Ela está vinculado a uma venda existente." });
    }
    return res.status(500).json({ error: "Erro interno" });
  }

});

export default router;
