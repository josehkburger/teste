<template>
  <div class="flex h-screen bg-gray-100">
    <!-- Sidebar -->   
    <aside class="w-56 bg-gray-800 text-white p-6 flex flex-col">
      <h2 class="text-2xl font-bold mb-8">Sistema Estoque</h2>

      <nav class="flex flex-col space-y-4">
        <RouterLink
          to="/cliente"
          class="text-gray-300 hover:text-white"
          :class="{ 'text-white font-bold': isActive('/cliente') }"
        >
          Clientes
        </RouterLink>

        <RouterLink
          to="/produto"
          class="text-gray-300 hover:text-white"
          :class="{ 'text-white font-bold': isActive('/produto') }"
        >
          Produtos
        </RouterLink>

        <RouterLink
          to="/pagamento"
          class="text-gray-300 hover:text-white"
          :class="{ 'text-white font-bold': isActive('/pagamento') }"
        >
          Pagamentos
        </RouterLink>

        <RouterLink
          to="/venda"
          class="text-gray-300 hover:text-white"
          :class="{ 'text-white font-bold': isActive('/venda') }"
        >
          Vendas
        </RouterLink>
      </nav>
    </aside>

    <!-- Conteúdo -->
    <main class="flex-1 p-6 overflow-auto">
      <RouterView />
    </main>
  </div>
</template>

<script setup lang="ts">
import { RouterLink, RouterView, useRoute } from 'vue-router'

const route = useRoute()

const isActive = (path: string) => route.path === path
</script>
