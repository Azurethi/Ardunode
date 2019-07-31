//serial write function & definitions
#define pd(a) swrite((byte *)&a,sizeof(a))
#define pid(a) Serial.write(a)
void swrite(byte *b, int l){Serial.write(b, l);}

//define packets
void packet_response(int i){pid(0x01); pd(i);}
void packet_pingCount(long i){pid(0x02); pd(i);}
void packet_systemTime(long i){pid(0x03); pd(i);}
void packet_wake(){pid(0x04);}
void packet_sleep(){pid(0x05);}

//sleep function
void sleeploop(){
    while(Serial.available()>0) Serial.read();
    while(Serial.available()<2){
        packet_sleep();
        digitalWrite(LED_BUILTIN,HIGH);
        delay(500);
        digitalWrite(LED_BUILTIN,LOW);
        delay(500);
    }
    packet_wake();
}

// Command Parser
/* Reads a single byte (if available) per call to keep up speed
 * NB: additional reads can be added to command case
 * 
 */
int cmd = -1;
long pingCounter = 0;
void checkCmds(){
    if(Serial.available()==0) return;
    int in = Serial.read();
    if(cmd==-1){
        cmd = in;
        return;
    }
    switch(cmd){            //Commands are defined here
        case 0x00:          //not required, but will be used to wake from sleep, could put "post sleep" code here
            break;
        case 0x01:          //sleep command, enters sleeploop
            sleeploop();
            break;
        case 0x02:          //ping command
            pingCounter++;
            packet_response(in);
            break;
        case 0x03:          //get ping pingCounter
            packet_pingCount(pingCounter);
            break;
        case 0x04:          //get system time
            packet_systemTime(millis());
    }
    cmd = -1;
}

//regular arduino code
void setup(){
    Serial.begin(112500);
    pinMode(LED_BUILTIN, OUTPUT);
    sleeploop();
}

void loop() {
    checkCmds(); //Checks for incomming serial commands as above

    //Other code here, not related to comunication (this example just flashes LED_BUILTIN faster than in sleep)
    digitalWrite(LED_BUILTIN,HIGH);
    delay(100);
    digitalWrite(LED_BUILTIN,LOW);
    delay(100);
}