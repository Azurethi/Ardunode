void setup() {
    Serial.begin(112500);
}

void loop() {

    packet_debugInt(1234);

    delay(1000);
}


void packet_debugInt(int i) {
    Serial.write(0xF0); Serial.write(i); Serial.write(i>>8);
}