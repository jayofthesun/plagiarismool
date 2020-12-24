import NodeWrapper from "./NodeWrapper";
import {
    Project,
    Node, 
    PropertyDeclaration
} from "ts-morph";
import {PROPERTY_DECLARATION, FUNCTION_DECLARATION, METHOD_DECLARATION,
     CLASS_DECLARATION, INTERFACE_DECLARATION, VARIABLE_STATEMENT, 
    VARIABLE_DECLARATION, ENUM_DECLARATION, RETURN_STATEMENT, EXPRESSION_STATEMENT, METHOD_SIGNATURE, SENTINEL, FOR_STATEMENT, IF_STATEMENT} from './Constants'

export default class AlgoSetUp { 

    /**
     * Converts all files in a single program to a single, wrapped AST
     * 
     * @param fileList - the list of file content in string format 
     * @param fileNames - the list of file names for a single program 
     * @returns - the root of a NodeWrapper tree for the program
     */
    static createProgramAST(fileList: string[], fileNames : string[]) : NodeWrapper {
    
        let programFiles : Map<string, Node> = new Map();
        for (let index = 0; index < fileList.length; index++){ 
            programFiles.set(fileNames[index], AlgoSetUp.stringFileToAst(fileList[index]));
        }
        let programSentinel = new NodeWrapper(SENTINEL, undefined)

        for(const [fileName, ast] of programFiles.entries()) { 
            let prunedTree = AlgoSetUp.constructPrunedTree(ast, fileName)
            programSentinel.addChild(prunedTree)
        }  
        return programSentinel
    }
    /**
     * Given the root of wrapped AST and a certain node type, returns a list of all nodes of that type
     * 
     * @param root - the root node of the AST being filtered over 
     * @param type - the name of the type of node to be collected 
     * @returns - a list of wrapped nodes that are of the given type 
     */
    static getByType(root: NodeWrapper, type : string) : NodeWrapper[] { 
        let allDescendant : NodeWrapper[] = root.flatten()
        let result : NodeWrapper[] = []
        allDescendant.forEach(child => { 
            if(child.getType() == type){ 
                result.push(child)
            }
        });
        return result
    }

    /**
     * Given the root node of an AST, creates a mappinig of node type to list of nodes that are of that type. 
     * 
     * *Only node types that are of interest in the plagarism detection algorithm are collected
     * 
     * @param root - the wrapped root of an AST 
     * @returns - a map of node type to a list of nodes of that type
     */
    static createGroupTypes(root: NodeWrapper) : Map<String, NodeWrapper[]> {
        const highLevelTypes : string[] = [METHOD_DECLARATION, CLASS_DECLARATION, FUNCTION_DECLARATION, INTERFACE_DECLARATION]
        let groupNodeTypes = new Map<String, NodeWrapper[]>();
        let allDescend : NodeWrapper [] = root.flatten()
        allDescend.forEach(child => { 
            let nodeType = child.getType()
            if (highLevelTypes.includes(nodeType)){ 
                if (highLevelTypes.includes(nodeType) && groupNodeTypes.has(nodeType)) {
                groupNodeTypes.get(nodeType).push(child); 
            } else if (highLevelTypes.includes(nodeType)) {
                groupNodeTypes.set(nodeType, [child]);
            }
         }
        }); 
        return groupNodeTypes;
    }

    /**
     * Given a ts-morph AST, creates a pruned wrapped version 
     * 
     * @param root - the root of a ts-morph AST 
     * @param fileName - the name of the file the AST was made from 
     * @returns - a wrapped and pruned version of the AST 
     */
    static constructPrunedTree(root: Node, fileName: string) : NodeWrapper{ 
        let wrappedRoot = new NodeWrapper(root.getKindName(), root, fileName); 
        AlgoSetUp.constructPrunedTreeHelper(root, wrappedRoot, fileName)
        return wrappedRoot;
    }

    /**
     * A helper function which, given a ts-morph AST root and wrapped root, continues 
     * to create a pruned and wrapped version
     * 
     * @param root - the root of the ts-morph AST 
     * @param wrappedRoot - the root of the wrapped AST being made
     * @param fileName - the name of the file the AST was made from 
     */
    static constructPrunedTreeHelper(root: Node, wrappedRoot : NodeWrapper, fileName : string) : void{ 
        const typesToKeep = [METHOD_DECLARATION, CLASS_DECLARATION, FUNCTION_DECLARATION, VARIABLE_STATEMENT,EXPRESSION_STATEMENT, RETURN_STATEMENT, ENUM_DECLARATION, INTERFACE_DECLARATION, VARIABLE_DECLARATION, PROPERTY_DECLARATION, METHOD_SIGNATURE, FOR_STATEMENT, IF_STATEMENT]
        root.forEachChild((child) => { 
            if(typesToKeep.includes(child.getKindName())) { 
                let wrappedNode = new NodeWrapper(child.getKindName(), child, fileName)
                wrappedRoot.addChild(wrappedNode)
                AlgoSetUp.constructPrunedTreeHelper(child, wrappedNode, fileName)
            } else { 
                AlgoSetUp.constructPrunedTreeHelper(child, wrappedRoot, fileName)
            }
           
        }); 
    }

    /**
     * Given a pieces of code, converts it into an AST representation using ts-morph 
     * 
     * @param fileContent - the code inside a file, represented as a string
     * @returns - the ts-morph root node of the AST represetntation for the code 
     */
    static stringFileToAst(fileContent: string): Node {
        const project = new Project();
        const sourceFile : Node = project.createSourceFile("/test.ts", fileContent);
        return sourceFile;
    }

    /**
     * Given a list of property nodes, returns a list of their type. 
     * 
     * @param props - a list of property nodes 
     * @returns - a list of the property nodes type 
     */
    static getPropTypeList(props : NodeWrapper[]) : string[] { 
        let listTypes : string [] = []
        var keywordRegex = new RegExp(".*Keyword");
        for (let property of props) { 
          let propDecl : PropertyDeclaration = property.getMorphNode() as PropertyDeclaration
          let propChildren = propDecl.getChildren(); 
          let type = undefined; 
          for (let child of propChildren){
            if (keywordRegex.test(child.getKindName())){ 
                type = child.getKindName()
                break;
            }
          }
          if(type == undefined) { 
            listTypes.push("PROPERTY_UNKNOWN_TYPE")
          } else { 
            listTypes.push(type)
          }
        }
        return listTypes
      }
}