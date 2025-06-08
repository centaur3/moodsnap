from flask import Flask, jsonify

app = Flask(__name__)
SUGGESTIONS = {
    "happy": ["dance", "smile", "sing"],
    "sad": ["listen to music", "call a friend"],
    "excited": ["go for a walk", "plan adventure"],
    "tired": ["nap", "drink tea"]
}

@app.route("/suggest/<mood>")
def suggest(mood):
    return jsonify(SUGGESTIONS.get(mood, []))

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8080)