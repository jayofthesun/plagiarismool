import { Input, WithStyles, withStyles } from "@material-ui/core";
import React from "react";

/**
 * Props for the file upload component
 * @member filesCallback function to pass uploaded files back to the parent component
 */
interface IProps extends WithStyles<typeof styles> {
  filesCallback: (files: File[]) => any;
}

/**
 * States for the file upload component
 * @member selectedFiles
 */
interface IState {
  selectedFile: File[]
}


/**
 * styles for this component
 */
const styles = {
  container: {
    height: '350px',
    background: 'white',
    padding: '15px',
    borderRadius: '5px',
    margin: '15px',
    overflow: 'scroll'
  }
};

/**
 * Component that represents the file groups upload button
 */
export class FileUploadComponent extends React.Component<IProps, IState> {
  constructor(props: IProps) {
    super(props)
    this.state = { selectedFile: [] };
  }

  /**
   * Updates the current uploaded files
   * @param event the targeted input element to get the files
   */
  handleChange(event: any): void {
    var newFiles: File[] = Array.from(event.target.files);
    this.setState({ selectedFile: newFiles });
    this.props.filesCallback(newFiles)
  }

  /**
   * Renders the data of the current uploaded files
   */
  fileData() {
    if (this.state.selectedFile.length !== 0) {
      return (
        <div>
          <h2>Uploaded files:</h2>
          {Array.from(this.state.selectedFile).map((file: File, index: number) => {
            if (index === this.state.selectedFile.length - 1) {
              return (
                <span className="file-name" key={file.name + index}>{file.name}</span>
              )
            } else {
              return (
                <span className="file-name" key={file.name + index}>{file.name}, </span>
              )
            }
          })}
        </div>
      );
    }
  };

  render() {
    return <div className={this.props.classes.container}>
      <Input type="file" inputProps={{ multiple: true, accept: ".js, .jsx, .ts, .tsx" }} onChange={this.handleChange.bind(this)} />
      {this.fileData()}
    </div>
  }
}


export default withStyles(styles)(FileUploadComponent);