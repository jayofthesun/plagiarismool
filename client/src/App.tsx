import React from 'react';
import './App.css';
import UploadComponent from './UploadComponent';
import ResultsComponent from './ResultsComponent';
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import { MainContext } from './MainContext'

/**
 * The overarching app
 * Currently holds a main context in order to pass the files around
 * 
 * Since we have no backend database, 
 * we'd thought the best solution would be to 
 * keep a global copy of files to move around with.
 */
export default class App extends React.Component {
  /**
   * Sets the global context of files
   * @param files 
   */
  setFileGroups = (files: File[][]) => {
    this.setState({ fileGroups: files });
  };

  state = {
    fileGroups: [] as File[][],
    setFileGroups: this.setFileGroups,
  }


  render() {
    return (<MainContext.Provider value={this.state}>
      <Router>
        <Switch>
          <Route exact path="/">
            <UploadComponent />
          </Route>
          <Route path="/results">
            <ResultsComponent />
          </Route>
        </Switch>
      </Router>
    </MainContext.Provider>
    );
  }
}
