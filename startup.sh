#!/bin/bash

npx prisma migrate deploy
echo $NODE_ENV
if [ $NODE_ENV = "production" ]
then
    npm start
else
    npm run dev
fi

