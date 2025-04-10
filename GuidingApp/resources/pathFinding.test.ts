// pathFinding.test.ts
import * as pathFindingModule from './pathFinding';
import { Dot } from '@/app/classes/geometry';
import { EdgeDTO, MapDataDTO, NodeDTO } from '@/app/classes/DTOs';
import { PathResult } from './pathFinding';

const { findGraphPath, findPathWithDistance, findShortestPath } = pathFindingModule;


// Datos de prueba para los nodos.
const originNode: NodeDTO = {
id: 1,
name: 'Origin',
beaconId: 'b1',
x: 0,
y: 0,
comment: '',
area: []
};

const intermediateNode: NodeDTO = {
id: 2,
name: 'Intermediate',
beaconId: 'b2',
x: 1,
y: 1,
comment: '',
area: []
};

const destinationNode: NodeDTO = {
id: 3,
name: 'Destination',
beaconId: 'b3',
x: 2,
y: 2,
comment: '',
area: []
};

const edge1: EdgeDTO = {
    id: 1,
    fromNode: originNode,
    toNode: intermediateNode,
    weight: 2
}

const edge2: EdgeDTO = {
    id: 2,
    fromNode: intermediateNode,
    toNode: destinationNode,
    weight: 2
}

// Genera un MapDataDTO de ejemplo. (Los edges no se usan en el test ya que se mockea findGraphPath)
const mapData: MapDataDTO = {
id: 100,
name: 'Test Map',
northAngle: 0,
matrix: [
    [0, 0, 0],
    [0, 0, 0],
    [0, 0, 0]
],
nodes: [originNode, intermediateNode, destinationNode],
edges: [edge1, edge2] // No es relevante para el test; la función findGraphPath se reemplaza.
};

// Grid de 3x3 (todos los valores 0 indican celdas transitables).
const grid: number[][] = [
[0, 0, 0],
[0, 0, 0],
[0, 0, 0]
];

describe('findPathWithDistance', () => {
beforeEach(() => {
    // Restaura los mocks antes de cada test.
    jest.restoreAllMocks();

    // Usa jest.spyOn para interceptar las llamadas a findGraphPath y findShortestPath.

    // Simula que findGraphPath retorna el camino [originNode, intermediateNode, destinationNode].
    jest.spyOn(pathFindingModule, 'findGraphPath').mockReturnValue([originNode, intermediateNode, destinationNode]);

    // Simula que findShortestPath retorna un segmento sencillo.
    // Para el segmento de (0,0) a (1,1): retorna [{ x: 0, y: 0 }, { x: 1, y: 1 }]
    // Para el segmento de (1,1) a (2,2): retorna [{ x: 1, y: 1 }, { x: 2, y: 2 }]
    jest.spyOn(pathFindingModule, 'findShortestPath').mockImplementation(
    (g: number[][], start: Dot, end: Dot, _isLastSegment: Boolean): Dot[] => {
        if (start.x === 0 && start.y === 0 && end.x === 1 && end.y === 1) {
        return [{ x: 0, y: 0 }, { x: 1, y: 1 }];
        }
        if (start.x === 1 && start.y === 1 && end.x === 2 && end.y === 2) {
        return [{ x: 1, y: 1 }, { x: 2, y: 2 }];
        }
        return [];
    }
    );
});

it('should return a valid PathResult when a graph path and grid segments exist', () => {
    const result = findPathWithDistance(grid, mapData, originNode, destinationNode);
    
    // Se espera que se retorne un resultado que no sea null.
    expect(result).not.toBeNull();

    // Los waypoints se extraen de las propiedades x e y.
    const expectedWaypoints: Dot[] = [
    { x: originNode.x, y: originNode.y },
    { x: intermediateNode.x, y: intermediateNode.y },
    { x: destinationNode.x, y: destinationNode.y }
    ];

    // Segmentos definidos: cada segmento conecta dos waypoints consecutivos.
    const expectedSegments = [
    { start: expectedWaypoints[0], end: expectedWaypoints[1] },
    { start: expectedWaypoints[1], end: expectedWaypoints[2] }
    ];

    // fullPath es la concatenación de cada segmento.
    // Se espera que, tras quitar duplicados, sea: [{x:0,y:0}, {x:1,y:1}, {x:2,y:2}]
    const expectedFullPath: Dot[] = [
    { x: 0, y: 0 },
    { x: 1, y: 1 },
    { x: 2, y: 2 }
    ];

    const expected: PathResult = {
    nodes: expectedWaypoints,
    segments: expectedSegments,
    fullPath: expectedFullPath
    };

    expect(result).toEqual(expected);
});

it('should return null when a segment path is not found', () => {
    // Configura el mock de findShortestPath para retornar un array vacío en el primer segmento.
    jest.spyOn(pathFindingModule, 'findShortestPath').mockImplementationOnce(
    (g: number[][], start: Dot, end: Dot, _isLastSegment: Boolean): Dot[] => {
        return []; // Simula que no se encontró camino para el segmento.
    }
    );

    const result = findPathWithDistance(grid, mapData, originNode, destinationNode);
    expect(result).toBeNull();
});
});