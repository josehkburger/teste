CREATE DATABASE IF NOT EXISTS estoque;
USE estoque;

CREATE USER IF NOT EXISTS 'app'@'%' IDENTIFIED BY 'app';
GRANT ALL PRIVILEGES ON estoque.* TO 'app'@'%';
FLUSH PRIVILEGES;

-- CLIENTE
CREATE TABLE clientes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  cpf VARCHAR(14) NOT NULL UNIQUE,
  endereco VARCHAR(255),
  email VARCHAR(100),
  cep VARCHAR(10)
);

-- FORMA DE PAGAMENTO
CREATE TABLE formas_pagamento (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(50) NOT NULL,
  parcelas INT NOT NULL
);

-- PRODUTO
CREATE TABLE produtos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  preco DECIMAL(10,2) NOT NULL
);

-- MOVIMENTAÇÃO DE ESTOQUE
CREATE TABLE movimentacoes_estoque (
  id INT AUTO_INCREMENT PRIMARY KEY,
  id_produto INT NOT NULL,
  quantidade INT NOT NULL,
  tipo ENUM('IN', 'OUT') NOT NULL,
  motivo ENUM('VENDA', 'COMPRA', 'AJUSTE') NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT fk_mov_produto
    FOREIGN KEY (id_produto)
    REFERENCES produtos(id)
);

-- VENDA
CREATE TABLE vendas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  id_produto INT NOT NULL,  
  id_cliente INT NOT NULL,
  id_forma_pagamento INT NOT NULL,
  quantidade INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT fk_venda_produto
    FOREIGN KEY (id_produto)
    REFERENCES produtos(id),

  CONSTRAINT fk_venda_cliente
    FOREIGN KEY (id_cliente)
    REFERENCES clientes(id),

  CONSTRAINT fk_venda_forma_pagamento
    FOREIGN KEY (id_forma_pagamento)
    REFERENCES formas_pagamento(id)
);

-- VENDA POR ITENS AJUSTAR DEPOIS
CREATE TABLE venda (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_cliente INT NOT NULL,
    id_forma_pagamento INT NOT NULL,
    total DECIMAL(10,2) DEFAULT 0,
    data TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_cliente) REFERENCES clientes(id),
    FOREIGN KEY (id_forma_pagamento) REFERENCES formas_pagamento(id)
);


CREATE TABLE item_venda (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_venda INT NOT NULL,
    id_produto INT NOT NULL,
    quantidade INT NOT NULL,
    preco_unitario DECIMAL(10,2) NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (id_venda) REFERENCES venda(id) ON DELETE CASCADE,
    FOREIGN KEY (id_produto) REFERENCES produtos(id)
);