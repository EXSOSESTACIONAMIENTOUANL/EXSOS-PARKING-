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

// SERVO
Servo plumaServo;
const int pinServo = 13;

// SENSOR
const int pinPresion = 34;
int umbralPresion = 1500;

// CONTROL TIEMPO
unsigned long tiempoAnterior = 0;
const int intervalo = 200; // 200 ms = rápido

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
// Leer sensor
int valorAnalogico = analogRead(pinPresion);
int estadoSensor = (valorAnalogico > umbralPresion) ? 1 : 0;

// Enviar sensor
Firebase.setInt(fbdo, "/estacionamiento/sensor_presion", estadoSensor);

// Leer pluma
int estadoPlumaDB = 0;
if (Firebase.getInt(fbdo, "/estacionamiento/pluma")) {
  estadoPlumaDB = fbdo.intData();
}

//  LÓGICA AUTOMÁTICA
if (estadoPlumaDB == 1) {

  if (estadoSensor == 1) {
    // 🚗 Hay carro → abrir
    Serial.println("ABRIR");

    plumaServo.write(90);
    delay(800);
    plumaServo.write(0);
  }

  //  SIEMPRE RESETEA (haya o no carro)
  Firebase.setInt(fbdo, "/estacionamiento/pluma", 0);
}
  
}
