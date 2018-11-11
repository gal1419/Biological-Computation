import configuration from '../conf';
import _ from 'lodash';

class GridUtils {

    neighborDirs = [
        [-1, -1], [0, -1], [1, -1],
        [-1, 0], [1, 0],
        [-1, 1], [0, 1], [1, 1]
    ];

    initGrid = (gridSize) => {
        const grid = new Array(gridSize);

        for (let i = 0; i < gridSize; i++) {
            grid[i] = new Array(gridSize);
            for (let j = 0; j < gridSize; j++) {
                const cellIndex = (i * gridSize) + j;
                const type = this.getCellType(cellIndex);
                const temperature = this.getTemperature(i, gridSize);
                const isIce = type === 'ice';

                const initObj = Object.assign({}, {
                    id: cellIndex,
                    type: this.getCellType(cellIndex),
                    isCloud: this.isCloud(cellIndex),
                    temperature: temperature,
                    initialTemperature: temperature,
                }, isIce && { iceLevel: 50 });

                grid[i][j] = Object.assign(
                    initObj,
                    initObj.type.includes('city') && { airPollution: this.getAirPollution() },
                    initObj.isCloud && { isRaining: this.getIsRaining() })
            }
        }
        this.graphBuilder(grid, 1);
        return grid;
    }

    getCellType = (cellId) => {
        if (configuration.iceCells.includes(cellId)) {
            return 'ice';
        } else if (configuration.cityCells.includes(cellId)) {
            return 'city' + Math.floor(((Math.random() * 3) + 1));
        } else if (configuration.forrestCells.includes(cellId)) {
            return 'forrest' + Math.floor(((Math.random() * 3) + 1));
        } else if (configuration.landCells.includes(cellId)) {
            return 'land';
        } else {
            return 'sea';
        }
    }

    isCloud = (cellId) => {
        return configuration.cloudCells.includes(cellId);
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

    getAirPollution = () => {
        return Math.floor(((Math.random() * 10) + 1));
    }

    getIsRaining = (neighbors) => {
        if (!neighbors) {
            return Math.floor(((Math.random() * 10) + 1)) > 5;
        }

        const numOfRainingNeighbors = _.sumBy(neighbors, (neighbor) => {
            return neighbor.isRaining ? 1 : 0;
        });

        if (numOfRainingNeighbors === 0) {
            return Math.floor(((Math.random() * 10) + 1)) > 5;
        } else if (numOfRainingNeighbors => 4) {
            return false;
        }
        return true;
    }

    getCellType(type) {
        if (type === 'city' || type === 'forrest') {
            return `cell ${type}` + Math.floor(((Math.random() * 3) + 1));
        }
        return `cell ${type}`;
    }

    calculateNextGeneration = (grid, day) => {
        const gridSize = grid.length;
        const newGrid = new Array(gridSize);

        for (let i = 0; i < gridSize; i++) {
            newGrid[i] = new Array(gridSize);
            for (let j = 0; j < gridSize; j++) {
                let newCell = {};
                const oldCell = grid[i][j];
                const isCloud = this.computeCloudCell(i, j, grid);
                const neighbors = this.getNeighbors(i, j, grid);
                const airPollution = oldCell.airPollution;

                 newCell = Object.assign(oldCell, {
                    isCloud,
                    isRaining: isCloud && this.getIsRaining(neighbors),
                    temperature: this.computeNewTemperature(
                        oldCell.temperature,
                        neighbors,
                        oldCell.airPollution,
                        oldCell.type.includes('forrest'),
                        oldCell.isRaining
                    ),
                });

                if (oldCell.iceLevel) {
                    newCell.iceLevel = this.computeIceLevel(newCell.temperature, oldCell);;

                    if (newCell.iceLevel === 0) {
                        newCell.type = 'sea';
                        delete newCell.iceLevel;
                    }
                }

                if (airPollution) {
                    newCell.newAirPollution = configuration.temperature.pollutionTemperature.value + (airPollution / 1000);
                }

                newGrid[i][j] = newCell;
            }
        }
        this.graphBuilder(newGrid, day);
        return newGrid;
    }

    computeIceLevel = (newTemp, oldCell) => {
        return newTemp - oldCell.initialTemperature > 2 ? oldCell.iceLevel - 1 : oldCell.iceLevel;
    }

    computeCloudCell = (i, j, grid) => {
        const y = j === 39 ? 0 : j + 1;
        return grid[i][y].isCloud;
    }

    computeNewTemperature = (currentTemp, cellNeighbors, airPollution, isForrest, isRaining) => {
        const neighborsSumTemp = _.sumBy(cellNeighbors, (neighbor) => {
            return neighbor.temperature;
        });
        const tempAverage =  neighborsSumTemp / cellNeighbors.length;
        let tempReducers = isForrest ? configuration.temperature.forrestTemperature.value : 0;
        tempReducers +=  isRaining ? configuration.temperature.rainTemperature.value : 0;

        let tempRaisers = airPollution ? configuration.temperature.pollutionTemperature.value + (airPollution / 1000) : 0;

        if (tempAverage  - currentTemp <= 0) {
            tempReducers += configuration.temperature.temperatureRaise.value;
        } else {
            tempRaisers += configuration.temperature.temperatureRaise.value;
        }

        return currentTemp - tempReducers + tempRaisers;
    }

    getNeighbors = (x, y, grid) => {
        const neighbors = this.neighborDirs.map(([dX, dY]) => [x + dX, y + dY]);
        const gridNeighbors = neighbors.map(([i, j]) => this.getFromGrid(grid, i, j));
        return gridNeighbors.filter(v => v);
    }

    getFromGrid = (grid, x, y) => (grid[x] || [])[y];

    graphBuilder = (grid, day) => {
        const flattenGrid = _.flattenDeep(grid);
        const temperature = _.meanBy(flattenGrid, 'temperature');
        const airPollution = _.meanBy(flattenGrid, 'newAirPollution');
        const rain = _.sumBy(flattenGrid, cell => cell.isRaining ? 1 : 0);

       configuration.graphValues.push({
           day,
           temperature,
           airPollution,
           rain
       });
    }
}

export default new GridUtils();