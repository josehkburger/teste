import { ProdutoBase, Produto } from "../models/Produto";
import {
  createProduto,
  getAllProdutos,
  getProdutoById,
  deleteProduto,
  updateProduto
} from "../repositories/produtoRepository";
import {
  deletarProdutoEstoque,
  getEstoqueDisponivelLock,
  registrarEntradaEstoque,
  registrarMovimentacaoEstoque
} from "../repositories/estoqueRepository"
import { pool } from "../database/connection";
import { PoolConnection } from "mysql2/promise";

export async function criarProduto(produto: ProdutoBase): Promise<Produto> {
  if (produto.preco <= 0) {
    throw new Error("PRECO_INVALIDO");
  }

  if (produto.quantidade < 0) {
    throw new Error("QUANTIDADE_INVALIDA");
  }
  const id: number = await createProduto(produto);
  const _ = await registrarEntradaEstoque(id, produto.quantidade);
  const produtoFinal: Produto = await getProdutoById(id)
  return produtoFinal as Produto;
}

export async function listarProdutos() {
  return await getAllProdutos();
}

export async function buscarProdutoPorId(id: number) {
  const produto = await getProdutoById(id);
  if (!produto) {
    throw new Error("PRODUTO_NAO_ENCONTRADO");
  }
  return produto;
}

export async function removerProduto(id: number) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const estoque: boolean = await deletarProdutoEstoque(id, connection); 
    const produto: boolean = await deleteProduto(id, connection); 
    if (!produto)
      throw new Error("PRODUTO_NAO_ENCONTRADO");

    if (!estoque)
      throw new Error("ESTOQUE_NAO_ENCONTRADO");

    await connection.commit();

  } catch (error) {
      await connection.rollback();
      throw error;
  } finally {
      connection.release();
  }
}

export async function editarProduto(produto: Produto) {
  const connection = await pool.getConnection();
  try {

    await connection.beginTransaction();
    if (produto.preco <= 0) {
      throw new Error("PRECO_INVALIDO");
    }

    if (produto.quantidade < 0) {
      throw new Error("QUANTIDADE_INVALIDA");
    }

    const produtoAtualizado: Produto = await updateProduto(produto, connection);
    await updateEstoque(produto.id, produto.quantidade, connection)

    const quantidade: number = await getEstoqueDisponivelLock(produto.id, connection);
    await connection.commit();

    return {...produtoAtualizado, quantidade};
  } catch (error) {
      await connection.rollback();
      throw error;
  } finally {
      connection.release();
  }
}

async function updateEstoque(idProduto: number, estoqueFinal: number, connection?: PoolConnection) {
  const estoqueDispnivel: number = await getEstoqueDisponivelLock(idProduto, connection);
  const diferenca: number = estoqueFinal - estoqueDispnivel;

  if (diferenca === 0) {
    return;
  }
    if (diferenca > 0) {
    await registrarMovimentacaoEstoque(
      idProduto,
      diferenca,
      "IN",
      "AJUSTE",
      connection
    );
  }

  if (diferenca < 0) {
    await registrarMovimentacaoEstoque(
      idProduto,
      Math.abs(diferenca),
      "OUT",
      "AJUSTE",
      connection
    );
  }
}


//falta fazer o delete estoque