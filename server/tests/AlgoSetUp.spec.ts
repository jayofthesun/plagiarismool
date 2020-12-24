import { expect } from 'chai';
import { Node, SyntaxKind} from 'ts-morph';
import AlgoSetUp from '../src/AlgoSetUp';
import { CLASS_DECLARATION, EXPRESSION_STATEMENT, FUNCTION_DECLARATION, INTERFACE_DECLARATION, METHOD_DECLARATION, METHOD_SIGNATURE, PROPERTY_DECLARATION, RETURN_STATEMENT, VARIABLE_DECLARATION, VARIABLE_STATEMENT } from '../src/Constants';
import NodeWrapper from '../src/NodeWrapper';
import TestHelper from './TestHelper';

describe("Test AlgoSetUp - createProgramAST - the conversion of an entire program into a pruned AST", () => {
    it("test program with 1 file - sentinel should have 1 child", () => {
        let singleFileString : string = TestHelper.fileToString("/code-tests/single-files/interface/IIterator1.ts")
        let sentinel : NodeWrapper = AlgoSetUp.createProgramAST([singleFileString], ["IIterator1.ts"])
        let fileTree : NodeWrapper = AlgoSetUp.constructPrunedTree(AlgoSetUp.stringFileToAst(singleFileString), "IIterator1.ts")
        expect(sentinel.getChildren().length, "program has 1 file so sentinel has 1 child").to.equal(1)
        expect(TestHelper.isWrappedTreeSame(sentinel.getChildren()[0], fileTree), "sentinel child and file tree are equal").to.be.true
    });

    it("test program with multiple files - sentinel should have many children", () => {
        let iterator1 : string = TestHelper.fileToString("/code-tests/single-files/interface/IIterator1.ts")
        let iterator2 : string = TestHelper.fileToString("/code-tests/single-files/interface/IIterator2.ts")
        let sorter1 : string = TestHelper.fileToString("/code-tests/single-files/sorter/Sorter1.ts")
        
        let sentinel : NodeWrapper = AlgoSetUp.createProgramAST([iterator1, iterator2, sorter1], ["IIterator1.ts", "Iterator2.ts",  "sorter1.ts"])

        let iterator1Tree : NodeWrapper = AlgoSetUp.constructPrunedTree(AlgoSetUp.stringFileToAst(iterator1), "IIterator1.ts")
        let iterator2Tree : NodeWrapper = AlgoSetUp.constructPrunedTree(AlgoSetUp.stringFileToAst(iterator2), "IIterator1.ts")
        let sorter1Tree : NodeWrapper = AlgoSetUp.constructPrunedTree(AlgoSetUp.stringFileToAst(sorter1), "IIterator1.ts")

        expect(sentinel.getChildren().length, "program has 3 files so 3 children").to.equal(3)
        expect(TestHelper.isWrappedTreeSame(sentinel.getChildren()[0], iterator1Tree), "sentinel's first child should be iterator 1 AST").to.be.true; 
        expect(TestHelper.isWrappedTreeSame(sentinel.getChildren()[1], iterator2Tree), "sentinel's second child should be iterator 2 AST").to.be.true; 
        expect(TestHelper.isWrappedTreeSame(sentinel.getChildren()[2], sorter1Tree), "sentinel's third child should be sorter 1 AST").to.be.true; 
    
    });

    
}); 

describe("Test AlgoSetUp - getPropTypeList - gets the property types", () => {
    it("test a file with a class with 4 properties", () => {
        let classPropsString : string = TestHelper.fileToString("/code-tests/single-files/classProperties.ts")
        let prunedTree : NodeWrapper = AlgoSetUp.constructPrunedTree(AlgoSetUp.stringFileToAst(classPropsString), "classProperties.ts")
        let props = AlgoSetUp.getByType(prunedTree, PROPERTY_DECLARATION); 
        let propTypesList = AlgoSetUp.getPropTypeList(props); 
        let expected = ["StringKeyword",  "BooleanKeyword", "NumberKeyword", "PROPERTY_UNKNOWN_TYPE"]
        expect(propTypesList).to.have.ordered.members(expected);
    });

    it("test a file with no classes and properties", () => {
        let iterator1 : string = TestHelper.fileToString("/code-tests/single-files/interface/IIterator1.ts")
        let prunedTree : NodeWrapper = AlgoSetUp.constructPrunedTree(AlgoSetUp.stringFileToAst(iterator1), "IIterator1.ts")
        let props = AlgoSetUp.getByType(prunedTree, PROPERTY_DECLARATION); 
        let propTypesList = AlgoSetUp.getPropTypeList(props); 
        expect(propTypesList.length).to.equal(0)
    });
}); 

describe("Test AlgoSetUp - getByType - filters all nodes in the tree by a given node type", () => {
    it("returns a list of nodes with the matching type", () => {
        let class1 : string = TestHelper.fileToString("/code-tests/single-files/multiple-classes/class1.ts")
        let prunedTree :  NodeWrapper = AlgoSetUp.constructPrunedTree(AlgoSetUp.stringFileToAst(class1), "class1.ts")
        let classes : NodeWrapper[] = AlgoSetUp.getByType(prunedTree, CLASS_DECLARATION)
        let methods : NodeWrapper[] = AlgoSetUp.getByType(prunedTree, METHOD_DECLARATION)
        expect(classes.length, "file has 2 classes").to.equal(2)
        expect(methods.length, "file has 2 methods").to.equal(2)
        classes.forEach(aClass => { 
            expect(aClass.getType(), "type should be class_declaration").to.equal(CLASS_DECLARATION)
        })
        methods.forEach(method => { 
            expect(method.getType(), "type should be method_declaration").to.equal(METHOD_DECLARATION)
        })
    });

    it("returns empty list because no nodes of the desired type exist", () => {
        let class1 : string = TestHelper.fileToString("/code-tests/single-files/multiple-classes/class1.ts")
        let prunedTree :  NodeWrapper = AlgoSetUp.constructPrunedTree(AlgoSetUp.stringFileToAst(class1), "class1.ts")
        let interfaces : NodeWrapper[] = AlgoSetUp.getByType(prunedTree, INTERFACE_DECLARATION)
        expect(interfaces.length, "file has 0 interfaces").to.equal(0)
    });

}); 

describe("Test AlgoSetUp - createGroupTypes - creates a map of nodeType to a list of nodes", () => {
    it("test on files with classes and methods", () => {
        let class1 : string = TestHelper.fileToString("/code-tests/single-files/multiple-classes/class1.ts")
        let prunedTree :  NodeWrapper = AlgoSetUp.constructPrunedTree(AlgoSetUp.stringFileToAst(class1), "class1.ts")
        let map : Map<String, Array<NodeWrapper>> = AlgoSetUp.createGroupTypes(prunedTree)

        expect(Array.from(map.keys()), "file and map should only have methods and classes").to.have.members([METHOD_DECLARATION, CLASS_DECLARATION])
        expect(Array.from(map.keys()), "file and map should not have functions and interfaces").to.not.have.members([FUNCTION_DECLARATION, INTERFACE_DECLARATION])
       
        expect(map.get(METHOD_DECLARATION).length, "file only has 2 methods").to.equal(2)
        expect(map.get(CLASS_DECLARATION).length, "file only has 2 classes").to.equal(2)

        map.get(METHOD_DECLARATION).forEach(node => {
            expect(node.getType(), "should be a method").to.equal(METHOD_DECLARATION)
        });
        map.get(CLASS_DECLARATION).forEach(node => {
            expect(node.getType(), "should be a class").to.equal(CLASS_DECLARATION)
        });
        
    });

    it("test on files with functions only", () => {
        let functions1 : string = TestHelper.fileToString("/code-tests/single-files/moved-functions/file1.js")
        let prunedTree :  NodeWrapper = AlgoSetUp.constructPrunedTree(AlgoSetUp.stringFileToAst(functions1), "file1.js")
        let map : Map<String, Array<NodeWrapper>> = AlgoSetUp.createGroupTypes(prunedTree)

        expect(Array.from(map.keys()), "file and map should only have functions").to.have.members([FUNCTION_DECLARATION])
        expect(Array.from(map.keys()), "file and map sbould not have methods, classes, and interfaces").to.not.have.members([METHOD_DECLARATION,CLASS_DECLARATION, INTERFACE_DECLARATION])
       
        expect(map.get(FUNCTION_DECLARATION).length).to.equal(16)

        map.get(FUNCTION_DECLARATION).forEach(node => {
            expect(node.getType(), "node type should be function").to.equal(FUNCTION_DECLARATION)
        });
    });

    it("test on files with interfaces only", () => {
        let functions1 : string = TestHelper.fileToString("/code-tests/single-files/interface/IIterator1.ts")
        let prunedTree :  NodeWrapper = AlgoSetUp.constructPrunedTree(AlgoSetUp.stringFileToAst(functions1), "IIterator1.ts")
        let map : Map<String, Array<NodeWrapper>> = AlgoSetUp.createGroupTypes(prunedTree)

        expect(Array.from(map.keys()), "file and map should only have interfaces").to.have.members([INTERFACE_DECLARATION])
        expect(Array.from(map.keys()), "file and map sbould not have methods, classes, and functions").to.not.have.members([METHOD_DECLARATION,CLASS_DECLARATION, FUNCTION_DECLARATION])
       
        expect(map.get(INTERFACE_DECLARATION).length).to.equal(1)

        map.get(INTERFACE_DECLARATION).forEach(node => {
            expect(node.getType(), "node type should be interface").to.equal(INTERFACE_DECLARATION)
        });
    });
}); 

describe("Test AlgoSetUp - constructPrunedTree and its helper - creates a pruned wrapped tree", () => {
    it("test classes, methods, and return statements are kept", () => {
        let fileString : string = TestHelper.fileToString("/code-tests/single-files/multiple-classes/class1.ts")
        let morphNode : Node = AlgoSetUp.stringFileToAst(fileString); 
        let wrappedNode : NodeWrapper = AlgoSetUp.constructPrunedTree(morphNode, "class1.ts")
        let classes : NodeWrapper[] = AlgoSetUp.getByType(wrappedNode, CLASS_DECLARATION)
        let methods : NodeWrapper[] = AlgoSetUp.getByType(wrappedNode, METHOD_DECLARATION)
        let returns : NodeWrapper[] = AlgoSetUp.getByType(wrappedNode, RETURN_STATEMENT)  
        expect(classes.length, "file has 2 classes").to.equal(2)  
        expect(methods.length, "file has 2 methods").to.equal(2) 
        expect(returns.length, "file has 2 return statements").to.equal(2)  

    });

    it("test function declarations are kept", () => {
        let fileString : string = TestHelper.fileToString("/code-tests/single-files/moved-functions/file1.js")
        let morphNode : Node = AlgoSetUp.stringFileToAst(fileString); 
        let wrappedNode : NodeWrapper = AlgoSetUp.constructPrunedTree(morphNode, "file1.ts")
        let functions : NodeWrapper[] = AlgoSetUp.getByType(wrappedNode, FUNCTION_DECLARATION)
        expect(functions.length, "file has 16 functions").to.equal(16)  
    });

    it("test property declarations are kept", () => {
        let fileString : string = TestHelper.fileToString("/code-tests/single-files/classProperties.ts")
        let morphNode : Node = AlgoSetUp.stringFileToAst(fileString); 
        let wrappedNode : NodeWrapper = AlgoSetUp.constructPrunedTree(morphNode, "classProperties.ts")
        let props : NodeWrapper[] = AlgoSetUp.getByType(wrappedNode, PROPERTY_DECLARATION)
        expect(props.length, "file has a single class with 4 propertie").to.equal(4) 
    });

    
    it("test interface declarations and their method signatures are kept", () => {
        let fileString : string = TestHelper.fileToString("/code-tests/single-files/interface/IIterator1.ts")
        let morphNode : Node = AlgoSetUp.stringFileToAst(fileString); 
        let wrappedNode : NodeWrapper = AlgoSetUp.constructPrunedTree(morphNode, "IIterator1.ts")
        let interfaces : NodeWrapper[] = AlgoSetUp.getByType(wrappedNode, INTERFACE_DECLARATION)
        let methodSigs : NodeWrapper[] = AlgoSetUp.getByType(wrappedNode, METHOD_SIGNATURE)
        expect(interfaces.length, "file has 1 interface").to.equal(1)
        expect(methodSigs.length, "file has 2 method signatures").to.equal(2)
    });

    it("test variable statement, variable declaration, and expression statements are kept", () => {
        let fileString : string = TestHelper.fileToString("/code-tests/single-files/classProperties.ts")
        let morphNode : Node = AlgoSetUp.stringFileToAst(fileString); 
        let wrappedNode : NodeWrapper = AlgoSetUp.constructPrunedTree(morphNode, "classProperties.ts")
        let variableDeclaration : NodeWrapper[] = AlgoSetUp.getByType(wrappedNode, VARIABLE_DECLARATION)
        let variableStatement : NodeWrapper[] = AlgoSetUp.getByType(wrappedNode, VARIABLE_STATEMENT)
        let expressionStatement : NodeWrapper[] = AlgoSetUp.getByType(wrappedNode, EXPRESSION_STATEMENT)

        expect(variableDeclaration.length, "file has 3 variable declaration").to.equal(3)
        expect(variableStatement.length, "file has 3 variable statement").to.equal(3)
        expect(expressionStatement.length, "file has 6 expression statement").to.equal(6)
        
    });

    it("test that file name is set correctly", () => {
        let fileString : string = TestHelper.fileToString("/code-tests/single-files/interface/IIterator1.ts")
        let morphNode : Node = AlgoSetUp.stringFileToAst(fileString); 
        let wrappedNode : NodeWrapper = AlgoSetUp.constructPrunedTree(morphNode, "IIterator1.ts")
        wrappedNode.flatten().forEach(node => { 
            expect(node.getFileName()).to.equal("IIterator1.ts")
        })
    });
    //TODO TEST IF TREE STRUCTURE IS AS EXPECTED?
}); 

describe("Test AlgoSetuUp - stringFileToAst - converts a string into a tsmorph AST", () => {
    it("test that a tree with a SourceFile and EndOfFileToken is created", () => {
        let fileString : string = TestHelper.fileToString("/code-tests/single-files/multiple-classes/class1.ts")
        let morphNode : Node = AlgoSetUp.stringFileToAst(fileString); 
        let endFileNodes : Node[] = morphNode.getDescendantsOfKind(SyntaxKind.EndOfFileToken)
        let allDescendants : Node [] = morphNode.getDescendants()
        expect(morphNode.getKindName(), "needs 1 source file node").to.equal("SourceFile")
        expect(endFileNodes.length,  "needs 1 end file token").to.equal(1)
        expect(allDescendants.length, "less than 2 descendants").to.be.greaterThan(2)
    });

    it("test an empty file", () => {
        let fileString : string = TestHelper.fileToString("/code-tests/single-files/emptyFile.ts")
        let morphNode : Node = AlgoSetUp.stringFileToAst(fileString);
        let endFileNodes : Node[] = morphNode.getDescendantsOfKind(SyntaxKind.EndOfFileToken)
        let allDescendants : Node [] = morphNode.getDescendants()
        expect(morphNode.getKindName(), "needs 1 source file node").to.equal("SourceFile")
        expect(endFileNodes.length,  "needs 1 end file token").to.equal(1)
        expect(allDescendants.length, "2 descendants").to.equal(2)
    });
}); 
