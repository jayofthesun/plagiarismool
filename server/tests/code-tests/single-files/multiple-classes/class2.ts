export class Rectangle {
    constructor(private width: number, private height: number) {

    }
    public area(): number {
        return this.width * this.height
    }

}