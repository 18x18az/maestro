FROM node:20.5.1-alpine as build

WORKDIR /usr/src/app

COPY package.json .
COPY yarn.lock .

RUN yarn install

COPY prisma ./prisma/

COPY .env ./

RUN yarn prisma generate

COPY --chown=node:node src ./src/
COPY --chown=node:node tsconfig.json ./

ENV NODE_ENV=production

RUN yarn build

RUN yarn install --immutable --immutable-cache --check-cache --production

USER node

FROM node:20.5.1-alpine as production

COPY --chown=node:node --from=build /usr/src/app/.env ./.env

COPY --chown=node:node --from=build /usr/src/app/node_modules ./node_modules
COPY --chown=node:node --from=build /usr/src/app/dist ./dist

COPY --chown=node:node --from=build /usr/src/app/prisma ./prisma

USER node

RUN npx prisma migrate dev --name init

CMD ["node", "dist/main.js"]

