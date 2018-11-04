import React from 'react';
import './Cell.css';

class Cell extends React.Component {

    constructor(props) {
        super(props);
        //this.state = {...props.cellData}
    }

    onCellClick = () => {
        // this.setState({
        //     isCloud: true
        // });
        // this.props.clickHandler(this.props.cellData.id);
    }

     getTempColorforValue = (value) => {
        const h = (1.0 - (value / 20)) * 240
        return {
            background: "hsl(" + h + ", 100%, 50%)"
        };
      }

    render() {
        return (
            <div className='cell'>
                {this.props.cellData.isCloud && <div className='cloud'></div>}
                {this.props.cellData.isCloud && this.props.cellData.isRaining && <div className='cloud drop'></div>}
                {this.props.showHeatMap && <div className="temperature" style={this.getTempColorforValue(this.props.cellData.temperature)}></div>}
                <div onClick={ () => console.log('s')} className={`cell ${this.props.cellData.cellType}`}></div>
            </div>
        )
    }
  }

export default Cell;
