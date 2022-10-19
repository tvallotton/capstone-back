from urllib.parse import urlparse
import pandas as pd
import psycopg2
import dotenv
import requests
import os
import time
dotenv.load_dotenv()

time.sleep(2)
try:
    res = requests.post("http://sibico-backend:5001/user/", json={
        "email": "tvallotton@uc.cl",
        "password": "asd123",
    })
    print("response: ", res.json())
except:
    pass


def connection():
    DATABASE_URL = os.environ["DATABASE_URL"]
    url = urlparse(DATABASE_URL)
    host = url.hostname
    port = url.port
    username = url.username
    password = url.password
    database = url.path[1:]
    return psycopg2.connect(
        database=database,
        user=username,
        password=password,
        host=host,
        port=port
    )


def creacte_models(conn, table):
    cursor = conn.cursor()
    for modelo in set(table["Modelo"]):
        if str(modelo) == "nan":
            continue
        cursor.execute(f"""
        insert into "BicycleModel" (name, description, image)
        values (%s, '', '')
        on conflict do nothing;
        """, (modelo,))

    cursor.execute(f"""
        select name, id from "BicycleModel"; 
    """)
    return dict(cursor.fetchall())


def create_bicycles(conn, table, models):
    status = {
        "DISPONIBLE": "HABILITADA",
        "NO DISPONIBLE": "HABILITADA",
        "BICITUR": "EVENTO",
        "BICITOUR": "EVENTO",
        "INHABILITADA": "INHABILITADA",
        "EN REPARACIÓN": "REPARACION",
    }

    cursor = conn.cursor()
    for bike in table.iterrows():
        bike = bike[1]
        if type(models[bike["Modelo"]]) != int:
            continue

        query = """
        insert into "Bicycle" (
            "qrCode",
            status,
            ulock,
            lights,
            fleet,
            reflector,
            "modelId"
        )
        values (
            %s, %s, %s,%s, %s, %s, %s
        )
        on conflict do nothing;
        """
        params = (
            bike["codigos"],
            status[bike["Unnamed: 1"]] or "",
            bike["ULOCK"] or "",
            bike["Luces"] or "",
            bike["FLOTA"] or "",
            bike["Reflectante"] or "",
            models[bike["Modelo"]] or ""

        )
        cursor.execute(query, params)


conn = connection()

cursor = conn.cursor()
cursor.execute(
    'update "User" set "isAdmin" = true, "isStaff" = true where email = \'tvallotton@uc.cl\';')

print(os.listdir("/home/upload"))
table = pd.read_csv("/home/upload/Inventario.csv")
table = table[~table["codigos"].isna()]
table["Modelo"] = table["Modelo"].fillna("")
table = table.fillna("")
models = creacte_models(conn, table)
create_bicycles(conn, table, models)
conn.commit()
print("populated db")
conn.close()
