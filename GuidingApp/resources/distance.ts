
export function calculateDistance(rssi: number, measure: number = -69, multiplier: number = 2): number {
    return Math.pow(10, (measure - rssi) / (10 * multiplier));
}

const rssiValues: { [key: string]: number[] } = {};

export function addRssiValueAndGetAverage(deviceId: string, newValue: number, maxSize: number = 3): number {
  if (!rssiValues[deviceId]) {
    rssiValues[deviceId] = []; // Initialize the array if this is the first value
  }
  const values: number[] = rssiValues[deviceId];
  values.push(newValue); // Add a new value

  // Remove the oldest value if the maximum array size is exceeded
  if (values.length > maxSize) {
    values.shift();
  }

  // Calculate the average value
  const averageRssi: number = values.reduce((acc: number, value: number) => acc + value, 0) / values.length;
  return averageRssi;
}
  
  