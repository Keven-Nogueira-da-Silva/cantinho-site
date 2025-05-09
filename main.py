from flask import Flask, render_template, request, redirect, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
import os

app = Flask(__name__)
CORS(app)  # Habilita CORS para todas as rotas

# Configuração do PostgreSQL (substitua pela sua URL real)
POSTGRES_URL = "postgresql://render:lkWK6Z2TpTyoiXQXkifuuQWEKlGAccBr@dpg-d0f4tfk9c44c73cbnbt0-a.oregon-postgres.render.com/renderdb_4l7m"

# Configuração do banco de dados
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL', POSTGRES_URL)
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SQLALCHEMY_ENGINE_OPTIONS'] = {
    'pool_pre_ping': True,  # Reconecta automaticamente se a conexão cair
    'pool_recycle': 300,    # Recicla conexões a cada 5 minutos
    'pool_timeout': 30,     # Tempo máximo de espera por conexão
    'max_overflow': 60      # Número máximo de conexões extras
}
db = SQLAlchemy(app)

class Reserva(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    nome = db.Column(db.String(100))
    telefone = db.Column(db.String(20))
    data = db.Column(db.String(20))
    pessoas = db.Column(db.Integer)
    evento = db.Column(db.String(50))
    obs = db.Column(db.String(200))

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/home.html')
def home():
    return render_template('home.html')

@app.route('/reservas', methods=['GET', 'POST'])
def reservas():
    if request.method == 'POST':
        try:
            data = request.get_json()
            if not data:
                return jsonify({'erro': 'Dados não fornecidos'}), 400
                
            nova = Reserva(
                nome=data.get('nome'),
                telefone=data.get('telefone'),
                data=data.get('data'),
                pessoas=data.get('pessoas'),
                evento=data.get('evento'),
                obs=data.get('obs', '')
            )
            db.session.add(nova)
            db.session.commit()
            return jsonify({'mensagem': 'Reserva salva com sucesso!'}), 201
        except Exception as e:
            db.session.rollback()
            return jsonify({'erro': f'Erro ao salvar reserva: {str(e)}'}), 500
    else:
        try:
            todas = Reserva.query.all()
            return jsonify([{
                'id': r.id,
                'nome': r.nome,
                'telefone': r.telefone,
                'data': r.data,
                'pessoas': r.pessoas,
                'evento': r.evento,
                'obs': r.obs
            } for r in todas])
        except Exception as e:
            return jsonify({'erro': f'Erro ao buscar reservas: {str(e)}'}), 500

@app.route('/deletar/<int:id>', methods=['POST'])
def deletar(id):
    try:
        data = request.get_json()
        if not data or data.get('senha') != '147952':
            return jsonify({'erro': 'Senha incorreta'}), 401
            
        reserva = Reserva.query.get(id)
        if not reserva:
            return jsonify({'erro': 'Reserva não encontrada'}), 404
            
        db.session.delete(reserva)
        db.session.commit()
        return jsonify({'mensagem': 'Reserva deletada'})
    except Exception as e:
        db.session.rollback()
        return jsonify({'erro': f'Erro ao deletar reserva: {str(e)}'}), 500

if __name__ == '__main__':
    with app.app_context():
        try:
            print("Criando tabelas...")
            db.create_all()  # Cria tabelas se não existirem
            print("Tabelas criadas com sucesso!")
        except Exception as e:
            print(f"Erro ao criar tabelas: {str(e)}")
    
    # Configurações para o Render
    port = int(os.environ.get("PORT", 5000))
    app.run(host='0.0.0.0', port=port, debug=False)