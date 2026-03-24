from influxdb_client import InfluxDBClient, Point, WritePrecision
from datetime import datetime, timezone
import os
from dotenv import load_dotenv
import time
import math

load_dotenv()

url = "http://localhost:8086"
token = os.getenv("INFLUXDB_TOKEN")
org = os.getenv("INFLUXDB_ORG")
bucket = os.getenv("INFLUXDB_BUCKET")

client = InfluxDBClient(url=url, token=token, org=org)
write_api = client.write_api()

start_time = time.time()

while True:
    now = datetime.now(timezone.utc)
    t = time.time() - start_time  # elapsed time

    points = []

    # simulate progression for each drawer
    for i in range(1, 7):
        temp = 50 + i * 5 + 10 * math.sin(t / 10 + i)   # smooth variation
        power = 30 + i * 5 + 5 * math.cos(t / 8 + i)

        points.append(
            Point("Cassetto")
            .tag("id", str(i))
            .field("temp", float(temp))
            .field("power", float(power))
            .time(now, WritePrecision.NS)
        )

    # machine vacuum
    vuoto = 12 + 0.5 * math.sin(t / 15)

    points.append(
        Point("Macchina")
        .field("vuoto", float(vuoto))
        .time(now, WritePrecision.NS)
    )

    write_api.write(bucket=bucket, org=org, record=points)

    print(f"Written at {now}")
    time.sleep(5)