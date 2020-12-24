import AlgoSetUp from "./AlgoSetUp";
import AlgorithmComparator from "./Comparators";
import { METHOD_DECLARATION, PROPERTY_DECLARATION } from "./Constants";
import NodeWrapper from "./NodeWrapper";

//this should probably go in a different Util class
//flatten the AST then compare structure via levenshtein
export default class Similarity {

    /**
       * Compares two classes and calculates their similarity
       * 
       * @param class1 - a class node
       * @param class2 - a class node
       * @returns number - the similarity between both classes
       * 
       */
    static compareClasses(class1: NodeWrapper, class2: NodeWrapper): number {
        let methods1: NodeWrapper[] = AlgoSetUp.getByType(class1, METHOD_DECLARATION)
        let methods2: NodeWrapper[] = AlgoSetUp.getByType(class2, METHOD_DECLARATION)

        //compare the methods in each class to each other only
        AlgorithmComparator.compareMethodGroups(methods1, methods2);
        let methodSum = 0;
        let allMethods = methods1.concat(methods2)
        allMethods.forEach(method => methodSum += method.getWeight()) 
        let averageMethodScore = methodSum / allMethods.length;
        //set the method weights back to undefined for the next round 
        allMethods.forEach(method => method.setWeight(undefined))

        //Compare class1 varBlock to class2 varBlock 
        let propBlock1: NodeWrapper[] = AlgoSetUp.getByType(class1, PROPERTY_DECLARATION)
        let propBlock2: NodeWrapper[] = AlgoSetUp.getByType(class2, PROPERTY_DECLARATION)
        let varScore = AlgorithmComparator.comparePropBlock(propBlock1, propBlock2)

        //Calculate overall score saying if classes are similar
        //averageMethodScore and varscore are from 0 to 1
        console.log("methodscore, varscore", averageMethodScore, varScore)
        if (isNaN(varScore)) {
            return averageMethodScore; // there are no props
        } else {
            return ((averageMethodScore * 3) + varScore) / 4
        }
    }

    /**
      * Compares two methods and calculates their similarity
      * 
      * @param methodRoot1 - a method node
      * @param methodRoot2 - a method node
      * @returns number - the similarity between both method
      * 
      */
    static editDistanceMethod(methodRoot1: NodeWrapper, methodRoot2: NodeWrapper): number {
        let nodes1: string[] = methodRoot1.flatten().map(ast => ast.getType());
        let nodes2: string[] = methodRoot2.flatten().map(ast => ast.getType());
        let percentChange = Similarity.editDistanceWeighted(nodes1, nodes2);
        return percentChange

    }

    /**
      * Compares two lists of nodes and calculates their similarity
      * 
      * @param nodes1 - a list of a variety of type of nodes
      * @param nodes2 - a list of a variety of types of nodes
      * @returns number - the similarity between both lists
      * 
      */
    static editDistanceWeighted(nodes1: string[], nodes2: string[]): number {
        let rows = nodes1.length + 1
        let cols = nodes2.length + 1

        let distMatrix: number[][] = [];
        //initilaize the distance matrix 
        for (let row = 0; row < rows; row++) {
            distMatrix.push([])
            for (let col = 0; col < cols; col++) {
                distMatrix[row][col] = 0
            }
        }

        //fill the 0th row and 0th column 
        for (let row = 0; row < rows; row++) {
            distMatrix[row][0] = row
        }
        for (let col = 0; col < cols; col++) {
            distMatrix[0][col] = col
        }

        for (let col = 1; col < cols; col++) {
            for (let row = 1; row < rows; row++) {
                if (nodes1[row - 1] == nodes2[col - 1]) {
                    distMatrix[row][col] = distMatrix[row - 1][col - 1]
                } else {
                    let deletion = distMatrix[row - 1][col] + 1
                    let insertion = distMatrix[row][col - 1] + 1
                    let substitution = distMatrix[row - 1][col - 1] + 1
                    distMatrix[row][col] = Math.min(deletion, insertion, substitution)
                }

            }
        }
        let editDistance = distMatrix[rows - 1][cols - 1]
        let averageLength = Math.ceil((nodes1.length + nodes2.length) / 2)
        let percentChange = editDistance / Math.max(nodes1.length, nodes2.length)
        return percentChange
    }
}