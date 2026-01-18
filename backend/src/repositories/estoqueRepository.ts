import { PoolConnection, ResultSetHeader } from "mysql2/promise";
import { pool } from "../database/connection";

export async function getEstoqueDisponivel(
  produtoId: number, 
  connection?: PoolConnection
) {
  const conn = connection ?? pool;
  const [[row]]: any = await conn.query(`
    SELECT 
      COALESCE(SUM(
        CASE 
          WHEN tipo = 'IN' THEN quantidade
          WHEN tipo = 'OUT' THEN -quantidade
        END
      ), 0) AS estoque
    FROM movimentacoes_estoque
    WHERE id_produto = ?
  `, [produtoId]);

  return row.estoque;
}

export async function getEstoqueDisponivelLock(
  produtoId: number, 
  connection?: PoolConnection
) {
  const conn = connection ?? pool;
  const [[row]]: any = await conn.query(`
    SELECT 
      COALESCE(SUM(
        CASE 
          WHEN tipo = 'IN' THEN quantidade
          WHEN tipo = 'OUT' THEN -quantidade
        END
      ), 0) AS estoque
    FROM movimentacoes_estoque
    WHERE id_produto = ?
    FOR UPDATE
  `, [produtoId]);

  return row.estoque;
}

export async function registrarSaidaEstoque(
  produtoId: number,
  quantidade: number,
  connection?: PoolConnection 
) {
  const conn = connection ?? pool;
  await conn.execute(`
    INSERT INTO movimentacoes_estoque 
    (id_produto, quantidade, tipo, motivo)
    VALUES (?, ?, 'OUT', 'VENDA')
  `, [produtoId, quantidade]);
}

export async function registrarEntradaEstoque(
  produtoId: number,
  quantidade: number,
  connection?: PoolConnection
) {
  await pool.execute(`
    INSERT INTO movimentacoes_estoque 
    (id_produto, quantidade, tipo, motivo)
    VALUES (?, ?, 'IN', 'COMPRA')
  `, [produtoId, quantidade]);
}

export async function registrarMovimentacaoEstoque(
  idProduto: number,
  quantidade: number,
  tipo: "IN" | "OUT",
  motivo: "VENDA" | "COMPRA" | "AJUSTE",
  connection?: PoolConnection
) {
  const conn = connection ? connection : pool;
  await conn.execute(
    `
    INSERT INTO movimentacoes_estoque
      (id_produto, quantidade, tipo, motivo)
    VALUES (?, ?, ?, ?)
    `,
    [idProduto, quantidade, tipo, motivo]
  );
}

export async function deletarProdutoEstoque(idProduto: number, connection?: PoolConnection) {
  const conn = connection ?? pool;
  const [rows] = await conn.execute<ResultSetHeader>(
    `DELETE FROM movimentacoes_estoque WHERE id_produto = ?`,
    [idProduto]
  );
  return rows.affectedRows > 0;
}