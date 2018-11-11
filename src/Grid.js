import React from 'react';
import configuration from './conf';
import _ from 'lodash';
import './Grid.css';
import Cell from './Cell';
import {LineChart, YAxis, XAxis, CartesianGrid, Line, Tooltip, Legend} from 'recharts';
import gridUtils from './services/gridUtils';

class Grid extends React.Component {

  constructor(props) {
    super(props);

    this.isRunning = false;

    this.state = Object.assign({
      grid: gridUtils.initGrid(40),
      gridSize: 40,
      speed: 100,
      days: 1,
      selectedCell: null,
      isRunning: false,
      showHeatMap: false,
      showRain: false,
      showClouds: true,
      showEarth: true,
      showGraph: false,
    }, { temperatureValues: configuration.temperature })
  }

  start = () => {
      this.timerID = setInterval(
      () => this.setState({
        grid: gridUtils.calculateNextGeneration(this.state.grid, this.state.days + 1),
        days: this.state.days + 1,
        isRunning: true
      }),
      this.state.speed
    );
  }

  stop = () => {
    clearInterval(this.timerID);
    clearInterval(this.graphTimerId);
    this.setState({
      isRunning: false
    })
    clearInterval(this.timerID);
  }

  restart = () => {
    this.stop();
    this.restartValues();
    this.setState({
      days: 0,
      grid: gridUtils.initGrid(40)
    })
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
    let newValue = parseFloat(event.target.value);
    const clonedValue = _.cloneDeep(this.state.temperatureValues);
    clonedValue[event.target.name].value = newValue;
    this.setState({
      temperatureValues: clonedValue
    });
    configuration.temperature[event.target.name].value = newValue;
  }

  restartValues = () => {
    const clonedValue = _.cloneDeep(this.state.temperatureValues);
    Object.keys(clonedValue).forEach(key => clonedValue[key].value = 0.01)
    this.setState({
      temperatureValues: clonedValue
    });
    Object.keys(configuration.temperature).forEach(key => configuration.temperature[key].value = 0.01);
  }

  generateGraphB = () => {
    const airPollution = 'pollutionTemperature';
    console.log(this);
    this.restart();
    this.start();

    this.graphTimerId = setInterval(
      () => {
        const event = {
          target: {
            name: airPollution,
            value: this.state.temperatureValues[airPollution].value + 0.0005
          }
        }
        this.onInputChange(event);
      },
      100)
  }

  generateGraphB = () => {
    this.restart();
    this.start();
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
                <div style={{display: 'inline-block', width: '200px', marginRight: '10px'}}><strong>{`${this.state.temperatureValues[key].displayName}: `}</strong></div> <input type='number' min='0.01' max='1' step='0.005' name={key} onChange={this.onInputChange.bind(this)} value={this.state.temperatureValues[key].value}></input>
              </div>
            })}
          </div>
          <button onClick={!this.state.isRunning ? this.start : this.stop} className='start-button'>{!this.state.isRunning ? 'Start Simulation' : 'Stop Simulation'}</button>
          <button onClick={this.restart} className='start-button'>Restart Simulation</button>
          <button onClick={this.generateGraphB} className='start-button'>Generate Graph B</button>
          <button onClick={this.generateGraphC} className='start-button'>Generate Graph C</button>
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
        {this.showGraph && this.state.days >= 365 && <div className='charts'>
        <div>Value across 1 year</div>
          <LineChart width={1400} height={800} data={configuration.graphValues}>
          <XAxis dataKey="day"/>
          <YAxis/>
          <CartesianGrid strokeDasharray="3 3"/>
          <Tooltip/>
          <Legend />
          <Line type="monotone" label='Temperature' dataKey="temperature" stroke="#8884d8" activeDot={{r: 8}}/>
          <Line type="monotone" label='Air Pollution' dataKey="airPollution" stroke="#82ca9d" />
          <Line type="monotone" label='Rainy Days' dataKey="rain" stroke="#4286f4" />
        </LineChart>
        </div>}
        {this.showGraph && this.state.days < 365 && <div>
          Grpahs Will Be Displayed HERE. Wait for 1 Year to pass... 
        </div>}
      </div>
    );
  }
}

export default Grid;
