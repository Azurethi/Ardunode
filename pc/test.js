console.log("Test started!");

const ardunode = require('./index');

ardunode.setPort('COM17');
ardunode.init();