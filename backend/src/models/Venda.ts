export interface ItemVendaBase {
  idProduto: number;
  nomeProduto: string;
  quantidade: number;
  subtotal: number;
  precoUnitario: number;
}

export interface VendaBase {
  idCliente: number;
  idFormaPagamento: number;
  total: number;
  itens: ItemVendaBase[];
}

export interface Venda extends VendaBase {
  id: number;
  nomeCliente: string;
  nomeFormaPagamento: string;
}

export interface VendaInput extends VendaBase {
  id: number;
}