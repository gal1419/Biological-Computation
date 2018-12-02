import React from "react";
import "./App.css";
import { BrowserRouter, Route, Link } from "react-router-dom";
import Grid from "./cellular-automaton/Grid";
import Environment from "./genetic-algorithms/Environment";

const Index = () => <h2>Choose Task from the Navigation Bar</h2>;

class App extends React.Component {
  render() {
    return ( <BrowserRouter>
    <div>
      <nav>
        <ul>
          <li>
            <Link to="/cellular-automaton/">Cellular Automaton</Link>
          </li>
          <li>
            <Link to="/genetic-algorithms/">Genetic Algorithms</Link>
          </li>
        </ul>
      </nav>

      <Route path="/" exact component={Index} />
      <Route path="/cellular-automaton/" component={Grid} />
      <Route path="/genetic-algorithms/" component={Environment} />
    </div>
  </BrowserRouter>
)}};

export default App;
