import requests
import csv
import time
from datetime import datetime
import os
from dotenv import load_dotenv

load_dotenv()  # Load environment variables from .env file
IP_SEVIO = "10.139.216.102"
IP_PLC = "192.168.151.102"

#set IP_TO_BE_USED as IP_ADDRESS from .env
IP_TO_BE_USED = os.getenv("IP_ADDRESS", IP_PLC)  # default to IP_PLC if not set

APIKEY = "aa554fa5a1d8135fc6d139d865a4f66f55916ddb04742bcec5622f17a292b50d54327980e36a38e1"
DURATION_OF_MEASUREMENT = 25 * 60  # 25 minutes in seconds

sleep_interval = 8
# M markers
M_START = 1

# MW markers

# cassetto 1
TEMP_1_1 = 240
TEMP_1_2 = 241
TEMP_1_3 = 242

# cassetto 2
TEMP_2_1 = 243
TEMP_2_2 = 244
TEMP_2_3 = 245

POW_1_1 = 246
POW_1_2 = 247
POW_1_3 = 248
POW_2_1 = 249
POW_2_2 = 250
POW_2_3 = 251

MW_VALORE_VUOTO_MACCHINA = 239
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


GET_URL = (
    f"https://192.168.151.100/api/get/data?elm="
    f"M({M_START})+"
    f"MW({MW_VALORE_VUOTO_MACCHINA})+"
    f"MW({MW_TEMP_DRAWER_1})+"
    f"MW({MW_TEMP_DRAWER_2})+"
    f"MW({MW_TEMP_DRAWER_3})+"
    f"MW({MW_TEMP_DRAWER_4})+"
    f"MW({MW_TEMP_DRAWER_5})+"
    f"MW({MW_TEMP_DRAWER_6})"
)

# Create CSV file with current date/time in the name
start_time = datetime.now()
# file_title = start_time.strftime("csv/%Y-%m-%d_%H-%M-%_MONITORING.csv")
file_name = "csv/MONITORING.csv"

# Write CSV header
with open(file_name, mode='w', newline='') as file:
    writer = csv.writer(file)
    writer.writerow([
        "TIMESTAMP", "MILLIBAR MACCHINA", "TEMPERATURA CASSETTO 1", "POTENZA CASSETTO 1", "TEMPERATURA CASSETTO 2", "POTENZA CASSETTO 2", "TEMPERATURA CASSETTO 3", "POTENZA CASSETTO 3", "TEMPERATURA CASSETTO 4", "POTENZA CASSETTO 4", "TEMPERATURA CASSETTO 5", "POTENZA CASSETTO 5", "TEMPERATURA CASSETTO 6", "POTENZA CASSETTO 6"])

print(f"CSV file created: {file_name}")

# Start the measurement loop using dynamic sleep intervals
while (datetime.now() - start_time).total_seconds() < DURATION_OF_MEASUREMENT:
    current_datetime = datetime.now()
    current_time_str = current_datetime.strftime("%Y-%m-%d %H:%M:%S")
    elapsed_seconds = int((current_datetime - start_time).total_seconds())
    headers = {'Authorization': f"Bearer {APIKEY}"}

    try:
        requests.get(GET_URL,verify=False)
        # /api/set/op?op=MW&index=<NUMERO>&val=<VALORE>
        print("\nAPI Request:", GET_URL)
        response = requests.get(GET_URL, headers=headers, verify=False)
        if response.status_code == 200:
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

            with open(file_name, mode='a', newline='') as file:
                writer = csv.writer(file)
                writer.writerow([
                    elapsed_seconds, current_time_str, valore_vuoto_macchina, temp_cassetto_1, pow_cassetto_1, temp_cassetto_2, pow_cassetto_2, temp_cassetto_3, pow_cassetto_3, temp_cassetto_4, pow_cassetto_4, temp_cassetto_5, pow_cassetto_5, temp_cassetto_6, pow_cassetto_6
                ])
            print(f"{current_time_str} -> Data logged successfully ")

    except Exception as e:
        print(f"{current_time_str} -> Request failed: {e}")
        sleep_interval = 30  # fallback sleep on exception

    time.sleep(sleep_interval)

print("Measurement complete! ")
