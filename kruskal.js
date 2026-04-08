function find(parent, x) {
  if (parent[x] !== x) {
    parent[x] = find(parent, parent[x]);
  }
  return parent[x];
}

function union(parent, rank, a, b) {
  const rootA = find(parent, a);
  const rootB = find(parent, b);

  // Aynı köke sahiplerse zaten aynı kümededirler
  // Bu kenar eklenirse çevrim oluşur
  if (rootA === rootB) return false;

  // Union by Rank uygulanır
  if (rank[rootA] < rank[rootB]) {
    parent[rootA] = rootB;
  } else if (rank[rootA] > rank[rootB]) {
    parent[rootB] = rootA;
  } else {
    parent[rootB] = rootA;
    rank[rootA]++;
  }

  return true;
}


function generateKruskalSteps() {
  // Geçerli grafın düğümleri alınır
  const nodeList = getCurrentNodes();

  // Kenarlar ağırlıklarına göre küçükten büyüğe sıralanır
  const sortedEdges = [...getCurrentEdges()].sort((a, b) => a.weight - b.weight);

  // Union-Find için parent ve rank yapıları
  const parent = {};
  const rank = {};

  // MST içine alınan kenarlar burada tutulur
  const selectedEdges = [];

  // Görselleştirme adımları burada saklanır
  const steps = [];
  nodeList.forEach((n) => {
    parent[n.id] = n.id;
    rank[n.id] = 0;
  });

  steps.push({
    text: "Tüm kenarlar ağırlıklarına göre küçükten büyüğe sıralandı.",
    highlightedNodes: [],
    selectedEdges: []
  });

  for (const edge of sortedEdges) {
    // O anda incelenen kenarı görsel olarak göster
    steps.push({
      text: `${edge.from} - ${edge.to} kenarı değerlendiriliyor. Ağırlık: ${edge.weight}`,
      highlightedNodes: [edge.from, edge.to],
      candidateEdge: { from: edge.from, to: edge.to },
      selectedEdges: [...selectedEdges]
    });

    if (union(parent, rank, edge.from, edge.to)) {
      selectedEdges.push(edge);

      steps.push({
        text: `${edge.from} - ${edge.to} kenarı çevrim oluşturmadığı için seçildi.`,
        highlightedNodes: [edge.from, edge.to],
        selectedEdges: [...selectedEdges]
      });

      // MST için yeterli sayıda kenar seçildiyse işlem tamamlanır
      if (selectedEdges.length === nodeList.length - 1) break;
    } else {

      steps.push({
        text: `${edge.from} - ${edge.to} kenarı çevrim oluşturacağı için alınmadı.`,
        highlightedNodes: [edge.from, edge.to],
        candidateEdge: { from: edge.from, to: edge.to },
        selectedEdges: [...selectedEdges]
      });
    }
  }

  const totalWeight = selectedEdges.reduce((sum, e) => sum + e.weight, 0);

  const resultText =
    `Kruskal tamamlandı.\n` +
    `Seçilen kenar sayısı: ${selectedEdges.length}\n` +
    `Toplam ağırlık: ${totalWeight}`;

  // Görsel adımlar ve sonuç metni geri döndürülür
  return { steps, resultText };
}