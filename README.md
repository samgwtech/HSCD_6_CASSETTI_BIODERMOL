# HSCD - HIGH SPEED COLD DRYING MACHINE

# Automatic script

## Install this:
   npm install -g pm2

## Run this once from terminal inside the project:
   pm2 start npm --name "dashboard" -- run dev

   pm2 save

   pm2 list to check if the process is running


# INFLUX DB

better to use Docker

start docker desktop

docker rm -f influxdb; docker run -d --name influxdb -p 8086:8086 influxdb:2.7
docker ps
docker ps -a

from(bucket: "HSCD")
  |> range(start: -10m)
  |> filter(fn: (r) => r._measurement == "Cassetto")
  |> filter(fn: (r) => r._field == "temp")

## install python client
pip install influxdb-client

# install grafana using docker




## What this program does
   - Renders customizable telemetric data of PIM HSCD Machine onto a dashboard 
   - Acheives that through the EasySoft API to read the data ad a given address



COMMANDS IN ORDER:

npm install

pip install requests

python.exe -m pip install --upgrade pip

# TO RUN CHARTING
npm run chart

# TO RUN TRAINING
python training_chart.py --source "csv\source.csv" --interval 1 --loop

# TO RUN DASHBOARD
npm run dev

# ALTOGETHER

1) python training_chart.py --source "csv\source.csv" --interval 10 --loop
2) npm run dev