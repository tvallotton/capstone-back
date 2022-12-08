# Setup
1. [instala docker desktop](https://www.docker.com/products/docker-desktop/)
2. ejecuta `docker compose build`
3. ejecuta `docker compose up -d`

# Correr el back
Para correr el back ejecuta: 
```sh
docker compose up -d
```

# Admin user
* **email:** `avcordova@uc.cl`
* **password:** `Asd12345`

# Testing

* Para poder ejecutar el testing debe cambiarse de rama a feat/backend-testing ahi podra encontrar todos los tests asociados a todos los archivos de código.
* Para poder ejecutar TODOS los test se debe ejectuar el comando npm run test. Este comando correrá el script definido en ./test/run-test.sh. Este permitirá correr cada uno de los archivos {}.test.ts de la carpeta ./test. 
* En caso de querer correr de forma individual un test (de la forma clásica con jest) se debe ejecutar npm run testing path_archivo.test.ts. 
* No hay detalle de la cobertura del testeo por la forma en que se estan ejecutando los test y por los diversos problemas en el seteo de jest, sin embargo, se busco cubrir al menos un 30% de las lineas de código de cada archivo testeado, este porcentaje exacto varia pero se asegura que hay como minimo 30% de coverage cubriendo los endpoints más importantes. 


