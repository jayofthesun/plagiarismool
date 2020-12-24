import NodeWrapper from "./NodeWrapper";
import {
    ClassDeclaration,
    FunctionDeclaration,
    MethodDeclaration
} from "ts-morph";
import { Strategy } from "./enums/Strategy";
import { FUNCTION_DECLARATION, METHOD_DECLARATION } from "./Constants";

export default class DetectPlagStrategy {

    /**
     * Given 2 classes that are plagarized, determines if they were renamed to try and avoid plagarism
     * 
     * @param class1 - the wrapped node of a class 
     * @param class2 - the wrapped node of another class
     * @returns - the plagarism detection avoidance strategy being used
     */
    static isClassRenamed(class1: NodeWrapper, class2: NodeWrapper): Strategy {
        let classDecl1: ClassDeclaration = class1.getMorphNode() as ClassDeclaration
        let classDecl2: ClassDeclaration = class2.getMorphNode() as ClassDeclaration
        if (classDecl1.getName() != classDecl2.getName()) {
            return Strategy.renamedVariable;
        } else {
            return Strategy.changedCodeOrder;
        }
    }

    /**
     * Given 2 functions or methods that were plagarized, determines what plagarism detection avoidance strategy was used
     * 
     * @param funcMethod1 - the wrapped node of a function or method
     * @param funcMethod2 - the wrapped node of another function or method
     * @returns - the plagarism detection avoidance strategy being used
     */
    static detectFunctionMethodStrategy(funcMethod1: NodeWrapper, funcMethod2: NodeWrapper): Strategy {
        let funcToMethod = funcMethod1.getType() == FUNCTION_DECLARATION && funcMethod2.getType() == METHOD_DECLARATION;
        let methodToFunc = funcMethod1.getType() == METHOD_DECLARATION && funcMethod2.getType() == FUNCTION_DECLARATION;


        if (funcToMethod || methodToFunc) {
            return Strategy.movedCode
        } 
        
        if (funcMethod1.getType() == FUNCTION_DECLARATION && funcMethod2.getType() == FUNCTION_DECLARATION) {
            let funcDecl1: FunctionDeclaration = funcMethod1.getMorphNode() as FunctionDeclaration
            let funcDecl2: FunctionDeclaration = funcMethod2.getMorphNode() as FunctionDeclaration
            if (funcDecl1.getName() != funcDecl2.getName()) {
                return Strategy.renamedVariable;
            }
        } else if (funcMethod1.getType() == METHOD_DECLARATION && funcMethod2.getType() == METHOD_DECLARATION) {
            let methodDecl1: MethodDeclaration = funcMethod1.getMorphNode() as MethodDeclaration
            let methodDecl2: MethodDeclaration = funcMethod2.getMorphNode() as MethodDeclaration
            if (methodDecl1.getName() != methodDecl2.getName()) {
                return Strategy.renamedVariable;
            }
        } 
        return Strategy.changedCodeOrder;

    }

}