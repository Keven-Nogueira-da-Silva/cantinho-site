from flask import Flask, render_template, request, redirect, jsonify
from flask_sqlalchemy import SQLAlchemy

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///reservas.db'
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

@app.route('/home')
def home():
    return render_template('home.html')

@app.route('/reservas', methods=['GET', 'POST'])
def reservas():
    if request.method == 'POST':
        data = request.json
        nova = Reserva(
            nome=data['nome'],
            telefone=data['telefone'],
            data=data['data'],
            pessoas=data['pessoas'],
            evento=data['evento'],
            obs=data['obs']
        )
        db.session.add(nova)
        db.session.commit()
        return jsonify({'mensagem': 'Reserva salva com sucesso!'})
    else:
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

@app.route('/deletar/<int:id>', methods=['POST'])
def deletar(id):
    data = request.json
    if data.get('senha') == '147952':
        reserva = Reserva.query.get(id)
        if reserva:
            db.session.delete(reserva)
            db.session.commit()
            return jsonify({'mensagem': 'Reserva deletada'})
        else:
            return jsonify({'erro': 'Reserva não encontrada'}), 404
    return jsonify({'erro': 'Senha incorreta'}), 401

if __name__ == '__main__':
    db.create_all()
    app.run(debug=True)
