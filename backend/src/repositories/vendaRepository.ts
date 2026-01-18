import { PoolConnection, RowDataPacket } from "mysql2/promise";
import { Venda, VendaBase, VendaInput } from "../models/Venda";

import { pool } from "../database/connection";

export async function createVenda(venda: VendaBase, conn?: PoolConnection): Promise<number> {
  const connection = conn || await pool.getConnection();

  try {
    const [result] = await connection.execute(
      `INSERT INTO venda (id_cliente, id_forma_pagamento, total)
        VALUES (?, ?, ?)`,
      [venda.idCliente, venda.idFormaPagamento, venda.total]
    );

    // @ts-ignore
    const idVenda = result.insertId;


    // Inserir itens
    for (const item of venda.itens) {
      await connection.execute(
        `INSERT INTO item_venda (id_venda, id_produto, quantidade, preco_unitario, subtotal)
          VALUES (?, ?, ?, ?, ?)`,
        [idVenda, item.idProduto, item.quantidade, item.precoUnitario, item.subtotal]
      );
    }

    return idVenda;

  } finally {
    if (!conn) connection.release();
  }
}

export async function getAllVendas( idCliente?: number, conn?: PoolConnection): Promise<Venda[]> {
  const connection = conn || await pool.getConnection();

  try {
    let query =      `SELECT
        v.id AS id,
        v.id_cliente AS idCliente,
        c.nome AS nomeCliente,
        v.id_forma_pagamento AS idFormaPagamento,
        f.nome AS nomeFormaPagamento,
        v.total AS total,
        i.id_produto AS idProduto,
        p.nome AS nomeProduto,
        i.quantidade AS quantidade,
        i.preco_unitario AS precoUnitario,
        i.subtotal AS subtotal
      FROM venda v
      LEFT JOIN clientes c ON c.id = v.id_cliente
      LEFT JOIN formas_pagamento f ON f.id = v.id_forma_pagamento
      LEFT JOIN item_venda i ON v.id = i.id_venda
      LEFT JOIN produtos p ON p.id = i.id_produto`
      
      const params: any[] = [];
      
      if (idCliente) {
        query += ` WHERE v.id_cliente = ?`;
        params.push(idCliente); // mesmo que seja só 1 número
      }
    const [rows] = await connection.query(query, params);

    // Transformar em objeto com array de itens
    const vendasMap = new Map<number, Venda>();
    for (const row of rows as any[]) {

      const id = row.id;
      if (!vendasMap.has(id)) {
        vendasMap.set(id, {
          id,
          idCliente: row.idCliente,
          nomeCliente: row.nomeCliente,
          idFormaPagamento: row.idFormaPagamento,
          nomeFormaPagamento: row.nomeFormaPagamento,
          total: row.total,
          itens: []
        });
      }
      if (row.idProduto) {
        vendasMap.get(id)!.itens.push({
          idProduto: row.idProduto,
          nomeProduto: row.nomeProduto,
          quantidade: row.quantidade,
          precoUnitario: row.precoUnitario,
          subtotal: row.subtotal
        });
      }
    }
    return Array.from(vendasMap.values());

  } finally {
    if (!conn) connection.release();
  }
}

export async function deleteVenda(idVenda: number, conn?: PoolConnection): Promise<void> {
  const connection = conn || await pool.getConnection();
  try {
    await connection.execute(`DELETE FROM item_venda WHERE id_venda = ?`, [idVenda]);
    const [result] = await connection.execute(`DELETE FROM venda WHERE id = ?`, [idVenda]);
    // @ts-ignore
    if (result.affectedRows === 0) throw new Error("VENDA_NAO_ENCONTRADA");
  } finally {
    if (!conn) connection.release();
  }
}

export async function updateVenda(venda: VendaInput, conn?: PoolConnection) {
  const connection = conn || await pool.getConnection();
    
    await connection.execute(
      `UPDATE venda SET id_cliente = ?, id_forma_pagamento = ?, total = ? WHERE id = ?`,
      [venda.idCliente, venda.idFormaPagamento, venda.total, venda.id]
    );
    // Deletar itens antigos
    await connection.execute(`DELETE FROM item_venda WHERE id_venda = ?`, [venda.id]);

    // Inserir itens novos
    for (const item of venda.itens) {
      await connection.execute(
        `INSERT INTO item_venda (id_venda, id_produto, quantidade, preco_unitario, subtotal)
          VALUES (?, ?, ?, ?, ?)`,
        [venda.id, item.idProduto, item.quantidade, Number(item.precoUnitario), item.subtotal]
      );
    }

  }

export async function getVendaById(
  vendaId: number,
  conn?: PoolConnection
): Promise<Venda | null> {

  const connection = conn || await pool.getConnection();

  try {
    const [rows] = await connection.query(
      `
      SELECT
        v.id AS id,
        v.id_cliente AS idCliente,
        c.nome AS nomeCliente,
        v.id_forma_pagamento AS idFormaPagamento,
        f.nome AS nomeFormaPagamento,
        v.total AS total,
        i.id_produto AS idProduto,
        p.nome AS nomeProduto,
        i.quantidade AS quantidade,
        i.preco_unitario AS precoUnitario,
        i.subtotal AS subtotal
      FROM venda v
      LEFT JOIN clientes c ON c.id = v.id_cliente
      LEFT JOIN formas_pagamento f ON f.id = v.id_forma_pagamento
      LEFT JOIN item_venda i ON v.id = i.id_venda
      LEFT JOIN produtos p ON p.id = i.id_produto
      WHERE v.id = ?
      `,
      [vendaId]
    );

    const result = rows as any[];

    if (result.length === 0) {
      return null;
    }

    // cria a venda a partir da primeira linha
    const venda: Venda = {
      id: result[0].id,
      idCliente: result[0].idCliente,
      nomeCliente: result[0].nomeCliente,
      idFormaPagamento: result[0].idFormaPagamento,
      nomeFormaPagamento: result[0].nomeFormaPagamento,
      total: result[0].total,
      itens: []
    };

    // adiciona os itens
    for (const row of result) {
      if (row.idProduto) {
        venda.itens.push({
          idProduto: row.idProduto,
          nomeProduto: row.nomeProduto,
          quantidade: row.quantidade,
          precoUnitario: row.precoUnitario,
          subtotal: row.subtotal
        });
      }
    }

    return venda;

  } finally {
    if (!conn) connection.release();
  }
}