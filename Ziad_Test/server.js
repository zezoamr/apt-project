const WebSocket = require('ws');

// todo code
// load document from user (ziad).
// bold and italic flag and functions, func (start unqiue identifer(pos), end unique identifier(pos)) modifies document (flags between idenifier pos) (yousef).
// display cursor of all users (dict contain user id and cursor position) broadcast to front when change happens, at front display them in different colors. (shams)
// add appropriate try catch blocks
//--- todo not code
// ask about if we should implement cursor shift at other users when they edit.

//---- observations
// undo and redo are buggy sometimes they work sometimes not.
// when refreshing frontend page or pressing ctrl+s in editor it refreshes and resends things need to check if it will cause errors, 
//or if its just caused by generating an id every time and not getting it from server and because of live server.

//important
//insert and delete should be single characters otherwise my implementation in front end that detects text differences doesn't work 
//(let prevInsertPos = docData[diffPos].pos; ) index here will be wrong or throw error because multiple chars will have same index in docdata
// SO FOR TAGS <b> EACH CHAR NEEDS TO BE INSERTED SEPRETELY '<' 'b' '>' IF WE WILL USE THE CURRENT TEMP IMPLEMENTATION TO DETECT DIFFERENCES
// two solutions:
// 1) at server side: function unpack multiple char structure into multiple structures each containing a char
// 2) at front end: a function that takes bold/italic flags and inserts tags while converting doc structure to text

class Document {
    constructor(users) {
        this.data = [{char: '', pos: 0, deleteFlag: false, boldFlag: false, italicFlag: false},
         {char: '', pos: 1000000, deleteFlag: false, boldFlag: false, italicFlag: false}]; // Start token
        this.users = users //|| [];
        this.operations = [];
        this.cursorPositions = {};
        this.last_operations = [];
    }
    
    insert(char, position, userindex) {

        //console.log("insert pos " + pos);
        let index = this.data.findIndex(item => item.pos >= position);
        
        let newPos =  position + userindex * 0.0001 + 0.0001;
        
        this.data.splice(index, 0, {char: char, pos: newPos, deleteFlag: false, boldFlag: false, italicFlag: false});
        
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
        const undoData = [{char: '', pos: 0, deleteFlag: false, boldFlag: false, italicFlag: false},
        {char: '', pos: 1000000, deleteFlag: false, boldFlag: false, italicFlag: false}];

        // Apply all operations except the last one
        for (let i = 0; i < this.operations.length -1; i++) { 
            const op = this.operations[i];
            if (op.operation === 'insert') {
                this.operation_insert(op.char, op.newPos, undoData);
            } else if (op.operation === 'delete') {
                this.operation_delete(op.pos, op.length, undoData);
            }
            // // add bold and italic operartions
            // if (op.operation === 'bold') {
            //     this.operation_bold(op.start, op.end, undoData);
            // }
            // if (op.operation === 'italic') {
            //     this.operation_italic(op.start, op.end, undoData);
            // }

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
                this.operation_insert(last_operation.char, last_operation.newPos, this.data);
            } else if (last_operation.operation === 'delete') {
                this.operation_delete(last_operation.pos, last_operation.length, this.data);
            }
            // add bold and italic operartions

            this.operations.push(last_operation);
        } 


        this.data.sort((a, b) => a.pos - b.pos);
        //console.log("redo data after " + JSON.stringify(this.data))
        
    }
    
    loadOperations(operations) {
        if (operations.length === 0) {
            return;
        }
        this.data = [{char: '', pos: 0, deleteFlag: false, boldFlag: false, italicFlag: false},
            {char: '', pos: 1000000, deleteFlag: false, boldFlag: false, italicFlag: false}]; // Start token

        for (let operation of operations) {
            //console.log(operation.operation);
            if (operation.operation === 'insert') {
                this.operation_insert(operation.char, operation.newPos, this.data);
            } else if (operation.operation === 'delete') {
                this.operation_delete(operation.pos, operation.length, this.data);
            }
            // add bold and italic operartions
        }

        this.operations = operations;

        this.data.sort((a, b) => a.pos - b.pos);
    }

    bold(pos, length) {
        //add bold flag to all characters from pos to pos + length
        for (let i = 0; i < this.data.length; i++) {
            if (this.data[i].pos >= pos && this.data[i].pos <= pos + length) {
                this.data[i].boldFlag = true;
            }
        }

        this.operations.push({start: pos, end: pos + length, length: length, operation: 'bold'});
    }

    italic(pos, length) {
        //add italic flag to all characters from pos to pos + length
        for (let i = 0; i < this.data.length; i++) {
            if (this.data[i].pos >= pos && this.data[i].pos <= pos + length) {
                this.data[i].italicFlag = true;
            }
        }

        this.operations.push({start: pos, end: pos + length, length: length, operation: 'italic'});
    }

    operation_insert(char, newPos,  baseData) {
        baseData.push({ char: char, pos: newPos, deleteFlag: false });
    }

    operation_delete(pos, length, baseData) {
        let index = this.data.findIndex(item => item.pos === pos);
        if (index === -1) {
            return 0;
        }
        baseData.splice(index, length);
    }

    // operation_bold(pos, length, baseData) {
    //     for (let i = 0; i < baseData.length; i++) {
    //         if (baseData[i].pos >= pos && baseData[i].pos <= pos + length) {
    //             baseData[i].boldFlag = true;
    //         }
    //     }
    // }

    // operation_italic(pos, length, baseData) {
    //     for (let i = 0; i < baseData.length; i++) {
    //         if (baseData[i].pos >= pos && baseData[i].pos <= pos + length) {
    //             baseData[i].italicFlag = true;
    //         }
    //     }
    // }


    toText() {
        // Exclude the start token when joining the characters into a string
        return this.data.slice(1).map(item => item.char).join('');
    }
    getCursorPosition(userindex) {
        return this.cursorPositions[userindex];
    }
    updateCursorPosition(userindex, pos) {
        this.cursorPositions[userindex] = pos;
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
                users: [],
                cursorPositions: operation.cursorPositions
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
            let index = room.users.indexOf(operation.userid); // if changed room.users from [] to dict please update this
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
            //console.log("user index " + userIndex);
            cursorShift = doc.insert(operation.chars, operation.pos, userIndex);
        } else if (operation.type === 'delete') {
            cursorShift = doc.delete(operation.pos, operation.length);
        } else if (operation.type === 'undo') {
            doc.undo();
            cursorShift = 0;
        } else if (operation.type === 'redo') {
            doc.redo();
            cursorShift = 0;
        } else if (operation.type === 'loadData') {
            doc.data = operation.newdata;
            cursorShift = 0;
        } else if (operation.type === 'loadOperations') {
            doc.loadOperations(operation.operations);
            cursorShift = 0;
        }
        else if (operation.type === 'cursor') {
            doc.updateCursorPosition(operation.userid, operation.pos);
            cursorShift = 0;
        }
        else if (operation.type === 'bold') {
            doc.bold(); // Call bold method in Document class
            cursorShift = 0; // Set cursor shift if necessary
        } else if (operation.type === 'italic') {
            doc.italic(); // Call italic method in Document class
            cursorShift = 0; // Set cursor shift if necessary
        }

        // Broadcast the updated document and cursor shift to all connected clients
        wss.clients.forEach(client => {
            if (client === ws && client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify({data: doc.data, cursorShift: 0, type: response_type})); //no need to update cursor at original
            }
        });

        wss.clients.forEach(client => {
            if (client !== ws && client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify({data: doc.data, cursorShift: cursorShift, type: response_type}));
            }
        });
        // Broadcast the updated cursor positions to all connected clients
        wss.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify({cursorPositions: room.cursorPositions, type: response_type}));
            }
        });
    });
});


module.exports = Document;