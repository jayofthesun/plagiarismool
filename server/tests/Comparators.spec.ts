import { expect } from 'chai';
import AlgoSetUp from '../src/AlgoSetUp';
import AlgorithmComparator from '../src/Comparators';
import { CLASS_DECLARATION, INTERFACE_DECLARATION, METHOD_DECLARATION, PROPERTY_DECLARATION } from '../src/Constants';
import NodeWrapper from '../src/NodeWrapper';
import Similarity from '../src/Similarity';
import TestHelper from './TestHelper';


describe("Test Comparators - compareClasses", () => {
    
    it("test file with only 1 class that are plagraized", () => {
        let singleFileString : string = TestHelper.fileToString("/code-tests/single-files/multiple-classes/class1.ts")
        let fileTree : NodeWrapper = AlgoSetUp.constructPrunedTree(AlgoSetUp.stringFileToAst(singleFileString), "class1.ts")
        let classes = AlgoSetUp.getByType(fileTree, CLASS_DECLARATION)
        AlgorithmComparator.compareClasses([classes[0]], [classes[1]]);

        expect(classes[0].getAllSimilarNodes().length).to.equal(1)
        expect(classes[1].getAllSimilarNodes().length).to.equal(1)

        expect(classes[0].getAllSimilarNodes(), "similar node should be set").to.include(classes[1]) 
        expect(classes[1].getAllSimilarNodes(), "similar node should be set").to.include(classes[0]) 
    });

    it("test file with multiple classes in a program", () => {
        let singleFileString : string = TestHelper.fileToString("/code-tests/single-files/differentClasses.ts")
        let fileTree : NodeWrapper = AlgoSetUp.constructPrunedTree(AlgoSetUp.stringFileToAst(singleFileString), "differentClasses.ts")
        let classes = AlgoSetUp.getByType(fileTree, CLASS_DECLARATION)
        //class 1 and 2 are animals, class 0 and 3 are shapes
        AlgorithmComparator.compareClasses([classes[0], classes[1]], [classes[2], classes[3]]);

        expect(classes[0].getAllSimilarNodes().length).to.equal(1)
        expect(classes[3].getAllSimilarNodes().length).to.equal(1)

        expect(classes[0].getAllSimilarNodes()).to.include(classes[3])
        expect(classes[3].getAllSimilarNodes()).to.include(classes[0])

        expect(classes[1].getAllSimilarNodes().length).to.equal(1)
        expect(classes[2].getAllSimilarNodes().length).to.equal(1)

        expect(classes[1].getAllSimilarNodes()).to.include(classes[2])
        expect(classes[2].getAllSimilarNodes()).to.include(classes[1])
        
    });
});  

describe("Test Comparators - compareInterfaces", () => {
    it("test programs with 1 interface", () => {
        let iterator1String : string = TestHelper.fileToString("/code-tests/single-files/interface/IIterator1.ts")
        let iterator1Tree : NodeWrapper = AlgoSetUp.constructPrunedTree(AlgoSetUp.stringFileToAst(iterator1String), "IIterator1.ts")
        let iterator2String : string = TestHelper.fileToString("/code-tests/single-files/interface/IIterator2.ts")
        let iterator2Tree : NodeWrapper = AlgoSetUp.constructPrunedTree(AlgoSetUp.stringFileToAst(iterator2String), "IIterator2.ts")
        let iterator1 : NodeWrapper = AlgoSetUp.getByType(iterator1Tree, INTERFACE_DECLARATION)[0]
        let iterator2 : NodeWrapper = AlgoSetUp.getByType(iterator2Tree, INTERFACE_DECLARATION)[0]
        AlgorithmComparator.compareInterfaces([iterator1], [iterator2])
        
        expect(iterator1.getAllSimilarNodes()).to.include(iterator2) 
        expect(iterator2.getAllSimilarNodes()).to.include(iterator1)
    });

    it("test programs with 2 interfaces each", () => {
        let singleFileString : string = TestHelper.fileToString("/code-tests/single-files/differentInterfaces.ts")
        let fileTree : NodeWrapper = AlgoSetUp.constructPrunedTree(AlgoSetUp.stringFileToAst(singleFileString), "differentInterfaces.ts")
        let interfaces = AlgoSetUp.getByType(fileTree, INTERFACE_DECLARATION)

        AlgorithmComparator.compareInterfaces([interfaces[0], interfaces[1]], [interfaces[2], interfaces[3]])
        
        //0 and 3 are animal, 1 and 2 are shape
        expect(interfaces[0].getAllSimilarNodes().length).to.equal(1)
        expect(interfaces[3].getAllSimilarNodes().length).to.equal(1)

        expect(interfaces[0].getAllSimilarNodes()).to.include(interfaces[3])
        expect(interfaces[3].getAllSimilarNodes()).to.include(interfaces[0])

        expect(interfaces[1].getAllSimilarNodes().length).to.equal(1)
        expect(interfaces[2].getAllSimilarNodes().length).to.equal(1)

        expect(interfaces[1].getAllSimilarNodes()).to.include(interfaces[2])
        expect(interfaces[2].getAllSimilarNodes()).to.include(interfaces[1])
    });
}); 

describe("Test Comparators - compareMethods", () => {
    it("test program 1 with method that are not similar", () => {
        let singleFileString : string = TestHelper.fileToString("/code-tests/single-files/differentClasses.ts")
        let fileTree : NodeWrapper = AlgoSetUp.constructPrunedTree(AlgoSetUp.stringFileToAst(singleFileString), "differentClasses.ts")
        let methods = AlgoSetUp.getByType(fileTree, METHOD_DECLARATION)
        AlgorithmComparator.compareMethodGroups([methods[0]], [methods[1]]);
        
        expect(methods[0].getWeight()).to.not.be.undefined
        expect(methods[0].getAllSimilarNodes().length).to.equal(0) 

        expect(methods[1].getWeight()).to.not.be.undefined
        expect(methods[1].getAllSimilarNodes().length).to.equal(0)
    });

    it("test program 2 with methods each - some are plagarized", () => {
        let singleFileString : string = TestHelper.fileToString("/code-tests/single-files/differentClasses.ts")
        let fileTree : NodeWrapper = AlgoSetUp.constructPrunedTree(AlgoSetUp.stringFileToAst(singleFileString), "differentClasses.ts")
        let methods = AlgoSetUp.getByType(fileTree, METHOD_DECLARATION)
        //0 and 5 are shape method, 1 and 3 are makeNoise
        AlgorithmComparator.compareMethodGroups([methods[0], methods[1]], [methods[3], methods[5]]);
        let badScore : number = Similarity.editDistanceMethod(methods[0], methods[3])
        let animalScore : number = Similarity.editDistanceMethod(methods[1], methods[3]) 
        let shapeScore : number = Similarity.editDistanceMethod(methods[0], methods[5])
        
        expect(methods[0].getWeight()).to.equal(shapeScore)
        expect(methods[5].getWeight()).to.equal(shapeScore)

        expect(methods[0].getAllSimilarNodes()).to.include(methods[5])
        expect(methods[5].getAllSimilarNodes()).to.include(methods[0])

        expect(methods[0].getWeight()).to.be.lessThan(badScore)
        expect(methods[5].getWeight()).to.be.lessThan(badScore)

        expect(methods[1].getWeight()).to.equal(animalScore)
        expect(methods[3].getWeight()).to.equal(animalScore)

        expect(methods[1].getAllSimilarNodes()).to.include(methods[3])
        expect(methods[3].getAllSimilarNodes()).to.include(methods[1])

        expect(methods[1].getWeight()).to.be.lessThan(badScore)
        expect(methods[3].getWeight()).to.be.lessThan(badScore)

    });
}); 

describe("Test Comparators - comparePropBlock", () => {
    it("compare 2 prop blocks", () => {
        let singleFileString : string = TestHelper.fileToString("/code-tests/single-files/differentClasses.ts")
        let fileTree : NodeWrapper = AlgoSetUp.constructPrunedTree(AlgoSetUp.stringFileToAst(singleFileString), "differentClasses.ts")
        let classes = AlgoSetUp.getByType(fileTree, CLASS_DECLARATION)
        let props : Array<Array<NodeWrapper>> = classes.map(aClass => AlgoSetUp.getByType(aClass, PROPERTY_DECLARATION))
        //prop 0 and 3 are shape, 1 and 2 are animal 

        let badScore = AlgorithmComparator.comparePropBlock(props[0], props[1])
        let shapeScore = AlgorithmComparator.comparePropBlock(props[0], props[3])
        let animalScore = AlgorithmComparator.comparePropBlock(props[1], props[2])

        expect(shapeScore).to.be.lessThan(badScore); 
        expect(animalScore).to.be.lessThan(badScore); 
    });
}); 
