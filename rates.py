import requests
import pandas as pd

# ─── CONFIG (HARDCODED) ─────────────────────────────────────────────
CITY_NAME = "Lahore"
CSV_PATH = "cities.csv"  # <- Make sure the CSV file is in this path
CATEGORY = "Grain"
TOKEN = "WyIxMjEiLCIkMmIkMTIkMzQydGFsMzB1Vm1XWFphVVltNUZVLldJenNWc2NwMTZYN3l6LkV4eGpValdNLlN5dHRkb1ciLCIyMDI1LTA2LTEzIDIwOjI0OjQ5Il0.aExORA.ESjAh9mcFewLpTM5RoDvXMXFau0"
# ────────────────────────────────────────────────────────────────────

def get_city_coords(city_name, csv_path):
    df = pd.read_csv(csv_path)
    pk_cities = df[df['country'].str.lower().str.strip() == 'pakistan']
    match = pk_cities[pk_cities['city'].str.lower().str.strip() == city_name.lower().strip()]
    if match.empty:
        raise ValueError(f"City '{city_name}' not found in CSV.")
    city_row = match.iloc[0]
    return float(city_row['lat']), float(city_row['lng'])

def get_mandi_prices(lat, lon, category, token):
    base = "https://api.madadgaar.net/external"
    headers = {
        "Accept": "application/json",
        "X-Authorization-Token": token,
        "User-Agent": "Mozilla/5.0",
        "Referer": "https://7272.pk"
    }

    # Step 1: Get nearby mandis
    mandis_resp = requests.get(
        f"{base}/nearest_mandis",
        headers=headers,
        params={"lat": lat, "long": lon}
    )
    mandis_resp.raise_for_status()

    mandis = mandis_resp.json().get('data', [])

    # Validate mandi IDs
    filtered_mandis = []
    for m in mandis:
        if isinstance(m, list) and len(m) >= 2:
            try:
                mandi_id = int(m[0])
                mandi_name = str(m[1])
                filtered_mandis.append((mandi_id, mandi_name))
            except:
                continue

    if not filtered_mandis:
        raise ValueError("No valid mandi IDs found.")

    # Step 2: Get rates per mandi
    all_data = []

    for mandi_id, mandi_name in filtered_mandis:
        rates_resp = requests.get(
            f"{base}/all_rates/{mandi_id}",
            headers=headers,
            params={"category": category}
        )
        rates_resp.raise_for_status()

        for item in rates_resp.json().get("data", []):
            all_data.append({
                "mandi": mandi_name,
                "item": item["ItemName"],
                "category": item["ItemCategory"],
                "min_price": item["MinRate"],
                "max_price": item["MaxRate"],
                "retail_price": item["RetailRate"],
                "unit": item["UnitName"]
            })

    return pd.DataFrame(all_data)

# ─── RUN ─────────────────────────────────────────────────────────────
try:
    lat, lon = get_city_coords(CITY_NAME, CSV_PATH)
    df = get_mandi_prices(lat, lon, CATEGORY, TOKEN)

    if df.empty:
        print("No mandi rates found.")
    else:
        print(df.head(10))
        output_file = f"mandi_rates_{CITY_NAME.replace(' ', '_')}.csv"
        df.to_csv(output_file, index=False, encoding='utf-8-sig')
        print(f"✅ Saved to: {output_file}")

except Exception as e:
    print(f"❌ Error: {e}")