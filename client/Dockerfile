FROM node

WORKDIR /app/client

COPY package.json .

RUN npm install

COPY . .

EXPOSE 8000

CMD ["npm", "start"]