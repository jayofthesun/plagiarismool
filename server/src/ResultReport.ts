import e = require("express");
import NodeWrapper from "./NodeWrapper";
import PlagarismInstance from "./PlagarismInstance";

/**
 * Represents a report of the results of the plagarism detection algorithm
 */
export default class ResultReport {

  private plagarismInstances: PlagarismInstance[];
  private overallPercentPlagarized: number;

  constructor() {
    this.plagarismInstances = [];
    this.overallPercentPlagarized = 0;
  }

  /**
   * Sets the overall percentage of plagiarism found in two programs
   * 
   * @param program1AST - AST for program 1
   * @param program2AST - AST for program 2
   * @returns void
   * 
   */
  setOverallPercentage(program1AST: NodeWrapper[], program2AST: NodeWrapper[]) {

    if (program1AST.length == 0 || program2AST.length == 0) {
      this.overallPercentPlagarized = 0;
    } else {
      let p1Length: number[] = [];
      let p2length: number[] = [];
      program1AST.forEach(x => this.lines(p1Length, x.getStartLine(), x.getEndLine()));
      program2AST.forEach(x => this.lines(p2length, x.getStartLine(), x.getEndLine()));
      let overallLength = p1Length.length + p2length.length;
      let plagiarismLines1: number[] = [];
      let plagiarismLines2: number[] = [];
      this.plagarismInstances.forEach(x => this.lines(plagiarismLines1, x.getStartEndLine()[0], x.getStartEndLine()[1]));
      this.plagarismInstances.forEach(x => this.lines(plagiarismLines2, x.getSimilarStartEndLine()[0], x.getSimilarStartEndLine()[1]));

      let overallPlagiarism = plagiarismLines1.length + plagiarismLines2.length;
      let result = overallPlagiarism / overallLength * 100
      this.overallPercentPlagarized = result;

      console.log("result", result)
    }
  }
  /**
   * Helper method for calculating the number of lines that are plagiarized
   * 
   * @param arr - an array of lines that are plagiarized
   * @param instStart - the start line of the plagiarism instance 
   * @param instEnd - the end line of the plagiarism instance
   * @returns void
   * 
   */
  lines(arr: number[], instStart: number, instEnd: number) {
    var list = [];
    for (let i = instStart; i <= instEnd; i++) {
      list.push(i);
    }

    for (let j = 0; j < list.length; j++) {
      if (!arr.includes(list[j])) {
        arr.push(list[j]);
      }
    }

  }
  /**
     * Get the overall percentage of plagiarism found in two programs
     * 
     * @returns number
     * 
     */
  getOverallPercentage(): number {
    return this.overallPercentPlagarized;
  }

  /**
   * Adds a plagiarism instance to the result report
   * 
   * @param plagInst - plagiarism instance
   * @returns void
   * 
   */
  addPlgarismInstance(plagInst: PlagarismInstance) {
    this.plagarismInstances.push(plagInst)
  }

  /**
     * gets the list of plagiarism instances found for a report
     * 
     * @returns a list of plagiarism instances
     * 
     */
  getPlagiarismInstances(): PlagarismInstance[] {
    return this.plagarismInstances;
  }

  /**
     * Turns the report information into a json for the front end
     * 
     * @returns JSON of report
     * 
     */
  getJson(): Object {
    let plagarismInstancesJson = this.getPlagiarismInstances().map(instance => instance.getJson())
    let jsonified = {
      'overallPercentPlagarized': this.getOverallPercentage(),
      'plagarismInstances': plagarismInstancesJson
    }
    return jsonified
  }

  alreadyPresent(node1 : NodeWrapper, node2 : NodeWrapper) : boolean { 
    //does a plag instance with node1 and node2 already exist
    this.plagarismInstances.forEach(instance => { 
      let node1node2 : boolean = instance.getPlagiarizedNode() == node1 && instance.getSimilarPlagiarizedNode() == node2
      let node2node1 : boolean = instance.getPlagiarizedNode() == node2 && instance.getSimilarPlagiarizedNode() == node1
      if(node1node2 || node2node1){ 
        return true;
      };
    });
    return false; 
  }
}
