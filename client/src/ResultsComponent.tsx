import React from "react";
import { Button, Grid, WithStyles, withStyles } from '@material-ui/core';
import { Link as RouterLink, RouteComponentProps, withRouter } from "react-router-dom";
import ResultsCodeBlock from './ResultsCodeBlock';
import ResultsCodeList from './ResultsCodeList';
import ResultsInformationColumn from "./ResultsInformationColumn";
import { MainContext } from "./MainContext";
import { DataService } from "./DataService";
import Strategy from "./objects/Strategy";
import Result from "./objects/Result";

/**
 * state for the result component
 * @member fileGroups the two file groups the user wants to compare between
 * @member currentFiles the current files being viewed
 * @member allHighlightedLines all highlighted lines based on each file
 * @member results the entire report of the JSON plagiarism result
 * @member currentStrategyLines all lines that are based off of the current strategy
 */
interface IState {
  fileGroups: File[][];
  currentFiles: File[];
  currentStrategies: Strategy[];
  allHighlightedLines: Map<string, number[][]>[];
  results: Result;
  currentStrategyLines: Map<string, number[][]>[];
}

interface IProps extends RouteComponentProps, WithStyles<typeof styles> { }

/**
 * Styles for this component
 */
const styles = {
  title: {
    marginTop: '2%',
    marginLeft: '4%'
  }
};

/**
 * The results page component
 * This class is the controller for all things related to the results page
 */
export class ResultsComponent extends React.Component<IProps, IState> {
  static contextType = MainContext;

  constructor(props: IProps) {
    super(props);
    this.state = {
      fileGroups: [],
      currentFiles: [File.prototype, File.prototype],
      allHighlightedLines: [new Map<string, number[][]>(), new Map<string, number[][]>()],
      results: { overallPercentPlagarized: 0, plagarismInstances: [] },
      currentStrategyLines: [new Map<string, number[][]>(), new Map<string, number[][]>()],
      currentStrategies: []
    };
  }

  componentDidMount() {
    const context = this.context;
    if (this.context.fileGroups.length !== 0) {
      this.setState({
        fileGroups: context.fileGroups,
        currentFiles: [context.fileGroups[0][0], context.fileGroups[1][0]]
      });
      DataService.getResult().then((response: any) => {
        this.setState({ results: response.data }, () => this.setHighlightedLines());
      });
    } else { //if context is empty, just go back to main screen (case if they decide to reload the page on results)
      this.props.history.push('/');

    }
  }

  /**
   * Reorganizes JSON data so each file knows only it's plagiarism occurences
   * Aka. Sets and map the highlighted lines by file name key
   */
  setHighlightedLines(): void {
    let instances: Strategy[] = this.state.results.plagarismInstances
    const updatedHighlightedLines = this.mappingStrategyToFileHighlights(instances);
    this.setState({ allHighlightedLines: updatedHighlightedLines });
  }

  /**
   * Helper function to parse all strategy objects into a map
   * Map is based on file name's key, values are the start and end lines
   * @param givenStrategies the given list of strategy instances
   */
  mappingStrategyToFileHighlights(givenStrategies: Strategy[]): Map<string, number[][]>[] {
    const updatedHighlightedLines: Map<string, number[][]>[] = [];
    this.state.fileGroups.forEach(() => (updatedHighlightedLines.push(new Map())))
    for (var fileIndex = 0; fileIndex < updatedHighlightedLines.length; fileIndex++) {
      const jsonIndex = fileIndex + 1;
      for (const fileInstance of givenStrategies) {
        const currentMap = updatedHighlightedLines[fileIndex];
        const currentPlagiarismInstance = fileInstance["fileName" + jsonIndex];
        const currentPlagiarismStartLine = fileInstance["startLine" + jsonIndex];
        const currentPlagiarismEndLine = fileInstance["endLine" + jsonIndex];
        if (currentMap.has(currentPlagiarismInstance)) {
          currentMap.get(currentPlagiarismInstance)?.push([currentPlagiarismStartLine, currentPlagiarismEndLine])
        } else {
          currentMap.set(currentPlagiarismInstance, [])
          currentMap.get(currentPlagiarismInstance)?.push([currentPlagiarismStartLine, currentPlagiarismEndLine])
        }
      }
    }
    return updatedHighlightedLines
  }


  /**
   * Find specific strategy instance in the JSON result file
   * @param fileName the given file name
   * @param lineNumber the line number
   * @param location which group this file belongs to
   */
  findStrategy(fileName: string, lineNumber: number, location: number) {
    let instances: Strategy[] = this.state.results.plagarismInstances;
    const updatedStrategies: Strategy[] = []
    const updateStrategyData = () => {
      this.updateFileByStrategy();
      this.updateCurrentHighlightedLines();
    }

    const jsonIndex = location + 1;
    for (let i = 0; i < instances.length; i++) {
      const sameFile = instances[i]["fileName" + jsonIndex] === fileName;
      const inLineRange = (lineNumber >= instances[i]["startLine" + jsonIndex]
        && lineNumber <= instances[i]["endLine" + jsonIndex])
      if (sameFile && inLineRange) {
        updatedStrategies.push(instances[i])
      }
    }

    this.setState({ currentStrategies: updatedStrategies }, updateStrategyData);
  }

  /**
   * Updates current files if there's a current plagiarism strategy instance
   */
  updateFileByStrategy() {
    const updatedArray = this.state.currentFiles;
    if (this.state.currentStrategies[0]) {
      for (var fileIndex = 0; fileIndex < this.state.fileGroups.length; fileIndex++) {
        const jsonIndex = fileIndex + 1;
        for (const file of this.state.fileGroups[fileIndex]) {
          if (this.state.currentStrategies[0]["fileName" + jsonIndex] === file.name) {
            updatedArray[fileIndex] = file
          }
        }
      }
    }
    this.setState({ currentFiles: updatedArray });
  }

  /**
   * Updates current files by selecting a file in a file list
   * @param index the index of the file 
   * @param location whether or not the file is in group 1 or group 2
   */
  updateFileByIndex(index: number, location: number) {
    const updatedArray = this.state.currentFiles;
    updatedArray[location] = this.state.fileGroups[location][index];
    this.setState({ currentFiles: updatedArray });
  }

  /**
   * Updates the current highlighted lines
   */
  updateCurrentHighlightedLines() {
    let instances: Strategy[] = this.state.currentStrategies
    const updatedHighlightedLines: Map<string, number[][]>[] = this.mappingStrategyToFileHighlights(instances)
    this.setState({ currentStrategyLines: updatedHighlightedLines });
  }

  render() {
    let codeDisplays = [];
    for (let i = 0; i < this.state.fileGroups.length; i++) {
      codeDisplays.push(
        <Grid item xs={4} key={`fileGroup${i}`}>
          <h3 id="file-name-header">
            {this.state.currentFiles[i].name}
          </h3>
          <div style={{ display: "flex" }}>
            <ResultsCodeList fileList={this.state.fileGroups[i]} passIndexBack={(index: number) => this.updateFileByIndex(index, i)} />
            <ResultsCodeBlock
              currentFile={this.state.currentFiles[i]}
              highlightedLines={this.state.allHighlightedLines[i].get(this.state.currentFiles[i].name)}
              lineDataCallback={(fileName: string, lineNumber: number) => this.findStrategy(fileName, lineNumber, i)}
              activeLines={this.state.currentStrategyLines[i].get(this.state.currentFiles[i].name)} />
          </div>
        </Grid>
      )
    }

    return <section id="results-page">
      <h1 className={this.props.classes.title}>Typescript Plagiarism Detector – Results</h1>
      <Grid container direction="row" justify="space-evenly" spacing={1}>
        {codeDisplays}
        <Grid item xs={2}>
          <h3 id="percentage"><strong>{this.state.results.overallPercentPlagarized}% plagiarized</strong></h3>
          <ResultsInformationColumn currentStrategies={this.state.currentStrategies} />
          <Button component={RouterLink} variant="contained" color="primary" className="back-button" to={{ pathname: '/' }}>Back</Button>
        </Grid>
      </Grid>
    </section>
  }
}

export default withStyles(styles)(withRouter(ResultsComponent));
