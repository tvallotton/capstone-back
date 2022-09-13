# Setup
## Base de datos
entrar a postgres:
```sh
psql
```
crear la base de datos:
```sql
create database sibico;
```
revisar su usuario en postgres (lo van a necesitar después):
```sql
select user; 
```
salir de postgres: 
```sql
\q
```
## Dotenv

Clonar el repo: 
```sh
git clone git@github.com:iic2154-uc-cl/2022-2-S2-Grupo4-Backend.git
cd 2022-2-S2-Grupo4-Backend
```
Crear un archivo .env con la url a la base de datos. Tienen que sustituir los valores de
`username` y `password`. Si no tienen contraseña dejenlo vacio. 
```sh
echo 'DATABASE_URL="postgresql://username:password@localhost:5432/sibico?schema=public"' >> .env
```
Agregar la variable `JWT_SECRET` al .env. El valor tiene que ser un string alfanumérico aleatorio.
```sh
echo 'JWT_SECRET="replazar esto con un string alfanumérico aleatorio"' >> .env
```

## Correr el servidor
Instalar las dependencias: 
```sh
npm i
```
Migrar la base de datos:
```sh
npx prisma migrate dev
```
Correr el servidor: 
```sh
npm run dev
```

# Documentación
La documentación de los endpoints se encuentra en la ruta `api-docs`. 