#!/bin/bash

npx prisma migrate deploy
echo $NODE_ENV
if [ $NODE_ENV = 'development' ]
then
    npm run dev
else
    npm start
fi

