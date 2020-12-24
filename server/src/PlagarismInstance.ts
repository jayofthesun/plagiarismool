import NodeWrapper from "./NodeWrapper";
import { Strategy } from "./enums/Strategy";

/**
 * Represents an instance of plagarism.
 */
export default class PlagiarismInstance {

  private avoidanceStrategy: Strategy;
  private plagarizedNode : NodeWrapper; //either a class or function SHOULD BE AT METHOD LEVEL
  private mostSimilarNode: NodeWrapper; //either a class or function

  constructor(node1: NodeWrapper, node2 : NodeWrapper) { 
    this.plagarizedNode = node1; 
    this.mostSimilarNode = node2; 
  }

  setAvoidanceStrategy(strategy  : Strategy) { 
    this.avoidanceStrategy = strategy; 
  }

  getPlagiarizedNode(): NodeWrapper{
    return this.plagarizedNode;
  }

  getSimilarPlagiarizedNode() : NodeWrapper {
    return this.mostSimilarNode;
  }

  getFileName() : string{ 
    return this.plagarizedNode.getFileName()
  }

  getSimilarFileName() : string { 
    return this.mostSimilarNode.getFileName()
  }

  //returns the start and end line 
  getStartEndLine() : number[] { 
   return [this.plagarizedNode.getStartLine(), this.plagarizedNode.getEndLine()]
  }

  //returns the start and end line
  getSimilarStartEndLine() : number[] { 
    return [this.mostSimilarNode.getStartLine(), this.mostSimilarNode.getEndLine()]
  }

  getAvoidanceStrategy(): Strategy {
    return this.avoidanceStrategy;
  }

  getJson() : Object { 
    let jsonified = { 
      'avoidanceStrategy' : this.getAvoidanceStrategy(), 
      'fileName1' : this.getFileName(), 
      'fileName2' : this.getSimilarFileName(),
      'startLine1' : this.getStartEndLine()[0],
      'endLine1' : this.getStartEndLine()[1], 
      'startLine2' : this.getSimilarStartEndLine()[0], 
      'endLine2' : this.getSimilarStartEndLine()[1], 
      'type1': this.plagarizedNode.getType(), 
      'type2': this.mostSimilarNode.getType()
    }
    return jsonified
  }
}
