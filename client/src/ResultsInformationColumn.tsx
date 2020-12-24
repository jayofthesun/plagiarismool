import { WithStyles, withStyles } from "@material-ui/core";
import React from "react";
import { StrategyInstance } from "./enums/StrategyInstance";
import Strategy from "./objects/Strategy";

/**
 * props for the result information column
 * @member currentStrategies the JSON instance for the current plagiarism instance
 */
interface IProps extends WithStyles<typeof styles> {
    currentStrategies: Strategy[]
}

/**
 * states for information column
 */
interface IState {}

/**
 * Styles for this component
 */
const styles = {
    column: {
        backgroundColor: '#fff',
        height: '65vh',
        overflow: 'scroll',
        padding: '10px',
        borderRadius: '5px'
    }, 
    startMessage: { 
        fontSize: '18px',
        color: 'darkgray'
    },
    bold: {
        fontWeight: 'bold' as 'bold'
    }
  };

/**
 * Component that displays specific information regarding a specific plagiarism instance
 */
class ResultsInformationColumn extends React.Component<IProps, IState> {
    /**
     * Renders a specific message based on the type of plagiarism instance that exists
     */
    renderPlagiarismStrategyMessage(currentStrategy: Strategy) {
        return <>
            We've detected <span id="plagiarism-type" className={this.props.classes.bold}>{this.renderPlagiarismTypeMessage(currentStrategy.avoidanceStrategy)}</span> between:
            <p id="group1-message">
                Group1/<span id="group1-location" className={this.props.classes.bold}>
                    {currentStrategy.fileName1} @ {currentStrategy.startLine1} – {currentStrategy.endLine1}
                    </span>
            </p>
            <p id="group2-message">
                Group2/<span id="group2-location" className={this.props.classes.bold}>
                    {currentStrategy.fileName2} @ {currentStrategy.startLine2} – {currentStrategy.endLine2}
                    </span>
            </p>
            <hr/>
        </>
    }

    /**
     * Returns the corresponding message for the plagiarism type
     * @param currentMethod The current strategy instance
     */
    renderPlagiarismTypeMessage(currentMethod: StrategyInstance) {
        if (currentMethod === StrategyInstance.changedCodeOrder) {
            return "changed code order"
        }
        if (currentMethod === StrategyInstance.movedCode) {
            return "moved code"
        }
        if (currentMethod === StrategyInstance.renamedVariable) {
            return "renamed variables"
        }
    }

    render() {
        var messageRender = <></>
        if (this.props.currentStrategies.length === 0) {
            messageRender = <div id="results-info-message" className={this.props.classes.startMessage}>
                Please select a portion of highlighted code to view more details!
            </div>
        } else {
            messageRender = <div id="results-info-message">
                    {this.props.currentStrategies.map((strategy: Strategy, index : number) => {
                        const key = `${strategy.avoidanceStrategy}-
                        ${index}-${strategy.fileName1}(${strategy.startLine1}, ${strategy.endLine1})
                        -${strategy.fileName2}(${strategy.startLine2}, ${strategy.endLine2})`
                        return (
                            <div key={key} id="strategy-message">{this.renderPlagiarismStrategyMessage(strategy)}</div>
                        ) 
                    })}
                </div>
        }
        return <>
            <h3>Result</h3>
            <div id="message-root" className={this.props.classes.column}>
                {messageRender}
            </div>
        </>
    }
}

export default withStyles(styles)(ResultsInformationColumn)