from flask import Flask
import random

app = Flask(__name__)
MOODS = ["happy", "sad", "excited", "tired"]

@app.route("/mood")
def mood():
    return random.choice(MOODS)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8080)