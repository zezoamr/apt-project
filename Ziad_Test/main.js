 // on opening tab need to ping to get document state

// function updateCursorPosition(cursorShift) {
//     const editor = document.getElementById('editor');
//     const currentCursorPosition = editor.selectionStart;
//     const newCursorPosition = currentCursorPosition + cursorShift;
//     const textLength = editor.value.length;

//     // Cap the cursor position to the end of the text
//     editor.selectionStart = Math.min(newCursorPosition, textLength);
//     editor.selectionEnd = editor.selectionStart;
// }

function updateCursorPosition(insertedChars, insertPos, deletedLength, prevCursorPos) {
    const editor = document.getElementById('editor');
    let newCursorPosition = prevCursorPos;

    if (insertedChars) {
        // If characters were inserted
        if (prevCursorPos >= insertPos) {
            // If the cursor was at or after the insertion point, move it forward
            newCursorPosition += insertedChars.length;
            newCursorPosition++
        }
    } else if (deletedLength) {
        // If characters were deleted
        if (prevCursorPos > insertPos) {
            // If the cursor was after the deletion point, move it backward
            newCursorPosition -= deletedLength;
        } else if (prevCursorPos === insertPos) {
            // If the cursor was at the deletion point, don't move it
            newCursorPosition = insertPos;
        }
    }

    if (editor.setSelectionRange) {
        editor.focus();
        editor.setSelectionRange(newCursorPosition, newCursorPosition);
    }
}

const ws = new WebSocket('ws://localhost:8080');
let docData = [{char: '', pos: 0, boldFlag: false, italicFlag: false}, {char: '', pos: 100000000, boldFlag: false, italicFlag: false}]; 
let updateQueue = [];
let isUpdating = false;
//let lastcursorPos = 0;

let id = 'id1'+ Math.random().toString(36).substr(2, 9); //write a function that gets id from java auth server

ws.onopen = () => {
    console.log('Connected to the websockets server');
    ws.send(JSON.stringify({type: 'join', roomId: 'room1', userid: id}));
    
};


ws.onmessage = (event) => {
    let response = JSON.parse(event.data);
    if(response.messageType === 'doc'){
        updateQueue.push(() => {
            docData = response.data;
            let sortedData = [...docData].sort((a, b) => a.pos - b.pos);
            let text = sortedData.slice(1, -1).map(item => item.char).join('');
            console.log('Updated document:', text);
            console.log('Cursor shift:', response.cursorShift);
    
            const prevCursorPos = editor.selectionStart;
            
            // Update textContent
            document.getElementById('editor').value = text; 
            
            if (response.type === 'insert') {
                updateCursorPosition(response.chars, response.pos, 0, prevCursorPos);
            } else if (response.type === 'delete') {
                updateCursorPosition(null, response.pos, response.length, prevCursorPos);
            }
            
        
        });
        processUpdateQueue();
    }
   
};



document.getElementById('editor').addEventListener("selectionchange", (event) => { 
    //console.log('Caret at: ', event.target.selectionStart);
    //console.log("text " + event.target.value);

    // check if position shifted: send userid, cursor to server websocket 
    updateQueue.push(() => {
    
        let text = event.target.value; //textContent
        let prevText = docData.slice(1, -1).map(item => item.char).join('');

        // Update lastcursorPos with the actual cursor position
        lastcursorPos = event.target.selectionStart;

        // Find the position where the text differs
        let diffPos = 0;
        while (diffPos < text.length && diffPos < prevText.length && text[diffPos] === prevText[diffPos]) {
            diffPos++;
        }
        //lastcursorPos = diffPos;
        console.log("diffPos: " + diffPos + "\n")// + "text: " + text + "\n" + "prevText: " + prevText);
        
        // If characters were inserted
        if (text.length > prevText.length) {
            let prevInsertPos = docData[diffPos].pos; 
            let nextInsertPos;
            if (diffPos + 1 < docData.length) nextInsertPos= docData[diffPos + 1].pos;
            else nextInsertPos = docData[docData.length - 1].pos;

            let insertPos = (prevInsertPos + nextInsertPos) / 2;
            let insertedChar = text.slice(diffPos, diffPos + text.length - prevText.length);
            ws.send(JSON.stringify({ type: 'insert', chars: insertedChar, pos: insertPos, userid: id, roomId: 'room1',}));
            
        }

        // If characters were deleted
        else if (text.length < prevText.length) {
            let deletePos = (diffPos + 1 < docData.length) ? docData[diffPos + 1].pos : docData[docData.length - 1].pos;
            let deletedLength = prevText.length - text.length;
            ws.send(JSON.stringify({ type: 'delete', pos: deletePos, length: deletedLength, roomId: 'room1', }));
            
        }
    
    });
    processUpdateQueue();
});

function processUpdateQueue() {
    if (!isUpdating && updateQueue.length > 0) {
        isUpdating = true;
        updateQueue.shift()();
        isUpdating = false;
    }
}

ws.onbeforeunload = () => {
    ws.send(JSON.stringify({type: 'leave', room: 'room1', userid: id}));
};

ws.onclose = () => {
    console.log('Disconnected from the server');
};


const undoButton = document.getElementById('undoButton');
    undoButton.addEventListener('click', () => {
        ws.send(JSON.stringify({ type: 'undo' }));
});

const redoButton = document.getElementById('redoButton');
    redoButton.addEventListener('click', () => {
        ws.send(JSON.stringify({ type: 'redo' }));
});

const loadButton = document.getElementById('loadButton');
    loadButton.addEventListener('click', () => {
        ws.send(JSON.stringify({ type: 'load', operations: getOperationsFromServer() }));
});

function getOperationsFromServer() {
    //send docid recive doc operations from java server document
    loadSavedDoc();
}

function loadSavedDoc() {
    
    function operation_insert(char, newPos,  baseData) {
        baseData.push({ char: char, pos: newPos, deleteFlag: false });
    }

    function operation_delete(pos, length, baseData) {
        let index = this.data.findIndex(item => item.pos === pos);
        if (index === -1) {
            return 0;
        }
        baseData.splice(index, length);
    }

    let trial_ops = [{"char":"h","position":500000,"newPos":500000.0001,"userindex":0,"operation":"insert"},
    {"char":"w","position":750000.00005,"newPos":750000.00015,"userindex":0,"operation":"insert"}, 
    ] //replace with server call
    
    if (trial_ops.length === 0) {
        return;
    }
    let newdata = [{char: '', pos: 0, deleteFlag: false, boldFlag: false, italicFlag: false},
        {char: '', pos: 1000000, deleteFlag: false, boldFlag: false, italicFlag: false}]; // Start token

    for (let operation of trial_ops) {
        console.log(operation.operation);
        if (operation.operation === 'insert') {
            operation_insert(operation.char, operation.newPos, newdata);
        } else if (operation.operation === 'delete') {
            operation_delete(operation.pos, operation.length, newdata);
        }
        
    }   

    newdata.sort((a, b) => a.pos - b.pos);
    docData = newdata;
    //ws.send(JSON.stringify({type: 'loadData', newdata: newdata}));
    ws.send(JSON.stringify({type: 'loadOperations', operations: trial_ops}));
}

// function getDocFromServer() {
//     return axios.get('http://localhost:8080/loadDoc') //modify url to correct one
//         .then(response => {
//             const { operations} = response.data; // assuming these properties exist in your response data
//             return { operations};
//         })
//         .catch(error => {
//             console.error(error);
//             //throw error; // re-throw the error to be handled by the caller
//         });
// }








//  // on opening tab need to ping to get document state

// // function updateCursorPosition(cursorShift) {
// //     const editor = document.getElementById('editor');
// //     const currentCursorPosition = editor.selectionStart;
// //     const newCursorPosition = currentCursorPosition + cursorShift;
// //     const textLength = editor.value.length;

// //     // Cap the cursor position to the end of the text
// //     editor.selectionStart = Math.min(newCursorPosition, textLength);
// //     editor.selectionEnd = editor.selectionStart;
// // }

// function updateCursorPosition(insertedChars, insertPos, deletedLength, prevCursorPos) {
//     const editor = document.getElementById('editor');
//     let newCursorPosition = prevCursorPos;

//     if (insertedChars) {
//         // If characters were inserted
//         if (prevCursorPos >= insertPos) {
//             // If the cursor was at or after the insertion point, move it forward
//             newCursorPosition += insertedChars.length;
//             newCursorPosition++
//         }
//     } else if (deletedLength) {
//         // If characters were deleted
//         if (prevCursorPos > insertPos) {
//             // If the cursor was after the deletion point, move it backward
//             newCursorPosition -= deletedLength;
//         } else if (prevCursorPos === insertPos) {
//             // If the cursor was at the deletion point, don't move it
//             newCursorPosition = insertPos;
//         }
//     }

//     if (editor.setSelectionRange) {
//         editor.focus();
//         editor.setSelectionRange(newCursorPosition, newCursorPosition);
//     }
// }

// const ws = new WebSocket('ws://localhost:8080');
// let docData = [{char: '', pos: 0, boldFlag: false, italicFlag: false}, {char: '', pos: 100000000, boldFlag: false, italicFlag: false}]; 
// let updateQueue = [];
// let isUpdating = false;
// //let lastcursorPos = 0;

// let id = 'id1'+ Math.random().toString(36).substr(2, 9); //write a function that gets id from java auth server

// ws.onopen = () => {
//     console.log('Connected to the websockets server');
//     ws.send(JSON.stringify({type: 'join', roomId: 'room1', userid: id}));
    
// };


// ws.onmessage = (event) => {
//     let response = JSON.parse(event.data);
//     updateQueue.push(() => {
//         docData = response.data;
//         let sortedData = [...docData].sort((a, b) => a.pos - b.pos);
//         let text = sortedData.slice(1, -1).map(item => item.char).join('');
//         console.log('Updated document:', text);
//         console.log('Cursor Position:',response);

//         const prevCursorPos = editor.selectionStart;
        
//         // Update textContent
//         document.getElementById('editor').value = text; 
        
//         if (response.type === 'insert') {
//             updateCursorPosition(response.chars, response.pos, 0, prevCursorPos);
//         } else if (response.type === 'delete') {
//             updateCursorPosition(null, response.pos, response.length, prevCursorPos);
//         }
        
    
//     });
//     processUpdateQueue();
// };


// document.getElementById('editor').addEventListener("input", (event) => { 
//     console.log("cursor at: " + event.target.selectionStart);

//     // check if position shifted: send userid, cursor to server websocket 
//     updateQueue.push(() => {
//         let text = event.target.value;
//         let prevText = docData.slice(1, -1).map(item => item.char).join('');

//         // Update lastcursorPos with the actual cursor position
//         lastcursorPos = event.target.selectionStart;

//         // Find the position where the text differs
//         let diffPos = 0;
//         while (diffPos < text.length && diffPos < prevText.length && text[diffPos] === prevText[diffPos]) {
//             diffPos++;
//         }

//         console.log("diffPos: " + diffPos);

//         // If characters were inserted
//         if (text.length > prevText.length) {
//             let prevInsertPos = docData[diffPos].pos;

//             // Send cursor position update to server
//             socket.send(JSON.stringify({
//                 type: 'cursorPosition',
//                 userid: userid,
//                 cursorPos: lastcursorPos
//             }));
//         }
//     });

//     processUpdateQueue();
// });

// function processUpdateQueue() {
//     if (!isUpdating && updateQueue.length > 0) {
//         isUpdating = true;
//         updateQueue.shift()();
//         isUpdating = false;
//     }
// }

// ws.onbeforeunload = () => {
//     ws.send(JSON.stringify({type: 'leave', room: 'room1', userid: id}));
// };

// ws.onclose = () => {
//     console.log('Disconnected from the server');
// };


// const undoButton = document.getElementById('undoButton');
//     undoButton.addEventListener('click', () => {
//         ws.send(JSON.stringify({ type: 'undo' }));
// });

// const redoButton = document.getElementById('redoButton');
//     redoButton.addEventListener('click', () => {
//         ws.send(JSON.stringify({ type: 'redo' }));
// });

// const loadButton = document.getElementById('loadButton');
//     loadButton.addEventListener('click', () => {
//         ws.send(JSON.stringify({ type: 'load', operations: getOperationsFromServer() }));
// });

// const boldButton = document.getElementById('boldButton');
//     boldButton.addEventListener('click', () => {
//         ws.send(JSON.stringify({ type: 'bold' }));
// });

// const italicButton = document.getElementById('italicButton');
//     italicButton.addEventListener('click', () => {
//         ws.send(JSON.stringify({ type: 'italic' }));
// });


// function getOperationsFromServer() {
//     //send docid recive doc operations from java server document
//     loadSavedDoc();
// }

// function loadSavedDoc() {
    
//     function operation_insert(char, newPos,  baseData) {
//         baseData.push({ char: char, pos: newPos, deleteFlag: false });
//     }

//     function operation_delete(pos, length, baseData) {
//         let index = this.data.findIndex(item => item.pos === pos);
//         if (index === -1) {
//             return 0;
//         }
//         baseData.splice(index, length);
//     }

//     let trial_ops = [{"char":"h","position":500000,"newPos":500000.0001,"userindex":0,"operation":"insert"},
//     {"char":"w","position":750000.00005,"newPos":750000.00015,"userindex":0,"operation":"insert"}, 
//     ] //replace with server call
    
//     if (trial_ops.length === 0) {
//         return;
//     }
//     let newdata = [{char: '', pos: 0, deleteFlag: false, boldFlag: false, italicFlag: false},
//         {char: '', pos: 1000000, deleteFlag: false, boldFlag: false, italicFlag: false}]; // Start token

//     for (let operation of trial_ops) {
//         console.log(operation.operation);
//         if (operation.operation === 'insert') {
//             operation_insert(operation.char, operation.newPos, newdata);
//         } else if (operation.operation === 'delete') {
//             operation_delete(operation.pos, operation.length, newdata);
//         }
        
//     }   

//     newdata.sort((a, b) => a.pos - b.pos);
//     docData = newdata;
//     //ws.send(JSON.stringify({type: 'loadData', newdata: newdata}));
//     ws.send(JSON.stringify({type: 'loadOperations', operations: trial_ops}));
// }

// // function getDocFromServer() {
// //     return axios.get('http://localhost:8080/loadDoc') //modify url to correct one
// //         .then(response => {
// //             const { operations} = response.data; // assuming these properties exist in your response data
// //             return { operations};
// //         })
// //         .catch(error => {
// //             console.error(error);
// //             //throw error; // re-throw the error to be handled by the caller
// //         });
// // }