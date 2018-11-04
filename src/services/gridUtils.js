import configuration from '../conf';

class GridUtils {

    constructor() {
        this.configuration = configuration;
    }

    initGrid = (gridSize) => {
        const grid = new Array(gridSize);

        for (let i = 0; i < gridSize; i++) {
            grid[i] = new Array(gridSize);
            for(let j = 0; j < gridSize; j++) {
                const cellIndex = (i * gridSize) + j;
                grid[i][j] = {
                id: cellIndex,
                cellType: this.getCellType(cellIndex),
                isCloud: this.isCloud(cellIndex),
                isRaining: this.isCloud(cellIndex) && Math.floor(((Math.random() * 10) + 1)) > 5,
                windDirection: this.getWindDirection(),
                windStrength: this.getWindStrength(),
                temperature: this.getTemperature(i)
                }
            }
        }
        return grid;
    }

    getCellType = (cellId) => {
        if (this.configuration.iceCells.includes(cellId)) {
        return 'ice';
        } else if (this.configuration.cityCells.includes(cellId)) {
        return 'city' + Math.floor(((Math.random() * 3) + 1));
        } else if (this.configuration.forrestCells.includes(cellId)) {
        return 'forrest' + Math.floor(((Math.random() * 3) + 1));
        } else if (this.configuration.landCells.includes(cellId)) {
        return 'land';
        } else {
        return 'sea';
        }
    }

    isCloud = (cellId) => {
        return this.configuration.cloudCells.includes(cellId);
    }

    getWindDirection = () => {
        const directions = ['north', 'south', 'east', 'west'];
        return directions[Math.floor(((Math.random() * 4)))];
    }

    getWindStrength = () => {
        return Math.floor(((Math.random() * 3))) + 1;
    }

    getTemperature = (row, gridSize) => {
        if (row % 2 === 0) {
            if (row > gridSize / 2) {
                return gridSize - row;
            }
            return row;
        }

        if (row > gridSize / 2) {
            return gridSize - row;
        }
        return row - 1;
    }

    getCellType(type) {
        if (type === 'city' || type === 'forrest') {
            return `cell ${type}` + Math.floor(((Math.random() * 3) + 1));
        }
        return `cell ${type}`;
    }

    calculateNextGeneration = (grid) => {
        const gridSize = grid.length;
        const newGrid = new Array(gridSize);

        for (let i = 0; i < gridSize; i++) {
            newGrid[i] = new Array(gridSize);
            for(let j = 0; j < gridSize; j++) {
                const cellIndex = (i * gridSize) + j;
                const newCell = Object.assign({}, grid[i][j]);
                newCell.isCloud = this.computeCloudCell(i, j, grid);
                newGrid[i][j] = newCell;
            } 
        }
        return newGrid;
    }

    computeCloudCell = (i, j, grid) => {
        const y = j === 39 ? 0 : j + 1;
        return grid[i][y].isCloud;
    }
}

export default new GridUtils();