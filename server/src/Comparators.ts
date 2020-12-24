import NodeWrapper from "./NodeWrapper";
import Similarity from "./Similarity";
import { CLASS_DECLARATION, CLASS_THRESHOLD, FUNCTION_DECLARATION, FUNCTION_METHOD_THRESHOLD, INTERFACE_DECLARATION, INTERFACE_THRESHOLD, METHOD_DECLARATION } from "./Constants";
import AlgoSetUp from "./AlgoSetUp";

export default class AlgorithmComparator {
  /**
   * Compares 2 programs, represented as mappings, in order to detect plagarism/ 
   * 
   * @param array1 - a mapping of node type to all nodes of that type for program 1
   * @param array2 - a mapping of node type to all nodes of that type for program 2
   */
  static compareGroups(
    array1: Map<String, NodeWrapper[]>,
    array2: Map<String, NodeWrapper[]>
  ) : void {
    let methods1 = array1.has(METHOD_DECLARATION)
      ? array1.get(METHOD_DECLARATION)
      : [];
    let methods2 = array2.has(METHOD_DECLARATION)
      ? array2.get(METHOD_DECLARATION)
      : [];
    //compare each function declaration with all the method declarations in the other file 
    let functions1 = array1.has(FUNCTION_DECLARATION)
      ? array1.get(FUNCTION_DECLARATION)
      : [];
    let functions2 = array2.has(FUNCTION_DECLARATION)
      ? array2.get(FUNCTION_DECLARATION)
      : [];

    let classes1 = array1.has(CLASS_DECLARATION)
      ? array1.get(CLASS_DECLARATION)
      : [];
    let classes2 = array2.has(CLASS_DECLARATION)
      ? array2.get(CLASS_DECLARATION)
      : [];

      let interfaces1 = array1.has(INTERFACE_DECLARATION)
      ? array1.get(INTERFACE_DECLARATION)
      : [];
    let interfaces2 = array2.has(INTERFACE_DECLARATION)
      ? array2.get(INTERFACE_DECLARATION)
      : [];
    //compare are classes in program 1 to all in program 2 
    AlgorithmComparator.compareClasses(classes1, classes2)

    //reset method weights since in ^ they were only compared within class 
    methods1.forEach(method => method.setWeight(undefined))
    methods2.forEach(method => method.setWeight(undefined))

    //compare all functions and methods to all functions and methods 
    AlgorithmComparator.compareMethodGroups(functions1.concat(methods1), functions2.concat(methods2))

    //compare interfaces in p 1 to all in p2
    AlgorithmComparator.compareInterfaces(interfaces1, interfaces2)
  }

  /**
   * Compares the interfaces in 2 programs 
   * 
   * @param interfaces1 - a list of interface nodes for program1
   * @param interfaces2 - a list of interface nodes for program2
   */
  static compareInterfaces(interfaces1: NodeWrapper[], interfaces2: NodeWrapper[]): void {
    
    for (let idx1 = 0; idx1 < interfaces1.length; idx1++) {
      for (let idx2 = 0; idx2 < interfaces2.length; idx2++) {
        let interface1 = interfaces1[idx1];
        let interface2 = interfaces2[idx2];

        let weightedDistance = Similarity.editDistanceMethod(
          interface1,
          interface2
        );
        if (weightedDistance < INTERFACE_THRESHOLD){
          interface1.addSimilarNode(interface2); 
          interface2.addSimilarNode(interface1)
        }
      }
    }
  }

  /**
   * Given a list of property nodes for 2 classes, returns a score representing their similarity 
   * 
   * @param propBlock1 - the list of properties for a class
   * @param propBlock2 - the list of properties for a class
   * @returns - a score representing their similiarity with lower scores indicating plagarism 
   */
  static comparePropBlock(propBlock1 : NodeWrapper[], propBlock2 : NodeWrapper[]): number { 
     let typeList1 : string[] = AlgoSetUp.getPropTypeList(propBlock1); 
     let typeList2 : string[]=  AlgoSetUp.getPropTypeList(propBlock2); 
     let score = Similarity.editDistanceWeighted(typeList1, typeList2)
     return score; 
  }

  /**
   * Given 2 list of classes, compares all pairs of classes against each other to see if 
   * plagarism occurred. 
   * 
   * @param file1Classes - a list of nodes representing all the classes in program 1
   * @param file2Classes - a list of nodes representing all the classes in program 2
   */
  static compareClasses(file1Classes: NodeWrapper[], file2Classes: NodeWrapper[]) : void {
    for (let file1Class of file1Classes) { 
      for (let file2Class of file2Classes) { 
        let score = Similarity.compareClasses(file1Class, file2Class); 
        //just record the score and later when creating plagiarims instance filter by weight
        if (score < CLASS_THRESHOLD) { 
          file1Class.addSimilarNode(file2Class)
          file2Class.addSimilarNode(file1Class)
        }
      }
    }

  }

  /**
   * Given 2 lists of methods/functions, compares all possible pairs to determine if plagarism occurred. 
   * 
   * @param methods1 - a list of methods/functions in program 1
   * @param methods2 - a list of methods/functions in program 2
   */
  static compareMethodGroups(methods1: NodeWrapper[], methods2: NodeWrapper[]) : void {

    //compare each pair of methods methods by calculating the weighted edit distance
    for (let idx1 = 0; idx1 < methods1.length; idx1++) {
      for (let idx2 = 0; idx2 < methods2.length; idx2++) {
        let method1 = methods1[idx1];
        let method2 = methods2[idx2];

        let weightedDistance = Similarity.editDistanceMethod(
          method1,
          method2
        );
  
        //need  to get and set the lowest weight 
        if (method1.getWeight() == undefined || weightedDistance < method1.getWeight()){ 
          method1.setWeight(weightedDistance)
        }
        if (method2.getWeight() == undefined || weightedDistance < method2.getWeight()){ 
          method2.setWeight(weightedDistance)
        }
        if (weightedDistance < FUNCTION_METHOD_THRESHOLD) { 
          method1.addSimilarNode(method2)
          method2.addSimilarNode(method1)
        }
      }
    }
  }
}
