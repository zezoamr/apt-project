
const WebSocket = require('ws');

class Document {
    constructor(users) {
        this.data = [{char: '', pos: 0, deleteFlag: false}, {char: '', pos: 1000000, deleteFlag: false}]; // Start token
        this.users = users //|| [];
        this.operations = [];
        this.last_operations = [];
    }

    insert(char, position, userindex) {

        //console.log("insert pos " + pos);
        let index = this.data.findIndex(item => item.pos >= position);
        
        let newPos =  position + userindex * 0.0001 + 0.0001;
        
        this.data.splice(index, 0, {char: char, pos: newPos, deleteFlag: false});
        
        this.operations.push({char: char, position: position, newPos: newPos, userindex: userindex, operation: 'insert'});
        //console.log(JSON.stringify(this.operations));

        //error here:
        //console.log("user index " + userindex);

        this.last_operations = []; //clear last operations because new operation means redo is gone
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

        this.operations.push({ position: pos, length: length, operation: 'delete'});
        this.last_operations = []; //clear last operations because new operation means redo is gone
        return -1// , index; // Return the cursor shift, negative cursor shift to move the cursor to the left
    }


    undo() {
        
        if (this.operations.length === 0) {
            return;
        }
        
        // Create a copy of the base document data
        const undoData = [{char: '', pos: 0, deleteFlag: false}, {char: '', pos: 1000000, deleteFlag: false}];

        // Apply all operations except the last one
        for (let i = 0; i < this.operations.length -1; i++) { 
            const op = this.operations[i];
            if (op.operation === 'insert') {
                this.undo_redo_insert(op.char, op.newPos, undoData);
            } else if (op.operation === 'delete') {
                this.undo_redo_delete(op.pos, op.length, undoData);
            }
        }

        //sort by pos
        undoData.sort((a, b) => a.pos - b.pos);

        this.last_operations.unshift( this.operations[this.operations.length - 1]); 

        // Update the operations array with the new state
        this.operations = this.operations.slice(0, -1);

        this.data = undoData;
    }

    redo(){
        //console.log("redo data before " + JSON.stringify(this.last_operations))
        if (this.last_operations.length === 0) {
            return;
        }
        const last_operation = this.last_operations.shift();
        //console.log("here " + JSON.stringify(this.last_operation))

        if (last_operation) {
            
            if (last_operation.operation === 'insert') {
                this.undo_redo_insert(last_operation.char, last_operation.newPos, this.data);
            } else if (last_operation.operation === 'delete') {
                this.undo_redo_delete(last_operation.pos, last_operation.length, this.data);
            }
            this.operations.push(last_operation);
        } 

        this.data.sort((a, b) => a.pos - b.pos);
        //console.log("redo data after " + JSON.stringify(this.data))
        
    }

    undo_redo_insert(char, newPos,  baseData) {
        baseData.push({ char: char, pos: newPos, deleteFlag: false });
    }

    undo_redo_delete(pos, length, baseData) {
        let index = this.data.findIndex(item => item.pos === pos);
        if (index === -1) {
            return 0;
        }
        baseData.splice(index, length);
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
            rooms[operation.room] = {
                doc: new Document([]), 
                users: [operation.userid]
            };
        }
        let room = rooms[operation.room];
        let doc = room.doc;
        let cursorShift = 0;
        let response_type = operation.type;

        if (operation.type === 'join') {
            let room = rooms[operation.room]
            
            room.users.push(operation.userid);
            doc.users = room.users;

            //console.log("users " + JSON.stringify(room.users));
        } else if (operation.type === 'leave') {
            let room = rooms[operation.room]
            let index = room.users.indexOf(operation.userid);
            if (index !== -1) {
                room.users.splice(index, 1);
            }
            doc.users = room.users; 
            if (room.users.length === 0) {
                delete rooms[operation.room];
            }
        } else if (operation.type === 'insert') {
            let room = rooms[operation.room]
            //console.log("room "  + JSON.stringify(room));
            
            let userIndex = room.users.indexOf(operation.userid);
            console.log("user index " + userIndex);
            cursorShift = doc.insert(operation.chars, operation.pos, userIndex);
        } else if (operation.type === 'delete') {
            cursorShift = doc.delete(operation.pos, operation.length);
        } else if (operation.type === 'undo') {
            doc.undo();
            cursorShift = 0;
        } else if (operation.type === 'redo') {
            doc.redo();
            cursorShift = 0;
        }

        // Broadcast the updated document and cursor shift to all connected clients
        wss.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify({data: doc.data, cursorShift: 0, type: response_type})); //no need to update cursor at original
            }
        });

        wss.clients.forEach(client => {
            if (client !== ws && client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify({data: doc.data, cursorShift: cursorShift, type: response_type}));
            }
        });
    });
});

