import configuration from "./conf";

class HelperService {

    chromosomelngth = 40;
    neighborDirs = [
        [-1, -1],
        [0, -1],
        [1, -1],
        [-1, 0],
        [1, 0],
        [-1, 1],
        [0, 1],
        [1, 1]
    ];

    generateEnvironment = () => {
        const envSize = configuration.gridSize;
        const grid = new Array(envSize);

        for (let i = 0; i < envSize; i++) {
            grid[i] = new Array(envSize);
            for (let j = 0; j < envSize; j++) {
                const cellIndex = i * envSize + j;

                grid[i][j] = {
                    index: cellIndex,
                    type: this.getCellType(cellIndex, i, j)
                }
            }
        }
        return grid;
    }

    generatePopulation = (grid) => {
        const population = [];
        const populationSize = configuration.populationSize;

        for (let i = 0; i < populationSize; i++) {
            const chromosome = [{ x: 0, y: 0 }];

            for (let j = 0; j < this.chromosomelngth - 1; j++) {
                const { x, y } = chromosome[j];
                const neighbors = this.getNeighbors(x, y, grid);
                chromosome[j + 1] = this.getRandomNeighborIndex(neighbors);
            }
            population.push(chromosome);
        }
        return population;
    }

    getRandomNeighborIndex = (neighbors) => {
        const keys = Object.keys(neighbors)
        const neighbor = neighbors[keys[Math.floor(Math.random() * keys.length)]];
        return this.getCordinatesByIndex(neighbor.index);
    }

    getCordinatesByIndex = (index) => {
        return {
            x: Math.floor(index / configuration.gridSize),
            y: index % configuration.gridSize
        }
    }

    getNeighbors = (x, y, grid) => {
        const neighbors = this.neighborDirs.map(([dX, dY]) => [x + dX, y + dY]);
        const gridNeighbors = neighbors.map(([i, j]) =>
            this.getFromGrid(grid, i, j)
        );
        return gridNeighbors.filter(v => v);
    };

    getFromGrid = (grid, x, y) => (grid[x] || [])[y];

    getCellType = (cellIndex, i, j) => {
        if (cellIndex === 0) {
            return 'robot';
        } else if (cellIndex === (Math.pow(configuration.gridSize, 2) - 1)) {
            return 'target';
        } else if (this.isObstacle(i, j)) {
            return 'obstacle';
        }
        return 'empty';
    }

    isObstacle = (i) => {
        if (!configuration.hasObstacles) {
            return false;
        }

        if (Math.floor(configuration.gridSize * 0.3) === i || Math.floor(configuration.gridSize * 0.75) === i) {
            return Math.floor(Math.random() * 10 + 1) > 7;
        };

        return false;
    }
}

export default new HelperService();

