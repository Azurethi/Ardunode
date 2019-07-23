const ardunode = require('./index');

ardunode.setPort('COM17');          //set com port with default baud of 112500
//ardunode.setPort('COM17',9600);   //alternate to above with specified baud of 9600

ardunode.addDefaults();             //add default types (int, long, float) & packets (debug_int, debug_long, debug_float)
                                    // don't do this if you want to define all from scratch 
                                    // (defaults are also used automatically if no definitions are given

//add the example packet (from arduino/example.ino) so that node will regognise it
ardunode.addPacket(0x01,'example',['int','long','float']);

var con = ardunode.init();          //connect & listen

con.on('*',(packet)=>{              //Use packet names to listen for specific packets or * to listen for all
    console.log(`Got ${packet.name} packet id:${packet.id} containing: ${packet.data} (raw was: [${packet.raw}])`)
})