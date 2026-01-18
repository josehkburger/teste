import { FormaPagamentoBase } from "../models/FormaPagamento";
import {
  createFormaPagamento,
  getAllFormasPagamento,
  getFormaPagamentoById,
  updateFormaPagamento,
  deleteFormaPagamento
} from "../repositories/formaPagamentoRepository";

/* CREATE */
export async function criarFormaPagamento(data: FormaPagamentoBase) {
  if (data.parcelas <= 0) {
    throw new Error("PARCELAS_INVALIDAS");
  }

  const id = await createFormaPagamento(data);
  return { id, ...data };
}

/* READ ALL */
export async function listarFormasPagamento() {
  return await getAllFormasPagamento();
}

/* READ BY ID */
export async function buscarFormaPagamentoPorId(id: number) {
  const forma = await getFormaPagamentoById(id);
  if (!forma) {
    throw new Error("FORMA_PAGAMENTO_NAO_ENCONTRADA");
  }
  return forma;
}

/* UPDATE */
export async function atualizarFormaPagamento(
  id: number,
  data: FormaPagamentoBase
) {
  const forma = await getFormaPagamentoById(id);
  if (!forma) {
    throw new Error("FORMA_PAGAMENTO_NAO_ENCONTRADA");
  }

  if (data.parcelas <= 0) {
    throw new Error("PARCELAS_INVALIDAS");
  }

  await updateFormaPagamento(id, data);
  return { id, ...data };
}

/* DELETE */
export async function removerFormaPagamento(id: number) {
  const forma = await getFormaPagamentoById(id);
  if (!forma) {
    throw new Error("FORMA_PAGAMENTO_NAO_ENCONTRADA");
  }

  await deleteFormaPagamento(id);
}
