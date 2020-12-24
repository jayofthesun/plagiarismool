import { StrategyInstance } from "../enums/StrategyInstance";

//probably put into separate files
export default interface Strategy {
    [index: string]: any;
    avoidanceStrategy: StrategyInstance,
    fileName1: string,
    fileName2: string,
    startLine1: number,
    endLine1: number,
    startLine2: number,
    endLine2: number
}