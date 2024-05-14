const Document = require('./server'); // adjust the path to match your project structure

describe('Document class', () => {
    let doc;
    const users = ['user1', 'user2'];

    beforeEach(() => {
        doc = new Document(users);
    });

    test('insert operation', () => {
        doc.insert('a', 1, 0);
        expect(doc.data[1].char).toBe('a');
        expect(doc.data[1].pos).toBeCloseTo(1.0001);
    });

    test('delete operation', () => {
        doc.insert('a', 1, 0);
        doc.delete(1.0001, 1);
        expect(doc.data.find(item => item.pos === 1.0001)).toBeUndefined();
    });

    test('undo operation', () => {
        doc.insert('a', 1, 0);
        doc.undo();
        expect(doc.data.find(item => item.pos === 1.0001)).toBeUndefined();
    });

    test('redo operation', () => {
        doc.insert('a', 1, 0);
        doc.undo();
        doc.redo();
        expect(doc.data[1].char).toBe('a');
        expect(doc.data[1].pos).toBeCloseTo(1.0001);
    });

    test('loadOperations operation', () => {
        const operations = [
            {char: 'a', newPos: 1.0001, operation: 'insert'},
            {pos: 1.0001, length: 1, operation: 'delete'}
        ];
        doc.loadOperations(operations);
        expect(doc.data.find(item => item.pos === 1.0001)).toBeUndefined();
    });

    test('updateCursorPosition operation', () => {
        doc.updateCursorPosition('user1', 5);
        expect(doc.getCursorPosition('user1')).toBe(5);
    });
});