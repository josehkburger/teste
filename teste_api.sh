#!/bin/bash

BASE_URL="http://localhost:3000"
CONTENT_TYPE="Content-Type: application/json"

fail() {
  echo "❌ ERRO na etapa: $1"
  exit 1
}

request() {
  METHOD=$1
  URL=$2
  DATA=$3

  if [ -z "$DATA" ]; then
    RESP=$(curl -s -w "\n%{http_code}" -X "$METHOD" "$URL")
  else
    RESP=$(curl -s -w "\n%{http_code}" -X "$METHOD" "$URL" -H "$CONTENT_TYPE" -d "$DATA")
  fi

  BODY=$(echo "$RESP" | head -n -1)
  STATUS=$(echo "$RESP" | tail -n 1)

  [ "$STATUS" != "200" ] && echo "$BODY" && fail "$METHOD $URL (HTTP $STATUS)"

  echo "$BODY"
}

extract_id() {
  echo "$1" | grep -o '"id"[[:space:]]*:[[:space:]]*[0-9]*' | head -n1 | grep -o '[0-9]*'
}

echo "▶️ Iniciando testes completos da API"

# ===================== SETUP =====================
echo "\n🔹 SETUP: Criando cliente"
CLIENTE=$(request POST "$BASE_URL/cliente" '{"nome":"Cliente Teste","cpf":"111.111.111-11","endereco":"Rua Teste","email":"cliente@teste.com","cep":"12345-678"}')
CLIENTE_ID=$(extract_id "$CLIENTE") || fail "POST /cliente"

echo "🔹 SETUP: Criando produtos"
PROD1=$(request POST "$BASE_URL/produto" '{"nome":"Produto A","quantidade":100,"preco":10.00}')
PRODUTO_ID_1=$(extract_id "$PROD1") || fail "POST /produto A"

PROD2=$(request POST "$BASE_URL/produto" '{"nome":"Produto B","quantidade":100,"preco":30.00}')
PRODUTO_ID_2=$(extract_id "$PROD2") || fail "POST /produto B"

echo "🔹 SETUP: Criando forma de pagamento"
PAG=$(request POST "$BASE_URL/pagamento" '{"nome":"Credito Teste","parcelas":3}')
PAGAMENTO_ID=$(extract_id "$PAG") || fail "POST /pagamento"

# ===================== VENDA =====================
echo "\n🧾 TESTE: Criando venda"
VENDA=$(request POST "$BASE_URL/venda" "{\"idCliente\":$CLIENTE_ID,\"idFormaPagamento\":$PAGAMENTO_ID,\"itens\":[{\"idProduto\":$PRODUTO_ID_1,\"quantidade\":2,\"precoUnitario\":\"10.00\",\"subtotal\":20},{\"idProduto\":$PRODUTO_ID_2,\"quantidade\":1,\"precoUnitario\":\"30.00\",\"subtotal\":30}]}" )
VENDA_ID=$(extract_id "$VENDA") || fail "POST /venda"

echo "✔ Venda criada (id=$VENDA_ID)"

echo "🔹 Validando venda (GET)"
request GET "$BASE_URL/venda" > /dev/null

echo "📝 Atualizando venda"
request PUT "$BASE_URL/venda/$VENDA_ID" "{\"idCliente\":$CLIENTE_ID,\"idFormaPagamento\":$PAGAMENTO_ID,\"itens\":[{\"idProduto\":$PRODUTO_ID_1,\"quantidade\":3,\"precoUnitario\":\"10.00\",\"subtotal\":30}]}" > /dev/null

echo "🔹 Validando venda atualizada"
request GET "$BASE_URL/venda" > /dev/null

echo "🗑️ Removendo venda"
request DELETE "$BASE_URL/venda/$VENDA_ID" > /dev/null

# ===================== TEARDOWN =====================
echo "\n🧹 TEARDOWN"
request DELETE "$BASE_URL/cliente/$CLIENTE_ID" > /dev/null
request DELETE "$BASE_URL/produto/$PRODUTO_ID_1" > /dev/null
request DELETE "$BASE_URL/produto/$PRODUTO_ID_2" > /dev/null
request DELETE "$BASE_URL/pagamento/$PAGAMENTO_ID" > /dev/null

echo "\n✅ TODOS OS TESTES (INCLUSIVE VENDA) EXECUTADOS COM SUCESSO"