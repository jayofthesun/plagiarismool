import Strategy from "./Strategy";

  
 export default interface Result {
    [index: string]: any;
    overallPercentPlagarized: number,
    plagarismInstances: Strategy[]
  }