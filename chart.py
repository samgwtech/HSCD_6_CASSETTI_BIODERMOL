import requests
import csv
import time
from datetime import datetime
import sys
import sqlite3

from dotenv import load_dotenv
import os

def init_db():
    conn = sqlite3.connect("machine_data.db")
    cursor = conn.cursor()

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS measurements (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        timestamp TEXT,
        elapsed_seconds INTEGER,
        valore_vuoto_macchina REAL,
        temp1 REAL, pow1 REAL,
        temp2 REAL, pow2 REAL,
        temp3 REAL, pow3 REAL,
        temp4 REAL, pow4 REAL,
        temp5 REAL, pow5 REAL,
        temp6 REAL, pow6 REAL
    )
    """)

    conn.commit()
    return conn

def insert_data(conn, timestamp, elapsed, vv, t1, p1, t2, p2, t3, p3, t4, p4, t5, p5, t6, p6):
    cursor = conn.cursor()

    cursor.execute("""
    INSERT INTO measurements (
        timestamp, elapsed_seconds, valore_vuoto_macchina,
        temp1, pow1, temp2, pow2, temp3, pow3,
        temp4, pow4, temp5, pow5, temp6, pow6
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (timestamp, elapsed, vv, t1, p1, t2, p2, t3, p3, t4, p4, t5, p5, t6, p6))
load_dotenv()
IP_ADDRESS = "192.168.151.101"
BASE_URL = f"https://{IP_ADDRESS}/api/get/data"
#the key does not automatically change; 
# rather, the user account configuration (which is part of the project) can be overwritten during a program download, which may render the existing API key invalid.
# If the new project preserves the same user accounts and the administrator does not manually delete the key, the same API key will continue to work.
APIKEY = os.getenv("EASYSOFT_API_KEY")
if not APIKEY:
    raise ValueError("API key non trovata. Controlla il file .env")

conn = init_db()

def check_connection(base_url, headers):
    test_url = f"{base_url}?elm=M(1)"

    try:
        print("🔍 Checking PLC connection...")

        response = requests.get(
            test_url,
            headers=headers,
            verify=False,
            timeout=5
        )

        if response.status_code != 200:
            print(f"❌ API error: {response.status_code}")
            return False

        data = response.json()

        # 🔴 CONTROLLO VERO
        if "OPERANDS" not in data:
            print("❌ Risposta API non valida (no OPERANDS)")
            return False

        print("✅ PLC raggiungibile e API valida")
        return True

    except requests.exceptions.ConnectTimeout:
        print("❌ Timeout PLC")
        return False

    except requests.exceptions.ConnectionError:
        print("❌ PLC spento o non raggiungibile")
        return False

    except Exception as e:
        print(f"❌ Errore: {e}")
        return False
    
DURATION_OF_MEASUREMENT = 25 * 60  # 25 minutes in seconds

sleep_interval = 8
# M markers
M_START = 1

# MW markers

# cassetto 1
TEMP_1_1 = 18
TEMP_1_2 = 19
TEMP_1_3 = 20

# cassetto 2
TEMP_2_1 = 15
TEMP_2_2 = 16
TEMP_2_3 = 17

# change with actual mw power addresses
POW_1_1 = 666
POW_1_2 = 666
POW_1_3 = 666
POW_2_1 = 666
POW_2_2 = 666
POW_2_3 = 666

MW_VALORE_VUOTO_MACCHINA = 10
MW_POWER_DRAWER_1 = POW_1_1
MW_TEMP_DRAWER_1 = TEMP_1_1
MW_POWER_DRAWER_2 = POW_1_2
MW_TEMP_DRAWER_2 = TEMP_1_2
MW_POWER_DRAWER_3 = POW_1_3
MW_TEMP_DRAWER_3 = TEMP_1_3
MW_POWER_DRAWER_4 = POW_2_1
MW_TEMP_DRAWER_4 = TEMP_2_1
MW_POWER_DRAWER_5 = POW_2_2
MW_TEMP_DRAWER_5 = TEMP_2_2
MW_POWER_DRAWER_6 = POW_2_3
MW_TEMP_DRAWER_6 = TEMP_2_3

# Build URL with '+' as separator
URL = (
    f"https://192.168.151.101/api/get/data?elm="
    f"M({M_START})+"
    f"MW({MW_VALORE_VUOTO_MACCHINA})+"
    f"MW({MW_TEMP_DRAWER_1})+MW({MW_POWER_DRAWER_1})+"
    f"MW({MW_TEMP_DRAWER_2})+MW({MW_POWER_DRAWER_2})+"
    f"MW({MW_TEMP_DRAWER_3})+MW({MW_POWER_DRAWER_3})+"
    f"MW({MW_TEMP_DRAWER_4})+MW({MW_POWER_DRAWER_4})+"
    f"MW({MW_TEMP_DRAWER_5})+MW({MW_POWER_DRAWER_5})+"
    f"MW({MW_TEMP_DRAWER_6})+MW({MW_POWER_DRAWER_6})"
)

# Create CSV file with current date/time in the name
start_time = datetime.now()
# file_title = start_time.strftime("csv/%Y-%m-%d_%H-%M-%_MONITORING.csv")
file_name = "csv/MONITORING.csv"

# Write CSV header
with open(file_name, mode='w', newline='') as file:
    writer = csv.writer(file)
    writer.writerow([
        "TIMESTAMP", "MILLIBAR MACCHINA", "TEMPERATURA CASSETTO 1", "POTENZA CASSETTO 1", "TEMPERATURA CASSETTO 2", "POTENZA CASSETTO 2", "TEMPERATURA CASSETTO 3", "POTENZA CASSETTO 3", "TEMPERATURA CASSETTO 4", "POTENZA CASSETTO 4", "TEMPERATURA CASSETTO 5", "POTENZA CASSETTO 5", "TEMPERATURA CASSETTO 6", "POTENZA CASSETTO 6"
        ])

print(f"CSV file created: {file_name}")



# Start the measurement loop using dynamic sleep intervals
while (datetime.now() - start_time).total_seconds() < DURATION_OF_MEASUREMENT:
    current_datetime = datetime.now()
    current_time_str = current_datetime.strftime("%Y-%m-%d %H:%M:%S")
    elapsed_seconds = int((current_datetime - start_time).total_seconds())
    headers = {'Authorization': f"Bearer {APIKEY}"}
    if not check_connection(BASE_URL, headers):
        print("⛔ Blocco esecuzione: controlla PLC/API key")
        sys.exit(1)
    try:
        print("\nAPI Request:", URL)
        response = requests.get(URL, headers=headers, verify=False)

        if response.status_code != 200:
            print(f"Errore API: {response.status_code}")
            continue
        data = response.json()
        # Retrieve MW measurements from MWSINGLE and M measurements from MSINGLE
        mw_measurements = data.get("OPERANDS", {}).get("MWSINGLE", [])
        m_measurements = data.get("OPERANDS", {}).get("MSINGLE", [])

        print("MW Measurements:", mw_measurements)
        print("M Measurements:", m_measurements)

        # Initialize measurement variables
        valore_vuoto_macchina =  temp_cassetto_1 = pow_cassetto_1 =  temp_cassetto_2 = pow_cassetto_2 = temp_cassetto_3 = pow_cassetto_3 =  temp_cassetto_4 = pow_cassetto_4 =  temp_cassetto_5 = pow_cassetto_5 =  temp_cassetto_6 = pow_cassetto_6 = None

        state = None  # will be determined by M markers

        # Process MW measurements
        for m in mw_measurements:
            idx = m.get("INDEX")
            value = m.get("V")
            if idx == MW_VALORE_VUOTO_MACCHINA:
                valore_vuoto_macchina = value
            elif idx == MW_TEMP_DRAWER_1:
                temp_cassetto_1 = value
            elif idx == MW_TEMP_DRAWER_2:
                temp_cassetto_2 = value
            elif idx == MW_TEMP_DRAWER_3:
                temp_cassetto_3 = value
            elif idx == MW_TEMP_DRAWER_4:
                temp_cassetto_4 = value
            elif idx == MW_TEMP_DRAWER_5:
                temp_cassetto_5 = value
            elif idx == MW_TEMP_DRAWER_6:
                temp_cassetto_6 = value
            elif idx == MW_POWER_DRAWER_1:
                pow_cassetto_1 = value
            elif idx == MW_POWER_DRAWER_2:
                pow_cassetto_2 = value
            elif idx == MW_POWER_DRAWER_3:
                pow_cassetto_3 = value
            elif idx == MW_POWER_DRAWER_4:
                pow_cassetto_4 = value
            elif idx == MW_POWER_DRAWER_5:
                pow_cassetto_5 = value
            elif idx == MW_POWER_DRAWER_6:
                pow_cassetto_6 = value

        # Detailed parsed values log
        print("Parsed Measurements:")
        print(f"  Valore Vuoto Macchina: {valore_vuoto_macchina}")
        print(f"Temp cassetto 1: {temp_cassetto_1}, Power cassetto 1: {pow_cassetto_1}")
        print(f"Temp cassetto 2: {temp_cassetto_2}, Power cassetto 2: {pow_cassetto_2}")
        print(f"Temp cassetto 3: {temp_cassetto_3}, Power cassetto 3: {pow_cassetto_3}")
        print(f"Temp cassetto 4: {temp_cassetto_4}, Power cassetto 4: {pow_cassetto_4}")
        print(f"Temp cassetto 5: {temp_cassetto_5}, Power cassetto 5: {pow_cassetto_5}")
        print(f"Temp cassetto 6: {temp_cassetto_6}, Power cassetto 6: {pow_cassetto_6}")

        insert_data(
            conn,
            current_time_str,
            elapsed_seconds,
            valore_vuoto_macchina,
            temp_cassetto_1, pow_cassetto_1,
            temp_cassetto_2, pow_cassetto_2,
            temp_cassetto_3, pow_cassetto_3,
            temp_cassetto_4, pow_cassetto_4,
            temp_cassetto_5, pow_cassetto_5,
            temp_cassetto_6, pow_cassetto_6
        )
        if elapsed_seconds % 30 == 0:
            conn.commit()
        print(f"{current_time_str} -> Data inserted into SQL database successfully")


        with open(file_name, mode='a', newline='') as file:
            writer = csv.writer(file)
#      index:0 lapsed_seconds, index:1 current_time_str, index:2 valore_vuoto_macchina, index:3 temp_cassetto_1, index:4 pow_cassetto_1, index:5 temp_cassetto_2, index:6 pow_cassetto_2, index:7 temp_cassetto_3, index:8 pow_cassetto_3, index:9 temp_cassetto_4, index:10 pow_cassetto_4, index:11 temp_cassetto_5, index:12 pow_cassetto_5, index:13 temp_cassetto_6, index:14 pow_cassetto_6

            writer.writerow([
                elapsed_seconds, current_time_str, valore_vuoto_macchina, temp_cassetto_1, pow_cassetto_1, temp_cassetto_2, pow_cassetto_2, temp_cassetto_3, pow_cassetto_3, temp_cassetto_4, pow_cassetto_4, temp_cassetto_5, pow_cassetto_5, temp_cassetto_6, pow_cassetto_6
            ])
        print(f"{current_time_str} -> Data logged successfully ")

    except Exception as e:
        print(f"{current_time_str} -> Request failed: {e}")
        sleep_interval = 30  # fallback sleep on exception

    time.sleep(sleep_interval)

print("Measurement complete! ")
conn.commit()
conn.close()