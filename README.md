# Team 14 - Plagarism Detector - Tim

This application performs plagarism detection on 2 uploaded sets of JavaScript or Typescript code. The plagarism detection algorithm is based on the concept of Levenshtein distance (aka edit distance) and the usage of abstract syntax trees (ASTs). The ts-morph library which can be found here https://ts-morph.com/ was used to parse code into ASTs. Once files are uploaded, the percentage of code plagarized and all plagarized blocks of code will be displayed. Plagarism instances can be explored by clicking on the text highlighted as plagarized in red.

## Quick-Start How To Run

1. Run npm install on the project in the server and the client respectively.
2. Run npm start on the server folder.
3. Run npm start on the client folder.
4. Go to localhost:3000.
5. An upload screen should appear, upload your file and press submit. If you have multiple files you must select all the files and not the folder when you upload. (Note: The tool only accepts .ts, .js, .jsx, and .tsx files.)
6. Press start scan to run the plagiarism detection tool.
7. A screen should display with the results of the tool. Highlighted sections indicate instances of plagiarisms detected. If you click on a highlighted plagiarism instance it will show you the area of corresponding plagiarism by differentiating the other unrelated plagiarism instances in red. 
8. After clicking on an instance in the results sidebar, a list of detected plagiarism strategies will appear along with their corresponding files/line numbers.
If you’d like to rerun the tool for different files, simply press the back button to return to the upload page.

## Running Test Suite 

To run the tests in the server navigate to the server file and run the following command 

```
npm test
```
A code coverage report should print out in the console. 

To run the tests in the front end navigate to the front end folder and run the following command 

```
npm test
```
