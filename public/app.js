import { db, auth } from "./firebase-config.js";
import { doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";
import {
    signOut,
    onAuthStateChanged,
    updatePassword
} from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";

let usuarioId = null;
let colecao = {};
let filtroAtual = 'all';
let buscaSelecao = '';

// ── LOADING SCREEN ────────────────────────────────────────────────────────────
// Cobre tudo enquanto o Firebase verifica se o usuário está logado.
// Sem isso, o PWA no celular mostra o álbum por um instante antes de redirecionar.
const loadingScreen = document.createElement('div');
loadingScreen.id = 'loadingScreen';
loadingScreen.innerHTML = `
    <div style="
        position:fixed; inset:0; z-index:9999;
        background: radial-gradient(circle at top, #4a0e1c 0%, #1a1a1a 100%);
        display:flex; align-items:center; justify-content:center;
        flex-direction:column; gap:16px;
    ">
        <img src="Sem nome (480 x 322 px).png" style="width:140px; opacity:0.9;">
        <div style="width:40px; height:40px; border:4px solid #333;
                    border-top-color:#00ff08; border-radius:50%;
                    animation: spin 0.8s linear infinite;"></div>
    </div>
    <style>@keyframes spin { to { transform: rotate(360deg); } }</style>
`;
document.body.appendChild(loadingScreen);

// Oculta o conteúdo real até confirmar autenticação
document.getElementById('appArea').style.visibility = 'hidden';
document.getElementById('header-app').style.visibility = 'hidden';

// ── DADOS DO ÁLBUM ────────────────────────────────────────────────────────────

const copaData = {
    FWC: { nome: 'Especiais (FIFA)', total: 29, grupo: 'Especiais' },
    C:   { nome: 'Coca-Cola', total: 8, grupo: 'Especiais' },
    MEX: { nome: 'México', total: 20, grupo: 'Grupo A' },
    RSA: { nome: 'África do Sul', total: 20, grupo: 'Grupo A' },
    KOR: { nome: 'Coreia do Sul', total: 20, grupo: 'Grupo A' },
    CZE: { nome: 'República Tcheca', total: 20, grupo: 'Grupo A' },
    CAN: { nome: 'Canadá', total: 20, grupo: 'Grupo B' },
    BIH: { nome: 'Bósnia e Herzegovina', total: 20, grupo: 'Grupo B' },
    QAT: { nome: 'Catar', total: 20, grupo: 'Grupo B' },
    SUI: { nome: 'Suíça', total: 20, grupo: 'Grupo B' },
    BRA: { nome: 'Brasil', total: 20, grupo: 'Grupo C' },
    MAR: { nome: 'Marrocos', total: 20, grupo: 'Grupo C' },
    HAI: { nome: 'Haiti', total: 20, grupo: 'Grupo C' },
    SCO: { nome: 'Escócia', total: 20, grupo: 'Grupo C' },
    USA: { nome: 'Estados Unidos', total: 20, grupo: 'Grupo D' },
    PAR: { nome: 'Paraguai', total: 20, grupo: 'Grupo D' },
    AUS: { nome: 'Austrália', total: 20, grupo: 'Grupo D' },
    TUR: { nome: 'Turquia', total: 20, grupo: 'Grupo D' },
    GER: { nome: 'Alemanha', total: 20, grupo: 'Grupo E' },
    CUW: { nome: 'Curaçao', total: 20, grupo: 'Grupo E' },
    CIV: { nome: 'Costa do Marfim', total: 20, grupo: 'Grupo E' },
    ECU: { nome: 'Equador', total: 20, grupo: 'Grupo E' },
    NED: { nome: 'Holanda', total: 20, grupo: 'Grupo F' },
    JPN: { nome: 'Japão', total: 20, grupo: 'Grupo F' },
    SWE: { nome: 'Suécia', total: 20, grupo: 'Grupo F' },
    TUN: { nome: 'Tunísia', total: 20, grupo: 'Grupo F' },
    BEL: { nome: 'Bélgica', total: 20, grupo: 'Grupo G' },
    EGY: { nome: 'Egito', total: 20, grupo: 'Grupo G' },
    IRN: { nome: 'Irã', total: 20, grupo: 'Grupo G' },
    NZL: { nome: 'Nova Zelândia', total: 20, grupo: 'Grupo G' },
    ESP: { nome: 'Espanha', total: 20, grupo: 'Grupo H' },
    CPV: { nome: 'Cabo Verde', total: 20, grupo: 'Grupo H' },
    KSA: { nome: 'Arábia Saudita', total: 20, grupo: 'Grupo H' },
    URU: { nome: 'Uruguai', total: 20, grupo: 'Grupo H' },
    FRA: { nome: 'França', total: 20, grupo: 'Grupo I' },
    SEN: { nome: 'Senegal', total: 20, grupo: 'Grupo I' },
    IRQ: { nome: 'Iraque', total: 20, grupo: 'Grupo I' },
    NOR: { nome: 'Noruega', total: 20, grupo: 'Grupo I' },
    ARG: { nome: 'Argentina', total: 20, grupo: 'Grupo J' },
    ALG: { nome: 'Argélia', total: 20, grupo: 'Grupo J' },
    AUT: { nome: 'Áustria', total: 20, grupo: 'Grupo J' },
    JOR: { nome: 'Jordânia', total: 20, grupo: 'Grupo J' },
    POR: { nome: 'Portugal', total: 20, grupo: 'Grupo K' },
    COD: { nome: 'RD Congo', total: 20, grupo: 'Grupo K' },
    UZB: { nome: 'Uzbequistão', total: 20, grupo: 'Grupo K' },
    COL: { nome: 'Colômbia', total: 20, grupo: 'Grupo K' },
    ENG: { nome: 'Inglaterra', total: 20, grupo: 'Grupo L' },
    CRO: { nome: 'Croácia', total: 20, grupo: 'Grupo L' },
    GHA: { nome: 'Gana', total: 20, grupo: 'Grupo L' },
    PAN: { nome: 'Panamá', total: 20, grupo: 'Grupo L' }
};

function inicializarColecao() {
    for (const time in copaData) {
        colecao[time] = {};
        for (let i = 1; i <= copaData[time].total; i++) {
            let num = (time === 'FWC' && i === 1) ? 0 : (time === 'FWC' ? i - 1 : i);
            colecao[time][num] = 0;
        }
    }
}

async function salvarDados() {
    if (!usuarioId) return;
    try {
        await setDoc(doc(db, "albuns", usuarioId), colecao);
        const repetidas = [];
        for (const time in colecao) {
            for (const num in colecao[time]) {
                if (colecao[time][num] > 1) {
                    for (let i = 0; i < colecao[time][num] - 1; i++) {
                        repetidas.push(time + ' ' + num);
                    }
                }
            }
        }
        const username = auth.currentUser?.displayName || 'Usuario';
        await setDoc(doc(db, "public_trades", usuarioId), { username, duplicates: repetidas });
    } catch (erro) {
        console.error("Erro ao salvar:", erro);
    }
}

async function carregarDados() {
    if (!usuarioId) return;
    try {
        const docRef = doc(db, "albuns", usuarioId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) { colecao = docSnap.data(); }
        else { inicializarColecao(); }
        atualizarTela();
    } catch (erro) {
        inicializarColecao();
        atualizarTela();
    }
}

function adicionarFigurinha() {
    let input = document.getElementById('stickerInput').value.trim().toUpperCase();
    input = input.replace(/^([A-Z]+)(\d+)$/, '$1 $2');
    const partes = input.split(' ');
    if (partes.length === 2) {
        const time = partes[0], num = parseInt(partes[1]);
        if (colecao[time] && colecao[time][num] !== undefined) {
            colecao[time][num]++;
            salvarDados();
            atualizarTela();
            const el = document.getElementById('ultimaFigurinha');
            if (el) { el.innerText = `✅ Última adicionada: ${time} ${num}`; el.classList.add('visivel'); }
        } else { alert("Código inválido!"); }
    } else { alert("Formato inválido (Ex: BRA 10)"); }
    document.getElementById('stickerInput').value = '';
}

function removerFigurinha() {
    let input = document.getElementById('stickerInput').value.trim().toUpperCase();
    input = input.replace(/^([A-Z]+)(\d+)$/, '$1 $2');
    const partes = input.split(' ');
    if (partes.length === 2) {
        const time = partes[0], num = parseInt(partes[1]);
        if (colecao[time] && colecao[time][num] !== undefined) {
            if (colecao[time][num] > 0) {
                colecao[time][num]--;
                salvarDados();
                atualizarTela();
                const el = document.getElementById('ultimaFigurinha');
                if (el) { el.innerText = `🗑️ Última removida: ${time} ${num}`; el.classList.add('visivel'); }
            } else { alert("Você não possui esta figurinha."); }
        }
    }
    document.getElementById('stickerInput').value = '';
}

function atualizarTela() {
    const container = document.getElementById('album');
    container.innerHTML = '';
    let totalGeral = 0, coladasGeral = 0;
    let qtdFaltantes = 0, qtdUnicas = 0, qtdRepetidas = 0;

    const grupos = {};
    for (const time in copaData) {
        const nomeGrupo = copaData[time].grupo;
        if (!grupos[nomeGrupo]) grupos[nomeGrupo] = [];
        grupos[nomeGrupo].push(time);
    }

    for (const nomeGrupo in grupos) {
        let temFigurinhaNoFiltro = false;
        let htmlTimesDoGrupo = '';

        grupos[nomeGrupo].forEach(time => {
            const nomeTime = copaData[time].nome.toLowerCase();
            const siglaTime = time.toLowerCase();
            const atendeBusca = buscaSelecao === '' || nomeTime.includes(buscaSelecao) || siglaTime.includes(buscaSelecao);

            if (atendeBusca) {
                let htmlTime = `<div class="time-section"><h3 style="padding: 10px 10px 0; color: #eee;">${copaData[time].nome} (${time})</h3><div class="grid-figurinhas">`;
                let figurinhasNoTimeNoFiltro = 0;

                for (const num in colecao[time]) {
                    totalGeral++;
                    const qtd = colecao[time][num];
                    if (qtd === 0) qtdFaltantes++;
                    else if (qtd === 1) { qtdUnicas++; coladasGeral++; }
                    else if (qtd > 1) { qtdUnicas++; coladasGeral++; qtdRepetidas += (qtd - 1); }

                    const mostrar = (filtroAtual === 'all') ||
                                    (filtroAtual === 'missing' && qtd === 0) ||
                                    (filtroAtual === 'unique' && qtd === 1) ||
                                    (filtroAtual === 'repeated' && qtd > 1);

                    if (mostrar) {
                        figurinhasNoTimeNoFiltro++;
                        temFigurinhaNoFiltro = true;
                        const classeCSS = qtd === 0 ? 'faltante' : (qtd === 1 ? 'unica' : 'repetida');
                        const badge = qtd > 1 ? `<span style="font-size:9px; display:block;">+${qtd - 1}</span>` : '';
                        htmlTime += `<div class="cromo ${classeCSS}">${num}${badge}</div>`;
                    }
                }

                htmlTime += `</div></div>`;
                if (figurinhasNoTimeNoFiltro > 0) htmlTimesDoGrupo += htmlTime;
            }
        });

        if (temFigurinhaNoFiltro) {
            const grupoDiv = document.createElement('div');
            grupoDiv.className = 'grupo-container';
            grupoDiv.innerHTML = `<div class="grupo-header"><h2>${nomeGrupo}</h2></div><div class="grupo-content">${htmlTimesDoGrupo}</div>`;
            const header = grupoDiv.querySelector('.grupo-header');
            const content = grupoDiv.querySelector('.grupo-content');
            header.addEventListener('click', () => {
                header.classList.toggle('fechado');
                content.classList.toggle('oculto');
            });
            container.appendChild(grupoDiv);
        }
    }

    document.querySelector('[data-filter="all"]').innerText = `Todas (${totalGeral})`;
    document.querySelector('[data-filter="missing"]').innerText = `Faltantes (${qtdFaltantes})`;
    document.querySelector('[data-filter="unique"]').innerText = `Únicas (${qtdUnicas})`;
    document.querySelector('[data-filter="repeated"]').innerText = `Repetidas (${qtdRepetidas})`;

    const porcento = totalGeral > 0 ? Math.round((coladasGeral / totalGeral) * 100) : 0;
    const bar = document.getElementById('progressBar');
    const tituloProgresso = document.querySelector('.progresso-titulo');
    if (bar) {
        bar.style.width = porcento + "%";
        bar.innerText = porcento + "%";
        if (tituloProgresso) {
            tituloProgresso.innerText = `Progresso do Álbum — ${coladasGeral}/${totalGeral}`;
        }
    }

    container.style.opacity = '0';
    setTimeout(() => { container.style.opacity = '1'; }, 50);

    atualizarGastos();
}

function atualizarGastos() {
    let totalFigurinhas = 0;
    for (const time in colecao) {
        for (const num in colecao[time]) {
            totalFigurinhas += colecao[time][num];
        }
    }
    const el = document.getElementById('valorGasto');
    const detalhe = document.getElementById('detalheGasto');
    if (el) el.innerText = `R$ ${totalFigurinhas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
    if (detalhe) detalhe.innerText = `${totalFigurinhas} figurinha${totalFigurinhas !== 1 ? 's' : ''} × R$ 1,00`;
}

// ── EVENTOS ──────────────────────────────────────────────────────────────────

document.getElementById('btnOpenSidebar').addEventListener('click', () => {
    document.getElementById('sidebar').style.width = "250px";
});
document.getElementById('btnClose').addEventListener('click', () => {
    document.getElementById('sidebar').style.width = "0";
});

document.getElementById('btnSair').addEventListener('click', async () => {
    document.getElementById('sidebar').style.width = "0";
    try {
        await signOut(auth);
    } catch (e) {
        console.error("Erro ao sair:", e);
    }
    window.location.replace('login.html');
});

document.getElementById('btnAdicionar').addEventListener('click', adicionarFigurinha);
document.getElementById('btnRemover').addEventListener('click', removerFigurinha);
document.getElementById('stickerInput').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') adicionarFigurinha();
});

document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        filtroAtual = e.target.getAttribute('data-filter');
        atualizarTela();
    });
});

document.getElementById('headerSearch').addEventListener('input', (e) => {
    buscaSelecao = e.target.value.trim().toLowerCase();
    atualizarTela();
});

// ── AUTH STATE ────────────────────────────────────────────────────────────────

onAuthStateChanged(auth, (user) => {
    // Remove a tela de loading sempre, independente do resultado
    const loading = document.getElementById('loadingScreen');
    if (loading) loading.remove();

    if (user) {
        usuarioId = user.uid;

        // Revela o conteúdo
        document.getElementById('appArea').style.visibility = 'visible';
        document.getElementById('header-app').style.visibility = 'visible';
        document.getElementById('progressoContainer').style.display = 'block';

        // Preenche dados do usuário na sidebar
        const userNameDisplay = document.getElementById('userNameDisplay');
        if (userNameDisplay) {
            userNameDisplay.innerHTML = `
                <div style="width:60px; height:60px; border-radius:50%; background:#333;
                            display:flex; align-items:center; justify-content:center;
                            margin:0 auto 10px; border:2px solid #00ff08;">
                    <span style="font-size:24px;">👤</span>
                </div>
                <strong style="font-size:18px;">${user.displayName || 'Usuário'}</strong><br>
                <span style="font-size:12px; color:#aaa;">${user.email}</span><br>
                <span style="font-size:10px; color:#555; word-break:break-all;
                             display:block; margin-top:4px;">ID: ${user.uid}</span>
            `;
        }

        carregarDados();

        // Toggle alterar senha
        const btnToggle = document.getElementById('btnToggleSenha');
        const senhaSection = document.getElementById('senhaSection');
        if (btnToggle && senhaSection) {
            btnToggle.onclick = () => {
                const aberto = senhaSection.style.display !== 'none';
                senhaSection.style.display = aberto ? 'none' : 'block';
                btnToggle.style.color = aberto ? '#aaa' : '#fff';
            };
        }

        const btnAtualizarSenha = document.getElementById('btnAtualizarSenha');
        if (btnAtualizarSenha) {
            btnAtualizarSenha.onclick = async () => {
                const novaSenha = document.getElementById('novaSenhaInput').value;
                if (!novaSenha || novaSenha.length < 6) return alert("A senha deve ter pelo menos 6 caracteres.");
                try {
                    await updatePassword(auth.currentUser, novaSenha);
                    alert("Senha atualizada com sucesso!");
                    document.getElementById('novaSenhaInput').value = '';
                    if (senhaSection) senhaSection.style.display = 'none';
                    if (btnToggle) btnToggle.style.color = '#aaa';
                } catch (e) {
                    alert("Erro ao atualizar senha: " + e.message);
                }
            };
        }

    } else {
        // Não logado → redireciona para login (replace evita voltar com o botão)
        window.location.replace('login.html');
    }
});