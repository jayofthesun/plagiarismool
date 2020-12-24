import AlgoSetUp from './AlgoSetUp';
import AlgorithmComparator from './Comparators';
import NodeWrapper from './NodeWrapper';
import ResultReport from './ResultReport';
import {
    Node,
    ClassDeclaration
} from "ts-morph";
import DetectPlagStrategy from './DetectPlagStrategy'
import PlagiarismInstance from './PlagarismInstance';
import { FUNCTION_DECLARATION, METHOD_DECLARATION, CLASS_DECLARATION, INTERFACE_DECLARATION } from './Constants'

export default class AlgorithmController {
    private static algoController: AlgorithmController;
    private currentResult: ResultReport;
    private program1Groups: Map<String, NodeWrapper[]>; //program 1 info 
    private program2Groups: Map<String, NodeWrapper[]>; //program 2 info 

    constructor() {
        this.currentResult = new ResultReport();
    }

    /**
       * creates an instance of an algorithm controller
       * 
       * @returns an instance of an algorithm controller
       * 
       */
    static instance(): AlgorithmController {
        if (AlgorithmController.algoController == undefined) {
            AlgorithmController.algoController = new AlgorithmController()
        }
        return this.algoController;
    }

    /**
     * Compares two ASTs to see if they have the same content
     * @param program1AST - an AST of a program
     * @param program2AST - an AST of a program
     * @returns void
     * 
     */
    compareTree(program1AST: NodeWrapper, program2AST: NodeWrapper) {

        //create the groups for each wrapped tree 
        this.program1Groups = AlgoSetUp.createGroupTypes(program1AST);
        this.program2Groups = AlgoSetUp.createGroupTypes(program2AST);
        AlgorithmComparator.compareGroups(this.program1Groups, this.program2Groups);
        this.compileResults()

        //get only the high level nodes 
        let highLevelTypes : string[] = [METHOD_DECLARATION, CLASS_DECLARATION, FUNCTION_DECLARATION, INTERFACE_DECLARATION]
        let program1Nodes : NodeWrapper[] = []
        let program2Nodes : NodeWrapper[] = []
        highLevelTypes.forEach(type => { 
            let nodes1 : NodeWrapper[] = this.program1Groups.has(type) ? this.program1Groups.get(type) : []
            let nodes2 : NodeWrapper[] = this.program2Groups.has(type) ? this.program2Groups.get(type) : []
            program1Nodes = program1Nodes.concat(nodes1)
            program2Nodes = program2Nodes.concat(nodes2)

        });
        this.currentResult.setOverallPercentage(program1Nodes, program2Nodes);
    }

    /**
      * compiles results by creating plagiarism results and adding to result report
      * @returns void
      * 
      */
    private compileResults(): void {

        //go through all classes, and all methods, if lower then threshold create plagiarism instance 
        let functions1 = this.program1Groups.has(FUNCTION_DECLARATION) ? this.program1Groups.get(FUNCTION_DECLARATION) : [];
        let methods1 = this.program1Groups.has(METHOD_DECLARATION) ? this.program1Groups.get(METHOD_DECLARATION) : [];
        let allFuncMeth = functions1.concat(methods1)
        allFuncMeth.forEach(funcMeth => {
            if (funcMeth.getAllSimilarNodes().length != 0) {
                for(let similarNode of funcMeth.getAllSimilarNodes()) {
                let plagInstance = new PlagiarismInstance(funcMeth, similarNode)
                let strategy = DetectPlagStrategy.detectFunctionMethodStrategy(funcMeth, similarNode);
                plagInstance.setAvoidanceStrategy(strategy)
                this.currentResult.addPlgarismInstance(plagInstance);
                }
            }
        })
        
        let functions2 = this.program2Groups.has(FUNCTION_DECLARATION) ? this.program2Groups.get(FUNCTION_DECLARATION) : [];
        let methods2 = this.program2Groups.has(METHOD_DECLARATION) ? this.program2Groups.get(METHOD_DECLARATION) : [];
        let allFuncMeth2 = functions2.concat(methods2)
        allFuncMeth2.forEach(funcMeth => {
                for(let similarNode of funcMeth.getAllSimilarNodes()) {
                if (!this.currentResult.alreadyPresent(similarNode, funcMeth)) {

                let plagInstance = new PlagiarismInstance(similarNode, funcMeth)
                let strategy = DetectPlagStrategy.detectFunctionMethodStrategy(funcMeth, similarNode);
                plagInstance.setAvoidanceStrategy(strategy)
                this.currentResult.addPlgarismInstance(plagInstance);
                }
            }
        })

        //go through only classes in program 1 to prevent redundnacy 
        let classes1 = this.program1Groups.has(CLASS_DECLARATION) ? this.program1Groups.get(CLASS_DECLARATION) : [];
        let classes2 = this.program2Groups.has(CLASS_DECLARATION) ? this.program2Groups.get(CLASS_DECLARATION) : [];
        classes1.forEach(aClass => { 
            aClass.getAllSimilarNodes().forEach(buddy => { 
                let plagInstance = new PlagiarismInstance(aClass, buddy)
                let strategy = DetectPlagStrategy.isClassRenamed(aClass, buddy)
                plagInstance.setAvoidanceStrategy(strategy)
                this.currentResult.addPlgarismInstance(plagInstance);
            });
        });

        classes2.forEach(aClass => { 
            aClass.getAllSimilarNodes().forEach(buddy => { 
                if(!this.currentResult.alreadyPresent(buddy, aClass)) { 
                    let plagInstance = new PlagiarismInstance(buddy, aClass)
                    let strategy = DetectPlagStrategy.isClassRenamed(aClass, buddy)
                    plagInstance.setAvoidanceStrategy(strategy)
                    this.currentResult.addPlgarismInstance(plagInstance);
                }
            });
        });
        

        let interfaces1 = this.program1Groups.has(INTERFACE_DECLARATION) ? this.program1Groups.get(INTERFACE_DECLARATION) : [];
        interfaces1.forEach(aInterface => {
                for(let similarNode of aInterface.getAllSimilarNodes()) {
                    let plagInstance = new PlagiarismInstance(aInterface, similarNode)
                    let strategy = DetectPlagStrategy.detectFunctionMethodStrategy(aInterface, similarNode);
                    plagInstance.setAvoidanceStrategy(strategy)
                    this.currentResult.addPlgarismInstance(plagInstance);
                }
        })

        let interfaces2 = this.program2Groups.has(INTERFACE_DECLARATION) ? this.program2Groups.get(INTERFACE_DECLARATION) : [];
        interfaces2.forEach(aInterface => {
                for(let similarNode of aInterface.getAllSimilarNodes()) {
                    if (!this.currentResult.alreadyPresent(similarNode, aInterface)) {
                    let plagInstance = new PlagiarismInstance(similarNode, aInterface)
                    let strategy = DetectPlagStrategy.detectFunctionMethodStrategy(aInterface, similarNode);
                    plagInstance.setAvoidanceStrategy(strategy)
                    this.currentResult.addPlgarismInstance(plagInstance);
                    }
            }
        })
    }

    /**
       * Gets the result report 
       * 
       * @returns result report 
       * 
       */
    getResult(): ResultReport {
        return this.currentResult;
    }
}