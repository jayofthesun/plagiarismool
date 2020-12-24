
import React from "react";
import FileUploadComponent from './FileUploadComponent';
import { Button, Grid, WithStyles, withStyles } from '@material-ui/core';
import { MainContext } from "./MainContext";
import { RouteComponentProps, withRouter } from "react-router-dom";
import { DataService } from "./DataService";
import LoadingOverlay from 'react-loading-overlay';

/**
 * Props for the upload component
 */
interface IProps extends RouteComponentProps, WithStyles<typeof styles> { }

/**
 * State for the upload component
 * @member uploadedFiles pair of file groups the user uploaded
 * @member disabledButton checks if the button should be enabled or disabled
 * @member isLoading checks whether or not the loading bar should shows up
 */
interface IState {
  uploadedFiles: File[][];
  disabledButton: boolean;
  isLoading: boolean;
}

/**
 * styles for this component
 */
const styles = {
  title: {
    marginTop: '2%',
    marginLeft: '4%'
  },
  gridContainer: {
    padding: '2% 4%'
  }
};

/**
 * The upload component page, the controller for the upload side of this react app
 */
export class UploadComponent extends React.Component<IProps, IState> {
  static contextType = MainContext;

  constructor(props: IProps) {
    super(props);
    this.state = {
      uploadedFiles: [[], []],
      disabledButton: true,
      isLoading: false
      
    };
  }

  /**
   * Sets the state of the selected files specfically on the upload page.
   * 
   * @param file The files that are being uploaded.
   */
  updateFiles(values: File[], index: number) {
    const newUploadedFiles = this.state.uploadedFiles;
    newUploadedFiles[index] = values;
    this.setState({ uploadedFiles: newUploadedFiles });
    this.updateButton();
  }

  /**
   * Pushes the updated state to the list
   * Since setting state is asyncronous, this has to be a separate function that launches post state set.
   */
  updateButton() {
    var hasItems = true;
    for (const fileGroup of this.state.uploadedFiles) {
      hasItems = ((fileGroup.length !== 0) && hasItems);
    }
    this.setState({ disabledButton: !hasItems })
  }

  /**
   * Sets the data of files into a formdata to send to API endpoint
   */
  onFileUpload() {
    this.setState({ isLoading: true })

    // Create an object of formData 
    if (this.state.uploadedFiles[0] === undefined || this.state.uploadedFiles[1] === undefined) {
      throw new Error("Invalid file upload")
    } else {
      const formData = new FormData();
      const newFileList1: File[] = [];
      const newFileList2: File[] = [];

      //For list 1
      for (let i = 0; i < this.state.uploadedFiles[0].length; i++) {
        const currentFile = this.state.uploadedFiles[0][i];
        formData.append(
          "program1",
          currentFile,
          currentFile.name
        );
        newFileList1.push(currentFile)

      }
      //For list 2
      for (let i = 0; i < this.state.uploadedFiles[1].length; i++) {
        const currentFile = this.state.uploadedFiles[1][i];
        formData.append(
          "program2",
          currentFile,
          currentFile.name
        );
        newFileList2.push(currentFile)
      }

      //API end point call
      DataService.addFiles(formData).then((response: any) => {
        const newFileLists = [newFileList1, newFileList2]
        this.context.setFileGroups(newFileLists);
        this.setState({ isLoading: false })
        this.props.history.push('/results');
      });
    }
  };


  render() {
    return <LoadingOverlay
      active={this.state.isLoading}
      spinner
      styles={{ wrapper: { position: "inherit" } }}
      text='Hang on...your files are being scanned!'>
      <section className="upload-body">
        <div className={this.props.classes.title}>
          <h1>Typescript Plagiarism Detector</h1>
          <p>Helps detect potential plagiarism files for .js, .jsx, .ts, and .tsx files</p>
        </div>
        <Grid
          container
          direction="row"
          justify="space-evenly"
          className={this.props.classes.gridContainer}
        >
          <Grid item xs={12}>
            <h3>First, upload your two groups of files:</h3>
          </Grid>
          <Grid item xs={5}>
            <FileUploadComponent filesCallback={(files: File[]) => this.updateFiles(files, 0)} />
          </Grid>
          <Grid item xs={5}>
            <FileUploadComponent filesCallback={(files: File[]) => this.updateFiles(files, 1)} />
          </Grid>
          <Grid item xs={12}>
            <h3>Next, start scan!</h3>
          </Grid>
          <Grid item xs={12}>
            <Button variant="contained"
              color="primary"
              disabled={this.state.disabledButton}
              onClick={this.onFileUpload.bind(this)}>
              Start Scan!
          </Button>
          </Grid>
        </Grid>
      </section >
    </LoadingOverlay>
  }
}

export default withStyles(styles)(withRouter(UploadComponent));