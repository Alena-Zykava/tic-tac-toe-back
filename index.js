const http = require('http');
const sockjs = require('sockjs');

const httpServer = http.createServer();
const socketServer = sockjs.createServer();

const Board = require('./lib/board');

let poolOfClient = [];

socketServer.on('connection', connection => {
    poolOfClient = [...poolOfClient, connection];

    connection.on('close', () => {
        poolOfClient = poolOfClient.filter((c) => c !== connection);
    })

    connection.on('data', msg => {
        try {
            const parsedData = JSON.parse(msg);
            switch (parsedData.type) {
                case 'ping':
                    handlePing(connection);
                    break; 
                case 'firstStep':
                    handleFirstStep(connection, parsedData.payload);
                    break; 
                case 'step':
                    handleStep(connection, parsedData.payload);
                    break; 
                case 'clearBoard':
                    handleClear();
                    break;
                case 'getBoardState':
                    handleGetBoardState(connection);
                    break;
                default:
                    handleDefault(connection);
                    break;
            }

        } catch (e) {
            console.log(e);
        }
    })

});

socketServer.installHandlers(httpServer);

httpServer.listen(5000);

function handlePing(connection) {
    connection.write(JSON.stringify({type: 'pong'}));
}

function handleDefault(connection) {
    connection.write(JSON.stringify({ type: 'UNKNOW' }));
}

function handleFirstStep(connection, payload) {
    const board = Board.getInstance();
    const { result } = board?.firstStep(payload);
    const boardStatus = board?.getCurrentGameState();

    if (result) {
        const message = JSON.stringify({ type: 'firstStepIsHappen', payload: boardStatus })
        poolOfClient.forEach(connection => connection.write(message));   
    } else {
        const message = JSON.stringify({ type: 'yourFirstStepIsFailed', payload: boardStatus })
        connection.write(message);
    }
}

function handleStep(connection, payload) {
    const board = Board.getInstance();
    const { result } = board?.step(payload);
    const boardStatus = board?.getCurrentGameState();

    if (result) {
        const message = JSON.stringify({ type: 'stepIsHappen', payload: boardStatus })
        poolOfClient.forEach(connection => connection.write(message));   
    } else {
        const message = JSON.stringify({ type: 'yourStepIsFailed', payload: boardStatus })
        connection.write(message);
    }
}

function handleClear() {
    const board = Board.getInstance();

    board?.clear();

    const message = JSON.stringify({ type: 'mapIsCleared', payload: board?.getCurrentGameState() })
    poolOfClient.forEach(connection => connection.write(message));    
}

function handleGetBoardState(connection) {
    const board = Board.getInstance();

    connection.write(JSON.stringify({ type: 'boardState', payload: board?.getCurrentGameState() }));
}

