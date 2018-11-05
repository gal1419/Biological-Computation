import React from 'react';
import configuration from './conf';
import './Grid.css';
import Cell from './Cell';
import gridUtils from './services/GridUtils';
import { VirtualTimeScheduler } from 'rxjs';

class Grid extends React.Component {

  constructor(props) {
    super(props);

    this.isRunning = false;

    this.state = Object.assign({
      grid: gridUtils.initGrid(40),
      gridSize: 40,
      speed: 500,
      days: 0,
      selectedCell: null,
      isRunning: false,
      showHeatMap: false,
      showRain: false,
      showClouds: true,
      showEarth: true,
    }, { temperatureValues: configuration.temperature })
  }

  start = () => {
    this.timerID = undefined;

    this.timerID = setInterval(
      () => this.setState({
        grid: gridUtils.calculateNextGeneration(this.state.grid),
        days: this.state.days + 1,
        isRunning: true
      }),
      this.state.speed
    );
  }

  stop = () => {
    this.setState({
      isRunning: false
    })
    clearInterval(this.timerID);
  }

  componentWillUnmount() {
    this.stop();
  }


  toggleEarth = () => {
    this.setState({
      showEarth: !this.state.showEarth
    })
  }

  toggleHeatMap = () => {
    this.setState({
      showHeatMap: !this.state.showHeatMap
    })
  }

  toggleRain = () => {
    this.setState({
      showRain: !this.state.showRain
    })
  }

  toggleClouds = () => {
    this.setState({
      showClouds: !this.state.showClouds
    })
  }

  selectCell = (cellData) => {
    this.setState({
      selectedCell: cellData
    });
  }

  onInputChange = (event) => {
    let temperature = {};
    let temp = parseFloat(event.target.value);
    temperature[event.target.name] = temp;
    this.setState({
      temperatureValues: Object.assign(this.state.temperatureValues, temperature)
    });
    configuration.temperature[event.target.name] = temp;
  }

  createGrid = () => {
    const table = [];

    for (let i = 0; i < this.state.gridSize; i++) {
      let children = [];

      for (let j = 0; j < this.state.gridSize; j++) {
        let cellIndex = (this.state.gridSize * i) + j;
        children.push(
          <Cell
            key={cellIndex}
            clickHandler={this.selectCell}
            showRain={this.state.showRain}
            showHeatMap={this.state.showHeatMap}
            showClouds={this.state.showClouds}
            showEarth={this.state.showEarth}
            cellData={this.state.grid[i][j]} />
        );
      }
      table.push(children);
    }
    return table;
  }

  render = () => {
    return (
      <div className='grid-container'>
        <div className='info-section'>
          <div className='cell-info'>
            <div>{`Days: ${this.state.days}`}</div>
            <div>{`Years: ${Math.floor(this.state.days / 365)}`}</div>
            <br />
            {!this.state.selectedCell && <div>No Cell Selected. Click on a cell to view it's properties.</div>}
            {this.state.selectedCell && Object.keys(this.state.selectedCell).map((key) => {
              return <div key={key}>
                <span><strong>{`${key}: `}</strong></span>
                <span>{` ${this.state.selectedCell[key]}`}</span>
              </div>
            })}
            <br />
            {Object.keys(this.state.temperatureValues).map((key) => {
              return <div key={key} style={{ marginTop: '10px' }}>
                <span><strong>{`${key}: `}</strong></span> <input type='number' min='0' max='5' name={key} onChange={this.onInputChange.bind(this)} defaultValue={this.state.temperatureValues[key]}></input>
              </div>
            })}
          </div>
          <button onClick={!this.state.isRunning ? this.start : this.stop} className='start-button'>{!this.state.isRunning ? 'Start Simulation' : 'Stop Simulation'}</button>
        </div>
        <div className='grid-section'>
          <div className='grid'>
            {this.createGrid()}
          </div>
          <div className='buttons'>
            <button onClick={this.toggleEarth}>Toggle Earth</button>
            <button onClick={this.toggleHeatMap}>Toggle Heat Map</button>
            <button onClick={this.toggleClouds}>Toggle Clouds</button>
            <button onClick={this.toggleRain}>Toggle Rain</button>
          </div>
        </div>
      </div>
    );
  }
}

export default Grid;
