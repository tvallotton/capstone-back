#!/bin/bash

docker cp src sibico-backend:./src
npm i
npx prisma migrate deploy
npx prisma generate
if [ $NODE_ENV = "production" ]
then
    echo "running in prod mode"
    npm start
else
    echo "running in dev mode"
    npm run dev
fi

