from flask import Flask, jsonify
import sqlite3

app = Flask(__name__)

def get_data():
    conn = sqlite3.connect("machine_data.db")
    cursor = conn.cursor()

    cursor.execute("SELECT timestamp, temp1, pow1 FROM measurements ORDER BY id DESC LIMIT 100")
    rows = cursor.fetchall()

    conn.close()

    return rows

@app.route("/data")
def data():
    rows = get_data()
    return jsonify(rows)

app.run(debug=True)
#http://127.0.0.1:5000/data