import {
    Node
} from "ts-morph";
import { SENTINEL } from "./Constants";

/**
 * A wrapper class for ts-morph nodes so that additional information can be stored and more easily 
 * accessed
 */
export default class NodeWrapper { 
    private type : string;
    private node : Node; //reference to the actual ts-morph node 
    private children : NodeWrapper[] = []; 
    private weight: number = undefined;
    private fileName : string = "No File"
    private allSimilarNodes : NodeWrapper[] = []

    
    constructor(type: string, node: Node, fileName? : string) {
        this.type = type;
        this.node = node;
        this.fileName = fileName;
    }

    getWeight(): number {
        return this.weight;
    }

    setWeight(weight:number) {
        this.weight = weight;
    }

    getMorphNode(): Node { 
        return this.node; 
    }

    addSimilarNode(similarNode : NodeWrapper){ 
        this.allSimilarNodes.push(similarNode);
    }

    getAllSimilarNodes() : NodeWrapper[] { 
        return this.allSimilarNodes;
    }

    getFileName() : string { 
        return this.fileName;
    }
    
    getStartLine() : number { 
        return this.node.getStartLineNumber(); 
    }

    getEndLine() : number { 
        return this.node.getEndLineNumber();
    }
    
    addChild(childNode : NodeWrapper) { 
        this.children.push(childNode);
    }

    getChildren() : NodeWrapper[] { 
        return this.children;
    }

    getType() : string  { 
        return this.type; 
    }

    //returns a list of all descendants via DFS
    flatten() : NodeWrapper[] { 
        let flatAST = []; 
        let stack : NodeWrapper[] = [this]; 
        while (stack.length > 0){ 
            let node : NodeWrapper = stack.shift()
            flatAST.push(node); 
            let children = node.getChildren(); 
            stack.unshift(...children)
        }
        //remove the sentinel node
        let result = flatAST.filter(node => node.getType() != SENTINEL)
        return result; 
    }
}