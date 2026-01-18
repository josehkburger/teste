import { PoolConnection } from "mysql2/promise";
import { pool } from "../database/connection";
import { Produto, ProdutoBase } from "../models/Produto";
import { ResultSetHeader, RowDataPacket } from "mysql2";


export async function createProduto(produto: ProdutoBase) {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const [produtoResult] = await pool.execute<ResultSetHeader>(
      `
      INSERT INTO produtos (nome, preco)
      VALUES (?, ?)
      `,
      [produto.nome, produto.preco]
    );

    return produtoResult.insertId;
    
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

export async function getAllProdutos() {
  const [rows] = await pool.query<RowDataPacket[]>(
    `
    SELECT 
      p.id,
      p.nome,
      p.preco,
      COALESCE(SUM(
        CASE 
          WHEN tipo = 'IN' THEN quantidade
          WHEN tipo = 'OUT' THEN -quantidade
        END
      ), 0) AS quantidade
    FROM produtos p
    LEFT JOIN movimentacoes_estoque m ON m.id_produto = p.id
    GROUP BY p.id
    `
  );

  return rows;
}

export async function getProdutoById(id: number, connection?: PoolConnection) {
  const conn = connection ?? pool;
  const [rows] = await conn.query<RowDataPacket[]>(
    `
    SELECT 
      p.id,
      p.nome,
      p.preco,
      COALESCE(SUM(
        CASE 
          WHEN m.tipo = 'IN' THEN m.quantidade
          ELSE -m.quantidade
        END
      ), 0) AS quantidade
    FROM produtos p
    LEFT JOIN movimentacoes_estoque m ON m.id_produto = p.id
    WHERE p.id = ?
    GROUP BY p.id
    `,
    [id]
  );

  return rows[0] as Produto;
}

export async function deleteProduto(id: number, connection?: PoolConnection) {
  try {
    const conn = connection ?? pool;
    const [rows] = await conn.execute<ResultSetHeader>(
      `DELETE FROM produtos WHERE id = ?`,
      [id]
    );
    return rows.affectedRows > 0;
  }
   catch (error: any) {
    if (error.code === "ER_ROW_IS_REFERENCED_2") {
      throw new Error(
        "ROW_IS_REFERENCED"
      );
    }
    // Outros erros
    throw error;
  }
  }
export async function updateProduto( produto: Produto, connection?: PoolConnection) {
    const conn = connection ? connection : pool;

    const [produtoResult] = await conn.execute<ResultSetHeader>(
      `
      UPDATE produtos 
      SET nome = ?, preco = ?
      WHERE id = ?
      `,
      [produto.nome, produto.preco, produto.id]
    );

    const [rows] = await conn.execute<RowDataPacket[]>(
    `
      SELECT id, nome, preco
      FROM produtos
      WHERE id = ?
      `,
      [produto.id]
    );
    return rows[0] as Produto;
  } 

