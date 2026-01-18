export interface ProdutoBase {
  nome: string;
  quantidade: number;
  preco: number;
}

export interface Produto extends ProdutoBase {
  id: number;
}
