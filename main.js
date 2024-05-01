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

    const textLength = editor.value.length;

    // Cap the cursor position to the end of the text
    editor.selectionStart = Math.min(newCursorPosition, textLength);
    editor.selectionEnd = editor.selectionStart;
}

const ws = new WebSocket('ws://localhost:8080');
let docData = [{char: '', pos: 0}, {char: '', pos: 100000000}]; 
let updateQueue = [];
let isUpdating = false;
//let lastcursorPos = 0;
ws.onopen = () => {
    console.log('Connected to the server');
    ws.send(JSON.stringify({type: 'join', room: 'room1'}));
};

ws.onmessage = (event) => {
    let response = JSON.parse(event.data);
    updateQueue.push(() => {
        docData = response.data;
        let text = docData.slice(1, -1).map(item => item.char).join('');
        console.log('Updated document:', text);
        console.log('Cursor shift:', response.cursorShift);

        const prevCursorPos = editor.selectionStart;
        
        // Update textContent
        document.getElementById('editor').value = text; //textContent 
        
        // Restore cursor position
        //moveCursor(lastcursorPos);
        
        // Adjust the cursor position //needs work
        // if (response.cursorShift && response.cursorShift !== 0 && document.getElementById('editor').selectionStart != null) 
        //     {
        //         setTimeout(() => {
        //             updateCursorPosition(response.cursorShift);
        //         }, 10);
        //     }
        // Restore cursor position
        if (response.type === 'insert') {
            updateCursorPosition(response.chars, response.pos, 0, prevCursorPos);
        } else if (response.type === 'delete') {
            updateCursorPosition(null, response.pos, response.length, prevCursorPos);
        }
    
    });
    processUpdateQueue();
};



document.getElementById('editor').addEventListener("selectionchange", (event) => { //selectionchange
    console.log('Caret at: ', event.target.selectionStart);
    //console.log("text " + event.target.value);
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
        //console.log("diffPos: " + diffPos + "\n" + "text: " + text + "\n" + "prevText: " + prevText);
        // If characters were inserted
        if (text.length > prevText.length) {
            let insertPos = docData[diffPos].pos; 
            console.log("insertPos: " + insertPos + "\n");

            let insertedChars = text.slice(diffPos, diffPos + text.length - prevText.length);
            ws.send(JSON.stringify({ type: 'insert', chars: insertedChars, pos: insertPos }));
            

        }
        // If characters were deleted
        else if (text.length < prevText.length) {
            let deletePos = (diffPos + 1 < docData.length) ? docData[diffPos + 1].pos : docData[docData.length - 1].pos;
            let deletedLength = prevText.length - text.length;
            ws.send(JSON.stringify({ type: 'delete', pos: deletePos, length: deletedLength }));
            

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

