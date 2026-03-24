@echo off
cd /d "C:\Users\Admin\OneDrive\Desktop\PIM 4.0 INDUSTRY PROGRAM\HSCD_6_CASSETTI_BIODERMOL"

echo Avvio dashboard...
start http://localhost:3000
npm run dev
echo Fine processo
pause