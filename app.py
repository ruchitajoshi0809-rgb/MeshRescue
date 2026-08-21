from flask import Flask, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

@app.route("/")
def home():
    return jsonify({
        "project": "MeshRescue",
    })

@app.route("/api/vehicles")
def get_vehicles():
    vehicles = [
        {
            "id": "A",
            "distance":42,
            "direction": "East →",
            "signal": "Strong",
            "relevance": 94
        },
        {
            "id": "B",
            "distance":67,
            "direction": "East →",
            "signal": "Strong",
            "relevance": 88
        },
        {
            "id": "C",
            "distance":85,
            "direction": "West ←",
            "signal": "Medium",
            "relevance": 18
        },
        {
            "id": "D",
            "distance":102,
            "direction": "North ↑",
            "signal": "Weak",
            "relevance": 25
        },
        {
            "id": "E",
            "distance":135,
            "direction": "East →",
            "signal": "Medium",
            "relevance": 71
        }
    ]

    return jsonify(vehicles)

@app.route("/api/relay")
def get_best_relay():

    vehicles = [
        {
            "id": "A",
            "distance": 42,
            "direction": "East →",
            "signal": "Strong",
            "relevance": 94
        },
        {
            "id": "B",
            "distance": 67,
            "direction": "East →",
            "signal": "Strong",
            "relevance": 88
        },
        {
            "id": "C",
            "distance": 85,
            "direction": "West ←",
            "signal": "Medium",
            "relevance": 18
        },
        {
            "id": "D",
            "distance": 102,
            "direction": "North ↑",
            "signal": "Weak",
            "relevance": 25
        },
        {
            "id": "E",
            "distance": 135,
            "direction": "East →",
            "signal": "Medium",
            "relevance": 71
        }
    ]

    for vehicle in vehicles:

        # Signal score
        if vehicle["signal"] == "Strong":
            signal_score = 100

        elif vehicle["signal"] == "Medium":
            signal_score = 70

        else:
            signal_score = 40

        # Distance score
        distance_score = max(
            0,
            100 - (vehicle["distance"] / 150) * 100
        )

        # Final relay score
        relay_score = (
            signal_score * 0.4
            + vehicle["relevance"] * 0.4
            + distance_score * 0.2
        )

        vehicle["relayScore"] = round(relay_score)

    # Highest score first
    vehicles.sort(
        key=lambda vehicle: vehicle["relayScore"],
        reverse=True
    )

    return jsonify({
        "bestRelay": vehicles[0],
        "relayPath": vehicles[:3]
    })

if __name__ == "__main__":
    app.run(debug=True)