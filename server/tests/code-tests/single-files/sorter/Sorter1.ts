import ISorter from "./ISorter";

/**
 * Place your first Task 2 implementation of an efficient sorter (e.g. Merge sort, heap sort, quicksort, shell sort) here.
 */
export default class Sorter1<E> implements ISorter<E> {
    public sort(list: E[], compareFun: (e1: E, e2: E) => number): void {
        if (list.length > 1) {
            let middle = Math.floor(list.length / 2),
                left = list.slice(0, middle),
                right = list.slice(middle);
            this.sort(left, compareFun)
            this.sort(right, compareFun)
            let result = this.merge(left, right, compareFun);

            for (let i = 0; i < result.length; i++) {
                list[i] = result[i]
            }
        }
    }
    public merge(left: E[], right: E[], compareFun: (e1: E, e2: E) => number): E[] {
        let result = [];

        while (left.length && right.length) {
            if (compareFun(left[0], right[0]) < 0) {
                result.push(left.shift());
            } else {
                result.push(right.shift());
            }
        }
        return result.concat(left.slice()).concat(right.slice());
    }
}
