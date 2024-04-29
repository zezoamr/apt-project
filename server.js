// server.js
const WebSocket = require('ws');

class Document {
    constructor() {
        this.data = [{char: '', pos: 0, deleteFlag: false}, {char: '', pos: 1000000, deleteFlag: false}]; // Start token
        this.users = [];
        this.operations=[];
    }

    insert(char, position, ws) {
        // console.log(
        //     "-----------items--------" 
        // )
        // for (let item of this.data) {
        //     console.log(item.pos + " index " + this.data.indexOf(item) + " char " + item.char);
        // }
        // console.log(
        //     "------------------------"
        // )

        //console.log("insert pos " + pos);
        let index = this.data.findIndex(item => item.pos >= position);
        
        //console.log("insert index " + index);
        if (index === -1 ) { 
            return 0;
        }
    
        let newPos = (this.data[index].pos + this.data[index + 1].pos) / 2;
        newPos += this.users.indexOf(ws) * 0.0001 + 0.0001;
        
        this.data.splice(index + 1, 0, {char: char, pos: newPos, deleteFlag: false});
        

        this.operations.push({char: char, position: position, operation: 'insert'});
        console.log(JSON.stringify(this.operations));
        return 1 //, index; // Return the cursor shift
    }
    

    delete(pos, length) {
        let index = this.data.findIndex(item => item.pos === pos);
        if (index === -1) {
            return 0;
            
        }
        this.data.splice(index, length);
        //this.data[index].deleteFlag = true;
        //console.log("delete " + JSON.stringify(this.data));

        this.operations.push({char: char, position: position, operation: 'delete'});
        return -1// , index; // Return the cursor shift, negative cursor shift to move the cursor to the left
    }

    toText() {
        // Exclude the start token when joining the characters into a string
        return this.data.slice(1).map(item => item.char).join('');
    }
}

const wss = new WebSocket.Server({ port: 8080 });
let rooms = {};

wss.on('connection', ws => {
    
    ws.on('message', message => {
        let operation = JSON.parse(message);
        if (!rooms[operation.room]) {
            rooms[operation.room] = new Document();
        }
        let doc = rooms[operation.room];
        //let doc = rooms[operation.room] || new Document();
        let cursorShift = 0;
        let updateindex = 0;
        if (operation.type === 'join') {
            rooms[operation.room] = doc;
            doc.users.push(ws);
        } else if (operation.type === 'leave') {
            let index = doc.users.indexOf(ws);
            if (index !== -1) {
                doc.users.splice(index, 1);
            }
            if (doc.users.length === 0) {
                delete rooms[operation.room];
            }
        } else if (operation.type === 'insert') {
            cursorShift = doc.insert(operation.chars, operation.pos, ws);
        } else if (operation.type === 'delete') {
            cursorShift = doc.delete(operation.pos, operation.length);
        }

        // Broadcast the updated document and cursor shift to all connected clients
        wss.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify({data: doc.data, cursorShift: 0})); //no need to update cursor at original
            }
        });

        wss.clients.forEach(client => {
            if (client !== ws && client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify({data: doc.data, cursorShift: cursorShift}));
            }
        });
    });
});