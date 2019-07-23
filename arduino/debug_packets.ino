//Serial write
#define sw(a,b) swrite((byte *)&a,b)
void swrite(byte *b, int l) {
    for(int i = 0; i<l;i++) Serial.write(b[i]);
}

//define packets
void packet_debugInt(int i) {
    Serial.write(0xFD); sw(i,2);
}

void packet_debugLong(long l) {
    Serial.write(0xFE); sw(l,4);
}
void packet_debugFloat(float f) {
    Serial.write(0xFF); sw(f,4);
}

//regular arduino code
void setup() {
    Serial.begin(112500);
}

void loop() {

    packet_debugInt(1234);
    packet_debugLong(135325L);
    packet_debugFloat(124145.512f);
    delay(1000);
}




