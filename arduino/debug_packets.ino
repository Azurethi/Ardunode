void setup() {
    Serial.begin(112500);
}

void loop() {

    packet_debugInt(1234);
    packet_debugInt_long(1234,135325);

    delay(1000);
}


void packet_debugInt(int i) {
    Serial.write(0xF0); swrite(i);
}

void packet_debugInt_long(int i,long l) {
    Serial.write(0xF1); swrite(i); swrite(l);
}

//serial writes
void swrite(int i)  { Serial.write(i); Serial.write(i>>8); }
void swrite(long l) { Serial.write(l); Serial.write(l>>8); Serial.write(l>>16); Serial.write(l>>24); }
