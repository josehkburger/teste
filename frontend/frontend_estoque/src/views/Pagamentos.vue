<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { api } from '../services/api'
import {useToast} from 'vue-toast-notification';
import 'vue-toast-notification/dist/theme-default.css';

interface Pagamento {
  id: number
  nome: string
  parcelas: number
}

const pagamentos = ref<Pagamento[]>([])

const form = ref<Omit<Pagamento, 'id'>>({
  nome: '',
  parcelas: 1
})

const toast = useToast()
const editId = ref<number | null>(null)


async function carregar() {
  const res = await api.get('/pagamento')
  pagamentos.value = res.data
}

async function salvar() {
  try {
    if (!form.value.nome) {
      toast.warning('Nome é obrigatório')
      return
    }

    if (editId.value === null) {
      // CREATE
      await api.post('/pagamento', form.value)
    } else {
      // UPDATE
      await api.put(`/pagamento/${editId.value}`, form.value)
    }

    limpar()
    carregar()
  }catch(error: any) {
    toast.error(error.response?.data?.error || 'Erro ao salvar pagamento')
  }
}

async function excluir(id: number) {
  try {  
    if (confirm('Deseja excluir este pagamento?')) {
      await api.delete(`/pagamento/${id}`)
      carregar()
    }
  }catch(error: any) {
    toast.error(error.response?.data?.error || 'Erro ao salvar pagamento')
  }
}

function editar(p: Pagamento) {
  editId.value = p.id
  form.value = {
    nome: p.nome,
    parcelas: p.parcelas
  }
}

function limpar() {
  editId.value = null
  form.value = {
    nome: '',
    parcelas: 1
  }
}

onMounted(carregar)
</script>

<template>
  <div class="max-w-6xl space-y-6">
    <!-- Título -->
    <h1 class="text-2xl font-bold text-gray-800">Forma de Pagamento</h1>

    <!-- FORM -->
    <div class="bg-white shadow rounded p-6 flex flex-wrap gap-4 items-end">
      <!-- Nome -->
      <div class="flex flex-col flex-1 min-w-[160px]">
        <label class="mb-1 font-medium text-gray-700">Nome</label>
        <input
          v-model="form.nome"
          placeholder="Ex: Crédito"
          class="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
      </div>

      <!-- Parcelas -->
      <div class="flex flex-col flex-1 min-w-[100px]">
        <label class="mb-1 font-medium text-gray-700">Parcelas</label>
        <input
          type="number"
          min="1"
          v-model.number="form.parcelas"
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
            <th class="px-4 py-2 text-left text-sm font-medium text-gray-700">Parcelas</th>
            <th class="px-4 py-2 text-right text-sm font-medium text-gray-700">Ações</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200">
          <tr v-for="p in pagamentos" :key="p.id" class="hover:bg-gray-50">
            <td class="px-4 py-2 text-sm text-gray-700">{{ p.id }}</td>
            <td class="px-4 py-2 text-sm text-gray-700">{{ p.nome }}</td>
            <td class="px-4 py-2 text-sm text-gray-700">{{ p.parcelas }}</td>
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
