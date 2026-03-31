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
POWER_CASSETTO_1  = os.getenv('VALUE_TO_SET_CASSETTO_1', '0')
POWER_ADDRESS  = os.getenv('ADDRESS_CASSETTO_1', '1')

APIKEY = "aa554fa5a1d8135fc6d139d865a4f66f55916ddb04742bcec5622f17a292b50d54327980e36a38e1"

headers = {'Authorization': f"Bearer {APIKEY}"}
SET_REQUEST_URL = (f"https://{IP_TO_BE_USED}/api/set/op?op=MW&index={POWER_ADDRESS}&val={POWER_CASSETTO_1}")
print("Sending request to:", SET_REQUEST_URL)
response = requests.get(SET_REQUEST_URL, headers=headers, verify=False)
if response.status_code == 200:
   data = response.json()