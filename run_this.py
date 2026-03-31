import requests
import json
import time
import urllib3
urllib3.disable_warnings()

URL = "http://192.168.151.100/"
APIKEY = "aa554fa5a1d8135fc6d139d865a4f66f55916ddb04742bcec5622f17a292b50d54327980e36a38e1"

#f"https://{IP_TO_BE_USED}/api/get/data?elm="
#    f"MW({MW_VALORE_VUOTO_MACCHINA})+"
#    f"MW({MW_TEMP_DRAWER_1})+MW({MW_POWER_DRAWER_1}+"

def request(target, method="GET"):
    print(f"Preparing {method} request to {target}...")
    headers = {'Authorization': f"Bearer {APIKEY}"}
    try:
        if method == "POST":
            print(f"Making POST request to {URL + target} with headers {headers}")
            resp = requests.post(URL + target, headers=headers, verify=False, timeout=10)
        else:
            print(f"Making GET request to {URL + target} with headers {headers}")
            resp = requests.get(URL + target, headers=headers, verify=False, timeout=10)
        
        print(f"Received response: {resp.status_code} - {resp.text}")
        if resp.status_code not in [200, 204]:
            print(f"❌ Error {resp.status_code}: {resp.text}")
            return resp.status_code, None
        
        # Decode if bytes
        content = resp.text if isinstance(resp.text, str) else resp.content.decode('utf-8')
        print(f"✅ {resp.status_code} - {content}")
        return resp.status_code, content
    except Exception as e:
        print(f"❌ {e}")
        return None, None

def isRunning():
    """Check if PLC is running"""
    print("Checking if PLC is running...")
    status, content = request("api/get/data?elm=STATE")
    print(f"PLC State Response: {status} - {content}")
    if status != 200 or not content:
        print("Failed to get PLC state")
        return False
    try:
        print("Parsing PLC state response...")
        data = json.loads(content)
        print(f"Parsed PLC State: {data.get('SYSINFO', {}).get('STATE')}")
        return data.get("SYSINFO", {}).get("STATE") == "RUN"
    except (ValueError, KeyError):
        print("JSON parsing failed")
        return False

def setOp(op, index, val):
    """Set operand - MW22 for chiller"""
    print(f"Setting {op}{index} to {val}...")
    target = f"api/set/op?op={op}&index={index}&val={val}"
    # url = f"api/set/op?op={op}&index={index}&val={val}"
    print(f"Constructed URL: {URL}{target}")
    status, response = request(target, method="POST")
    print(f"Set {op}{index} Response: {status} - {response}")
    return status, response

def main():
    #if not isRunning():
        #print("PLC not running")
        #return
    
    # Set MW22 to 1 (chiller on)
    print("Turning chiller ON...")
    setOp("M", 1, 1)
    time.sleep(0.3)
    # Set MW22 to 0 (chiller off)
    setOp("M", 2, 1)

if __name__ == "__main__":
    print("Starting script...")
    main()