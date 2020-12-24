
import axios from 'axios';
import Result  from './objects/Result';

/**
 * Class to deal with server calls
 */
export class DataService {
  /**
   * Gets the plagiarism result data from the server
   */
  public static getResult(): Promise<Result> {
    return axios.get<Result>('http://localhost:3001/results')
      .catch((error: Error): any  => {
        console.error('Something went wrong: ', error.message);
        return { data: [] };
      });
  }
  /**
   * uploaded files to the server end point
   * @param files the files to pass onto the server 
   */
  public static addFiles(files: FormData) {
    return axios.post<FormData>('http://localhost:3001/file', files)
      .catch((error: Error): any  => {
        console.error('Something went wrong: ', error.message);
        return { data: [] };
      });
  }
}
