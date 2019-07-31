module.exports=()=>({
    types:{
        'int':{bytes:2},
        'long':{bytes:4},
        'float':{bytes:4,preproc:(preproc)=>{
            var view = new DataView(new ArrayBuffer(4));
            preproc.forEach(function (b, i) {
                view.setUint8(3-i, b);
            });
            return view.getFloat32(0);
        }}
    },
    packets:{
        0xFD: {name: "debug_int",   structure:['int'], names: false},
        0xFE: {name: "debug_long",   structure:['long'],names: false},
        0xFF: {name: "debug_float",   structure:['float'],names: false}
    }
});