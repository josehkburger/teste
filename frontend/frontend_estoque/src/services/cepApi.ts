import axios from 'axios'

export const cepApi = axios.create({
  baseURL: 'https://viacep.com.br/ws',
  timeout: 5000
})