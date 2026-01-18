import { z } from 'zod'

// Regex para CPF no formato 000.000.000-00
const cpfRegex = /^\d{3}\.\d{3}\.\d{3}-\d{2}$/

export const ClienteSchema = z.object({
  nome: z.string().min(1, "Nome é obrigatório"),
  cpf: z.string().regex(cpfRegex, "CPF inválido. Formato esperado: 000.000.000-00"),
  endereco: z.string().min(1, "Endereço é obrigatório"),
  email: z.string().email("Email inválido"),
  cep: z.string().min(8, "CEP inválido. Formato esperado: 00000-000 ou 00000000"),
})

export type ClienteDTO = z.infer<typeof ClienteSchema>

export function validarCliente(cliente: unknown): ClienteDTO {
  const result = ClienteSchema.safeParse(cliente);

  if (!result.success) {
    throw {
      type: "VALIDACAO",
      errors: result.error.issues[0].message
      
    };
  }

  return result.data;
}