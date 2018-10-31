import React from 'react';
import './Grid.css';
import Cell from './Cell';
import configuration from './conf';

class Grid extends React.Component {

  constructor(props) {
    super(props);
    this.gridSize = 40;
    this.cells = [];
    this.configuration = configuration;
    this.state = {
      grid: this.initGrid()
    }
  }

  initGrid = () => {
    const grid = new Array(this.gridSize);

    for(let i = 0; i < this.gridSize; i++) {
      grid[i] = new Array(this.gridSize);
      for(let j = 0; j < this.gridSize; j++) {
        const cellIndex = (i * this.gridSize) + j;
        grid[i][j] = {
          id: cellIndex,
          type: this.getCellType(cellIndex),
          isCloud: this.isCloud(cellIndex)
        }
      }
    }
    return grid;
  }

  getCellType = (cellId) => {
    if (this.configuration.iceCells.includes(cellId)) {
      return 'ice';
    } else if (this.configuration.cityCells.includes(cellId)) {
      return 'city';
    } else if (this.configuration.forrestCells.includes(cellId)) {
      return 'forrest';
    } else if (this.configuration.landCells.includes(cellId)) {
      return 'land';
    } else {
      return 'sea';
    }
  }

  isCloud = (cellId) => {
    return this.configuration.cloudCells.includes(cellId);
  }


  addToLand = (cellId) => {
    if(this.cells.indexOf(cellId) === -1) {
      this.cells.push(cellId);
    }
  }

  printLand = () => {
    console.log(this.cells);
  }

  createGrid = () => {
    const table = [];
    
    // create rows
    for (let i = 0; i < this.gridSize; i++) {
      let children = [];
      // create columns
      for (let j = 0; j < this.gridSize; j++) {
        let cellIndex = (this.gridSize * i) + j;
        children.push(
        <td key={`row-${i}-col-${j}`}>
        <Cell key={cellIndex} clickHandler={this.addToLand} cellData={this.state.grid[i][j]}/>
        </td>);
      }
      table.push(<tr key={`row-${i}`} >{children}</tr>);
    }
    return table;
  }

  render = () => {
    return (
      <div className="grid">
        <table>
          <tbody>
          {this.createGrid()}
          </tbody>
        </table>
      <button onClick={this.printLand}></button>
      </div>
    );
  }
}

export default Grid;
