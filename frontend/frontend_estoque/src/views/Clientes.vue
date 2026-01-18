<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { api } from '../services/api'
import { buscarEnderecoPorCep } from '@/services/cepService'
import {useToast} from 'vue-toast-notification';
import 'vue-toast-notification/dist/theme-default.css';

interface Cliente {
  id: number
  nome: string
  cpf: string
  endereco: string
  email: string
  cep: string
}

const toast = useToast()
const clientes = ref<Cliente[]>([])

const form = ref<Omit<Cliente, 'id'>>({
  nome: '',
  cpf: '',
  endereco: '',
  email: '',
  cep: ''
})

const editId = ref<number | null>(null)
 
async function carregar() {
  const res = await api.get('/cliente')
  clientes.value = res.data
}

async function salvar() {
  try {
    if (!form.value.nome || !form.value.cpf) {
      toast.warning('Nome e CPF são obrigatórios')
      return
    }

    if (editId.value === null) {
      // CREATE
      await api.post('/cliente', form.value)
    } else {
      // UPDATE
      await api.put(`/cliente/${editId.value}`, form.value)
    }

    limpar()
    carregar()
  }catch(error: any) {
     toast.error(error.response?.data?.error)
  }
}

async function excluir(id: number) {
  try {
    if (confirm('Deseja excluir este cliente?')) {
     await api.delete(`/cliente/${id}`)
      carregar()
    }
  }catch(error: any) {
     toast.error(error.response?.data?.error)
  }
}

function editar(c: Cliente) {
  editId.value = c.id
  form.value = {
    nome: c.nome,
    cpf: c.cpf,
    endereco: c.endereco,
    email: c.email,
    cep: c.cep
  }
}

function limpar() {
  editId.value = null
  form.value = {
    nome: '',
    cpf: '',
    endereco: '',
    email: '',
    cep: ''
  }
}

function formatarCPF(valor: string): string {
  const numeros = valor.replace(/\D/g, '')

  if (numeros.length !== 11) {
    return numeros
  }

  return numeros.replace(
    /(\d{3})(\d{3})(\d{3})(\d{2})/,
    '$1.$2.$3-$4'
  )
}

async function onCepInput() {
  const cleanCep = form.value.cep.replace(/\D/g, '')
  if (cleanCep.length === 8) {
    form.value.endereco = await buscarEnderecoPorCep(cleanCep)
  }
}

onMounted(carregar)
</script>

<template>
  <div class="max-w-6xl space-y-6">
    <!-- Título -->
    <h1 class="text-2xl font-bold text-gray-800">Clientes</h1>

    <!-- FORM -->
    <div class="bg-white shadow rounded p-6 flex flex-wrap gap-4 items-end">
      <!-- Nome -->
      <div class="flex flex-col flex-1 min-w-[180px]">
        <label class="mb-1 font-medium text-gray-700">Nome</label>
        <input
          v-model="form.nome"
          placeholder="Nome completo"
          class="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
      </div>

      <!-- CPF -->
      <div class="flex flex-col flex-1 min-w-[180px]">
        <label class="mb-1 font-medium text-gray-700">CPF</label>
        <input
          v-model="form.cpf"
          placeholder="000.000.000-00"
          @input="form.cpf = formatarCPF(form.cpf)"
          maxlength="14"
          class="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
      </div>

      <!-- CEP -->
      <div class="flex flex-col flex-1 min-w-[120px]">
        <label class="mb-1 font-medium text-gray-700">CEP</label>
        <input
          v-model="form.cep"
          @input="onCepInput"
          placeholder="00000-000"
          class="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
      </div>

      <!-- Endereço -->
      <div class="flex flex-col flex-1 min-w-[250px]">
        <label class="mb-1 font-medium text-gray-700">Endereço</label>
        <input
          v-model="form.endereco"
          class="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
      </div>

      <!-- Email -->
      <div class="flex flex-col flex-1 min-w-[180px]">
        <label class="mb-1 font-medium text-gray-700">Email</label>
        <input
          v-model="form.email"
          type="email"
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
            <th class="px-4 py-2 text-left text-sm font-medium text-gray-700">CPF</th>
            <th class="px-4 py-2 text-left text-sm font-medium text-gray-700">Email</th>
            <th class="px-4 py-2 text-left text-sm font-medium text-gray-700">CEP</th>
            <th class="px-4 py-2 text-right text-sm font-medium text-gray-700">Ações</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200">
          <tr v-for="c in clientes" :key="c.id" class="hover:bg-gray-50">
            <td class="px-4 py-2 text-sm text-gray-700">{{ c.id }}</td>
            <td class="px-4 py-2 text-sm text-gray-700">{{ c.nome }}</td>
            <td class="px-4 py-2 text-sm text-gray-700">{{ c.cpf }}</td>
            <td class="px-4 py-2 text-sm text-gray-700">{{ c.email }}</td>
            <td class="px-4 py-2 text-sm text-gray-700">{{ c.cep }}</td>
            <td class="px-4 py-2 flex justify-end gap-2">
              <button
                @click="editar(c)"
                class="bg-yellow-400 hover:bg-yellow-500 text-white px-3 py-1 rounded text-sm mr-2"
              >
                Editar
              </button>
              <button
                @click="excluir(c.id)"
                class="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm mr-2"
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
