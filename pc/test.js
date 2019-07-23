console.log("Test started!");
 
const ardunode = require('./index');

ardunode.setPort('COM17');

ardunode.addDefaults();
ardunode.addType('long',4);
ardunode.addPacket(0xF1,'debug_int,long',['int','long']);

ardunode.init();