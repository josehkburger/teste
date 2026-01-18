import { pool } from "../database/connection";
import { ResultSetHeader, RowDataPacket } from "mysql2";
import { FormaPagamentoBase } from "../models/FormaPagamento";
import { PoolConnection } from "mysql2/promise";

/* CREATE */
export async function createFormaPagamento(data: FormaPagamentoBase) {
  const [result] = await pool.execute<ResultSetHeader>(
    `
    INSERT INTO formas_pagamento (nome, parcelas)
    VALUES (?, ?)
    `,
    [data.nome, data.parcelas]
  );

  return result.insertId;
}

/* READ ALL */
export async function getAllFormasPagamento() {
  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT * FROM formas_pagamento`
  );
  return rows;
}

/* READ BY ID */
export async function getFormaPagamentoById(id: number, connection?: PoolConnection) {
  const conn = connection ?? pool;
  const [rows] = await conn.query<RowDataPacket[]>(
    `SELECT * FROM formas_pagamento WHERE id = ?`,
    [id]
  );

  return rows[0];
}

/* UPDATE */
export async function updateFormaPagamento(
  id: number,
  data: FormaPagamentoBase
) {
  await pool.execute(
    `
    UPDATE formas_pagamento
    SET nome = ?, parcelas = ?
    WHERE id = ?
    `,
    [data.nome, data.parcelas, id]
  );
}

/* DELETE */
export async function deleteFormaPagamento(id: number) {
    try {
      await pool.execute(
        `DELETE FROM formas_pagamento WHERE id = ?`,
      [id]
      );
    }
     catch (error: any) {
      if (error.code === "ER_ROW_IS_REFERENCED_2") {
        throw new Error(
          "ROW_IS_REFERENCED"
        );
    }
    throw error;
  }
}
