from urllib.parse import urlparse
import pandas as pd
import psycopg2
import dotenv
import os
dotenv.load_dotenv()


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
        print(f"insert model: {modelo}")

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
            status[bike["Unnamed: 1"]],
            bike["ULOCK"],
            bike["Luces"],
            bike["FLOTA"],
            bike["Reflectante"],
            models[bike["Modelo"]]

        )
        cursor.execute(query, params)
        print(f"insert bike: {bike['codigos']}")



conn = connection()
table = pd.read_csv("Inventario.csv")
table = table[~table["codigos"].isna()]
table["Modelo"] = table["Modelo"].fillna("")
models = creacte_models(conn, table)
create_bicycles(conn, table, models)
conn.close()
