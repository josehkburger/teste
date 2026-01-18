import { pool } from "../database/connection";
import { ResultSetHeader, RowDataPacket } from "mysql2";
import { Cliente, ClienteBase } from "../models/Cliente"
import { PoolConnection } from "mysql2/promise";

/* CREATE */
export async function createCliente(data: Omit<ClienteBase, "id">, ) {
  const [result] = await pool.execute<ResultSetHeader>(
    `
    INSERT INTO clientes (nome, cpf, endereco, email, cep)
    VALUES (?, ?, ?, ?, ?)
    `,
    [data.nome, data.cpf, data.endereco, data.email, data.cep]
  );

  return result.insertId;
}

/* READ ALL */
export async function getAllClientes() {
  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT * FROM clientes`
  );
  return rows;
}

/* READ BY ID */
export async function getClienteById(id: number, connection?: PoolConnection) {
  const conn = connection ?? pool;

  const [rows] = await conn.query<RowDataPacket[]>(
    `SELECT * FROM clientes WHERE id = ?`,
    [id]
  );

  return rows[0];
}

/* READ BY CPF */
export async function getClienteByCpf(cpf: string) {
  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT * FROM clientes WHERE cpf = ?`,
    [cpf]
  );

  return rows[0];
}

/* UPDATE */
export async function updateCliente(
  id: number,
  data: Omit<Cliente, "id">
) {
  await pool.execute(
    `
    UPDATE clientes
    SET nome = ?, cpf = ?, endereco = ?, email = ?, cep = ?
    WHERE id = ?
    `,
    [data.nome, data.cpf, data.endereco, data.email, data.cep, id]
  );
}

/* DELETE */
export async function deleteCliente(id: number) {
  try {
    await pool.execute(
      `DELETE FROM clientes WHERE id = ?`,
      [id]
    );
  } catch (error: any) {
    if (error.code === "ER_ROW_IS_REFERENCED_2") {
      throw new Error(
        "ROW_IS_REFERENCED"
    );
    }
  }
}