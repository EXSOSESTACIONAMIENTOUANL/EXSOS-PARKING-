#include <Arduino.h>
#include <WiFi.h>
#include <FirebaseESP32.h>
#include <ESP32Servo.h>

// WIFI
const char* ssid = "Wokwi-GUEST";
const char* password = "";

// FIREBASE
#define FIREBASE_HOST "estacionamientouanl-default-rtdb.firebaseio.com"
#define FIREBASE_AUTH "AIzaSyDTEJ3mfhPKsC2gsp4VNutoCcZ-4naQNTs"

FirebaseData fbdo;
FirebaseConfig config;
FirebaseAuth auth;

// ==================== ENTRADA ====================
// SERVO ENTRADA
Servo plumaServo;
const int pinServo = 13;

// SENSOR ENTRADA
const int pinPresion = 34;
int umbralPresion = 1500;

// ==================== SALIDA ====================
// SERVO SALIDA
Servo plumaSalidaServo;
const int pinServoSalida = 12; // puedes cambiar pin

// SENSOR SALIDA
const int pinPresionSalida = 35;
int umbralPresionSalida = 1500;

// CONTROL TIEMPO
unsigned long tiempoAnterior = 0;
const int intervalo = 200;

void setup() {
  Serial.begin(115200);

  // ==================== ENTRADA ====================
  ESP32PWM::allocateTimer(0);
  plumaServo.setPeriodHertz(50);
  plumaServo.attach(pinServo, 500, 2400);
  plumaServo.write(0);

  // ==================== SALIDA ====================
  ESP32PWM::allocateTimer(1);
  plumaSalidaServo.setPeriodHertz(50);
  plumaSalidaServo.attach(pinServoSalida, 500, 2400);
  plumaSalidaServo.write(0);

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

  // ==================== ENTRADA ====================
  int valorAnalogico = analogRead(pinPresion);
  int estadoSensor = (valorAnalogico > umbralPresion) ? 1 : 0;

  Firebase.setInt(fbdo, "/estacionamiento/sensor_presion", estadoSensor);

  int estadoPlumaDB = 0;
  if (Firebase.getInt(fbdo, "/estacionamiento/pluma")) {
    estadoPlumaDB = fbdo.intData();
  }

  if (estadoPlumaDB == 1) {

    if (estadoSensor == 1) {
      Serial.println("ENTRADA → CARRO DETECTADO → ABRIR");

      plumaServo.write(90);

      while ((analogRead(pinPresion) > umbralPresion)) {

      }

      Serial.println("ENTRADA → CARRO SE FUE → BAJAR");

      plumaServo.write(0);
    }

    Firebase.setInt(fbdo, "/estacionamiento/pluma", 0);
  }

  // ==================== SALIDA ====================
  int valorAnalogicoSalida = analogRead(pinPresionSalida);
  int estadoSensorSalida = (valorAnalogicoSalida > umbralPresionSalida) ? 1 : 0;

  Firebase.setInt(fbdo, "/estacionamiento/sensor_presion_salida", estadoSensorSalida);

  int estadoPlumaSalidaDB = 0;
  if (Firebase.getInt(fbdo, "/estacionamiento/pluma_salida")) {
    estadoPlumaSalidaDB = fbdo.intData();
  }

  if (estadoPlumaSalidaDB == 1) {

    if (estadoSensorSalida == 1) {
      Serial.println("SALIDA → CARRO DETECTADO → ABRIR");

      plumaSalidaServo.write(90);

      while ((analogRead(pinPresionSalida) > umbralPresionSalida)) {
   
      }

      Serial.println("SALIDA → CARRO SE FUE → BAJAR");

      plumaSalidaServo.write(0);
    }

    Firebase.setInt(fbdo, "/estacionamiento/pluma_salida", 0);
  }

  delay(200);
}
