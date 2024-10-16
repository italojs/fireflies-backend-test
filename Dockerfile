FROM node:22-alpine

WORKDIR /usr/src/app

COPY package*.json ./

# usually i use npm ci --omit dev but i was having a annoying error so decided to follow with npm i 
RUN npm i 

COPY . .

EXPOSE 3000

CMD ["npm", "start"]
