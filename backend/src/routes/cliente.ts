import { Router, Request, Response } from "express";
import { ClienteBase } from "../models/Cliente";
import { 
  criarCliente,
  listarClientes,
  atualizarCliente,
  removerCliente
} from "../services/clienteService"
import { validarCliente } from "../utils/validator"
const router = Router();

router.post("/", async (req: Request, res: Response) => {
  try {
    const clienteReq: ClienteBase = validarCliente(req.body)
    const cliente = await criarCliente(clienteReq);
    res.status(200).json(cliente);
  }  catch (error: any) {
    
    if (error.type === "VALIDACAO") {
      console.log(error.errors)
      return res.status(400).json({
        error: "Dados inválidos",
        detalhes: error.errors
      });
    }

    if (error.message === "CPF_JA_CADASTRADO") {
      return res.status(400).json({ error: "CPF ja cadastrado" });
    }
    res.status(500).json({ error: error.message });
  }

});

router.get("/", async(_req: Request, res: Response) => {
  try {
    const clientes = await listarClientes();
    res.status(200).json(clientes)
  } catch (error: any) {
    res.status(500).json({ error: "Erro interno" });
  }
});

router.put("/:id", async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const clienteReq: ClienteBase = validarCliente(req.body);

    const clienteAtualizado = await atualizarCliente(id, clienteReq);
    return res.status(200).json(clienteAtualizado);

  } catch (error: any) {
    if (error.message === "CLIENTE_NAO_ENCONTRADO") {
      return res.status(404).json({ error: "Cliente não encontrado" });
    }
    return res.status(500).json({ error: "Erro interno" });
  }
});

router.delete("/:id", async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    await removerCliente(id);
    return res.status(200).send();

  } catch (error: any) {
    if (error.message === "CLIENTE_NAO_ENCONTRADO") {
      return res.status(404).json({ error: "Cliente não encontrado" });
    }
    if (error.message === "ROW_IS_REFERENCED") {
      return res.status(404).json({ error: "Não é possível deletar o cliente. Ele está vinculado a uma venda existente." });
    }
    return res.status(500).json({ error: "Erro interno" });
  }
});

export default router;
