function generatePrimSteps(start) {
  // Geçerli grafın düğümleri ve kenarları alınır
  const nodeList = getCurrentNodes();
  const currentEdges = getCurrentEdges();

  // visited: ağaca dahil edilmiş düğümleri tutar
  const visited = new Set();

  // selectedEdges: minimum yayılma ağacına eklenen kenarlar
  const selectedEdges = [];

  // steps: görselleştirme için her adım burada saklanır
  const steps = [];

  visited.add(start);

  // İlk görsel adım
  steps.push({
    text: `${start} düğümü ile başlanır. Bu düğüm ağaca eklendi.`,
    highlightedNodes: [...visited],
    selectedEdges: [...selectedEdges]
  });

  while (visited.size < nodeList.length) {
    let bestEdge = null;

    for (const edge of currentEdges) {
      const condition1 = visited.has(edge.from) && !visited.has(edge.to);
      const condition2 = visited.has(edge.to) && !visited.has(edge.from);

      if (condition1 || condition2) {
        // Uygun kenarlar arasında en küçük ağırlıklı olan seçilir
        if (!bestEdge || edge.weight < bestEdge.weight) {
          bestEdge = edge;
        }
      }
    }

    if (!bestEdge) break;

    // Seçilecek kenar görsel olarak gösterilir
    steps.push({
      text: `En küçük uygun kenar seçiliyor: ${bestEdge.from} - ${bestEdge.to} (Ağırlık: ${bestEdge.weight})`,
      highlightedNodes: [...visited],
      candidateEdge: { from: bestEdge.from, to: bestEdge.to },
      selectedEdges: [...selectedEdges]
    });

    selectedEdges.push(bestEdge);
    visited.add(bestEdge.from);
    visited.add(bestEdge.to);

    // Kenarın seçildiği adım görsel olarak eklenir
    steps.push({
      text: `${bestEdge.from} - ${bestEdge.to} kenarı minimum yayılma ağacına eklendi.`,
      highlightedNodes: [...visited],
      selectedEdges: [...selectedEdges]
    });
  }
  
  const totalWeight = selectedEdges.reduce((sum, e) => sum + e.weight, 0);

  const resultText =
    `Prim tamamlandı.\n` +
    `Seçilen kenar sayısı: ${selectedEdges.length}\n` +
    `Toplam ağırlık: ${totalWeight}`;

  // Görsel adımlar ve sonuç metni geri döndürülür
  return { steps, resultText };
}