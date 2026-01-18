export interface FormaPagamentoBase {
  nome: string;
  parcelas: number;
}

export interface FormaPagamento extends FormaPagamentoBase {
    id: number;
}