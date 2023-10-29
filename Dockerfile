FROM node:20-alpine as build

WORKDIR /usr/src/app

ADD --chown=node:node package.json ./
ADD --chown=node:node yarn.lock ./

RUN yarn install --frozen-lockfile

COPY --chown=node:node prisma ./prisma/

COPY --chown=node:node .env ./

RUN npx prisma generate

COPY --chown=node:node . .

RUN yarn build

ENV NODE_ENV production

RUN rm -rf node_modules && yarn install --frozen-lockfile --production

RUN npx prisma generate

USER node

FROM node:20-alpine as run

USER node

COPY --chown=node:node --from=build usr/src/app/.env ./

COPY --chown=node:node --from=build /usr/src/app/node_modules ./node_modules

COPY --chown=node:node --from=build /usr/src/app/dist ./dist

COPY --chown=node:node --from=build /usr/src/app/prisma ./prisma

RUN npx prisma migrate deploy

CMD [ "node", "dist/main.js" ]