#include <Arduino.h>
#include <WiFi.h>
#include <FirebaseESP32.h>
#include <ESP32Servo.h>

// WIFI
const char* ssid = "Wokwi-GUEST";
const char* password = "";

// FIREBASE
#define FIREBASE_HOST "esp32-ecdcf-default-rtdb.asia-southeast1.firebasedatabase.app"
#define FIREBASE_AUTH "AIzaSyBTnfeDaDYQlk3ugUHzc3SXB_b7dMrv3Qg"

FirebaseData fbdo;
FirebaseConfig config;
FirebaseAuth auth;

// SERVO
Servo plumaServo;
const int pinServo = 13;

// SENSOR
const int pinPresion = 34;
int umbralPresion = 1500; //  AJUSTA SEGÚN TUS VALORES

void setup() {
  Serial.begin(115200);

  // Servo
  ESP32PWM::allocateTimer(0);
  plumaServo.setPeriodHertz(50);
  plumaServo.attach(pinServo, 500, 2400);
  plumaServo.write(0);

  // WiFi
  WiFi.begin(ssid, password);
  Serial.print("Conectando WiFi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nWiFi Conectado");

  // Firebase
  config.host = FIREBASE_HOST;
  config.signer.tokens.legacy_token = FIREBASE_AUTH;
  Firebase.begin(&config, &auth);
  Firebase.reconnectWiFi(true);
}

void loop() {
  if (Firebase.ready()) {
    int estadoPlumaDB = 0;
    if (Firebase.getInt(fbdo, "/estacionamiento/pluma")) {
      estadoPlumaDB = fbdo.intData();
    }
    delay(5000);
    //  1. Leer sensor
    int valorAnalogico = analogRead(pinPresion);

    // DEBUG (MUY IMPORTANTE)
    Serial.print("Valor sensor: ");
    Serial.println(valorAnalogico);

    // 🔹 2. Convertir a estado (AJUSTA SI ESTÁ INVERTIDO)
    int estadoSensor = (valorAnalogico > umbralPresion) ? 1 : 0;

    // 🔹 3. Enviar SIEMPRE a Firebase (tiempo real)
    Firebase.setInt(fbdo, "/estacionamiento/sensor_presion", estadoSensor);




    // 🔹 5. Lógica principal
    if (estadoSensor == 1 && estadoPlumaDB == 1) {


      // Abrir pluma
      plumaServo.write(90);
      delay(1500);

      // Cerrar pluma
      plumaServo.write(0);

      // Resetear SOLO después de usar
      Firebase.setInt(fbdo, "/estacionamiento/pluma", 0);
      Firebase.setInt(fbdo, "/estacionamiento/sensor_presion", 0);
    } 
    else {
      // Mantener cerrada
      plumaServo.write(0);
      estadoPlumaDB = 0;
      Firebase.setInt(fbdo, "/estacionamiento/pluma", estadoPlumaDB);
    }
  }

  delay(100); // velocidad de actualización
}
