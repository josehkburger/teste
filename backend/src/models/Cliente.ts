export interface ClienteBase {
  nome: string;
  cpf: string;
  endereco: string;
  email: string;
  cep: string;
}

export interface Cliente extends ClienteBase {
    id: number;
}