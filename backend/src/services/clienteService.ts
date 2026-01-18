import { Cliente, ClienteBase } from "../models/Cliente";
import {
  createCliente,
  getAllClientes,
  getClienteById,
  getClienteByCpf,
  updateCliente,
  deleteCliente
} from "../repositories/clienteRepositort";

/* CREATE */
export async function criarCliente(cliente: ClienteBase) {
  const clienteExistente = await getClienteByCpf(cliente.cpf);
  if (clienteExistente) {
    throw new Error("CPF_JA_CADASTRADO");
  }

  const id = await createCliente(cliente);
  return { id, ...cliente };
}

/* READ ALL */
export async function listarClientes() {
  return await getAllClientes();
}

/* READ BY ID */
export async function buscarClientePorId(id: number) {
  const cliente = await getClienteById(id);
  if (!cliente) {
    throw new Error("CLIENTE_NAO_ENCONTRADO");
  }
  return cliente;
}

/* UPDATE */
export async function atualizarCliente(
  id: number,
  data: ClienteBase
) {
  const cliente = await getClienteById(id);
  if (!cliente) {
    throw new Error("CLIENTE_NAO_ENCONTRADO");
  }
  //retornar data atualizado
  await updateCliente(id, data);
  return { id, ...data };
}

/* DELETE */
export async function removerCliente(id: number) {
  const cliente = await getClienteById(id);
  if (!cliente) {
    throw new Error("CLIENTE_NAO_ENCONTRADO");
  }

  await deleteCliente(id);
}
