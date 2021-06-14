
const emptyCell = 'none';

function getClearMap() {
    return [
        emptyCell, emptyCell, emptyCell,
        emptyCell, emptyCell, emptyCell,
        emptyCell, emptyCell, emptyCell
    ]
}

const WIN_COMBINATION = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6]
]

function checkIsGameEnd(map) {
    return WIN_COMBINATION.some((combination) => {
        return combination.every((position) => map[position] === 'X') || combination.every((position) => map[position] === '0');

    })
}

class Board {
    static instance;
    steps = [];
    map = getClearMap();    
    status = 'before_start';

    constructor() {
    };

    static getInstance() {
        if (!Board.instance) {
            Board.instance = new Board();
        }
        
        return Board.instance;
    }
    
    getCurrentGameState() {
        return {
            map: this.map,
            steps: this.steps,
            status: this.status
        };
    }

    clear() {
        this.map = getClearMap();
        this.steps = [];
        this.status = 'before_start';
    }

    firstStep(stepData) {
        const isFieldCorrect = stepData.field >= 0 && stepData.field <= 8;
        const isMapEmpty = this.map.every((f) => f === emptyCell);
        const isStepsLengthZero = this.steps.length === 0;        

        if (isFieldCorrect && isMapEmpty && isStepsLengthZero) {
            const step = {
                id: 0,
                prevStepId: undefined,
                field: stepData.field,
            }

            this.steps = [step];
            this.map[stepData.field] = 'X'; // проверить
            this.status = 'game';

            return { result: true };
        } else {
            return { result: true };
        }
    }

    step(stepData) {
        const isProgression = this.steps.length > 0 && this.steps.slice(-1)[0].id === stepData.prevStepId;
        const isFieldCorrect = stepData.field >= 0 && stepData.field <= 8 && this.map[stepData.field] === emptyCell;
        const isGameStatusCorrect = this.status === 'game';

        if (isProgression && isFieldCorrect && isGameStatusCorrect) {
            const step = {
                id: this.steps.length,
                prevStepId: this.steps.length - 1,
                field: stepData.field,
            };

            const fieldData = this.steps.length % 2 === 1 ? '0' : 'X';

            this.steps = [...this.steps, step];
            this.map[stepData.field] = fieldData;

            this.checkGameEnd();

            return { result: true };
        } else {
            return { result: true };
        }
    }

    checkGameEnd() {
        const isGameEnd = this.steps.length >= 5 && checkIsGameEnd(this.map);

        if (isGameEnd) {
            this.status = 'finished';
        }
    }
}

module.exports = Board;

