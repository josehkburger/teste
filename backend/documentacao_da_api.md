# 📘 Documentação da API REST

## Visão Geral
API REST para gerenciamento de **Clientes**, **Produtos**, **Formas de Pagamento** e **Vendas**.

- Base URL: `/`
- Formato: JSON
- Status padrão de sucesso: `200 OK`

---

## 📌 Cliente

### Validações de Campos
- **nome**: texto livre
- **cpf**: formato `###.###.###-##`
- **email**: formato de e-mail válido
- **cep**: formato `#####-###`
- **endereco**: texto livre

### Criar cliente
**POST** `/cliente`

**Request Body**
```json
{
  "nome": "string",
  "cpf": "string",
  "endereco": "string",
  "email": "string",
  "cep": "string"
}
```

**Response**
```json
{
  "id": 1,
  "nome": "string",
  "cpf": "string",
  "endereco": "string",
  "email": "string",
  "cep": "string"
}
```

---

### Listar clientes
**GET** `/cliente`

**Response**
```json
[
  {
    "id": 1,
    "nome": "string",
    "cpf": "string",
    "endereco": "string",
    "email": "string",
    "cep": "string"
  }
]
```

---

### Atualizar cliente
**PUT** `/cliente/:id`

**Request Body**
```json
{
  "nome": "string",
  "cpf": "string",
  "endereco": "string",
  "email": "string",
  "cep": "string"
}
```

**Response**
```json
{
  "id": 1,
  "nome": "string",
  "cpf": "string",
  "endereco": "string",
  "email": "string",
  "cep": "string"
}
```

---

### Remover cliente
**DELETE** `/cliente/:id`

**Response**
```
200 OK
```

---

## 📦 Produto

### Validações de Campos
- **nome**: texto livre
- **quantidade**: número inteiro >= 0
- **preco**: número decimal positivo

### Criar produto
**POST** `/produto`

**Request Body**
```json
{
  "nome": "string",
  "quantidade": "number",
  "preco": "number"
}
```

**Response**
```json
{
  "id": 1,
  "nome": "string",
  "quantidade": "number",
  "preco": "number"
}
```

---

### Listar produtos
**GET** `/produto`

**Response**
```json
[
  {
    "id": 1,
    "nome": "string",
    "preco": "string",
    "quantidade": "string"
  }
]
```

---

### Atualizar produto
**PUT** `/produto/:id`

**Request Body**
```json
{
  "nome": "string",
  "quantidade": "number",
  "preco": "number"
}
```

**Response**
```json
{
  "id": 1,
  "nome": "string",
  "preco": "string",
  "quantidade": "string"
}
```

---

### Remover produto
**DELETE** `/produto/:id`

**Response**
```
200 OK
```

---

## 💳 Forma de Pagamento

### Validações de Campos
- **nome**: texto livre
- **parcelas**: número inteiro >= 1

### Criar forma de pagamento
**POST** `/pagamento`

**Request Body**
```json
{
  "nome": "string",
  "parcelas": "number"
}
```

**Response**
```json
{
  "id": 1,
  "nome": "string",
  "parcelas": "number"
}
```

---

### Listar formas de pagamento
**GET** `/pagamento`

**Response**
```json
[
  {
    "id": 1,
    "nome": "string",
    "parcelas": "number"
  }
]
```

---

### Atualizar forma de pagamento
**PUT** `/pagamento/:id`

**Request Body**
```json
{
  "nome": "string",
  "parcelas": "number"
}
```

**Response**
```json
{
  "id": 1,
  "nome": "string",
  "parcelas": "number"
}
```

---

### Remover forma de pagamento
**DELETE** `/pagamento/:id`

**Response**
```
200 OK
```

---

## 🧾 Venda

### Validações de Campos
- **idCliente**: ID válido de cliente existente
- **idFormaPagamento**: ID válido de forma de pagamento existente
- **itens**: lista não vazia
- **itens[].idProduto**: ID válido de produto existente
- **itens[].quantidade**: número inteiro > 0
- **itens[].precoUnitario**: decimal no formato `##.##`
- **itens[].subtotal**: número decimal calculado (`quantidade × precoUnitario`)

### Criar venda
**POST** `/venda`

**Request Body**
```json
{
  "idCliente": "number",
  "idFormaPagamento": "number",
  "itens": [
    {
      "idProduto": "number",
      "quantidade": "number",
      "precoUnitario": "string",
      "subtotal": "number"
    }
  ]
}
```

**Response**
```json
{
  "id": 1,
  "idCliente": "number",
  "idFormaPagamento": "number",
  "total": "number",
  "itens": [
    {
      "idProduto": "number",
      "quantidade": "number",
      "precoUnitario": "string",
      "subtotal": "number"
    }
  ]
}
```

---

### Listar vendas
**GET** `/venda`

**Response**
```json
[
  {
    "id": 1,
    "idCliente": "number",
    "nomeCliente": "string",
    "idFormaPagamento": "number",
    "nomeFormaPagamento": "string",
    "total": "string",
    "itens": [
      {
        "idProduto": "number",
        "nomeProduto": "string",
        "quantidade": "number",
        "precoUnitario": "string",
        "subtotal": "string"
      }
    ]
  }
]
```
**GET** `/venda?clienteId=1`

**Response**
```json
[
  {
    "id": 1,
    "idCliente": "number",
    "nomeCliente": "string",
    "idFormaPagamento": "number",
    "nomeFormaPagamento": "string",
    "total": "string",
    "itens": [
      {
        "idProduto": "number",
        "nomeProduto": "string",
        "quantidade": "number",
        "precoUnitario": "string",
        "subtotal": "string"
      }
    ]
  }
]
```
---

### Atualizar venda
**PUT** `/venda/:id`

**Request Body**
```json
{
  "idCliente": "number",
  "idFormaPagamento": "number",
  "itens": [
    {
      "idProduto": "number",
      "precoUnitario": "string",
      "quantidade": "number",
      "subtotal": "number"
    }
  ]
}
```

**Response**
```json
{
  "id": 1,
  "idCliente": "number",
  "idFormaPagamento": "number",
  "total": "number",
  "itens": [
    {
      "idProduto": "number",
      "precoUnitario": "string",
      "quantidade": "number",
      "subtotal": "number"
    }
  ]
}
```

---

### Remover venda
**DELETE** `/venda/:id`

**Response**
```
200 OK
```



