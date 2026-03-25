#include <Arduino.h>
#include <WiFi.h>
#include <WebServer.h>
#include <SPIFFS.h>

const char* ssid = "Totalplay-5BB1";
const char* password = "5BB13C41hajvn9Au";

WebServer server(80);

// LEDS
int led1R = 23;
int led1V = 14;
int led2R = 4;
int led2V = 18;
int led3R = 25;
int led3V = 33;
int led4R = 27;
int led4V = 26;
int led5R = 19;
int led5V = 22;

// SENSORES
int sensor1 = 34;
int sensor2 = 35;
int sensor3 = 32;
int sensor4 = 39;
int sensor5 = 36;

int valor1, valor2, valor3, valor4, valor5;
int valorP1, valorP2, valorP3, valorP4, valorP5;

String enviarEstados()
{
  return String(valorP1) + "," +
         String(valorP2) + "," +
         String(valorP3) + "," +
         String(valorP4) + "," +
         String(valorP5);
}

void setup()
{
  Serial.begin(115200);

  pinMode(led1R, OUTPUT);
  pinMode(led1V, OUTPUT);
  pinMode(led2R, OUTPUT);
  pinMode(led2V, OUTPUT);
  pinMode(led3R, OUTPUT);
  pinMode(led3V, OUTPUT);
  pinMode(led4R, OUTPUT);
  pinMode(led4V, OUTPUT);
  pinMode(led5R, OUTPUT);
  pinMode(led5V, OUTPUT);

  WiFi.begin(ssid, password);

  Serial.print("Conectando WiFi");

  while (WiFi.status() != WL_CONNECTED)
  {
    delay(500);
    Serial.print(".");
  }

  Serial.println("");
  Serial.println("WiFi conectado");
  Serial.println(WiFi.localIP());

  SPIFFS.begin(true);

  // PAGINA PRINCIPAL
  server.on("/", []()
  {
    File file = SPIFFS.open("/Home.html", "r");
    server.streamFile(file, "text/html");
    file.close();
  });

  // ENVIO DE DATOS
  server.on("/datos", []()
  {
    server.send(200, "text/plain", enviarEstados());
  });

  // PERMITE USAR JS, CSS, IMAGENES
  server.serveStatic("/", SPIFFS, "/");

  server.begin();
}

void loop()
{
  server.handleClient();

  valor1 = analogRead(sensor1);
  valor2 = analogRead(sensor2);
  valor3 = analogRead(sensor3);
  valor4 = analogRead(sensor4);
  valor5 = analogRead(sensor5);

  if(valor1 < 3000){
    digitalWrite(led1R, HIGH);
    digitalWrite(led1V, LOW);
    valorP1 = 0;
  }else{
    digitalWrite(led1V, HIGH);
    digitalWrite(led1R, LOW);
    valorP1 = 1;
  }

  if(valor2 < 700){
    digitalWrite(led2R, HIGH);
    digitalWrite(led2V, LOW);
    valorP2 = 0;
  }else{
    digitalWrite(led2V, HIGH);
    digitalWrite(led2R, LOW);
    valorP2 = 1;
  }

  if(valor3 < 2000){
    digitalWrite(led3R, HIGH);
    digitalWrite(led3V, LOW);
    valorP3 = 0;
  }else{
    digitalWrite(led3V, HIGH);
    digitalWrite(led3R, LOW);
    valorP3 = 1;
  }

  if(valor4 < 2500){
    digitalWrite(led4R, HIGH);
    digitalWrite(led4V, LOW);
    valorP4 = 0;
  }else{
    digitalWrite(led4V, HIGH);
    digitalWrite(led4R, LOW);
    valorP4 = 1;
  }

  if(valor5 < 1700){
    digitalWrite(led5R, HIGH);
    digitalWrite(led5V, LOW);
    valorP5 = 0;
  }else{
    digitalWrite(led5V, HIGH);
    digitalWrite(led5R, LOW);
    valorP5 = 1;
  }
}