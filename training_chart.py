import csv
import os
import time
import argparse

def stream_csv_one_row_per_second(
    source_csv: str,
    out_csv: str,
    interval_sec: float = 1.0,
    loop: bool = False,
) -> None:
    """
    Esempi:
      python training_chart.py --source "csv\\source.csv"
      python training_chart.py --source "csv\\source.csv" --interval 0.2
      python training_chart.py --source "csv\\source.csv" --loop
    """
    if not os.path.isfile(source_csv):
        raise FileNotFoundError(f"Source CSV not found: {source_csv}")

    out_dir = os.path.dirname(out_csv)
    if out_dir:
        os.makedirs(out_dir, exist_ok=True)

    # Leggo tutto il source in memoria (semplice)
    with open(source_csv, "r", newline="", encoding="utf-8") as f:
        reader = list(csv.reader(f))

    if not reader:
        raise ValueError("Source CSV is empty")

    header = reader[0]
    rows = reader[1:]

    if not rows:
        raise ValueError("Source CSV has only header, no data rows")

    cycle = 0
    try:
        while True:
            cycle += 1

            # Sovrascrivo out_csv a ogni ciclo (truncate)
            with open(out_csv, "w", newline="", encoding="utf-8") as out:
                w = csv.writer(out)
                w.writerow(header)
                out.flush()

            # Appendo righe una per volta
            with open(out_csv, "a", newline="", encoding="utf-8") as out:
                w = csv.writer(out)
                for r in rows:
                    w.writerow(r)
                    out.flush()
                    time.sleep(interval_sec)

            if not loop:
                break

            print(f"Loop: fine ciclo {cycle}, riparto da capo (reset file).")

    except KeyboardInterrupt:
        print("\nInterrotto da tastiera (CTRL+C).")


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--source", required=True, help="CSV sorgente (già pieno) da riprodurre lentamente")
    parser.add_argument(
        "--out",
        default=os.path.join("csv", "csv_data.csv"),
        help="CSV di output letto dalla dashboard (default: csv\\csv_data.csv)",
    )
    parser.add_argument("--interval", type=float, default=1.0, help="Secondi tra una riga e la successiva (default: 1.0)")
    parser.add_argument("--loop", action="store_true", help="Quando arrivi all'ultima riga, riparti da capo resettando out_csv")
    args = parser.parse_args()

    print(f"Source : {args.source}")
    print(f"Out    : {args.out}")
    print(f"Every  : {args.interval} sec/row")
    print(f"Loop   : {args.loop}")

    stream_csv_one_row_per_second(args.source, args.out, args.interval, args.loop)
    print("Done.")


if __name__ == "__main__":
    main()
