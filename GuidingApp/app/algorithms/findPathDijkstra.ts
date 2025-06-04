import { EdgeDTO, MapDataDTO, NodeDTO } from '@/app/classes/DTOs';

export function findPathDijkstra(mapdata: MapDataDTO, startId: number, endId: number): number[] {
  const distances: Record<number, number> = {};
  const previous: Record<number, number | null> = {};
  const unvisited = new Set<number>();

  // Inicializa cada nodo con distancia infinita y sin predecesor.
  mapdata.nodes.forEach((node) => {
    distances[node.id] = Infinity;
    previous[node.id] = null;
    unvisited.add(node.id);
  });
  distances[startId] = 0;

  // Bucle principal de Dijkstra.
  while (unvisited.size > 0) {
    let currentId: number | null = null;
    unvisited.forEach((id) => {
      if (currentId === null || distances[id] < distances[currentId]) {
        currentId = id;
      }
    });

    // Si currentId es nulo, sal del bucle.
    if (currentId === null) break;
    
    const curId = currentId;

    // Si hemos llegado al destino, sal del bucle.
    if (curId === endId) break;

    unvisited.delete(curId);

    // Obtén todas las aristas salientes del nodo actual.
    const neighbors = mapdata.edges.filter((edge: EdgeDTO) => edge.fromNode.id === curId);

    // Relaja la distancia de cada vecino.
    neighbors.forEach((edge: EdgeDTO) => {
      const neighborId = edge.toNode.id;
      if (!unvisited.has(neighborId)) return;
      const alt = distances[curId] + edge.weight;
      if (alt < distances[neighborId]) {
        distances[neighborId] = alt;
        previous[neighborId] = curId;
      }
    });
  }

  // Reconstruye el camino desde el destino hacia el inicio.
  const path: number[] = [];
  let current: number | null = endId;
  while (current !== null) {
    path.unshift(current);
    current = previous[current];
  }

  // Si el camino reconstruido no comienza en el nodo de inicio, no se encontró un camino.
  if (path[0] !== startId) {
    return [];
  }
  return path;
}