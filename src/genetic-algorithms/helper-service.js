import configuration from "./conf";
import _ from "lodash";

class HelperService {
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

  isObstacle(i) {
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
  }

  generateInitialPopulation = grid => {
    const population = [];
    const populationSize = configuration.populationSize;

    for (let i = 0; i < populationSize; i++) {
      const chromosome = this.createNewChoromosome([{ x: 0, y: 0 }]);
      this.generateChromoseInitialPath(chromosome, grid);
      population.push(chromosome);
    }

    return this.calculatePopulationFitnessDistanceAndObstacles(population);
  };

  createNewChoromosome(coordinates) {
    return {
      coordinates: coordinates || [],
      distanceFromTarget: undefined,
      fitness: undefined,
      hasObstacles: undefined
    };
  }

  generateChromoseInitialPath(chromosome, grid) {
    const { coordinates } = chromosome;
    const chromosomeLength = this.getRandomInt(
      10,
      Math.pow(configuration.gridSize, 2)
    );
    for (let j = 0; j < chromosomeLength; j++) {
      const neighbors = this.getNeighbors(coordinates[j], grid);
      const neighborsCoordinates = _.map(neighbors, n =>
        this.getCoordinatesByIndex(n.index)
      );
      _.remove(neighborsCoordinates, n => _.some(coordinates, n));

      if (_.isEmpty(neighborsCoordinates)) return;

      coordinates[j + 1] = this.getRandomNeighborCoordinates(
        neighborsCoordinates
      );
    }
  }

  calculatePopulationFitnessDistanceAndObstacles(population) {
    population.forEach(chromosome => {
      this.calculateDistanceFromTarget(chromosome);
      this.calculateObstacles(chromosome);
      this.calculateChromosomeFitness(chromosome);
    });

    return _.sortBy(population, ["fitness"]);
  }

  calculateDistanceFromTarget(chromosome) {
    const { coordinates } = chromosome;
    const indexOfTargetCoordinateInPath = this.getIndexOfTargetCoordinateInPath(
      coordinates
    );
    const lastCoordinateInPath =
      indexOfTargetCoordinateInPath >= 0
        ? coordinates[indexOfTargetCoordinateInPath]
        : coordinates[coordinates.length - 1];

    chromosome.distanceFromTarget = this.getPointDistanceFromTargetPoint(
      lastCoordinateInPath.x,
      lastCoordinateInPath.y
    );
  }

  getPointDistanceFromTargetPoint(x, y) {
    return Math.sqrt(
      Math.pow(x - this.TARGET_COORDINATES.x, 2) +
        Math.pow(y - this.TARGET_COORDINATES.y, 2)
    );
  }

  calculateObstacles(chromosome) {
    chromosome.hasObstacles = _.isEmpty(
      _.intersectionWith(this.obstacles, chromosome.coordinates, _.isEqual)
    );
  }

  calculateChromosomeFitness(chromosome) {
    let fitness = 0;
    const { coordinates, distanceFromTarget, hasObstacles } = chromosome;
    const indexOfTargetCoordinateInPath = this.getIndexOfTargetCoordinateInPath(
      coordinates
    );

    const pathLength =
      indexOfTargetCoordinateInPath >= 0
        ? indexOfTargetCoordinateInPath
        : coordinates.length;

    fitness = pathLength / Math.pow(configuration.gridSize, 2);
    fitness += hasObstacles ? 1 : 0;
    fitness +=
      distanceFromTarget === 0
        ? distanceFromTarget
        : distanceFromTarget / configuration.gridSize;

    chromosome.fitness = fitness;
  }

  getIndexOfTargetCoordinateInPath(coordinates) {
    return _.findIndex(coordinates, coordinate =>
      _.isEqual(coordinate, this.TARGET_COORDINATES)
    );
  }

  getObstablesInPath(coordinates) {
    return _.intersectionWith(this.obstacles, coordinates, _.isEqual);
  }

  calculateNextGeneration = (oldPopulation, grid) => {
    const newPopulation = [];
    const totalFitness = _.sumBy(
      oldPopulation,
      chromosome => chromosome.fitness
    );
    const oldPopulationClone = _.cloneDeep(oldPopulation);
    const elitisemIndex = Math.ceil(oldPopulation.length * 0.05);
    const elitisemSelection = oldPopulationClone.slice(0, elitisemIndex);
    Array.prototype.push.apply(newPopulation, elitisemSelection);

    while (newPopulation.length < configuration.populationSize) {
      const firstParent = this.rouletteWheelSelection(
        oldPopulationClone,
        totalFitness
      );
      const secondParent = this.rouletteWheelSelection(
        oldPopulationClone,
        totalFitness
      );

      if (_.isEqual(firstParent.coordinates, secondParent.coordinates)) {
        continue;
      }

      const offspring = this.crossover(firstParent, secondParent);

      if (offspring && offspring.coordinates.length > 10) {
        this.mutate(offspring, grid);
        newPopulation.push(offspring);
      }
    }
    return this.calculatePopulationFitnessDistanceAndObstacles(newPopulation);
  };

  crossover = (firstParent, secondParent) => {
    const sharedCoordinates = _.intersectionWith(
      firstParent.coordinates,
      secondParent.coordinates,
      _.isEqual
    );

    _.remove(sharedCoordinates, { x: 0, y: 0 });

    if (_.isEmpty(sharedCoordinates)) {
      return null;
    }

    const firstParentIndexOfTargetCoordinate = this.getIndexOfTargetCoordinateInPath(
      firstParent.coordinates
    );
    const secondParentIndexOfTargetCoordinate = this.getIndexOfTargetCoordinateInPath(
      secondParent.coordinates
    );

    if (
      firstParentIndexOfTargetCoordinate < 0 &&
      secondParentIndexOfTargetCoordinate < 0
    ) {
      return this.handleCrossoverWithoutTargetPoint(
        firstParent,
        secondParent,
        sharedCoordinates
      );
    }

    return this.handleCrossoverWithTargetPoint(
      firstParent,
      secondParent,
      firstParentIndexOfTargetCoordinate,
      secondParentIndexOfTargetCoordinate,
      sharedCoordinates
    );
  };

  handleCrossoverWithoutTargetPoint(
    firstParent,
    secondParent,
    sharedCoordinates
  ) {
    const potenialOffSprings = this.getPotentialOffsprings(
      sharedCoordinates,
      firstParent,
      secondParent
    );

    return potenialOffSprings[
      this.getRandomInt(0, potenialOffSprings.length - 1)
    ];
  }

  createOffspringByCrossover(
    parentACoordinates,
    parentBCoordinates,
    parentAIndex,
    ParentBIndex
  ) {
    const offspringCoordinates = [
      ...parentACoordinates.slice(0, parentAIndex),
      ...parentBCoordinates.slice(ParentBIndex, parentBCoordinates.length - 1)
    ];

    return this.createNewChoromosome(offspringCoordinates);
  }

  handleCrossoverWithTargetPoint(
    firstParent,
    secondParent,
    firstParentIndexOfTargetCoordinate,
    secondParentIndexOfTargetCoordinate,
    sharedCoordinates
  ) {
    let firstParentToUse = secondParent;
    let targetParentToUse = firstParent;

    let targetPointIndexToUse = firstParentIndexOfTargetCoordinate;
    _.remove(sharedCoordinates, this.TARGET_COORDINATES);

    if (
      firstParentIndexOfTargetCoordinate > 0 &&
      secondParentIndexOfTargetCoordinate > 0
    ) {
      targetPointIndexToUse = _.min(
        firstParentIndexOfTargetCoordinate,
        secondParentIndexOfTargetCoordinate
      );
    } else if (secondParentIndexOfTargetCoordinate > 0) {
      targetPointIndexToUse = secondParentIndexOfTargetCoordinate;
    }

    if (!_.isEqual(firstParent[targetPointIndexToUse])) {
      firstParentToUse = firstParent;
      targetParentToUse = secondParent;
    }

    const randomSharedPoint =
      sharedCoordinates[this.getRandomInt(0, sharedCoordinates.length - 1)];
    let firstIndex = _.findIndex(firstParent.coordinates, coordinate =>
      _.isEqual(coordinate, randomSharedPoint)
    );
    let secondIndex = _.findIndex(secondParent.coordinates, coordinate =>
      _.isEqual(coordinate, randomSharedPoint)
    );

    return this.createOffspringByCrossover(
      firstParentToUse.coordinates,
      targetParentToUse.coordinates,
      firstIndex,
      secondIndex + 1
    );
  }

  getPotentialOffsprings(sharedCoordinates, firstParent, secondParent) {
    const potenialOffSprings = [];
    sharedCoordinates.forEach(c => {
      let firstIndex = _.findIndex(firstParent.coordinates, coordinate =>
        _.isEqual(coordinate, c)
      );
      let secondIndex = _.findIndex(secondParent.coordinates, coordinate =>
        _.isEqual(coordinate, c)
      );

      potenialOffSprings.push(
        this.createOffspringByCrossover(
          firstParent.coordinates,
          secondParent.coordinates,
          firstIndex,
          secondIndex
        )
      );

      potenialOffSprings.push(
        this.createOffspringByCrossover(
          secondParent.coordinates,
          firstParent.coordinates,
          secondIndex,
          firstIndex
        )
      );
    });

    return potenialOffSprings;
  }

  mutate = (offspring, grid) => {
    const { coordinates } = offspring;
    const mutationProbability = this.getRandomInt(1, 10);

    if (mutationProbability <= 2) {
      const obstacles = this.getObstablesInPath(coordinates);
      let indexToMutate = this.getRandomInt(1, coordinates.length - 2);

      if (!_.isEmpty(obstacles)) {
        indexToMutate = _.findIndex(coordinates, coordinate =>
          _.isEqual(coordinate, obstacles[0])
        );
      }

      if (!coordinates[indexToMutate - 1] || !coordinates[indexToMutate + 1]) {
        return;
      }

      coordinates[indexToMutate] = this.getRandomNeighborCoordinates(
        this.getSharedNeighbors(
          coordinates[indexToMutate - 1],
          coordinates[indexToMutate + 1],
          grid
        )
      );
    }
  };

  getSharedNeighbors(firstCoordinate, secondCoordinate, grid) {
    const firstNeighbors = _.map(this.getNeighbors(firstCoordinate, grid), n =>
      this.getCoordinatesByIndex(n.index)
    );
    const secondNeighbors = _.map(
      this.getNeighbors(secondCoordinate, grid),
      n => this.getCoordinatesByIndex(n.index)
    );

    return _.intersectionWith(firstNeighbors, secondNeighbors, _.isEqual);
  }

  getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  rouletteWheelSelection(population, totalFitness) {
    let seed = Math.floor(Math.random() * totalFitness);

    for (let i = 0; i < population.length; i++) {
      const chromosome = population[i];
      const { fitness } = chromosome;
      seed -= fitness;
      if (seed < 0) return chromosome;
    }

    return population.length - 1;
  }

  getRandomNeighborCoordinates = neighbors => {
    const keys = Object.keys(neighbors);
    return neighbors[keys[Math.floor(Math.random() * keys.length)]];
  };

  getCoordinatesByIndex = index => {
    return {
      x: Math.floor(index / configuration.gridSize),
      y: index % configuration.gridSize
    };
  };

  getNeighbors = (coordinate, grid) => {
    const { x, y } = coordinate;
    const neighbors = this.neighborDirs.map(([dX, dY]) => [x + dX, y + dY]);
    const gridNeighbors = neighbors.map(([i, j]) =>
      this.getFromGrid(grid, i, j)
    );
    return gridNeighbors.filter(v => v);
  };

  getFromGrid = (grid, x, y) => (grid[x] || [])[y];
}

export default new HelperService();
