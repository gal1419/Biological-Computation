import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import Grid from './Grid';

class App extends React.Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    this.timerID = undefined;
    //  setInterval(
    //   () => this.setState(this.calculateNextGeneration()),
    //   1000
    // );
  }

  componentWillUnmount() {
    clearInterval(this.timerID);
  }

  render() {
    return (
    <Grid {...this.state}/>
    );
  }
}

export default App;
