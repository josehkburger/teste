<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { api } from '../services/api'
import {useToast} from 'vue-toast-notification';
import 'vue-toast-notification/dist/theme-default.css';

interface Produto {
  id: number
  nome: string
  quantidade: number
  preco: number
}

const toast = useToast()
const produtos = ref<Produto[]>([])

const form = ref<Omit<Produto, 'id'>>({
  nome: '',
  quantidade: 0,
  preco: 0
})

const editId = ref<number | null>(null)

// ================= API =================
async function carregar() {
  const res = await api.get('/produto')
  produtos.value = res.data
}

async function salvar() {
  try {
    if (!form.value.nome) {
      toast.warning('Nome é obrigatório')
      return
    }

    if (editId.value === null) {
      // CREATE
      await api.post('/produto', form.value)
    } else {
      // UPDATE
      await api.put(`/produto/${editId.value}`, form.value)
    }

    limpar()
    carregar()
  } catch ( error: any ) {
     toast.error(error.response?.data?.error || 'Erro ao salvar venda')
  } 
}

async function excluir(id: number) {
  try {  
    if (confirm('Deseja excluir este produto?')) {
      await api.delete(`/produto/${id}`)
      carregar()
    }
  } catch ( error: any ) {
     toast.error(error.response?.data?.error || 'Erro ao salvar venda')
  } 

}

function editar(p: Produto) {
  editId.value = p.id
  form.value = {
    nome: p.nome,
    quantidade: p.quantidade,
    preco: p.preco
  }
}

function limpar() {
  editId.value = null
  form.value = {
    nome: '',
    quantidade: 0,
    preco: 0
  }
}

onMounted(carregar)
</script>

<template>
  <div class="max-w-5xl space-y-6">
    <!-- Título -->
    <h1 class="text-2xl font-bold text-gray-800">Produtos</h1>

    <!-- FORM -->
    <div class="bg-white shadow rounded p-6 flex flex-wrap gap-4 items-end">
      <!-- Nome -->
      <div class="flex flex-col flex-1 min-w-[160px]">
        <label class="mb-1 font-medium text-gray-700">Nome</label>
        <input
          v-model="form.nome"
          placeholder="Nome do produto"
          class="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
      </div>

      <!-- Quantidade -->
      <div class="flex flex-col flex-1 min-w-[100px]">
        <label class="mb-1 font-medium text-gray-700">Quantidade</label>
        <input
          type="number"
          min="0"
          v-model.number="form.quantidade"
          class="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
      </div>

      <!-- Preço -->
      <div class="flex flex-col flex-1 min-w-[120px]">
        <label class="mb-1 font-medium text-gray-700">Preço</label>
        <input
          type="number"
          step="0.01"
          min="0"
          v-model.number="form.preco"
          class="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
      </div>

      <!-- Botões -->
      <div class="flex gap-2">
        <button
          @click="salvar"
          class="bg-blue-500 hover:bg-blue-600 text-white font-medium px-4 py-2 rounded"
        >
          {{ editId === null ? 'Salvar' : 'Atualizar' }}
        </button>
        <button
          v-if="editId !== null"
          @click="limpar"
          class="bg-gray-300 hover:bg-gray-400 text-gray-800 font-medium px-4 py-2 rounded"
        >
          Cancelar
        </button>
      </div>
    </div>

    <!-- LISTA -->
    <div class="overflow-auto">
      <table class="min-w-full border border-gray-300 divide-y divide-gray-200 bg-white">
        <thead class="bg-gray-100">
          <tr>
            <th class="px-4 py-2 text-left text-sm font-medium text-gray-700">ID</th>
            <th class="px-4 py-2 text-left text-sm font-medium text-gray-700">Nome</th>
            <th class="px-4 py-2 text-left text-sm font-medium text-gray-700">Quantidade</th>
            <th class="px-4 py-2 text-left text-sm font-medium text-gray-700">Preço</th>
            <th class="px-4 py-2 text-right text-sm font-medium text-gray-700">Ações</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200">
          <tr v-for="p in produtos" :key="p.id" class="hover:bg-gray-50">
            <td class="px-4 py-2 text-sm text-gray-700">{{ p.id }}</td>
            <td class="px-4 py-2 text-sm text-gray-700">{{ p.nome }}</td>
            <td class="px-4 py-2 text-sm text-gray-700">{{ p.quantidade }}</td>
            <td class="px-4 py-2 text-sm text-gray-700">R$ {{ p.preco }}</td>
            <td class="px-4 py-2 flex justify-end gap-2">
              <button
                @click="editar(p)"
                class="bg-yellow-400 hover:bg-yellow-500 text-white px-3 py-1 rounded text-sm"
              >
                Editar
              </button>
              <button
                @click="excluir(p.id)"
                class="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm"
              >
                Excluir
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

