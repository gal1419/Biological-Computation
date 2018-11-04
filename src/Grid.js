import React from 'react';
import './Grid.css';
import Cell from './Cell';
import gridUtils from './services/GridUtils';

class Grid extends React.Component {

  constructor(props) {
    super(props);
    this.cells = [];
    this.gridUtils = gridUtils;
    this.state = {
      grid: this.gridUtils.initGrid(40),
      gridSize: 40,
      showHeatMap: false,
      showRain: false,
      showClouds: true,
      showEarth: true,
    }
  }

  componentDidMount() {
    this.timerID = undefined;
     setInterval(
      () => this.setState({
        grid: this.gridUtils.calculateNextGeneration(this.state.grid)
      }),
      1000
    );
  }

  componentWillUnmount() {
    clearInterval(this.timerID);
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

  addToLand = (cellId) => {
    if (this.cells.indexOf(cellId) === -1) {
      this.cells.push(cellId);
    }
  }

  printLand = () => {
    console.log(this.cells);
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
        clickHandler={this.addToLand}
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
      <div className="grid-container">
        <div className="grid">
        {this.createGrid()}
        </div>
        <div className="buttons">
          <button onClick={this.printLand}>Print</button>
          <button onClick={this.toggleEarth}>Toggle Earth</button>
          <button onClick={this.toggleHeatMap}>Toggle Heat Map</button>
          <button onClick={this.toggleClouds}>Toggle Clouds</button>
          <button onClick={this.toggleRain}>Toggle Rain</button>
        </div>
      </div>
    );
  }
}

export default Grid;
