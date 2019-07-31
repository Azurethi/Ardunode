const ardunode = require('../../npm_public/index'); //require('ardunode');

ardunode.setPort('COM17');          //set com port with default baud of 112500
//ardunode.setPort('COM17',9600);   //alternate to above with specified baud of 9600

ardunode.addDefaults();             //add default types (int, long, float) & packets (debug_int (0xFD), debug_long (0xFE), debug_float (0xFF))
                                    // don't do this if you want to define all from scratch 
                                    // (defaults are also used automatically if no definitions are given

//packets to add
/*  void packet_response(int i){pid(0x01); pd(i);}
 *  void packet_pingCount(long i){pid(0x02); pd(i);}
 *  void packet_systemTime(long i){pid(0x03); pd(i);}
 *  void packet_wake(){pid(0x04);}
 *  void packet_sleep(){pid(0x05);}
 */

ardunode.addPacket(0x01,'pong',['int']);
ardunode.addPacket(0x02,'pingCount',['long']);
ardunode.addPacket(0x03,'systemTime',['long']);
ardunode.addPacket(0x04,'wake',[]);
ardunode.addPacket(0x05,'sleep',[]);

//connect & listen
var con = ardunode.init();

//Catch sleep packets & wake the arduino after one second
con.on('sleep',(packet)=>{
    console.log('Arduino went to sleep.');  
    setTimeout(()=>{
        con.sendBytes([0x00,0x00]);     //Wake cmd id & arbitrary byte (unused, required to run the cmd)
    },1000);
});

//listeners for other packets
con.on('wake',(packet)=>{
    console.log('Arduino woke up!');  
})

con.on('pong',(packet)=>{
    console.log(`Got pong (id:${packet.data[0]})`);
});

con.on('pingCount',(packet)=>{
    console.log(`Got pingCount of ${packet.data[0]}`);
});

con.on('systemTime',(packet)=>{
    console.log(`Got system Time of ${packet.data[0]}ms`);  
});

//Ping the arduino every 2s after 5s
/*
setTimeout(()=>{
    setInterval(()=>{
        var pingId = parseInt(Math.random()*255);
        con.sendBytes([0x02, pingId]);      //Ping cmd id & random ping id that the arduino should send back
        console.log(`Sent ping (id:${pingId})`);
    },2000);
},5000);
//*/

//add global functions for easy console testing
global.sleep = () =>{
    console.log('Sending sleep command');
    con.sendBytes([0x01,0x00]);        //Sleep cmd id & arbitrary byte (unused, required to run the cmd)
}

global.getPingCount = () => {
    console.log('Requesting ping count');
    con.sendBytes([0x03,0x00]);        
}

global.getSystemTime = () => {
    console.log('Requesting system time');
    con.sendBytes([0x04,0x00]);        
}
