import { expect } from 'chai';
import AlgoSetUp from '../src/AlgoSetUp';
import { CLASS_DECLARATION, FUNCTION_DECLARATION, METHOD_DECLARATION } from '../src/Constants';
import DetectPlagStrategy from '../src/DetectPlagStrategy';
import { Strategy } from '../src/enums/Strategy';
import NodeWrapper from '../src/NodeWrapper';
import TestHelper from './TestHelper';

 describe("Test DetectPlagStrategy isClassRenamed ", () => {
    it("test classes that have been renamed", () => {
        let singleFileString : string = TestHelper.fileToString("/code-tests/single-files/multiple-classes/class1.ts")
        let fileTree : NodeWrapper = AlgoSetUp.constructPrunedTree(AlgoSetUp.stringFileToAst(singleFileString), "class1.ts")
        let classes = AlgoSetUp.getByType(fileTree, CLASS_DECLARATION)
        let strategy = DetectPlagStrategy.isClassRenamed(classes[0], classes[1]); 
        expect(strategy).to.equal(Strategy.renamedVariable)

    });
    it("test classes that have not been renamed", () => {
        let singleFileString : string = TestHelper.fileToString("/code-tests/single-files/multiple-classes/class1.ts")
        let fileTree : NodeWrapper = AlgoSetUp.constructPrunedTree(AlgoSetUp.stringFileToAst(singleFileString), "class1.ts")
        let classes = AlgoSetUp.getByType(fileTree, CLASS_DECLARATION)
        let strategy = DetectPlagStrategy.isClassRenamed(classes[0], classes[0]); 
        expect(strategy).to.equal(Strategy.changedCodeOrder)
    });
}); 

describe("Test DetectPlagStrategy isFunctionAMethod - checks code movement", () => {
    it("test method moved out as a function", () => {
        let singleFileString : string = TestHelper.fileToString("/code-tests/single-files/functionMethod.ts")
        let fileTree : NodeWrapper = AlgoSetUp.constructPrunedTree(AlgoSetUp.stringFileToAst(singleFileString), "functionMethod.ts")
        let methods = AlgoSetUp.getByType(fileTree, METHOD_DECLARATION)
        let functions = AlgoSetUp.getByType(fileTree, FUNCTION_DECLARATION)
        let strategy = DetectPlagStrategy.detectFunctionMethodStrategy(functions[0], methods[0])
        expect(strategy).to.equal(Strategy.movedCode)
    });

    it("test method renamed", () => {
        let singleFileString : string = TestHelper.fileToString("/code-tests/single-files/functionMethod.ts")
        let fileTree : NodeWrapper = AlgoSetUp.constructPrunedTree(AlgoSetUp.stringFileToAst(singleFileString), "functionMethod.ts")
        let methods = AlgoSetUp.getByType(fileTree, METHOD_DECLARATION)
        let strategy = DetectPlagStrategy.detectFunctionMethodStrategy(methods[0], methods[1])
        expect(strategy).to.equal(Strategy.renamedVariable)
    });

    it("test function renamed", () => {
        let singleFileString : string = TestHelper.fileToString("/code-tests/single-files/functionMethod.ts")
        let fileTree : NodeWrapper = AlgoSetUp.constructPrunedTree(AlgoSetUp.stringFileToAst(singleFileString), "functionMethod.ts")
        let functions = AlgoSetUp.getByType(fileTree, FUNCTION_DECLARATION)
        let strategy = DetectPlagStrategy.detectFunctionMethodStrategy(functions[0], functions[1])
        expect(strategy).to.equal(Strategy.renamedVariable)
    });

    it("test no renaming or code movement", () => {
        let singleFileString : string = TestHelper.fileToString("/code-tests/single-files/functionMethod.ts")
        let fileTree : NodeWrapper = AlgoSetUp.constructPrunedTree(AlgoSetUp.stringFileToAst(singleFileString), "functionMethod.ts")
        let functions = AlgoSetUp.getByType(fileTree, FUNCTION_DECLARATION)
        let strategy = DetectPlagStrategy.detectFunctionMethodStrategy(functions[0], functions[0])
        expect(strategy).to.equal(Strategy.changedCodeOrder)
    });
}); 