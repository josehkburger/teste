<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { api } from '../services/api'
import {useToast} from 'vue-toast-notification';
import 'vue-toast-notification/dist/theme-default.css';

interface Cliente { id: number; nome: string }
interface Produto { id: number; nome: string; preco: number }
interface Pagamento { id: number; nome: string }

interface ItemVendaForm {
  idProduto: number
  quantidade: number
  precoUnitario: number
  subtotal: number
}

interface ItemVenda extends ItemVendaForm {
    nomeProduto: string
}

interface VendaForm {
  idCliente: number
  idFormaPagamento: number
  itens: ItemVendaForm[]
}

interface Venda extends VendaForm {
  id: number
  total: number
  nomeCliente: string
  formaPagamento: string
  itens: ItemVenda[]
}

const toast = useToast()
const clientes = ref<Cliente[]>([])
const produtos = ref<Produto[]>([])
const pagamentos = ref<Pagamento[]>([])
const vendas = ref<Venda[]>([])

const form = ref<VendaForm>({
  idCliente: 0,
  idFormaPagamento: 0,
  itens: [
    { idProduto: 0, quantidade: 1, precoUnitario:0, subtotal: 0 }
  ]
})

const editId = ref<number | null>(null)
const vendaAbertaId = ref<number | null>(null);

// Carregar selects
async function carregarTudo() {
  const [c, p, f, v] = await Promise.all([
    api.get('/cliente'),
    api.get('/produto'),
    api.get('/pagamento'),
    api.get('/venda')
  ])
  clientes.value = c.data
  produtos.value = p.data
  pagamentos.value = f.data
  vendas.value = v.data
}

// front
const totalVenda = computed(() =>
  form.value.itens.reduce((acc, item) => acc + item.subtotal, 0)
)

function atualizarSubtotal(item: ItemVendaForm) {
  const produto = produtos.value.find(p => p.id === item.idProduto)
  item.subtotal = produto ? produto.preco * item.quantidade : 0
  item.precoUnitario = produto.preco
}

function adicionarItem() {
  form.value.itens.push({ idProduto: 0, quantidade: 1, precoUnitario:0, subtotal: 0 })
}

function removerItem(index: number) {
  form.value.itens.splice(index, 1)
}

function toggleDetalhes(id: number) {
  vendaAbertaId.value =
    vendaAbertaId.value === id ? null : id;
}

// request
async function salvar() {
  if (!form.value.idCliente || !form.value.idFormaPagamento || form.value.itens.length === 0) {
    toast.warning('Preencha todos os campos e adicione ao menos um item.')
    return
  }

  try {
    if (editId.value === null) {
      await api.post('/venda', form.value)
    } else {
      await api.put(`/venda/${editId.value}`, form.value)
    }
    limpar()
    carregarTudo()
  } catch (error: any) {
    toast.error(error.response?.data?.error || 'Erro ao salvar venda')
  }
}

function editarVenda(venda: Venda) {

  editId.value = venda.id

  form.value.idCliente = venda.idCliente
  form.value.idFormaPagamento = venda.idFormaPagamento

  form.value.itens = venda.itens.map((i: any) => ({
    idProduto: i.idProduto,
    precoUnitario: i.precoUnitario,
    quantidade: i.quantidade,
    subtotal: Number(i.subtotal)
  }))
}

async function excluir(id: number) {
if (confirm('Deseja excluir esta venda?')) {
  await api.delete(`/venda/${id}`)
  carregarTudo()
}
}

function limpar() {
  editId.value = null
  form.value = {
    idCliente: 0,
    idFormaPagamento: 0,
    itens: [{ idProduto: 0, quantidade: 1, precoUnitario:0, subtotal: 0 }]
  }
}

onMounted(carregarTudo)
</script>

<template>
  <div class="max-w-4xl space-y-6">
    <h1 class="text-2xl font-bold">Vendas</h1>

    <!-- FORM -->
    <div class="bg-white p-6 rounded shadow space-y-4">
      <div class="flex gap-4">
        <div class="flex-1">
          <label>Cliente</label>
          <select v-model="form.idCliente" class="w-full border px-2 py-1 rounded">
            <option :value="0">Selecione</option>
            <option v-for="c in clientes" :key="c.id" :value="c.id">{{ c.nome }}</option>
          </select>
        </div>

        <div class="flex-1">
          <label>Forma de Pagamento</label>
          <select v-model="form.idFormaPagamento" class="w-full border px-2 py-1 rounded">
            <option :value="0">Selecione</option>
            <option v-for="f in pagamentos" :key="f.id" :value="f.id">{{ f.nome }}</option>
          </select>
        </div>
      </div>

      <!-- ITENS -->
      <div class="space-y-2">
        <h2 class="font-semibold">Itens</h2>
        <div v-for="(item, index) in form.itens" :key="index" class="flex gap-2 items-end">
          <div class="flex-1">
            <label>Produto</label>
            <select v-model="item.idProduto" @change="atualizarSubtotal(item)" class="w-full border px-2 py-1 rounded">
              <option :value="0">Selecione</option>
              <option v-for="p in produtos" :key="p.id" :value="p.id">{{ p.nome }}</option>
            </select>
          </div>

          <div class="w-24">
            <label>Qtd</label>
            <input type="number" min="1" v-model.number="item.quantidade" @input="atualizarSubtotal(item)" class="w-full border px-2 py-1 rounded" />
          </div>

          <div class="w-32">
            <label>Subtotal</label>
            <input type="text" :value="item.subtotal.toFixed(2)" readonly class="w-full border px-2 py-1 rounded bg-gray-100" />
          </div>

          <button type="button" @click="removerItem(index)" class="bg-red-500 text-white px-2 py-1 rounded">X</button>
        </div>

        <button type="button" @click="adicionarItem()" class="bg-blue-500 text-white px-3 py-1 rounded mt-2">Adicionar Item</button>
      </div>

      <!-- TOTAL -->
      <div class="text-right font-bold text-lg">
        Total: R$ {{ totalVenda.toFixed(2) }}
      </div>

      <!-- BOTÕES -->
      <div class="flex gap-2 justify-end">
        <button @click="salvar" class="bg-green-500 text-white px-4 py-2 rounded">
          {{ editId === null ? 'Salvar' : 'Atualizar' }}
        </button>
        <button @click="limpar" class="bg-gray-300 px-4 py-2 rounded">Cancelar</button>
      </div>
    </div>


    <!-- TABELA -->
    <div class="overflow-x-auto bg-white shadow rounded">
      <table class="min-w-full divide-y divide-gray-200">
        <!-- HEADER -->
        <thead class="bg-gray-100">
          <tr>
            <th class="px-4 py-2 text-left text-sm font-semibold text-gray-700">Venda</th>
            <th class="px-4 py-2 text-left text-sm font-semibold text-gray-700">Cliente</th>
            <th class="px-4 py-2 text-right text-sm font-semibold text-gray-700">Total</th>
            <th class="px-4 py-2 text-right text-sm font-medium text-gray-700">Ações</th>
          </tr>
        </thead>

        <!-- BODY -->
        <tbody class="divide-y divide-gray-200">
          <template v-for="v in vendas" :key="v.id">
            <!-- LINHA PRINCIPAL -->
            <tr class="hover:bg-gray-50"
                @click="toggleDetalhes(v.id)"
            >
              <td class="px-4 py-2 text-sm font-medium text-gray-800">
                {{ v.id }} 
              </td>

              <td class="px-4 py-2 text-sm text-gray-700">
                {{ v.nomeCliente }}
              </td>

              <td class="px-4 py-2 text-sm text-right font-semibold text-gray-800">
                R$ {{ Number(v.total).toFixed(2) }}
              </td>
              <td class="px-4 py-2 flex justify-end gap-2">
                <button
                  @click="editarVenda(v)"
                  class="bg-yellow-400 hover:bg-yellow-500 text-white px-3 py-1 rounded text-sm"
                >
                  Editar
                </button>
                <button
                  @click="excluir(v.id)"
                  class="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm"
                >
                  Excluir
                </button>
   <span
      class="inline-block text-gray-400 transition-transform duration-200"
    >
      ▾
    </span>
              </td>
            </tr>

            <!-- SUBTABELA (ITENS DA VENDA) -->
            <tr v-if="vendaAbertaId === v.id">
              <td colspan="4" class="bg-gray-50 px-6 py-3">
                <table class="min-w-full text-sm">
                  <thead>
                    <tr class="text-gray-600">
                      <th class="py-1 text-left">Produto</th>
                      <th class="py-1 text-right">Quantidade</th>
                      <th class="py-1 text-right">Preço</th>
                      <th class="py-1 text-right">Subtotal</th>
                    </tr>
                  </thead>

                  <tbody class="divide-y divide-gray-200">
                    <tr
                      v-for="item in v.itens ?? []"
                      :key="item.idProduto"
                    >
                      <td class="py-1 text-gray-700">
                        {{ item.idProduto + " - " + item.nomeProduto }}
                      </td>
                      <td class="py-1 text-right">
                        {{ item.quantidade }}
                      </td>
                      <td class="py-1 text-right">
                        R$ {{ Number(item.precoUnitario).toFixed(2) }}
                      </td>
                      <td class="py-1 text-right font-medium">
                        R$ {{ Number(item.subtotal).toFixed(2) }}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </td>
            </tr>
          </template>
        </tbody>
      </table>
    </div>
  </div>

</template>
