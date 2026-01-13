FROM node:18

WORKDIR /app

COPY package*.json ./
RUN npm install

RUN npm run dev
RUN npm run build
RUN vite --config 

COPY . .

EXPOSE 3000

CMD ["npm", "start"]