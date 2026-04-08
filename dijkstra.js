function generateDijkstraSteps(start) {
  // Geçerli düğüm listesi alınır
  const nodeList = getCurrentNodes();

  const adj = buildAdjacencyList();

  const dist = {};
  const visited = {};
  const prev = {};
  const steps = [];


  nodeList.forEach((n) => {
    dist[n.id] = Infinity;
    visited[n.id] = false;
    prev[n.id] = null;
  });

  // Başlangıç düğümünün uzaklığı 0 yapılır
  dist[start] = 0;

  steps.push({
    text: `Başlangıç düğümü ${start} seçildi. Uzaklık(${start}) = 0 olarak ayarlandı.`,
    distances: { ...dist },
    highlightedNodes: [start],
    selectedEdges: []
  });

  for (let i = 0; i < nodeList.length; i++) {
    let current = null;
    let minDist = Infinity;

    for (const node of nodeList) {
      if (!visited[node.id] && dist[node.id] < minDist) {
        minDist = dist[node.id];
        current = node.id;
      }
    }

    // Eğer erişilebilir düğüm kalmadıysa algoritma durur
    if (current === null) break;

    // Seçilen düğüm artık işlenmiş kabul edilir
    visited[current] = true;

    steps.push({
      text: `${current} düğümü seçildi. Bu düğümün mevcut en kısa uzaklığı ${dist[current]} olarak kesinleşti.`,
      distances: { ...dist },
      highlightedNodes: Object.keys(visited).filter((k) => visited[k]),
      selectedEdges: Object.keys(prev)
        .filter((k) => prev[k] !== null)
        .map((k) => ({ from: prev[k], to: k }))
    });

    for (const neighbor of adj[current]) {
      // Eğer komşu zaten ziyaret edildiyse tekrar işlenmez
      if (visited[neighbor.to]) continue;

      // current üzerinden neighbor düğümüne gitmenin yeni maliyeti
      const newDist = dist[current] + neighbor.weight;

      // Kenar kontrolü görsel olarak gösterilir
      steps.push({
        text: `${current} -> ${neighbor.to} kenarı kontrol edildi. Yeni uzaklık adayı: ${dist[current]} + ${neighbor.weight} = ${newDist}`,
        distances: { ...dist },
        highlightedNodes: [current, neighbor.to],
        candidateEdge: { from: current, to: neighbor.to },
        selectedEdges: Object.keys(prev)
          .filter((k) => prev[k] !== null)
          .map((k) => ({ from: prev[k], to: k }))
      });

      if (newDist < dist[neighbor.to]) {
        dist[neighbor.to] = newDist;
        prev[neighbor.to] = current;

        // Güncelleme adımı da görselleştirme için eklenir
        steps.push({
          text: `${neighbor.to} düğümünün uzaklığı güncellendi. Yeni değer: ${newDist}`,
          distances: { ...dist },
          highlightedNodes: [current, neighbor.to],
          candidateEdge: { from: current, to: neighbor.to },
          selectedEdges: Object.keys(prev)
            .filter((k) => prev[k] !== null)
            .map((k) => ({ from: prev[k], to: k }))
        });
      }
    }
  }

  /* ---------------------------------------------------------
     Sonuç metni hazırlanır:
     Her düğüm için başlangıçtan olan son uzaklık değeri yazılır
  --------------------------------------------------------- */
  let resultText = "Son uzaklıklar:\n";
  for (const n of nodeList) {
    resultText += `${n.id}: ${dist[n.id] === Infinity ? "∞" : dist[n.id]}\n`;
  }

  // Fonksiyon, görsel adımları ve sonuç metnini geri döndürür
  return { steps, resultText };
}