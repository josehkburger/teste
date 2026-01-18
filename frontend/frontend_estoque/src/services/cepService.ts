import { cepApi } from './cepApi'

export interface Endereco {
  logradouro: string
  bairro: string
  localidade: string
  uf: string
  cep: string
}

export async function buscarEnderecoPorCep(cep: string) {
  const cleanCep = cep.replace(/\D/g, '')

  if (cleanCep.length !== 8) {
    throw new Error('CEP inválido')
  }

  const { data } = await cepApi.get(`/${cleanCep}/json/`)

  if (data.erro) {
    throw new Error('CEP não encontrado')
  }

  return data.logradouro + ', ' + data.localidade + ' - ' + data.uf 
}