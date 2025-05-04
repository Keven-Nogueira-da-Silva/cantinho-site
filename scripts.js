tailwind.config = {
    theme: {
      extend: {
        colors: {
          primary: {
            50: '#f0f9ff',
            100: '#e0f2fe',
            200: '#bae6fd',
            300: '#7dd3fc',
            400: '#38bdf8',
            500: '#0ea5e9',
            600: '#0284c7',
            700: '#0369a1',
            800: '#075985',
            900: '#0c4a6e',
          },
          success: '#28a745',
          danger: '#dc3545',
          warning: '#ffc107',
          pix: '#32BBAD',
          cartao: '#1A4F8B'
        }
      }
    }
  }
  const form = document.getElementById("formReserva");
  const lista = document.getElementById("listaReservas");
  const msg = document.getElementById("mensagem");
  const areaPagamento = document.getElementById("areaPagamento");
  const pixArea = document.getElementById("pixArea");
  const cartaoArea = document.getElementById("cartaoArea");

  let reservas = JSON.parse(localStorage.getItem("reservas")) || [];
  let reservaTemp = null;
  const senhaCorreta = "147952";

  function mostrarMensagem(texto, tipo) {
    const alertClasses = {
      success: "bg-green-100 border border-green-400 text-green-700",
      error: "bg-red-100 border border-red-400 text-red-700"
    };
    
    msg.innerHTML = `
      <div class="px-4 py-3 rounded relative ${alertClasses[tipo]}" role="alert">
        <span class="block sm:inline">${texto}</span>
      </div>
    `;
    setTimeout(() => msg.innerHTML = '', 3000);
  }

  function salvarReservas() {
    localStorage.setItem("reservas", JSON.stringify(reservas));
  }

  function formatarData(dataString) {
    const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
    return new Date(dataString).toLocaleDateString('pt-BR', options);
  }

  function renderizarReservas() {
    lista.innerHTML = "";
    reservas.sort((a, b) => new Date(a.data) - new Date(b.data));
    
    if (reservas.length === 0) {
      lista.innerHTML = `
        <div class="text-center py-8">
          <i class="fas fa-calendar-xmark text-4xl text-primary-300 mb-4"></i>
          <p class="text-primary-500">Nenhuma reserva cadastrada ainda</p>
        </div>
      `;
      return;
    }

    reservas.forEach((r, i) => {
      const div = document.createElement("div");
      div.className = "bg-white rounded-lg shadow-md p-5 relative border-l-4 border-primary-500";
      div.innerHTML = `
        <div class="absolute top-3 right-3 bg-primary-500 text-white text-xs font-bold px-2 py-1 rounded-full">
          <i class="fas fa-check mr-1"></i> Confirmada
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <h3 class="font-bold text-primary-700 mb-1 flex items-center">
              <i class="fas fa-user mr-2 text-sm"></i> Nome
            </h3>
            <p class="text-gray-700">${r.nome}</p>
          </div>
          
          <div>
            <h3 class="font-bold text-primary-700 mb-1 flex items-center">
              <i class="fas fa-phone mr-2 text-sm"></i> Telefone
            </h3>
            <p class="text-gray-700">${r.telefone}</p>
          </div>
          
          <div>
            <h3 class="font-bold text-primary-700 mb-1 flex items-center">
              <i class="fas fa-calendar-day mr-2 text-sm"></i> Data
            </h3>
            <p class="text-gray-700">${formatarData(r.data)}</p>
          </div>
          
          <div>
            <h3 class="font-bold text-primary-700 mb-1 flex items-center">
              <i class="fas fa-users mr-2 text-sm"></i> Pessoas
            </h3>
            <p class="text-gray-700">${r.pessoas}</p>
          </div>
        </div>
        
        <div class="mb-4">
          <h3 class="font-bold text-primary-700 mb-1 flex items-center">
            <i class="fas fa-gift mr-2 text-sm"></i> Tipo de Evento
          </h3>
          <p class="text-gray-700">${r.evento}</p>
        </div>
        
        ${r.obs ? `
          <div class="mb-4">
            <h3 class="font-bold text-primary-700 mb-1 flex items-center">
              <i class="fas fa-comment-dots mr-2 text-sm"></i> Observações
            </h3>
            <p class="text-gray-700">${r.obs}</p>
          </div>
        ` : ''}
        
        <div class="mb-4">
          <h3 class="font-bold text-primary-700 mb-1 flex items-center">
            <i class="fas fa-money-bill-wave mr-2 text-sm"></i> Método de Pagamento
          </h3>
          <p class="text-gray-700">${r.metodoPagamento || 'Não informado'}</p>
        </div>
        
        <div class="pt-4 border-t border-gray-200">
          <label class="block text-sm font-medium text-primary-700 mb-1">Senha para deletar: “Em caso de cancelamento, entre em contato conosco.”</label>
          <div class="flex space-x-2">
            <input type="password" id="senha-${i}" placeholder="Digite a senha" 
              class="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500">
            <button onclick="deletarReserva(${i})" 
              class="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-md transition duration-200">
              <i class="fas fa-trash mr-1"></i> Deletar
            </button>
          </div>
        </div>
      `;
      lista.appendChild(div);
    });
  }

  function deletarReserva(index) {
    const senha = document.getElementById(`senha-${index}`).value;
    if (senha === senhaCorreta) {
      reservas.splice(index, 1);
      salvarReservas();
      renderizarReservas();
      mostrarMensagem("Reserva deletada com sucesso.", "success");
    } else {
      mostrarMensagem("Senha incorreta!", "error");
    }
  }

  function mostrarPix() {
    pixArea.classList.remove('hidden');
    cartaoArea.classList.add('hidden');
  }

  function mostrarCartao() {
    cartaoArea.classList.remove('hidden');
    pixArea.classList.add('hidden');
  }

  function finalizarPagamento(metodo) {
    if (!reservaTemp) return;
    
    // Adiciona o método de pagamento à reserva
    reservaTemp.metodoPagamento = metodo === 'pix' ? 'PIX (50% adiantado)' : 
                                  metodo === 'cartao' ? 'Cartão (50% adiantado)' : 
                                  'Dinheiro (combinar pagamento)';
    
    reservas.push(reservaTemp);
    salvarReservas();
    renderizarReservas();
    mostrarMensagem("Pagamento confirmado e reserva garantida!", "success");
    reservaTemp = null;
    areaPagamento.classList.add('hidden');
    pixArea.classList.add('hidden');
    cartaoArea.classList.add('hidden');
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    const novaData = document.getElementById("data").value;
    
    // Verifica se a data já está reservada
    if (reservas.some(r => r.data === novaData)) {
      mostrarMensagem("Esta data já está reservada!", "error");
      return;
    }

    // Cria o objeto de reserva temporário
    reservaTemp = {
      nome: document.getElementById("nome").value,
      telefone: document.getElementById("telefone").value,
      data: novaData,
      pessoas: document.getElementById("pessoas").value,
      evento: document.getElementById("evento").value,
      obs: document.getElementById("obs").value,
      dataReserva: new Date().toLocaleString()
    };

    form.reset();
    areaPagamento.classList.remove('hidden');
    pixArea.classList.add('hidden');
    cartaoArea.classList.add('hidden');
  });

  // Inicialização
  document.addEventListener('DOMContentLoaded', function() {
    renderizarReservas();
    
    // Configura a data mínima como hoje
    document.getElementById('data').min = new Date().toISOString().split('T')[0];
    
    // Adiciona máscara para telefone
    const telefoneInput = document.getElementById('telefone');
    telefoneInput.addEventListener('input', function(e) {
      let value = e.target.value.replace(/\D/g, '');
      if (value.length > 11) value = value.substring(0, 11);
      
      if (value.length > 0) {
        value = value.replace(/^(\d{2})(\d)/g, '($1) $2');
        if (value.length > 10) {
          value = value.replace(/(\d)(\d{4})$/, '$1-$2');
        }
      }
      
      e.target.value = value;
    });
  });