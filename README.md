# HSCD - HIGH SPEED COLD DRYING MACHINE

## What this program does
   - Renders customizable telemetric data of PIM HSCD Machine onto a dashboard 
   - Acheives that through the EasySoft API to read the data ad a given address
   - 


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