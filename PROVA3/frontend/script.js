const API_URL = 'http://localhost:3000/api';

async function carregarDados() {
    const [resMesas, resReservas] = await Promise.all([
        fetch(`${API_URL}/mesas`),
        fetch(`${API_URL}/reservas`)
    ]);

    const mesas = await resMesas.json();
    const reservas = await resReservas.json();

    renderizarMapa(mesas, reservas);
    renderizarLista(reservas);
}

function renderizarMapa(mesas, reservas) {
    const container = document.getElementById('mapaMesas');
    container.innerHTML = '';

    const agora = new Date().getTime();

    mesas.forEach(mesa => {
        const div = document.createElement('div');
        div.className = 'mesa';
        div.innerHTML = `<span>Mesa ${mesa.numero}</span><small>Cap: ${mesa.capacidade}</small>`;

        const reservaAtual = reservas.find(r => 
            r.mesa === mesa.numero && 
            ['reservado', 'ocupado'].includes(r.status) &&
            verificarConflitoHorario(r.dataHora, agora)
        );

        if (reservaAtual) {
            if (reservaAtual.status === 'ocupado') {
                div.classList.add('vermelho'); 
                div.title = `Ocupado por ${reservaAtual.cliente}`;
            } else {
                div.classList.add('amarelo'); 
                div.title = `Reservado para ${reservaAtual.cliente}`;
            }
        } else {
            div.classList.add('verde'); 
            div.title = 'Disponível';
            div.onclick = () => {
                document.getElementById('mesa').value = mesa.numero;
                document.getElementById('pessoas').value = mesa.capacidade;
            };
        }

        container.appendChild(div);
    });
}


function verificarConflitoHorario(dataReservaStr, agoraMs) {
    const inicio = new Date(dataReservaStr).getTime();
    const fim = inicio + (90 * 60 * 1000);
    const diff = inicio - agoraMs;
    return (agoraMs >= inicio && agoraMs <= fim) || (diff > 0 && diff < 86400000);
}

function renderizarLista(reservas) {
    const tbody = document.getElementById('listaReservas');
    tbody.innerHTML = '';

    reservas.forEach(r => {
        const dataFmt = new Date(r.dataHora).toLocaleString('pt-BR');
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${r.mesa}</td>
            <td>${r.cliente}</td>
            <td>${dataFmt}</td>
            <td>${r.status}</td>
            <td>
                ${r.status !== 'cancelado' && r.status !== 'finalizado' 
                  ? `<button class="btn-cancel" onclick="cancelarReserva('${r._id}')">X</button>` 
                  : '-'}
            </td>
        `;
        tbody.appendChild(tr);
    });
}

document.getElementById('formReserva').addEventListener('submit', async (e) => {
    e.preventDefault();
    const msgDiv = document.getElementById('msg');
    
    const dados = {
        cliente: document.getElementById('cliente').value,
        contato: document.getElementById('contato').value,
        mesa: Number(document.getElementById('mesa').value),
        pessoas: Number(document.getElementById('pessoas').value),
        dataHora: document.getElementById('dataHora').value,
        observacoes: document.getElementById('observacoes').value
    };

    try {
        const res = await fetch(`${API_URL}/reservas`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dados)
        });
        
        const json = await res.json();
        
        if (res.ok) {
            msgDiv.innerHTML = '<span style="color:green">Reserva criada com sucesso!</span>';
            document.getElementById('formReserva').reset();
            carregarDados();
        } else {
            msgDiv.innerHTML = `<span style="color:red">${json.mensagem}</span>`;
        }
    } catch (error) {
        console.error(error);
        msgDiv.innerHTML = '<span style="color:red">Erro ao conectar servidor.</span>';
    }
});

async function cancelarReserva(id) {
    if(!confirm('Deseja cancelar esta reserva?')) return;
    await fetch(`${API_URL}/reservas/${id}/cancelar`, { method: 'PATCH' });
    carregarDados();
}


carregarDados();
setInterval(carregarDados, 60000);