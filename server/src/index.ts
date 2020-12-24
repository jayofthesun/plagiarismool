
import * as express from 'express';
import * as fileUpload from 'express-fileupload';
import TestHelper from '../tests/TestHelper';
import AlgorithmController from './AlgorithmController';
import AlgoSetUp from './AlgoSetUp' 
import NodeWrapper from "./NodeWrapper";

let algoController: AlgorithmController;

const app: express.Application = express();

app.use(express.json({type: 'json'}));

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Methods", "*");
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  next();
});

app.use(fileUpload());

app.post('/file', (req, res) => {
  const fileList1 : string[] = []; 
  const fileNames1 : string [] = [];
  const fileList2 : string[] = []; 
  const fileNames2 : string [] = [];
  if (Object.keys(req.files.program1).includes("data")) { 
    fileList1.push(req.files.program1.data.toString());
    fileNames1.push(req.files.program1.name)
  } else {
    for(const [key, value] of Object.entries(req.files.program1)) { 
      fileList1.push(value.data.toString())
      fileNames1.push(value.name)
    }
  }

  if (Object.keys(req.files.program2).includes("data")) { 
    fileList2.push(req.files.program2.data.toString());
    fileNames2.push(req.files.program2.name)
  } else {
    for(const [key, value] of Object.entries(req.files.program2)) { 
      fileList2.push(value.data.toString())
      fileNames2.push(value.name)
    }
  }
  algoController = new AlgorithmController(); 
  let program1Sentinel : NodeWrapper = AlgoSetUp.createProgramAST(fileList1, fileNames1)
  let program2Sentinel : NodeWrapper = AlgoSetUp.createProgramAST(fileList2, fileNames2)
  algoController.compareTree(program1Sentinel, program2Sentinel)
  
  res.status(200).send("File uploaded succesfully")
});

app.get('/results', (req, res) => {
  let results : Object = algoController.getResult().getJson(); 
  res.status(200).send(results);
});


/* 
  Catch all route which matches any type of request on any route.
  Returns 404 not found.

  IMPORTANT: Express routes are checked sequentially and and first matching handlers is the one to respond.
            Always keep this last or all requests will result in a 404 error.

*/
app.all('*', (req, res) => {
  res.status(404).send('Not Found!')
});

app.listen('3001', () => {
  console.log('server running on localhost:3001/');
});


