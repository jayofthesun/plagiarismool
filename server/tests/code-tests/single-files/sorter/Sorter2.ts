import ISorter from "./ISorter";

/**
 * Place your second Task 2 implementation of an efficient sorter (e.g. Merge sort, heap sort, quicksort, shell sort) here.
 */
export default class Sorter2<E> implements ISorter<E> {
    public sort(list: E[], compareFun: (e1: E, e2: E) => number) : void {
    let n = list.length;
    for (let i=0; i<n; i++) {
        let current = list[i];
        let j = i-1;
        while((j>=0) && compareFun(current,list[j])<0) {
            list[j+1] = list[j];
            j--;
        }
        list[j+1] = current;
    }
    }
}
