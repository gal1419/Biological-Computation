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
                const isIce = type === 'ice';

                const initObj = Object.assign({}, {
                    id: cellIndex,
                    type: this.getCellType(cellIndex),
                    isCloud: this.isCloud(cellIndex),
                    temperature: this.getTemperature(i, gridSize),
                }, isIce && { iceLevel: 50 });

                grid[i][j] = Object.assign(
                    initObj,
                    initObj.type.includes('city') && { airPollution: this.getAirPollution() },
                    initObj.isCloud && { isRaining: this.getIsRaining() })
            }
        }
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
            return Math.floor(((Math.random() * 10) + 1)) > 7;
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

    calculateNextGeneration = (grid) => {
        const gridSize = grid.length;
        const newGrid = new Array(gridSize);

        for (let i = 0; i < gridSize; i++) {
            newGrid[i] = new Array(gridSize);
            for (let j = 0; j < gridSize; j++) {
                let newCell = {};
                const oldCell = grid[i][j];
                const isCloud = this.computeCloudCell(i, j, grid);
                const neighbors = this.getNeighbors(i, j, grid);

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
                    const iceLevel = this.computeIceLevel(oldCell.iceLevel, oldCell.temperature);

                    if (iceLevel < 0) {
                        newCell.type = 'sea';
                        delete newCell.iceLevel;
                    }
                }
                newGrid[i][j] = newCell;
            }
        }
        return newGrid;
    }

    computeIceLevel = (iceLevel, temperature) => {
        return {
            iceLevel: temperature > 0 ? iceLevel - 1 : iceLevel
        }
    }

    computeCloudCell = (i, j, grid) => {
        const y = j === 39 ? 0 : j + 1;
        return grid[i][y].isCloud;
    }

    computeNewTemperature = (currentTemp, cellNeighbors, airPollution, isForrest, isRaining) => {
        const hasHigherTemp = _.some(cellNeighbors, (neighbor) => {
            return Math.abs(neighbor.temperature - currentTemp) > 2;
        });

        const tempWithAirPollution = airPollution ? currentTemp + (airPollution / 100) + configuration.temperature.pollutionTemperature : currentTemp;
        const tempWithRain = isRaining ? tempWithAirPollution - configuration.temperature.rainTemperature : tempWithAirPollution;
        const tempWithForrest = isForrest ? tempWithRain + configuration.temperature.forrestTemperature : tempWithRain;
        return hasHigherTemp ? tempWithForrest + configuration.temperature.temperatureRaise : tempWithForrest;
    }

    getNeighbors = (x, y, grid) => {
        const neighbors = this.neighborDirs.map(([dX, dY]) => [x + dX, y + dY]);
        const gridNeighbors = neighbors.map(([i, j]) => this.getFromGrid(grid, i, j));
        return gridNeighbors.filter(v => v);
    }

    getFromGrid = (grid, x, y) => (grid[x] || [])[y];
}

export default new GridUtils();