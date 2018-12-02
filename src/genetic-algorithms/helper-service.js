import configuration from "./conf";
import _ from "lodash";

class HelperService {
  CHROMOSOMELENGTH = 40;
  FITNESS_COEFFICIENT = 1000000;
  TARGET_COORDINATES = {
    x: configuration.gridSize - 1,
    y: configuration.gridSize - 1
  };
  obstacles = [];
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
        };
      }
    }
    return grid;
  };

  generatePopulation = grid => {
    const population = [];
    const populationSize = configuration.populationSize;

    for (let i = 0; i < populationSize; i++) {
      const chromosome = {
        coordinates: [{ x: 0, y: 0 }],
        distanceFromTarget: undefined,
        fitness: undefined
      };

      for (let j = 0; j < this.CHROMOSOMELENGTH - 1; j++) {
        const { x, y } = chromosome.coordinates[j];
        const neighbors = this.getNeighbors(x, y, grid);
        chromosome.coordinates[j + 1] = this.getRandomNeighborCoordinates(
          neighbors
        );
      }
      chromosome.distanceFromTarget = this.getDistanceFromTarget(
        chromosome.coordinates[this.CHROMOSOMELENGTH - 1]
      );
      population.push(chromosome);
    }

    return this.calculatePopulationFitness(population);
  };

  calculatePopulationFitness(population) {
    population.forEach(chromosome => {
      this.calculateChromosomeFitness(chromosome);
    });

    return _.sortBy(population, ["fitness"]);
  }

  calculateChromosomeFitness(chromosome) {
    let score = 0;
    const { coordinates } = chromosome;
    const hasObstacles = !_.isEmpty(
      _.intersectionWith(this.obstacles, coordinates, _.isEqual)
    );
    const indexOfTargetCoordinateInPath = _.findIndex(coordinates, coordinate =>
      _.isEqual(coordinate, this.TARGET_COORDINATES)
    );

    const lastCoordinateInPath =
      indexOfTargetCoordinateInPath >= 0
        ? coordinates[indexOfTargetCoordinateInPath]
        : coordinates[coordinates.length - 1];

    const pathLength =
      indexOfTargetCoordinateInPath >= 0
        ? indexOfTargetCoordinateInPath
        : this.CHROMOSOMELENGTH;

    const distanceFromTarget = this.getDistanceFromTarget(lastCoordinateInPath);

    score = pathLength / this.CHROMOSOMELENGTH;
    score = hasObstacles ? score + 1 : score;
    score =
      distanceFromTarget === 0
        ? distanceFromTarget
        : distanceFromTarget / Math.pow(configuration.gridSize, 2);

    chromosome.fitness = score;
  }

  getDistanceFromTarget(coordinates) {
    return Math.sqrt(
      Math.pow(coordinates.x - this.TARGET_COORDINATES.x, 2) +
        Math.pow(coordinates.y - this.TARGET_COORDINATES.y, 2)
    );
  }

  getRandomNeighborCoordinates = neighbors => {
    const keys = Object.keys(neighbors);
    const neighbor = neighbors[keys[Math.floor(Math.random() * keys.length)]];
    return this.getCoordinatesByIndex(neighbor.index);
  };

  getCoordinatesByIndex = index => {
    return {
      x: Math.floor(index / configuration.gridSize),
      y: index % configuration.gridSize
    };
  };

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
      return "robot";
    } else if (cellIndex === Math.pow(configuration.gridSize, 2) - 1) {
      return "target";
    } else if (this.isObstacle(i, j)) {
      this.obstacles.push({ x: i, y: j });
      return "obstacle";
    }
    return "empty";
  };

  isObstacle = i => {
    if (!configuration.hasObstacles) {
      return false;
    }

    if (
      Math.floor(configuration.gridSize * 0.3) === i ||
      Math.floor(configuration.gridSize * 0.75) === i
    ) {
      return Math.floor(Math.random() * 10 + 1) > 7;
    }

    return false;
  };
}

export default new HelperService();
