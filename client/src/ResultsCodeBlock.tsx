import { Card, CardContent, withStyles, WithStyles} from "@material-ui/core";
import React from "react";
import './App.css';

/**
 * The props for the result code block
 * @member currentFile the file being viewed
 * @member highlightedLines all lines containing potential plagiarism
 * @member activeLines if any, the current selected lines of a plagiarism instance
 * @member lineDataCallback call for parent to make to pass line data back
 */
interface IProps extends WithStyles<typeof styles> {
    currentFile: File;
    highlightedLines: number[][] | undefined;
    activeLines : number[][] | undefined;
    lineDataCallback: (fileName: string, lineNumber: number) => any;
}

/**
 * States for the result code block
 * @member currentFileStringList the parsed file contents
 */
interface IState {
    currentFileStringList: string[];
}

/**
 * Styles for this component
 */
const styles = {
    codeBlock: {
        color: 'black',
        overflow: 'scroll',
        padding: '0px',
        height: '80vh',
        width: '80%',
        borderRadius: '0px 5px 5px 0px'
    },
    codeContent: {
        width: 'max-content'
    },
    lineNumber: {
        display: 'inline-block',
        width: '30px',
    },
    highlighted: {
        backgroundColor: 'rgba(255, 0 ,0 ,0.5)'
    },
    activeInstance: {
        backgroundColor: 'rgba(255, 230, 0, 0.5)'
    },
  };

/**
 * A Component that visually displays the file's code
 */
export class ResultsCodeBlock extends React.Component<IProps, IState> {
    private fileReader: FileReader | undefined;
    constructor(props: IProps) {
        super(props);
        this.state = {
            currentFileStringList: [],
        };
    }

    componentDidMount() {
        this.handleFile();
    }

    componentDidUpdate(nextProps: IProps) {
        if (this.props.currentFile !== nextProps.currentFile) {
            this.handleFile();
        }
    }

    /**
     * Updates the current file being viewed
     */
    handleFile() : void {
        this.readFile(this.props.currentFile)
    }

    /**
     * Renders the file contents into a readable string
     * @param file the given file
     */
    readFile(file: File) : void {
        this.fileReader = new FileReader();
        this.fileReader.onloadend = this.renderFileCode.bind(this);
        this.fileReader.readAsText(file);
    }

    /**
     * Parses file string into an array separate by lines
     */
    renderFileCode() :void {
        const content: string = String(this.fileReader?.result);
        let formattedContent: string[] = content.split("\n");
        this.setState({ currentFileStringList: formattedContent });
    }

    /**
     * Sets data to pass back to parent regarding which line of the file is clicked
     * @param fileName this file's name
     * @param lineNumber the line number that's clicked on
     */
    lineCallback = (fileName: string, lineNumber: number) => {
        this.props.lineDataCallback(fileName, lineNumber)
    }

    /**
     * helper function to determine if lines need highlighting 
     * @param lines the array of tuples
     * @param indexLine the index of the given line
     */
    highlightLines(lines : number[][] | undefined, indexLine : number) : boolean {
        var isHighlighted = false;
        if(lines) {
            for (var lineInstance of lines) {
                isHighlighted = isHighlighted || (lineInstance[0] <= indexLine && lineInstance[1] >= indexLine);
            }
        }
        return isHighlighted;
    }

    render() {
        return <Card id="code-block" className={this.props.classes.codeBlock} color="black">
            <CardContent id="code-block-content" className={this.props.classes.codeContent}>
                {this.state.currentFileStringList.map((codeLine: string, index: number) => {
                    const jsonIndex = index + 1;
                    var red = this.highlightLines(this.props.highlightedLines, jsonIndex);
                    var current = this.highlightLines(this.props.activeLines, jsonIndex);
                    const isRed = red ? (this.props.classes.highlighted  + " highlighted") : "";
                    const isCurrent =  current ? (this.props.classes.activeInstance + " active") : "";
                    return (
                        <div key={index} id="code-line" onClick={red ? () => this.lineCallback(this.props.currentFile.name, jsonIndex) : undefined} className={`${isRed} ${isCurrent}`}>
                            <span id="line-number" className={this.props.classes.lineNumber}>{jsonIndex}</span>
                            <code id="written-code">{codeLine}</code>
                        </div>
                    )
                })}
            </CardContent>
        </Card>

    }
}


export default withStyles(styles)(ResultsCodeBlock);

