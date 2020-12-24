import { List, ListItem, ListItemText, WithStyles, withStyles } from "@material-ui/core";

import React from "react";
import { MainContext } from "./MainContext";
import './App.css';

/**
 * Props for the result code list
 * @member fileList the list of files the user uploaded
 * @member passIndexBack call for parent to make to pass index data back to update the viewed file
 */
interface IProps extends WithStyles<typeof styles> {
    fileList: File[];
    passIndexBack: (index: number) => any;
}

/**
 * states for the result code list
 */
interface IState {}

/**
 * Styles for this component
 */
const styles = {
    list: {
        backgroundColor: '#3f51b5',
        width: '20%',
        height: '80vh',
        overflow: 'scroll',
        borderRadius: '5px 0px 0px 5px',
        boxShadow: `0px 2px 1px -1px rgba(0,0,0,0.2), 
        0px 1px 1px 0px rgba(0,0,0,0.14), 0px 1px 3px 0px rgba(0,0,0,0.12)`,

    },
    listText: {
        fontSize: '13px',
        color: '#fff'
    },
    button: {
        padding: '10px'
    }
  };

/**
 * The component that displays a file explorer of the files uploaded by the user
 */
export class ResultsCodeList extends React.Component<IProps, IState> {
    static contextType = MainContext;

    /**
     * Updates the file index 
     * which the parent will use to update the file view
     * @param index the given file index
     */
    changeFileView(index: number) {
        this.props.passIndexBack(index);
    }

    render() {
        return <div className={this.props.classes.list}>
            <List disablePadding={true}>
                {this.props.fileList.map((file: File, index: number) => {
                    return (
                        <ListItem button key={file.name} className={this.props.classes.button} onClick={() => this.changeFileView(index)}>
                            <ListItemText classes={{ primary : this.props.classes.listText}} primary={file.name} />
                        </ListItem>
                    )
                })}
            </List>
        </div>
    }
} 

export default withStyles(styles)(ResultsCodeList)

