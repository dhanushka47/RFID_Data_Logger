#include <WiFi.h>
#include <FirebaseESP32.h>
#include <SPI.h>
#include <MFRC522.h>


//wifi data
const char* ssid = "Redmi 9T";
const char* password = "12345678@";

// Firebase project credentials
#define FIREBASE_HOST "https://rfid-data-log-default-rtdb.asia-southeast1.firebasedatabase.app/"
#define FIREBASE_AUTH "zs9s1CLt1aUtCBG0DFjbdNR7tFf5dQNuZPgpNC5N"


#define SS_PIN 22  // SDA pin of MFRC522
#define RST_PIN 21 // RST pin of MFRC522

#define Red_PIN 4  //red led
#define Green_PIN 16 //green led 
#define Buzzer_PIN 12  // buzzer pin 

MFRC522 mfrc522(SS_PIN, RST_PIN); // Create MFRC522 instance


// Define Firebase objects
FirebaseData firebaseData;
FirebaseConfig firebaseConfig;
FirebaseAuth firebaseAuth;

void setup() {
 
  pinMode(Red_PIN,OUTPUT);
  pinMode(Green_PIN,OUTPUT);
   pinMode(Buzzer_PIN,OUTPUT);

  // Connect to Wi-Fi
  WiFi.begin(ssid, password);
  
  while (WiFi.status() != WL_CONNECTED) {
      digitalWrite(Green_PIN,HIGH);
      delay(200);
      digitalWrite(Green_PIN,LOW);
      delay(200);;
   
  }
   
  digitalWrite(Green_PIN,HIGH);

  // Configure Firebase
  firebaseConfig.host = FIREBASE_HOST;
  firebaseConfig.signer.tokens.legacy_token = FIREBASE_AUTH;

  // Initialize Firebase
  Firebase.begin(&firebaseConfig, &firebaseAuth);
  Firebase.reconnectWiFi(true);

  SPI.begin(); // Initialize SPI bus
  mfrc522.PCD_Init(); // Initialize MFRC522 RFID reader
  
}


void loop() {

if (mfrc522.PICC_IsNewCardPresent() && mfrc522.PICC_ReadCardSerial()) {
    // Print UID of the card

    digitalWrite(Buzzer_PIN,HIGH);
    delay(100);
    digitalWrite(Buzzer_PIN,LOW);
    
 

     String uidString = "";

    for (byte i = 0; i < mfrc522.uid.size; i++) {
      if (mfrc522.uid.uidByte[i] < 0x10) {
        uidString += " 0";
      } else {
        uidString += " ";
      }
      uidString += String(mfrc522.uid.uidByte[i], HEX);
    }

    // Remove the leading space
    if (uidString.startsWith(" ")) {
      uidString = uidString.substring(1);
    }

    // Print the UID string
    
   

    if (Firebase.pushString(firebaseData, "/RFID", uidString)) {
     
      for(int i=1;i<4;i++){
      digitalWrite(Red_PIN,HIGH);
      delay(200);
      digitalWrite(Red_PIN,LOW);
      delay(200);
      }
      

    } else {
      //faild
     for(int i=1;i<4;i++){
      digitalWrite(Green_PIN,HIGH);
      delay(200);
      digitalWrite(Green_PIN,LOW);
      delay(200);
     
      }
       digitalWrite(Green_PIN,HIGH);
    }

   
  }

   while (WiFi.status() != WL_CONNECTED) {
      digitalWrite(Green_PIN,HIGH);
      delay(200);
      digitalWrite(Green_PIN,LOW);
      delay(200);;
  
  }
   digitalWrite(Green_PIN,HIGH);
}
