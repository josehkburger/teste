# Use Node LTS
FROM node:20-alpine

# Define diretório de trabalho
WORKDIR /usr/src/app

# Copia package.json e package-lock.json
COPY package*.json ./

# Instala dependências
RUN npm install

# Copia todo o código
COPY . .

# Compila TypeScript
RUN npm run build

# Expõe a porta
EXPOSE 3000

# Comando para rodar
# CMD ["npx", "tsx", "dist/server.js"]
CMD ["node", "dist/server.js"]
