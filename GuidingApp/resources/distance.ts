export function calculateDistance(rssi: number, measuredPower: number = -59, pathLossExponent: number = 2): number {
  if (rssi === 0) {
      return -1.0; // Indica que no se pudo calcular la distancia
  }
  return Math.pow(10, (measuredPower - rssi) / (10 * pathLossExponent));
}
  
  