function generateBellmanFordSteps(start) {
  const nodeList = getCurrentNodes();
  const currentEdges = getCurrentEdges();

  const dist = {};
  const prev = {};
  const steps = [];

  nodeList.forEach((n) => {
    dist[n.id] = Infinity;
    prev[n.id] = null;
  });

  dist[start] = 0;


  steps.push({
    text: `Başlangıç düğümü ${start} seçildi. Bellman-Ford başlatıldı. Bu grafikte negatif ağırlıklı kenarlar bulunabilir.`,
    distances: { ...dist },
    highlightedNodes: [start],
    selectedEdges: []
  });

  for (let i = 0; i < nodeList.length - 1; i++) {
    steps.push({
      text: `${i + 1}. tur başladı. Tüm yönlü kenarlar gevşetilecek.`,
      distances: { ...dist },
      highlightedNodes: [],
      selectedEdges: Object.keys(prev)
        .filter((k) => prev[k] !== null)
        .map((k) => ({ from: prev[k], to: k }))
    });

    // Bu turda herhangi bir güncelleme olup olmadığını takip eder
    let updated = false;

    for (const edge of currentEdges) {
      // O anda kontrol edilen kenarı görsel olarak göster
      steps.push({
        text: `${edge.from} -> ${edge.to} kenarı kontrol ediliyor. Ağırlık = ${edge.weight}`,
        distances: { ...dist },
        highlightedNodes: [edge.from, edge.to],
        candidateEdge: { from: edge.from, to: edge.to },
        selectedEdges: Object.keys(prev)
          .filter((k) => prev[k] !== null)
          .map((k) => ({ from: prev[k], to: k }))
      });


      if (dist[edge.from] !== Infinity && dist[edge.from] + edge.weight < dist[edge.to]) {
        dist[edge.to] = dist[edge.from] + edge.weight;
        prev[edge.to] = edge.from;
        updated = true;

        // Güncelleme yapıldıktan sonra bu adım da görsel olarak eklenir
        steps.push({
          text: `${edge.to} düğümünün uzaklığı güncellendi. Yeni değer: ${dist[edge.to]}`,
          distances: { ...dist },
          highlightedNodes: [edge.from, edge.to],
          candidateEdge: { from: edge.from, to: edge.to },
          selectedEdges: Object.keys(prev)
            .filter((k) => prev[k] !== null)
            .map((k) => ({ from: prev[k], to: k }))
        });
      }
    }

    if (!updated) {
      steps.push({
        text: `Bu turda hiçbir güncelleme yapılmadı. Algoritma erken tamamlandı.`,
        distances: { ...dist },
        highlightedNodes: [],
        selectedEdges: Object.keys(prev)
          .filter((k) => prev[k] !== null)
          .map((k) => ({ from: prev[k], to: k }))
      });
      break;
    }
  }

  /* ---------------------------------------------------------
     Negatif çevrim kontrolü:
     Eğer |V|-1 turdan sonra hâlâ bir kenar üzerinden
     mesafe küçültülebiliyorsa negatif çevrim vardır.
  --------------------------------------------------------- */
  let negativeCycle = false;
  for (const edge of currentEdges) {
    if (dist[edge.from] !== Infinity && dist[edge.from] + edge.weight < dist[edge.to]) {
      negativeCycle = true;
      break;
    }
  }

  let resultText = negativeCycle
    ? "Negatif çevrim tespit edildi.\n"
    : "Negatif çevrim tespit edilmedi.\n";

  resultText += "\nSon uzaklıklar:\n";
  for (const n of nodeList) {
    resultText += `${n.id}: ${dist[n.id] === Infinity ? "∞" : dist[n.id]}\n`;
  }

  // Fonksiyon, görsel adımları ve sonuç metnini geri döndürür
  return { steps, resultText };
}