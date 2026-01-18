import { pool } from "../database/connection";
import { getProdutoById } from "../repositories/produtoRepository";
import {
  getEstoqueDisponivelLock,
  registrarMovimentacaoEstoque
} from "../repositories/estoqueRepository";
import {
  createVenda,
  deleteVenda,
  getAllVendas,
  getVendaById,
  updateVenda
} from "../repositories/vendaRepository";
import { getFormaPagamentoById } from "../repositories/formaPagamentoRepository";
import { getClienteById } from "../repositories/clienteRepositort";
import { Venda, VendaBase, ItemVendaBase, VendaInput } from "../models/Venda";

export async function realizarVenda(venda: VendaBase) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const cliente = await getClienteById(venda.idCliente, connection);
    if (!cliente) throw new Error("CLIENTE_NAO_EXISTE");

    const formaPagamento = await getFormaPagamentoById(venda.idFormaPagamento, connection);
    if (!formaPagamento) throw new Error("FORMAPAGAMENTO_NAO_EXISTE");

    let total = 0;
    const itensComSubtotal: ItemVendaBase[] = [];
    
    for (const item of venda.itens) {
        
      const produto = await getProdutoById(item.idProduto, connection);
      if (!produto) throw new Error("PRODUTO_NAO_EXISTE");

      const estoque = await getEstoqueDisponivelLock(item.idProduto, connection);
      if (estoque < item.quantidade) throw new Error("ESTOQUE_INSUFICIENTE");

      // Baixa o estoque
      await registrarMovimentacaoEstoque(item.idProduto, item.quantidade, "OUT", "VENDA", connection);

      const subtotal = item.quantidade * produto.preco;
      total += subtotal;

      itensComSubtotal.push({
        ...item,
        subtotal
      });
    }

    // Cria a venda
    const vendaId = await createVenda(
      {
        idCliente: venda.idCliente,
        idFormaPagamento: venda.idFormaPagamento,
        total,
        itens: itensComSubtotal
      },
      connection
    );
    await connection.commit();

    return {
      id: vendaId,
      idCliente: venda.idCliente,
      idFormaPagamento: venda.idFormaPagamento,
      total,
      itens: itensComSubtotal
    } as VendaBase;

  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

export async function listarVendas(): Promise<Venda[]> {
  return await getAllVendas();
}
export async function listarVendasPorCliente(idCliente: number){
  return await getAllVendas(idCliente);
}

export async function removerVenda(vendaId: number) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const venda = await getVendaById(vendaId, connection);
    if (!venda) throw new Error("VENDA_NAO_ENCONTRADA");
    // Devolver estoque de todos os itens
    for (const item of venda.itens) {
      await registrarMovimentacaoEstoque(item.idProduto, item.quantidade, "IN", "AJUSTE", connection);
    }

      await deleteVenda(vendaId, connection);
 

    await connection.commit();
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

export async function editarVenda(venda: VendaInput) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const vendaAtual = await getVendaById(venda.id, connection);
    if (!vendaAtual) throw new Error("VENDA_NAO_EXISTE");

    // Ajusta estoque: devolve antigos itens
    for (const item of vendaAtual.itens) {
      await registrarMovimentacaoEstoque(item.idProduto, item.quantidade, "IN", "AJUSTE", connection);
    }

    // Ajusta estoque: baixa novos itens
    for (const item of venda.itens) {
      const estoque = await getEstoqueDisponivelLock(item.idProduto, connection);
 
      if (estoque < item.quantidade) throw new Error("ESTOQUE_INSUFICIENTE");

      await registrarMovimentacaoEstoque(item.idProduto, item.quantidade, "OUT", "AJUSTE", connection);
    }

    //ta aqui, chega no repository
    // Atualiza venda no banco
    venda.total = venda.itens.reduce(
      (sum, i) => sum + i.subtotal,
      0
    );
    await updateVenda(venda, connection);

    await connection.commit();
    return await getVendaById(venda.id)
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}
