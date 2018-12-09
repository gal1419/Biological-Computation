import React from "react";
import configuration from "./conf";
import helper from "./helper-service";
import "./Environment.css";

class Environment extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      environment: helper.generateEnvironment(),
      population: null,
      speed: 100
    };
  }

  start = () => {
    this.setState({
      population: helper.generateInitialPopulation(this.state.environment)
    });

    this.timerID = setInterval(
      () =>
        this.setState({
          population: helper.calculateNextGeneration(
            this.state.population,
            this.state.environment
          )
        }),
      this.state.speed
    );
  };

  stop = () => {
    clearInterval(this.timerID);
    clearInterval(this.graphTimerId);
    this.showGraph = false;
    this.setState({
      isRunning: false,
      showGraph: false
    });
  };

  restart = () => {
    this.stop();
    this.restartValues();
    this.setState({});
  };

  componentWillUnmount() {
    this.stop();
  }

  restartValues = () => {};

  selectCell = event => {
    console.log(event.target);
    this.setState({
      //selectedCell: cellData
    });
  };

  createEnvironment = () => {
    const table = [];
    const size = configuration.gridSize;

    for (let i = 0; i < size; i++) {
      let children = [];

      for (let j = 0;j  < size; j++) {
        let cellIndex = size * i + j;
        children.push(
          <div
            key={cellIndex}
            onClick={this.selectCell}
            className={this.state.environment[i][j].type}
          />
        );
      }
      table.push(children);
    }
    return table;
  };

  render = () => {
    return (
      <div className="grid-container">
        <div className="info-section">
          <button
            onClick={!this.state.isRunning ? this.start : this.stop}
            className="start-button"
          >
            {!this.state.isRunning ? "Start Simulation" : "Stop Simulation"}
          </button>
          <button onClick={this.restart} className="start-button">
            Restart Simulation
          </button>
          <button onClick={this.generateGraphB} className="start-button">
            Generate Graph B
          </button>
          <button onClick={this.generateGraphC} className="start-button">
            Generate Graph C
          </button>
        </div>
        <div className="grid-section">
          <div className="environment">{this.createEnvironment()}</div>
          <div className="buttons">
            <button onClick={this.toggleEarth}>Toggle Earth</button>
            <button onClick={this.toggleHeatMap}>Toggle Heat Map</button>
            <button onClick={this.toggleClouds}>Toggle Clouds</button>
            <button onClick={this.toggleRain}>Toggle Rain</button>
          </div>
        </div>
      </div>
    );
  };
}

export default Environment;
