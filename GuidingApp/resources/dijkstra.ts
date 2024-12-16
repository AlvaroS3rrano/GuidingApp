export function dijkstra(graph: any, start: string, end: string): string[] {
    const distances: { [key: string]: number } = {};
    const visited: Set<string> = new Set();
    const previous: { [key: string]: string | null } = {};
    const nodes = Object.keys(graph);
  
    // Inicializa distancias
    nodes.forEach((node) => {
      distances[node] = node === start ? 0 : Infinity;
      previous[node] = null;
    });
  
    while (nodes.length) {
      // Encuentra el nodo más cercano no visitado
      const closestNode = nodes.reduce((a, b) =>
        distances[a] < distances[b] ? a : b
      );
  
      nodes.splice(nodes.indexOf(closestNode), 1);
  
      if (closestNode === end) break;
  
      visited.add(closestNode);
  
      for (const neighbor in graph[closestNode]) {
        const distance = distances[closestNode] + graph[closestNode][neighbor];
        if (distance < distances[neighbor]) {
          distances[neighbor] = distance;
          previous[neighbor] = closestNode;
        }
      }
    }
  
    // Reconstruye la ruta más corta
    const path: string[] = [];
    let currentNode = end;
    while (previous[currentNode]) {
      path.unshift(currentNode);
      currentNode = previous[currentNode]!;
    }
  
    if (currentNode === start) path.unshift(start);
  
    return path.length > 1 ? path : [];
  }
  