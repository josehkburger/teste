import { createRouter, createWebHistory } from 'vue-router'
import Clientes from './views/Clientes.vue'
import Produtos from './views/Produtos.vue'
import Pagamentos from './views/Pagamentos.vue'
import Vendas from './views/Vendas.vue'


export default createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/cliente', component: Clientes },
    { path: '/produto', component: Produtos },
    { path: '/pagamento', component: Pagamentos },
    { path: '/venda', component: Vendas },
  ]
})