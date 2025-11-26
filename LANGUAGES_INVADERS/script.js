// --- 1. SELEÇÃO DE ELEMENTOS DOM (HTML) ---
// Telas
const telaInicial = document.getElementById("tela-inicial");
const telaJogo = document.getElementById("tela-jogo");

// Botões
const botoesNivel = document.querySelectorAll(".btn-nivel");
const btnReiniciar = document.getElementById("btn-reiniciar");

// Áreas do Jogo
const campoDeBatalha = document.getElementById("campo-de-batalha");
const linhaPerigo = document.getElementById("linha-perigo");
const zonasDrop = document.querySelectorAll(".categoria");
const placarElement = document.getElementById("placar");
const comboDisplay = document.getElementById("combo-display");
const highScoreDisplay = document.getElementById("high-score-display");

// Áudios
const audioAcerto = document.getElementById("audio-acerto");
const audioErro = document.getElementById("audio-erro");
const audioMusica = document.getElementById("audio-musica");
const audioVitoria = document.getElementById("audio-vitoria");
const audioDerrota = document.getElementById("audio-derrota");
const audioMenu = document.getElementById("audio-menu"); // NOVO
const estrelasFundo = document.getElementById("estrelas-fundo"); // NOVO
// --- 2. DADOS DO JOGO ---
const DADOS_JOGO_COMPLETO = [
  { nome: "JavaScript", categoria: "Linguagens de Programação" },
  { nome: "Python", categoria: "Linguagens de Programação" },
  { nome: "Java", categoria: "Linguagens de Programação" },
  { nome: "C#", categoria: "Linguagens de Programação" },
  { nome: "PHP", categoria: "Linguagens de Programação" },
  { nome: "Ruby", categoria: "Linguagens de Programação" },
  { nome: "Go", categoria: "Linguagens de Programação" },
  { nome: "Swift", categoria: "Linguagens de Programação" },
  { nome: "Kotlin", categoria: "Linguagens de Programação" },
  { nome: "TypeScript", categoria: "Linguagens de Programação" },
  { nome: "React", categoria: "Frameworks / Bibliotecas" },
  { nome: "Angular", categoria: "Frameworks / Bibliotecas" },
  { nome: "Vue.js", categoria: "Frameworks / Bibliotecas" },
  { nome: "Node.js", categoria: "Frameworks / Bibliotecas" },
  { nome: "Django", categoria: "Frameworks / Bibliotecas" },
  { nome: "Spring Boot", categoria: "Frameworks / Bibliotecas" },
  { nome: ".NET", categoria: "Frameworks / Bibliotecas" },
  { nome: "Laravel", categoria: "Frameworks / Bibliotecas" },
  { nome: "MySQL", categoria: "Banco de Dados Relacional" },
  { nome: "PostgreSQL", categoria: "Banco de Dados Relacional" },
  { nome: "SQL Server", categoria: "Banco de Dados Relacional" },
  { nome: "Oracle", categoria: "Banco de Dados Relacional" },
  { nome: "SQLite", categoria: "Banco de Dados Relacional" },
  { nome: "MongoDB", categoria: "Banco de Dados Não Relacional" },
  { nome: "Redis", categoria: "Banco de Dados Não Relacional" },
  { nome: "Firebase DB", categoria: "Banco de Dados Não Relacional" },
  { nome: "Cassandra", categoria: "Banco de Dados Não Relacional" },
];

// --- 3. VARIÁVEIS DE ESTADO DO JOGO ---
let pontuacao;
let totalItensNivel;
let itensCorretos;
let musicStarted = false;
let itemArrastado = null;
let currentCombo = 0;
let highScore = 0;
const HIGH_SCORE_KEY = "languagesInvaders_highScore";
// --- 3. VARIÁVEIS DE ESTADO DO JOGO ---
// ... (pontuacao, totalItensNivel, etc.) ...
let isGameOver = false;

// Nossos "Motores" (Intervals)
let gameLoopInterval = null;
// let spawnInterval = null; // <-- PODE APAGAR ESTA LINHA

// Configurações de Nível
// ... (gameSpeed, spawnRate) ...
// Vamos trocar gameSpeed por swarmSpeed
let swarmSpeed; // Velocidade do enxame
let swarmDownStep; // O quanto desce
// spawnRate será usado para os tiros, depois.

// Configurações de Nível
let gameSpeed; // Velocidade de descida (pixels por loop)
let spawnRate; // Tempo para criar um novo invasor (ms)

// NOVAS VARIÁVEIS DO ENXAME
let enxameContainer = document.getElementById("enxame-container");
let enxameX = 0;
let enxameY = 0;
let enxameDirection = 1; // 1 = direita, -1 = esquerda
let currentWave = 1;

// --- 4. FUNÇÕES PRINCIPAIS DO JOGO ---

/**
 * Inicia o jogo com base no nível
 */
function iniciarJogo(nivel) {
  // 1. Resetar estado
  isGameOver = false;
  pontuacao = 100;
  itensCorretos = 0;
  placarElement.innerText = pontuacao;
  currentWave = 1;
  currentCombo = 0;
  comboDisplay.innerText = "";
  comboDisplay.classList.remove("active");
  comboDisplay.innerText = ""; // NOVO (Limpa o display)
  comboDisplay.classList.remove("active");

  // 2. Limpar intervalos
  clearInterval(gameLoopInterval);

  // 3. Limpar o enxame
  enxameContainer.innerHTML = "";
  enxameX = 0;
  enxameY = 0;
  enxameDirection = 1;
  enxameContainer.style.transform = `translate(0, 0)`;

  // 4. Definir dificuldade
  let waveConfig;
  switch (nivel) {
    case "facil":
      totalItensNivel = 10; // 5 cols * 2 rows
      swarmSpeed = 3;
      swarmDownStep = 15;
      waveConfig = { cols: 4, rows: 2 }; // 5 colunas (Funciona!)
      break;
    case "medio":
      totalItensNivel = 12; // MUDAMOS: 6 cols * 2 rows
      swarmSpeed = 4;
      swarmDownStep = 20;
      waveConfig = { cols: 5, rows: 3 }; // MUDAMOS PARA 6 COLUNAS
      break;
    case "dificil":
      totalItensNivel = 18; // MUDAMOS: 6 cols * 3 rows
      swarmSpeed = 5;
      swarmDownStep = 25;
      waveConfig = { cols: 5, rows: 4 }; // MUDAMOS PARA 6 COLUNAS
      break;
  }

  // 5. Iniciar Áudio
  audioMenu.pause();
  audioMusica.volume = 0.5;
  audioMusica.currentTime = 0;
  audioMusica.play();

  // 6. Trocar telas
  telaInicial.classList.add("escondido");
  telaJogo.classList.remove("escondido");

  // 7. Criar a primeira onda
  createWave(waveConfig);
  // 8. Iniciar o motor do jogo
  gameLoopInterval = setInterval(gameLoop, 100); // Roda 10x por segundo
}

function spawnEstrelas(numEstrelas = 100) {
  estrelasFundo.innerHTML = ""; // Limpa estrelas antigas
  for (let i = 0; i < numEstrelas; i++) {
    const estrela = document.createElement("div");
    estrela.className = "estrela";

    // Tipo aleatório (p, m, g)
    const tipoRand = Math.random();
    if (tipoRand < 0.6) estrela.classList.add("p");
    else if (tipoRand < 0.9) estrela.classList.add("m");
    else estrela.classList.add("g");

    // Posição e delay aleatórios
    estrela.style.top = Math.random() * -100 + "vh"; // Começa acima da tela
    estrela.style.left = Math.random() * 100 + "vw";
    estrela.style.animationDelay = Math.random() * 10 + "s"; // Evita que todas comecem juntas

    estrelasFundo.appendChild(estrela);
  }
}

/**
 * Toca a música do menu (precisa de interação do usuário)
 */
function iniciarMusicaAmbiente() {
  if (musicStarted) return;
  audioMenu.volume = 0.3; // Volume mais baixo
  audioMenu.play();
  musicStarted = true;
}
/**
 * O loop principal do jogo: move os invasores e verifica a derrota
 */
function gameLoop() {
    if (isGameOver) return;

    // --- 1. Mover o Enxame ---
    enxameX += (swarmSpeed * enxameDirection);
    const campoWidth = campoDeBatalha.clientWidth;
    const enxameWidth = enxameContainer.clientWidth;
    let hitEdge = false;

    if (enxameX + enxameWidth >= campoWidth) {
        enxameDirection = -1;
        enxameX = campoWidth - enxameWidth;
        hitEdge = true;
    } else if (enxameX <= 0) {
        enxameDirection = 1;
        enxameX = 0;
        hitEdge = true;
    }

    if (hitEdge) {
        enxameY += swarmDownStep;
    }

    enxameContainer.style.transform = `translate(${enxameX}px, ${enxameY}px)`;

    // --- 2. Verificar Condição de Derrota (Invasão) ---
    const linhaPerigoPos = linhaPerigo.getBoundingClientRect().top;
    const enxamePos = enxameContainer.getBoundingClientRect().bottom;

    if (enxamePos >= linhaPerigoPos) {
        gameOver("invasao");
    }
}

function createWave(config) {
  enxameContainer.innerHTML = ""; // Limpa a onda anterior

  // Configura o CSS Grid com espaçamento maior
  enxameContainer.style.gridTemplateColumns = `repeat(${config.cols}, 110px)`;
  enxameContainer.style.gap = "30px"; // Espaço entre os invasores

  let itensDaOnda = DADOS_JOGO_COMPLETO.sort(() => 0.5 - Math.random()).slice(
    0,
    config.cols * config.rows
  );
  totalItensNivel = itensDaOnda.length; // Atualiza o total
  itensCorretos = 0; // Reseta o contador de acertos da onda

  itensDaOnda.forEach((itemInfo) => {
    // 1. Cria o contêiner principal (o item arrastável)
    const divItem = document.createElement("div");
    divItem.className = "item-arrastavel";
    divItem.draggable = true;
    divItem.dataset.categoria = itemInfo.categoria;

    // 2. Cria o 'corpo' (o pixel art)
    const body = document.createElement("div");

    // Sorteia um dos 3 visuais que fizemos para o menu
    const visualRand = Math.floor(Math.random() * 3) + 1;
    body.className = `invader-body pixel-invader invader-${visualRand}`;

    // 3. Cria o 'nome' (o texto)
    const name = document.createElement("span");
    name.className = "invader-name";
    name.innerText = itemInfo.nome;

    // 4. Monta o invasor (coloca o corpo e o nome dentro do contêiner)
    divItem.appendChild(body);
    divItem.appendChild(name);

    // 5. Adiciona os eventos de drag
    divItem.addEventListener("dragstart", onDragStart);
    divItem.addEventListener("dragend", onDragEnd);

    // 6. Adiciona o invasor montado ao enxame
    enxameContainer.appendChild(divItem);
  });
}

/**
 * Para tudo e mostra a tela de derrota
 */
function gameOver(motivo) {
  if (isGameOver) return; // Garante que só rode uma vez
  isGameOver = true;
  saveHighScore();
  // Para os motores
  clearInterval(gameLoopInterval);

  // Para a música e toca o som de derrota
  audioMusica.pause();
  audioDerrota.play();

  let titulo = "GAME OVER";
  let texto = "";
  if (motivo === "invasao") {
    texto = "Os invasores chegaram à sua base!";
  } else if (motivo === "score") {
    texto = "Sua pontuação chegou a zero!";
  } else if (motivo === "bases destruidas") {
    // NOVO
    texto = "Todas as suas bases de defesa foram destruídas!";
  }

  Swal.fire({
    title: titulo,
    text: texto,
    icon: "error",
    confirmButtonText: "Tentar Novamente",
  }).then(() => {
    reiniciarJogo();
  });
}

/**
 * Para tudo e mostra a tela de vitória
 */
function victory() {
  if (isGameOver) return;
  isGameOver = true;
  saveHighScore();

  clearInterval(gameLoopInterval);


  audioMusica.pause();
  audioVitoria.play();

  // Mensagem de Parabéns
  Swal.fire({
    title: "Parabéns!",
    text: `Você defendeu a base e completou o desafio com ${pontuacao} pontos!`,
    icon: "success",
    confirmButtonText: "Jogar Novamente",
  }).then(() => {
    reiniciarJogo();
  });
}

/**
 * Volta para a tela inicial e para os motores
 */
function reiniciarJogo() {
  isGameOver = true; // Garante que tudo pare
  saveHighScore();
  clearInterval(gameLoopInterval);

  audioMusica.pause();
  audioMenu.play();

  telaJogo.classList.add("escondido");
  telaInicial.classList.remove("escondido");
}

/**
 * Atualiza a pontuação
 */
function atualizarPontuacao(pontos) {
  pontuacao += pontos;
  placarElement.innerText = pontuacao;

  // Condição de derrota por pontuação
  if (pontuacao <= 0) {
    placarElement.innerText = 0;
    gameOver("score");
  }
}

/**
 * Mostra o feedback visual (verde/vermelho) temporariamente
 */
function feedbackVisual(zona, tipo) {
  const classe = tipo === "acerto" ? "feedback-acerto" : "feedback-erro";
  zona.classList.add(classe);

  setTimeout(() => {
    zona.classList.remove(classe);
  }, 500);
}

// --- 5. LÓGICA DE DRAG & DROP (EVENTOS) ---

function onDragStart(event) {
  itemArrastado = event.target;
  itemArrastado.classList.add("arrastando");
}

function onDragEnd() {
  if (itemArrastado) {
    itemArrastado.classList.remove("arrastando");
  }
  itemArrastado = null;
}

function onDragOver(event) {
  event.preventDefault();
  if (event.target.classList.contains("categoria")) {
    event.target.classList.add("hover-valido");
  }
}

function onDragLeave(event) {
  if (event.target.classList.contains("categoria")) {
    event.target.classList.remove("hover-valido");
  }
}

function onDrop(event) {
  event.preventDefault();
  if (isGameOver || !itemArrastado) return;

  const zonaDrop = event.target.closest(".categoria");
  if (!zonaDrop) return;

  zonaDrop.classList.remove("hover-valido");

  const zonaCategoria = zonaDrop.dataset.categoria;
  const itemCategoria = itemArrastado.dataset.categoria;

  if (zonaCategoria === itemCategoria) {
    // --- ACERTO ---
    itemArrastado.remove();
    itemArrastado = null;

    audioAcerto.play();
    feedbackVisual(zonaDrop, "acerto");

    // Lógica de Combo
    currentCombo++;
    let pontosGanhos = 10 + currentCombo * 2; // 10 base + 2 por combo
    atualizarPontuacao(pontosGanhos); // Adiciona os pontos

    // Feedback visual do Combo
    comboDisplay.innerText = `COMBO x${currentCombo}!`;
    comboDisplay.classList.remove("active"); // Reseta a animação
    void comboDisplay.offsetWidth; // Truque para forçar o reinício da animação
    comboDisplay.classList.add("active");

    // Verifica se a onda terminou
    if (enxameContainer.childElementCount === 0) {
      nextWave();
    }
  } else {
    // --- ERRO ---
    audioErro.play();
    feedbackVisual(zonaDrop, "erro");
    atualizarPontuacao(-5); // Perde 5 pontos

    // Quebra o Combo!
    currentCombo = 0;
    comboDisplay.classList.remove("active");
    comboDisplay.innerText = "COMBO BREAK!"; // Feedback de quebra

    // Esconde a mensagem de quebra após 1s
    setTimeout(() => {
      if (currentCombo === 0) {
        // Só limpa se outro combo não começou
        comboDisplay.innerText = "";
      }
    }, 1000);
  }
}
function loadHighScore() {
  highScore = parseInt(localStorage.getItem(HIGH_SCORE_KEY)) || 0;
  highScoreDisplay.innerText = `HIGH SCORE: ${highScore}`;
}

/**
 * Verifica se a pontuação atual é um novo recorde e salva
 */
function saveHighScore() {
  if (pontuacao > highScore) {
    highScore = pontuacao;
    localStorage.setItem(HIGH_SCORE_KEY, highScore);
    // Atualiza o display no menu, mesmo que ele não esteja visível
    highScoreDisplay.innerText = `HIGH SCORE: ${highScore}`;
  }
}
function nextWave() {
  currentWave++;

  // TODO: Adicionar lógica do BOSS AQUI (Cirurgia 2)
  if (currentWave % 5 === 0) {
    // Por enquanto, apenas mostra um alerta e começa a próxima
    Swal.fire("BOSS WAVE!", "Prepare-se para o chefe!", "warning");
    // (Aqui chamaremos o spawnBoss() no futuro)
  }

  // Aumenta a dificuldade
  swarmSpeed += 0.5;

  // Reseta a posição do enxame
  enxameX = 0;
  enxameY = 0;
  enxameDirection = 1;

  // Pega a config do nível atual
  const nivel =
    document.querySelector(".btn-nivel:not(.escondido)")?.dataset.nivel ||
    "facil";
  let waveConfig;
  switch (nivel) {
    case "facil":
      waveConfig = { cols: 5, rows: 2 };
      break;
    case "medio":
      waveConfig = { cols: 8, rows: 2 };
      break;
    case "dificil":
      waveConfig = { cols: 8, rows: 3 };
      break;
  }

  // Cria a próxima onda
  createWave(waveConfig);
}
// --- 6. INICIALIZAÇÃO (Adicionar Event Listeners) ---


botoesNivel.forEach((botao) => {
  botao.addEventListener("click", () => {
    const nivel = botao.dataset.nivel;

    iniciarMusicaAmbiente(); // <-- ADICIONE ISSO AQUI
    iniciarJogo(nivel);
  });
});

// Botão de Reiniciar
btnReiniciar.addEventListener("click", reiniciarJogo);

// Zonas de Drop
zonasDrop.forEach((zona) => {
  zona.addEventListener("dragover", onDragOver);
  zona.addEventListener("dragleave", onDragLeave);
  zona.addEventListener("drop", onDrop);
});
window.addEventListener("load", () => {
  spawnEstrelas(150); // Gera 150 estrelas
  loadHighScore();
});
