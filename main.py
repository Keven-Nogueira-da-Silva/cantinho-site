from flask import Flask
from flask_sqlalchemy import SQLAlchemy

# Primeiro cria a instância do SQLAlchemy
db = SQLAlchemy()

# Depois cria a aplicação Flask
app = Flask(__name__)

# Configuração do banco de dados
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///reservas.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Associa a instância do SQLAlchemy com a app
db.init_app(app)

class Reserva(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    nome = db.Column(db.String(100))
    telefone = db.Column(db.String(20))
    # ... (outras colunas)

# Cria as rotas normalmente
@app.route('/')
def index():
    return render_template('index.html')

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True)