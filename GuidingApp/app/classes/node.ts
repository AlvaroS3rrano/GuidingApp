import { Dot } from './geometry'

/**
 * This module defines the Dot interface (imported from './geometry') and the Node class.
 * 
 * The Node class encapsulates:
 *   - id: a unique identifier for the node.
 *   - area: an array of Dot objects representing a collection of points.
 *   - sensor: a Dot object representing a sensor point.
 * 
 * The Node class also provides methods to add a new Dot to the area and update the sensor.
 */
export class Node {
  // 'id' is a unique identifier for the node.
  public id: string;

  // 'area' is an array of Dot objects representing a collection of points.
  public area: Dot[];

  // 'sensor' is a Dot object representing the sensor.
  public sensor: Dot;

  /**
   * Creates an instance of the Node class.
   * @param id - A unique identifier for the node.
   * @param area - An array of Dot objects defining the area.
   * @param sensor - A Dot object representing the sensor.
   */
  constructor(id: string, area: Dot[], sensor: Dot) {
    this.id = id;
    this.area = area;
    this.sensor = sensor;
  }

  /**
   * Adds a new Dot to the area.
   * @param dot - The Dot object to add to the area.
   */
  public addToArea(dot: Dot): void {
    this.area.push(dot);
  }

  /**
   * Updates the sensor with a new Dot.
   * @param newSensor - The new Dot object for the sensor.
   */
  public updateSensor(newSensor: Dot): void {
    this.sensor = newSensor;
  }
}

// Example usage:
if (require.main === module) {
    // Define some Dot objects.
    const dot1: Dot = { x: 1, y: 2 };
    const dot2: Dot = { x: 3, y: 4 };
    const sensorDot: Dot = { x: 5, y: 6 };
  
    // Create a Node instance with an id, initial area, and sensor.
    const myNode = new Node("node-1", [dot1, dot2], sensorDot);
  
    // Add a new Dot to the Node's area.
    myNode.addToArea({ x: 7, y: 8 });
  
    // Update the sensor.
    myNode.updateSensor({ x: 9, y: 10 });
  
    // Display the Node's id, area, and sensor in the console.
    console.log("Node ID:", myNode.id);
    console.log("Area:", myNode.area);
    console.log("Sensor:", myNode.sensor);
}