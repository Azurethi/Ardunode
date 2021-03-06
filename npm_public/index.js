//get dependancies
const sp = require('serialport');
const events = require('events').EventEmitter;

//load default packets & types
exports.defaultDefinitions = require('defaultDefinitions')();

var asp = false;
var definitions = false;
var settings = {
    port: false,
    baudRate: 112500
};

exports.setPort = (port, baudRate = false) => {
    settings.port = port;
    if(baudRate) settings.baudRate = baudRate;
};

exports.setDefinitions = (_definitions) => {
    definitions = _definitions;
};

exports.addDefaults = () => {
    definitions = exports.defaultDefinitions;
};

exports.addType = (name, bytes, proc = false,preproc = false) => {
    if(definitions){
        if(!Object.keys(definitions.types).includes(name)){
            definitions.types[name] = {bytes,proc,preproc};
            return true;
        }
        return 'name already taken';
    } else {
        definitions = {types:{},packets:{}};
        definitions.types[name] = {bytes,proc};
        return true;
    }
} 

exports.addPacket = (id, name, structure, names = false) =>{
    if(!definitions) return 'definitions unset!';
    var registeredTypes = Object.keys(definitions.types);
    structure.forEach(sid=>{
        if(!registeredTypes.includes(sid)) return `unregistered type: ${sid}`;
    });
    if(Object.keys(definitions.packets).includes(id)) return 'id already taken';
    definitions.packets[id] = {name,structure,names};
}

exports.init = () => {

    var Packet_emitter = new events.EventEmitter();

    //Sanity check
    if(!settings.port) throw 'Ardunode: Tried to init with no port set'
    if(!definitions) definitions = exports.defaultDefinitions;
    //TODO more safety checks of definitions 

    //Get the list of packet id's & add total length fields to each packet definition
    var packets_list = Object.keys(definitions.packets);
    packets_list.forEach(packet_id =>{
        var totLen = 1;
        definitions.packets[packet_id].structure.forEach(type=>{totLen += definitions.types[type].bytes});
        definitions.packets[packet_id].length = totLen;
    });

    //create packet build buffer
    var packet_buffer = [];
    var packet_buffer_pos = 0;

    //create serialport instance
    asp = new sp(settings.port, {
        baudRate: settings.baudRate
    });
    
    //setup handlers
    asp.on('open', () => {
        
        //listen for bytes
        asp.on('data', data => {
            //add bytes to packet buffer until expected packet length
            for(var i = 0; i<data.length; i++){
                var byte = data[i];
                
                //if invalid byte, discard. else, add to buffer
                if(packet_buffer_pos == 0 && !packets_list.includes(byte.toString())) return;
                packet_buffer[packet_buffer_pos++] = byte;
                //if buffer at expected packet length, emit packet & reset buffer
                if(packet_buffer_pos>0 && definitions.packets[packet_buffer[0]].length == packet_buffer_pos){
                    asp.emit('packet', [...packet_buffer]);
                    packet_buffer = [];
                    packet_buffer_pos = 0;
                }
            }
        });

        //listen for packets from above
        asp.on('packet', (packet)=>{
            var structure = definitions.packets[packet[0]].structure
            var pos = 1;
            var proc = [];
            for(var structure_i = 0; structure_i<structure.length; structure_i++){
                var tmp = 0;
                var shift = -8;
                var thisVar = [];
                for(var v_i = 0; v_i<definitions.types[structure[structure_i]].bytes; v_i++){
                    thisVar.push(packet[pos]);
                    tmp |= packet[pos++] << (shift+=8);
                }
                if(definitions.types[structure[structure_i]].preproc) tmp = definitions.types[structure[structure_i]].preproc(thisVar);
                if(definitions.types[structure[structure_i]].proc) tmp = definitions.types[structure[structure_i]].proc(tmp);
                proc.push(tmp);
            }
            
            //console.log("got packet: " + packet[0] + " ("+definitions.packets[packet[0]].name+")");
            //proc.forEach(e=>{console.log("  "+e)});
            var data = {
                _id: packet[0],
                _data: proc,
                _raw: packet,
                _name: definitions.packets[packet[0]].name
            };
            if(definitions.packets[packet[0]].names){
                definitions.packets[packet[0]].names.forEach((n,i)=>{
                    data[n] = proc[i];
                });
            }
            Packet_emitter.emit('*', data);
            Packet_emitter.emit(data.name, data);
        });
    });
    
    //Add send functions to return emitter
    Packet_emitter['sendRaw'] = asp.write;
    Packet_emitter['sendByte'] =(byte)=>{
        var buf = new Buffer.alloc(1);
        buf.writeUInt8(parseInt(byte));
        asp.write(buf);
    };
    Packet_emitter['sendBytes'] =(bytes)=>{
        var buf = new Buffer.alloc(bytes.length);
        bytes.forEach(byte=>{buf.writeUInt8(parseInt(byte));});
        asp.write(buf);
    };
    //TODO add more sending functions so that users don't have to implement themselves?
    //  possibly even default & editable definitions for these?

    return Packet_emitter;
}