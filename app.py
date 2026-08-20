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

if __name__ == "__main__":
    app.run(debug=True)