import json
from multiprocessing.pool import TERMINATE
from urllib.parse import urlparse
from dataclasses import dataclass
import pandas as pd
import random
import psycopg2
import dotenv
import requests
import os
import time
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
        cursor.execute("""
        insert into "BicycleModel" (name, description, image)
        values (%s, '', '')
        on conflict do nothing;
        """, (modelo,))

    cursor.execute("""
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
            fleet,
            "modelId"
        )
        values (
            %s, %s, %s,%s
        )
        on conflict do nothing;
        """
        params = (
            bike["codigos"],
            status[bike["Unnamed: 1"]] or "",
            bike["FLOTA"] or "",
            models[bike["Modelo"]] or ""

        )
        cursor.execute(query, params)


with open("users.json") as f:
    USERS = json.load(f)
    TERMINATE = USERS[:3]
    BOOKING = USERS[:6]
    SUBMISSION = USERS[:9]

conn = connection()
cursor = conn.cursor()

print(os.listdir("/home/upload"))
table = pd.read_csv("/home/upload/Inventario.csv")
table = table[~table["codigos"].isna()]
table["Modelo"] = table["Modelo"].fillna("")
table = table.fillna("")
models = creacte_models(conn, table)
create_bicycles(conn, table, models)
conn.commit()
print("populated db")


for user in USERS:
    # create user
    r = requests.post("http://sibico-backend:5001/user/", json=user)

    if r.json()["status"] == "success":
        user.update(r.json()["user"])
        cursor.execute(
            'update "User" set "isAdmin" = true, "isValidated" = true, "isStaff" = true where id = %s;', (
                user["id"],
            ))
        conn.commit()
        print("created", user["email"])

    # log in
    r = requests.post("http://sibico-backend:5001/user/login", json={
        "email": user["email"],
        "password": user["password"]
    })

    user["headers"] = {"x-access-token": r.json()["x-access-token"]}

    if user.get("id") == None:
        r = requests.get("http://sibico-backend:5001/user/me",
                         headers=user["headers"])
        user.update(r.json()["user"])


for user in SUBMISSION:
    r = requests.get("http://sibico-backend:5001/bicycle-model/available")

    model = r.json()["models"][0]

    url = "http://sibico-backend:5001/submission"

    payload = {
        "bicycleModelId": model["id"],
        "userId": user["id"]
    }
    r = requests.post(url, json=payload, headers=user["headers"])
    if r.json()["status"] == "success":
        user["submission"] = r.json()["submission"]

for user in BOOKING:
    headers = user["headers"]

    r = requests.get("http://sibico-backend:5001/bicycle", headers=headers)
    bicycles = [bike for bike in r.json()["bicycles"]]

    payload = {
        "qrCode": bicycles[user["id"]]["qrCode"],
        "lights": random.randint(0, 1),
        "ulock":  random.randint(0, 1),
        "userId": user["id"],
        "reflector": random.randint(0, 1),
    }
    r = requests.post("http://sibico-backend:5001/submission/upgrade",
                      headers=headers, json=payload)
    print(r.json())
    r = requests.get("http://sibico-backend:5001/booking/mine",
                     params={"activeOnly": True}, headers=user["headers"])
    print(r.json())
    user["booking"] = r.json()["bookings"][0]


for user in TERMINATE:
    if user.get("booking"):
        form = {
            "bicycleReview": 5,
            "accessoryReview": 5,
            "suggestions": "n/a",
            "parkingSpot": "Agronomía - San Joaquín",
        }
        r = requests.put("http://sibico-backend:5001/exit-form",
                         json=form, headers=user["headers"])
        assert r.json()["status"] == "success", r.json()

        r = requests.put("http://sibico-backend:5001/booking/terminate", json={
            "qrCode": user["booking"]["bicycle"]["qrCode"],
        }, headers=user["headers"])
        assert r.json()["status"] == "success", r.json()


conn.close()
