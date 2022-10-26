#!/bin/bash

npx prisma migrate deploy
if [ $NODE_ENV = "production" ]
then
    echo "running in prod mode"
    npm start
else
    echo "running in dev mode"
    npm run dev
fi

