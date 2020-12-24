/**
 * interface defining the API for iterators.
 */
interface IIterator<T> {
    hasNext(): boolean
    add() : number
    next(): T
  }
  
  export default IIterator