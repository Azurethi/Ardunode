//Packet Data Serial write functions
/* Usages: pid(<packet id>)
 *          pd(<data>)
 *          
 * NB: types & packet definitions must be registered pc-side
 *
 * int, long and float are implemented by default, along with the three debug packets below
 */
// ignore from here
#define pd(a) swrite((byte *)&a,sizeof(a))
#define pid(a) Serial.write(a)
void swrite(byte *b, int l){for(int i =0; i<l;i++)pid(b[i]);}
// ignore to here


//Define your packets!
/* First send a Packet id using: pid(<id>);
 *  add packet data with one or more: pd(<data>);
 */
void packet_debugInt(int i) {
    pid(0xFD); pd(i);
}

void packet_debugLong(long l) {
    pid(0xFE); pd(l);
}
void packet_debugFloat(float f) {
    pid(0xFF); pd(f);
}

//not implemented pc-side by default. Structure would be ['int','long','float'] (see example.js)
void packet_example(int i, long l, float f){
    pid(0x01); pd(i); pd(l); pd(f);
}
//end of packet definitions


//regular arduino code
void setup() {
    Serial.begin(112500);
}

void loop() {

    packet_debugInt(1234);
    packet_debugLong(135325L);
    packet_debugFloat(124145.512F);
    packet_example(1234,135325L,124145);
    delay(1000);
}

