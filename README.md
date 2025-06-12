# GuidingApp

## Resumen del Proyecto

Este proyecto es una aplicación móvil híbrida de navegación que combina:

- **Exterior (GPS + Google Maps)**  
  Utiliza la API de Google Maps para trazar rutas y mostrar la posición del usuario en entornos al aire libre.

- **Interior (BLE Beacons Eddystone)**  
  Emplea balizas Bluetooth Low Energy instaladas en el edificio para estimar la posición mediante RSSI y realizar la transición automática al modo de guiado interior.

- **Arquitectura Cliente-Servidor**  
  - **Frontend**: React Native (Expo) con `react-native-maps`, `react-native-ble-plx` y lógica A* para el cálculo de rutas en interiores.  
  - **Backend**: API REST en Spring Boot (Java) con base de datos MySQL que sirve mapas interiores modelados como grafos (nodos, aristas, matrices de planta).

- **Transición automática**  
  Detecta balizas para cambiar sin intervención manual entre navegación exterior e interior, adaptándose al piso del edificio y al nodo de entrada o salida correspondiente.

- **Desarrollo seguro**  
  En desarrollo usa ngrok para exponer el backend por HTTPS, evitando problemas con certificados autofirmados.

Este sistema ofrece una experiencia de usuario fluida, con cambios de entorno transparentes y rutas optimizadas tanto en exteriores como en interiores.  


## Instalación

1. Clonar el repositorio:
   ```bash
   git clone https://github.com/tu-usuario/tu-proyecto.git
   cd tu-proyecto
   ```
2. Instalar dependencias:
   ```bash
   npm install
   ```

## Configuración

### 1. Google Maps API Key

Para que la aplicación funcione, debes proporcionar tu propia clave de API de Google Maps.

- Abre el archivo `app/constants/consts.ts`.
- Localiza la constante `GOOGLE_MAPS_API_KEY` y reemplaza su valor con tu API Key:
  ```ts
  // app/constants/consts.ts
  export const GOOGLE_MAPS_API_KEY = 'TU_API_KEY_AQUÍ';
  ```

### 2. AndroidManifest.xml

También debes incluir la API Key en tu `AndroidManifest.xml` para la integración de Google Maps:

```xml
<!-- AndroidManifest.xml -->
<application>
  <!-- ... -->
  <meta-data
    android:name="com.google.android.geo.API_KEY"
    android:value="TU_API_KEY_AQUÍ"/>
</application>
```

### 3. Backend con ngrok (opcional)

Si no quieres crear un certificado SSL real para tu backend en desarrollo, puedes usar ngrok para exponer tu servidor local por HTTPS.

1. Iniciar ngrok:

   - En una terminal, ejecuta:
     ```bash
     ngrok http https://localhost:8443 --host-header="localhost:8443"
     ```
   - Busca la línea que muestra **Forwarding**, por ejemplo:
     ```
     https://abcd1234.ngrok-free.app -> https://localhost:8443
     ```

2. Copiar el host de ngrok en tus constantes:

   - Del URL de forwarding, toma la parte entre `https://` y `/`, por ejemplo:
     ```text
     abcd1234.ngrok-free.app
     ```
   - En `app/constants/consts.ts` establece:
     ```ts
     // app/constants/consts.ts
     export const COMP_IP = 'abcd1234.ngrok-free.app';
     ```

## Ejecución

*Ejecutar cada comando desde su respectiva raíz del proyecto.*

1. Levantar el backend:
   ```bash
   mvn clean install
   mvn spring-boot:run
   ```
2. Ejecutar la app Android:
   ```bash
   npx expo run:android --device 
   ```
