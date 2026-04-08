const algorithmInfo = {
  dijkstra: {
    title: "Dijkstra Algoritması",
    description:
      "Dijkstra algoritması, pozitif ağırlıklı bir graf üzerinde bir başlangıç düğümünden diğer düğümlere olan en kısa yolları bulmak için kullanılır.",
    steps: [
      "Başlangıç düğümünün uzaklığı 0 yapılır.",
      "Diğer tüm düğümlerin uzaklığı sonsuz kabul edilir.",
      "Ziyaret edilmemiş düğümler arasından en küçük uzaklığa sahip düğüm seçilir.",
      "Komşu düğümlerin uzaklıkları güncellenir.",
      "Tüm düğümler işlenene kadar işlem devam eder."
    ]
  },
  bellmanFord: {
    title: "Bellman-Ford Algoritması",
    description:
      "Bellman-Ford algoritması, negatif ağırlıklı kenarların bulunduğu yönlü graflarda da en kısa yolu bulabilir. Bu görselleştirmede negatif ağırlıklı özel bir grafik kullanılmaktadır.",
    steps: [
      "Başlangıç düğümünün uzaklığı 0 yapılır.",
      "Diğer düğümlerin uzaklığı sonsuz olarak ayarlanır.",
      "Tüm kenarlar |V|-1 kez gevşetilir.",
      "Bir kenar üzerinden daha kısa yol bulunursa mesafe güncellenir.",
      "Son adımda negatif çevrim olup olmadığı kontrol edilir."
    ]
  },
  prim: {
    title: "Prim Algoritması",
    description:
      "Prim algoritması, bir grafın minimum yayılma ağacını oluşturur. Her adımda ağaca en küçük maliyetli uygun kenar eklenir.",
    steps: [
      "Bir başlangıç düğümü seçilir.",
      "Bu düğüm ağaç içine alınır.",
      "Ağaç içindeki ve dışındaki düğümler arasındaki en küçük kenar seçilir.",
      "Yeni düğüm ağaca eklenir.",
      "Tüm düğümler seçilene kadar devam edilir."
    ]
  },
  kruskal: {
    title: "Kruskal Algoritması",
    description:
      "Kruskal algoritması, kenarları küçükten büyüğe sıralayıp çevrim oluşturmayacak şekilde seçerek minimum yayılma ağacını oluşturur.",
    steps: [
      "Tüm kenarlar ağırlıklarına göre sıralanır.",
      "En küçük kenardan başlanır.",
      "Çevrim oluşturmayan kenar seçilir.",
      "Seçilen kenar minimum yayılma ağacına eklenir.",
      "Yeterli sayıda kenar seçilince işlem tamamlanır."
    ]
  }
};

const defaultNodes = [
  { id: "A", x: 120, y: 350 },
  { id: "B", x: 260, y: 150 },
  { id: "C", x: 450, y: 110 },
  { id: "D", x: 700, y: 160 },
  { id: "E", x: 260, y: 360 },
  { id: "F", x: 560, y: 330 }
];

const defaultEdges = [
  { from: "A", to: "B", weight: 4 },
  { from: "A", to: "E", weight: 2 },
  { from: "B", to: "C", weight: 5 },
  { from: "B", to: "E", weight: 1 },
  { from: "C", to: "D", weight: 3 },
  { from: "C", to: "F", weight: 7 },
  { from: "E", to: "F", weight: 8 },
  { from: "F", to: "D", weight: 2 },
  { from: "E", to: "C", weight: 6 }
];

const bellmanFordEdges = [
  { from: "A", to: "B", weight: 4 },
  { from: "A", to: "E", weight: 2 },
  { from: "B", to: "C", weight: -3 },
  { from: "B", to: "E", weight: 1 },
  { from: "E", to: "C", weight: 6 },
  { from: "C", to: "D", weight: 3 },
  { from: "C", to: "F", weight: 2 },
  { from: "F", to: "D", weight: -2 },
  { from: "E", to: "F", weight: 5 }
];

const canvas = document.getElementById("graphCanvas");
const ctx = canvas.getContext("2d");

const algoTitle = document.getElementById("algoTitle");
const algoDescription = document.getElementById("algoDescription");
const algoSteps = document.getElementById("algoSteps");
const summaryContent = document.getElementById("summaryContent");
const currentStepText = document.getElementById("currentStepText");
const statusText = document.getElementById("statusText");
const sourceNodeSelect = document.getElementById("sourceNode");
const menuButtons = document.querySelectorAll(".menu-btn");

const startBtn = document.getElementById("startBtn");
const nextBtn = document.getElementById("nextBtn");
const stopBtn = document.getElementById("stopBtn");
const clearBtn = document.getElementById("clearBtn");
const resetBtn = document.getElementById("resetBtn");
const newGraphBtn = document.getElementById("newGraphBtn");

const edgeModal = document.getElementById("edgeModal");
const edgeModalText = document.getElementById("edgeModalText");
const edgeWeightInput = document.getElementById("edgeWeightInput");
const saveEdgeBtn = document.getElementById("saveEdgeBtn");
const cancelEdgeBtn = document.getElementById("cancelEdgeBtn");

let currentAlgorithm = "dijkstra";   // aktif algoritma
let currentSteps = [];               // algoritmanın oluşturduğu görsel adımlar
let currentStepIndex = -1;           // şu an hangi adımdayız
let finalResultText = "";            // sonuç özeti
let autoPlayInterval = null;         // otomatik oynatma için timer

/* Kullanıcının oluşturduğu özel grafik verileri */
let customNodes = [];
let customEdges = [];
let isCustomMode = false;            // kullanıcı kendi grafiğini çiziyor mu
let selectedNode = null;             // kenar eklemek için seçilen ilk düğüm

/* Kenar ekleme penceresinde bekleyen düğümler */
let pendingEdgeStart = null;
let pendingEdgeEnd = null;

function getNodeById(id) {
  return getCurrentNodes().find((n) => n.id === id);
}

function getCurrentNodes() {
  return isCustomMode ? customNodes : defaultNodes;
}

function getCurrentEdges() {
  if (isCustomMode) return customEdges;
  return currentAlgorithm === "bellmanFord" ? bellmanFordEdges : defaultEdges;
}

function isDirectedGraph() {
  return currentAlgorithm === "bellmanFord";
}

function setAlgorithmInfo(algoKey) {
  const info = algorithmInfo[algoKey];
  algoTitle.textContent = info.title;
  algoDescription.textContent = info.description;
  algoSteps.innerHTML = "";

  info.steps.forEach((step) => {
    const li = document.createElement("li");
    li.textContent = step;
    algoSteps.appendChild(li);
  });
}


function edgeMatches(edge1, edge2) {
  if (isDirectedGraph()) {
    return edge1.from === edge2.from && edge1.to === edge2.to;
  }

  return (
    (edge1.from === edge2.from && edge1.to === edge2.to) ||
    (edge1.from === edge2.to && edge1.to === edge2.from)
  );
}


function drawArrow(fromX, fromY, toX, toY, color, lineWidth) {
  const headLength = 12; // okun baş büyüklüğü
  const dx = toX - fromX;
  const dy = toY - fromY;
  const angle = Math.atan2(dy, dx);
  const nodeRadius = 24; // düğüm yarıçapı

  // Çizginin düğüm merkezinden değil, düğüm kenarından başlaması için düzeltme
  const startX = fromX + Math.cos(angle) * nodeRadius;
  const startY = fromY + Math.sin(angle) * nodeRadius;
  const endX = toX - Math.cos(angle) * nodeRadius;
  const endY = toY - Math.sin(angle) * nodeRadius;

  // Ana çizgi
  ctx.beginPath();
  ctx.moveTo(startX, startY);
  ctx.lineTo(endX, endY);
  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;
  ctx.stroke();

  // Ok ucu
  ctx.beginPath();
  ctx.moveTo(endX, endY);
  ctx.lineTo(
    endX - headLength * Math.cos(angle - Math.PI / 6),
    endY - headLength * Math.sin(angle - Math.PI / 6)
  );
  ctx.lineTo(
    endX - headLength * Math.cos(angle + Math.PI / 6),
    endY - headLength * Math.sin(angle + Math.PI / 6)
  );
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();
}

/* ---------------------------------------------------------
   Canvas üzerinde yönsüz kenar çizer
--------------------------------------------------------- */
function drawUndirectedEdge(fromX, fromY, toX, toY, color, lineWidth) {
  ctx.beginPath();
  ctx.moveTo(fromX, fromY);
  ctx.lineTo(toX, toY);
  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;
  ctx.stroke();
}


function drawGraph(stepData = null) {
  // Önce canvas temizlenir
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const currentNodes = getCurrentNodes();
  const currentEdges = getCurrentEdges();

  const selectedEdges = stepData?.selectedEdges || [];
  const candidateEdge = stepData?.candidateEdge || null;
  const highlightedNodes = stepData?.highlightedNodes || [];
  const distanceMap = stepData?.distances || null;

  /* Kenarları çiz */
  currentEdges.forEach((edge) => {
    const from = getNodeById(edge.from);
    const to = getNodeById(edge.to);

    if (!from || !to) return;

    let strokeColor = "#6b7280"; // normal renk
    let lineWidth = 2;

    // Negatif kenarları kırmızı göster
    if (edge.weight < 0) {
      strokeColor = "#dc2626";
      lineWidth = 2.5;
    }

    // Algoritma tarafından seçilmiş kenarlar mavi gösterilir
    if (selectedEdges.some((e) => edgeMatches(e, edge))) {
      strokeColor = "#2563eb";
      lineWidth = 4;
    }

    // O anda incelenen kenar turuncu gösterilir
    if (candidateEdge && edgeMatches(candidateEdge, edge)) {
      strokeColor = "#f59e0b";
      lineWidth = 4;
    }

    // Graf yönlü ise ok çizilir, değilse düz kenar çizilir
    if (isDirectedGraph()) {
      drawArrow(from.x, from.y, to.x, to.y, strokeColor, lineWidth);
    } else {
      drawUndirectedEdge(from.x, from.y, to.x, to.y, strokeColor, lineWidth);
    }

    // Kenar ağırlığı ortada yazılır
    const midX = (from.x + to.x) / 2;
    const midY = (from.y + to.y) / 2;

    ctx.fillStyle = edge.weight < 0 ? "#dc2626" : "#111827";
    ctx.font = "bold 14px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "alphabetic";
    ctx.fillText(edge.weight, midX, midY - 8);
  });

  /* Düğümleri çiz */
  currentNodes.forEach((node) => {
    const isHighlighted = highlightedNodes.includes(node.id);

    ctx.beginPath();
    ctx.arc(node.x, node.y, 24, 0, Math.PI * 2);
    ctx.fillStyle = isHighlighted ? "#93c5fd" : "#ffffff";
    ctx.fill();
    ctx.strokeStyle = "#475569";
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Düğüm ismi
    ctx.fillStyle = "#0f172a";
    ctx.font = "bold 16px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(node.id, node.x, node.y);

    // Eğer algoritma mesafe hesaplıyorsa node altında d=... göster
    if (distanceMap && distanceMap[node.id] !== undefined) {
      const val = distanceMap[node.id] === Infinity ? "∞" : distanceMap[node.id];
      ctx.fillStyle = "#1d4ed8";
      ctx.font = "bold 13px Arial";
      ctx.fillText(`d=${val}`, node.x, node.y + 40);
    }
  });

  // Kullanıcı kenar eklerken seçtiği düğümü ekstra halka ile göster
  if (isCustomMode && selectedNode) {
    ctx.beginPath();
    ctx.arc(selectedNode.x, selectedNode.y, 30, 0, Math.PI * 2);
    ctx.strokeStyle = "#f59e0b";
    ctx.lineWidth = 3;
    ctx.stroke();
  }
}

function resetVisualizationText() {
  summaryContent.textContent = "Bir algoritma seçin ve “Başlat” butonuna basın.";
  currentStepText.textContent = "Henüz işlem başlatılmadı.";
  statusText.textContent = "Hazır";
}

function stopAutoPlay(updateStatus = true) {
  if (autoPlayInterval) {
    clearInterval(autoPlayInterval);
    autoPlayInterval = null;
  }

  if (updateStatus) {
    statusText.textContent = "Durduruldu";
  }
}

function buildAdjacencyList() {
  const adj = {};
  getCurrentNodes().forEach((n) => {
    adj[n.id] = [];
  });

  const currentEdges = getCurrentEdges();

  if (isDirectedGraph()) {
    // Yönlü graf: sadece from -> to eklenir
    currentEdges.forEach((e) => {
      adj[e.from].push({ to: e.to, weight: e.weight });
    });
  } else {
    // Yönsüz graf: iki yönlü eklenir
    currentEdges.forEach((e) => {
      adj[e.from].push({ to: e.to, weight: e.weight });
      adj[e.to].push({ to: e.from, weight: e.weight });
    });
  }

  return adj;
}

function hasNegativeEdge() {
  return getCurrentEdges().some((edge) => edge.weight < 0);
}

function prepareAlgorithm() {
  const nodeList = getCurrentNodes();
  const startNode = sourceNodeSelect.value;

  if (nodeList.length === 0) {
    currentStepText.textContent = "Önce en az bir düğüm ekleyin.";
    summaryContent.textContent = "Graf boş olduğu için algoritma çalıştırılamadı.";
    statusText.textContent = "Hata";
    return false;
  }

  if (!nodeList.some((n) => n.id === startNode)) {
    currentStepText.textContent =
      "Seçilen başlangıç düğümü mevcut grafikte bulunmuyor.";
    summaryContent.textContent =
      "Lütfen mevcut bir başlangıç düğümü seçin veya grafiği kontrol edin.";
    statusText.textContent = "Hata";
    return false;
  }

  if (currentAlgorithm === "dijkstra" && hasNegativeEdge()) {
    currentStepText.textContent =
      "Dijkstra negatif ağırlıklı kenarlarda kullanılmamalıdır.";
    summaryContent.textContent =
      "Bu grafikte negatif ağırlık bulunduğu için Dijkstra çalıştırılmadı.";
    statusText.textContent = "Hata";
    return false;
  }

  currentStepIndex = -1;

  // Seçili algoritmaya göre gerekli adımlar oluşturulur
  if (currentAlgorithm === "dijkstra") {
    const result = generateDijkstraSteps(startNode);
    currentSteps = result.steps;
    finalResultText = result.resultText;
  } else if (currentAlgorithm === "bellmanFord") {
    const result = generateBellmanFordSteps(startNode);
    currentSteps = result.steps;
    finalResultText = result.resultText;
  } else if (currentAlgorithm === "prim") {
    const result = generatePrimSteps(startNode);
    currentSteps = result.steps;
    finalResultText = result.resultText;
  } else if (currentAlgorithm === "kruskal") {
    const result = generateKruskalSteps();
    currentSteps = result.steps;
    finalResultText = result.resultText;
  }

  summaryContent.textContent =
    "Algoritma hazırlandı. Adımları görmek için “Adım Adım” butonunu kullanın veya otomatik başlatın.";
  currentStepText.textContent = "Hazırlandı. İlk adıma geçebilirsiniz.";
  statusText.textContent = "Hazırlandı";
  drawGraph();

  return true;
}

function showNextStep() {
  if (!currentSteps.length) {
    const ok = prepareAlgorithm();
    if (!ok) return;
  }

  if (currentStepIndex < currentSteps.length - 1) {
    currentStepIndex++;
    const step = currentSteps[currentStepIndex];

    drawGraph(step);
    currentStepText.textContent = step.text;
    statusText.textContent = `Adım ${currentStepIndex + 1} / ${currentSteps.length}`;

    // Son adıma gelindiyse sonuç özeti gösterilir
    if (currentStepIndex === currentSteps.length - 1) {
      summaryContent.textContent = finalResultText;
      statusText.textContent = "Tamamlandı";
      stopAutoPlay(false);
    }
  }
}

function startAutoPlay() {
  stopAutoPlay(false);

  if (!currentSteps.length) {
    const ok = prepareAlgorithm();
    if (!ok) return;
  }

  if (!currentSteps.length) return;

  statusText.textContent = "Otomatik Çalışıyor";

  autoPlayInterval = setInterval(() => {
    if (currentStepIndex < currentSteps.length - 1) {
      showNextStep();
    } else {
      stopAutoPlay(false);
      statusText.textContent = "Tamamlandı";
    }
  }, 1200);
}

function clearCanvasOnly() {
  stopAutoPlay(false);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  currentStepText.textContent = "Graf alanı temizlendi.";
  statusText.textContent = "Temizlendi";
}

function updateSourceNodeOptions() {
  const currentNodes = getCurrentNodes();
  sourceNodeSelect.innerHTML = "";

  currentNodes.forEach((node) => {
    const option = document.createElement("option");
    option.value = node.id;
    option.textContent = node.id;
    sourceNodeSelect.appendChild(option);
  });

  if (currentNodes.length > 0) {
    sourceNodeSelect.value = currentNodes[0].id;
  }
}

function openEdgeModal(startNode, endNode) {
  pendingEdgeStart = startNode;
  pendingEdgeEnd = endNode;

  edgeModalText.textContent = `${startNode.id} ile ${endNode.id} arasındaki kenar ağırlığını girin.`;

  // Bellman-Ford negatif ağırlığa izin verdiği için buna göre placeholder değişir
  if (currentAlgorithm === "bellmanFord") {
    edgeWeightInput.placeholder = "Örnek: -3 veya 5";
    edgeWeightInput.min = "";
  } else {
    edgeWeightInput.placeholder = "Sadece 0 veya pozitif değer";
    edgeWeightInput.min = "0";
  }

  edgeWeightInput.value = "";
  edgeModal.classList.remove("hidden");
  edgeWeightInput.focus();
}

function closeEdgeModal() {
  edgeModal.classList.add("hidden");
  edgeWeightInput.value = "";
  pendingEdgeStart = null;
  pendingEdgeEnd = null;
}

function handleEdgeSelection(node) {
  if (!selectedNode) {
    selectedNode = node;
    currentStepText.textContent =
      `${node.id} seçildi. Bağlamak için başka bir düğüme tıklayın.`;
    drawGraph();
  } else {
    if (selectedNode.id === node.id) return;

    // Aynı kenar tekrar eklenmesin diye kontrol yapılır
    const edgeExists = customEdges.some((edge) => {
      if (isDirectedGraph()) {
        return edge.from === selectedNode.id && edge.to === node.id;
      }
      return (
        (edge.from === selectedNode.id && edge.to === node.id) ||
        (edge.from === node.id && edge.to === selectedNode.id)
      );
    });

    if (edgeExists) {
      currentStepText.textContent = "Bu kenar zaten mevcut.";
      selectedNode = null;
      drawGraph();
      return;
    }

    openEdgeModal(selectedNode, node);
    selectedNode = null;
    drawGraph();
  }
}

function resetAll() {
  stopAutoPlay(false);

  isCustomMode = false;
  customNodes = [];
  customEdges = [];
  selectedNode = null;
  pendingEdgeStart = null;
  pendingEdgeEnd = null;

  currentAlgorithm = "dijkstra";
  currentSteps = [];
  currentStepIndex = -1;
  finalResultText = "";

  menuButtons.forEach((btn) => btn.classList.remove("active"));
  document.querySelector('[data-algo="dijkstra"]').classList.add("active");

  setAlgorithmInfo(currentAlgorithm);
  updateSourceNodeOptions();
  drawGraph();
  resetVisualizationText();
}

newGraphBtn.addEventListener("click", () => {
  stopAutoPlay(false);

  isCustomMode = true;
  customNodes = [];
  customEdges = [];
  selectedNode = null;

  currentSteps = [];
  currentStepIndex = -1;
  finalResultText = "";

  updateSourceNodeOptions();
  drawGraph();

  summaryContent.textContent = "Yeni grafik modu aktif. Boş alana tıklayarak düğüm ekleyin.";
  currentStepText.textContent =
    "Boş grafik oluşturuldu. Düğüm eklemek için canvas üzerine tıklayın.";
  statusText.textContent = "Çizim Modu";
});

canvas.addEventListener("click", (e) => {
  if (!isCustomMode) return;

  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;

  // Tıklanan nokta canvas koordinatlarına çevrilir
  const x = (e.clientX - rect.left) * scaleX;
  const y = (e.clientY - rect.top) * scaleY;

  // Tıklanan yer mevcut bir düğüm mü diye kontrol edilir
  const clickedNode = getCurrentNodes().find((n) => {
    const dx = n.x - x;
    const dy = n.y - y;
    return Math.sqrt(dx * dx + dy * dy) < 25;
  });

  if (!clickedNode) {
    // Yeni düğüm ekleme
    if (customNodes.length >= 26) {
      currentStepText.textContent = "En fazla 26 düğüm eklenebilir.";
      return;
    }

    // A, B, C ... şeklinde otomatik isimlendirme
    const id = String.fromCharCode(65 + customNodes.length);
    customNodes.push({ id, x, y });
    updateSourceNodeOptions();
    drawGraph();

    currentStepText.textContent = `${id} düğümü eklendi.`;
    summaryContent.textContent =
      "Düğüm eklendi. Başka düğümler ekleyebilir veya iki düğüme tıklayarak kenar oluşturabilirsiniz.";
  } else {
    // Mevcut düğüm seçildiyse kenar oluşturma işlemi
    handleEdgeSelection(clickedNode);
  }
});

saveEdgeBtn.addEventListener("click", () => {
  if (!pendingEdgeStart || !pendingEdgeEnd) return;

  let weight = parseInt(edgeWeightInput.value, 10);

  if (isNaN(weight)) {
    alert("Geçerli bir sayı giriniz.");
    return;
  }

  // Negatif ağırlık sadece Bellman-Ford için izinli
  if (weight < 0 && currentAlgorithm !== "bellmanFord") {
    alert("Negatif ağırlık sadece Bellman-Ford algoritmasında kullanılabilir.");
    return;
  }

  customEdges.push({
    from: pendingEdgeStart.id,
    to: pendingEdgeEnd.id,
    weight: weight
  });

  currentStepText.textContent =
    `${pendingEdgeStart.id} ile ${pendingEdgeEnd.id} arasında kenar eklendi.`;
  summaryContent.textContent =
    `Yeni kenar eklendi: ${pendingEdgeStart.id} - ${pendingEdgeEnd.id}, ağırlık = ${weight}`;

  closeEdgeModal();
  drawGraph();
});

cancelEdgeBtn.addEventListener("click", () => {
  closeEdgeModal();
  currentStepText.textContent = "Kenar ekleme işlemi iptal edildi.";
  drawGraph();
});

menuButtons.forEach((button) => {
  button.addEventListener("click", () => {
    stopAutoPlay(false);

    menuButtons.forEach((btn) => btn.classList.remove("active"));
    button.classList.add("active");

    currentAlgorithm = button.dataset.algo;
    currentSteps = [];
    currentStepIndex = -1;
    finalResultText = "";
    selectedNode = null;

    setAlgorithmInfo(currentAlgorithm);
    drawGraph();
    resetVisualizationText();

    // Eğer kullanıcı kendi grafiğini çizmişse, grafik korunur
    if (isCustomMode) {
      updateSourceNodeOptions();
      summaryContent.textContent =
        "Algoritma değiştirildi. Mevcut kullanıcı grafiği korunuyor.";
      currentStepText.textContent =
        "Grafiğiniz hazır. İsterseniz algoritmayı başlatabilirsiniz.";
      statusText.textContent = "Hazır";
    }
  });
});

startBtn.addEventListener("click", startAutoPlay);
nextBtn.addEventListener("click", showNextStep);
stopBtn.addEventListener("click", () => stopAutoPlay());
clearBtn.addEventListener("click", clearCanvasOnly);
resetBtn.addEventListener("click", resetAll);

setAlgorithmInfo(currentAlgorithm);
updateSourceNodeOptions();
drawGraph();
resetVisualizationText();