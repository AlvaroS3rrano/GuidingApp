# GuidingApp

## Project Overview

GuidingApp is a hybrid mobile navigation application that seamlessly combines **outdoor and indoor navigation**, providing a continuous and transparent guiding experience across different environments.

The system integrates the following components:

- **Outdoor Navigation (GPS + Google Maps)**  
  Uses the Google Maps API to display maps, calculate routes, and track the user’s real-time position in outdoor environments.

- **Indoor Navigation (BLE Eddystone Beacons)**  
  Relies on Bluetooth Low Energy (BLE) beacons installed inside buildings to estimate the user’s position using RSSI values and provide accurate indoor guidance.

- **Client–Server Architecture**  
  - **Frontend**: Developed with React Native (Expo), using `react-native-maps`, `react-native-ble-plx`, and an A* pathfinding algorithm for indoor routing.  
  - **Backend**: REST API built with Spring Boot (Java) and backed by a MySQL database. Indoor maps are modeled as graphs composed of nodes, edges, and floor matrices.

- **Automatic Environment Transition**  
  The application automatically switches between outdoor and indoor navigation by detecting nearby BLE beacons, adapting to the correct building floor and corresponding entry or exit nodes without user intervention.

- **Secure Development Setup**  
  During development, ngrok is used to expose the backend over HTTPS, avoiding issues related to self-signed SSL certificates.

Overall, the system delivers a smooth user experience, ensuring optimized routing and seamless transitions between outdoor and indoor environments.

---

## Demo Videos

### 1. Outdoor → Indoor Navigation Demo

This video demonstrates the complete navigation workflow, starting outdoors using GPS and Google Maps and automatically transitioning to indoor guidance when entering a building.

📽️ **Outdoor to Indoor Guidance**  

https://vimeo.com/1095542197

---

### 2. Indoor Navigation (Multiple Floors)

This video showcases indoor navigation across multiple floors, including automatic floor detection and path recalculation during vertical transitions.

📽️ **Indoor Guidance (Multiple Floors)**  

https://vimeo.com/1094743646

---

## Project Structure

The project is divided into two main components: a **mobile application** (frontend) and a **web backend** (server-side logic).

### Mobile Application (Expo / React Native)

```text
GuidingApp/
├── android/                     # Android-specific generated files
├── app/                         # Main Expo application source
│   ├── algorithms/              # Pathfinding and routing algorithms (A*)
│   ├── classes/                 # Domain and helper classes
│   ├── components/              # Reusable UI components
│   ├── constants/               # Global constants and configuration
│   ├── hooks/                   # Custom React hooks
│   ├── screens/                 # Application screens
│   ├── services/                # Beacon scanning, API calls, navigation logic
│   │
│   ├── _layout.tsx               # Root layout (Expo Router)
│   ├── AppContext.tsx            # Global application state
│   └── index.tsx                 # Application entry point
│
├── assets/                       # Static assets
│   ├── fonts/
│   ├── images/
│   └── resources/
│
├── BeaconMonitorTask.js          # Background BLE monitoring task
├── app.json                      # Expo configuration
├── metro.config.js               # Metro bundler configuration
├── declarations.d.ts             # TypeScript declarations
├── tsconfig.json                 # TypeScript configuration
└── package.json                  # Frontend dependencies and scripts
```

### Backend Application (Spring Boot)

``` text
GuidingApp_web/guidingApp/
├── .mvn/                         # Maven wrapper files
├── src/
│   ├── main/
│   │   ├── java/es/gdapp/guidingApp/
│   │   │   ├── config/           # Application and security configuration
│   │   │   ├── controllers/      # REST API controllers
│   │   │   ├── converters/       # DTO/entity converters
│   │   │   ├── dto/              # Data Transfer Objects
│   │   │   ├── mappers/          # Entity–DTO mappers
│   │   │   ├── models/           # JPA entities and domain models
│   │   │   ├── repositories/     # JPA repositories
│   │   │   ├── services/         # Business logic and data services
│   │   │   └── GuidingAppApplication.java
│   │
│   └── resources/
│       ├── application.properties
│       ├── static/
│       └── templates/
│
├── keystore.p12                  # HTTPS keystore (development)
├── pom.xml                       # Maven configuration
├── mvnw / mvnw.cmd               # Maven wrapper scripts
└── .gitignore
```

---

## Prerequisites

To run this project, make sure the following tools are installed:

- **Node.js** (LTS version recommended)
- **Expo CLI**
- **Android Studio** with Android SDK and an emulator or physical device
- **Java JDK 17** (required for the Spring Boot backend)
- **npm** (comes with Node.js)

Optional:
- **Expo Go** (for quick testing without building the Android app)

---

## Installation

### Clone the repository

```bash
git clone https://github.com/your-username/your-project.git
cd your-project
```

### Install dependencies
```bash
npm install
```

## Expo Initialization

After installing dependencies, the Expo project must be initialized at least once.

Run the following command from the project root:

```bash
npx expo start
```

This step will:
- Generate the `.expo` directory
- Create required Expo TypeScript types
- Validate the project configuration

Once the development server starts, you can stop the process and continue with the configuration steps.

## Configuration

### 1. Google Maps API Key

To run the application, you must provide your own Google Maps API key.

- Open `app/constants/consts.ts`.
- Locate the `GOOGLE_MAPS_API_KEY` constant and replace its value:

```ts
// app/constants/consts.ts 
export const GOOGLE_MAPS_API_KEY = 'YOUR_API_KEY_HERE';
```

## Google Maps APIs Configuration

In addition to providing a Google Maps API key, the following Google Maps APIs must be enabled in the Google Cloud Console:

- **Maps SDK for Android**  
  Required to render Google Maps inside the Android application and display the user’s position and map layers.

- **Directions API**  
  Required to calculate outdoor routes and navigation paths between GPS coordinates.


These APIs can be enabled from the Google Cloud Console:

https://console.cloud.google.com/apis/library

---

### 2. AndroidManifest.xml

You must also add the API key to `AndroidManifest.xml` for Google Maps integration:

```xml
<!-- AndroidManifest.xml -->
<application>
  <!-- ... -->  
  <meta-data`  
    android:name="com.google.android.geo.API_KEY" 
    android:value="YOUR_API_KEY_HERE"/>
</application>
```

---

### 3. Backend with ngrok (Optional)

If you do not want to configure a real SSL certificate during development, you can use ngrok to expose your local backend over HTTPS.

**Start ngrok**

```bash
ngrok http https://localhost:8443 --host-header="localhost:8443"
```
**Example output:**

```text
https://abcd1234.ngrok-free.app -> https://localhost:8443
```

**Configure the ngrok host in your constants**

Extract the host part:

```text
abcd1234.ngrok-free.app
```
Set it in `app/constants/consts.ts`:

```ts
// app/constants/consts.ts  
export const COMP_IP = 'abcd1234.ngrok-free.app';
```

---

### BLE Beacons Configuration

Indoor positioning relies on Bluetooth Low Energy (BLE) beacons configured using the **Eddystone-UID** protocol.

#### Beacon Registration in the Backend

For a beacon to be recognized by the system, it must be explicitly registered in the backend database.

Currently, this is done by adding a **Node** object associated with the beacon identifier in the backend initializer:

`GuidingApp_web/guidingApp/src/main/java/es/gdapp/guidingApp/services/DatabaseInitializer.java`

Each beacon must be linked to a navigation node by setting the corresponding `beaconId` field.  
Only beacons registered this way will be considered valid during the indoor positioning process.

#### Beacon Detection in the Mobile Application

On the client side, beacon detection is handled by the beacon scanning service:

`GuidingApp/app/services/beaconScannerService.ts`

When a BLE beacon is detected, the application checks whether its identifier matches a registered node received from the backend. If a match is found, the beacon is classified as *recognized* and can trigger indoor navigation and map loading.

#### Supported Beacon UUID

At the moment, the application only detects beacons broadcasting the following Eddystone service UUID:

`0000fe9a-0000-1000-8000-00805f9b34fb`

This UUID corresponds to the **Eddystone** specification.  
All beacons used during the development and testing of this application were **Estimote beacons**, configured to broadcast using the Eddystone-UID format.

> ⚠️ Beacons using other protocols or UUIDs (e.g., iBeacon or AltBeacon) will not be detected unless the scanning logic is extended accordingly.


## Running the Application

_Run each command from its corresponding project root._

### Start the backend

```bash
mvn clean install  
mvn spring-boot:run
```

### Run the Android application

```bash
npx expo run:android --device
```

## Academic Context

This project was developed as part of a **Bachelor’s Final Project (Trabajo Fin de Grado)** in Software Engineering and Computer Engineering.

The goal of the project is to explore hybrid indoor–outdoor navigation systems combining GPS, BLE beacons, and graph-based pathfinding algorithms.
