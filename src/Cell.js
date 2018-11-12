import React from "react";
import "./Cell.css";

class Cell extends React.Component {
  constructor(props) {
    super(props);
  }

  onCellClick = () => {
    this.props.clickHandler(this.props.cellData);
  };

  getTempColorforValue = value => {
    const h = (1.0 - value / 20) * 240;
    return {
      background: `hsl(${h}, 100%, 50%)`
    };
  };

  render() {
    return (
      <div
        className="cell"
        onClick={this.onCellClick}
        title={this.props.cellData.id}
      >
        {this.props.showClouds && this.props.cellData.isCloud && (
          <div className="cloud" />
        )}
        {this.props.showRain && this.props.cellData.isRaining && (
          <div className="cloud drop" />
        )}
        {this.props.showHeatMap && (
          <div
            className={
              !this.props.showEarth ? "temperature" : "temperature temp-opacity"
            }
            style={this.getTempColorforValue(this.props.cellData.temperature)}
          />
        )}
        {this.props.showEarth && (
          <div className={`cell ${this.props.cellData.type}`} />
        )}
      </div>
    );
  }
}

export default Cell;
