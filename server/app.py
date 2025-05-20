from flask import Flask, request, jsonify
from flask_cors import CORS
from routes.document import bp as document_bp

app = Flask(__name__)
CORS(app)

# Registra o blueprint do documento
app.register_blueprint(document_bp, url_prefix='/api/document')

@app.route('/api/health')
def health_check():
    return jsonify({'status': 'healthy'})

if __name__ == '__main__':
    app.run(debug=True, port=5000)
