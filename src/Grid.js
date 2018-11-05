import React from 'react';
import './Grid.css';
import Cell from './Cell';
import gridUtils from './services/GridUtils';

class Grid extends React.Component {

  constructor(props) {
    super(props);

    this.isRunning = false;

    this.state = {
      grid: gridUtils.initGrid(40),
      gridSize: 40,
      days: 0,
      selectedCell: null,
      isRunning: false,
      showHeatMap: false,
      showRain: false,
      showClouds: true,
      showEarth: true,
    }
  }

  start = () => {
    this.timerID = undefined;

    this.timerID = setInterval(
      () => this.setState({
        grid: gridUtils.calculateNextGeneration(this.state.grid),
        days: this.state.days + 1,
        isRunning: true
      }),
      1000
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
        cellData={this.state.grid[i][j]}/>
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
          <span>{`Days: ${this.state.days}`}</span>
          <br/>
          <span>{`Years: ${Math.floor(this.state.days / 365)}`}</span>
          <div className='cell-info'>
            {this.state.selectedCell && Object.keys(this.state.selectedCell).map((key) => {
              return <div key={key} className="whiteSpaceNoWrap">{`${key}: ${this.state.selectedCell[key]}`}</div>
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
