import React from 'react';
import './Cell.css';

class Cell extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            cellType: this.getCellType(props.cellData.type),
            isCloud: props.cellData.isCloud
        }
    }

    getCellType(type) {
        if (type === 'city' || type === 'forrest') {
            return `cell ${type}` + Math.floor(((Math.random() * 3) + 1));
        }
        return `cell ${type}`;
    }

    onCellClick = () => {
        this.setState({
            isCloud: true
        });
        this.props.clickHandler(this.props.cellData.id);
    }

    render() {
        return (
            <div className='cell'>
                {this.state.isCloud && <div className="cloud"></div>}
                <div onClick={ () => this.onCellClick()} className={this.state.cellType}></div>
            </div>
        )
    }
  }

export default Cell;
