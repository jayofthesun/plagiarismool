export class Triangle {
    constructor(private base: number, private height: number) {

    }
    public area(): number {
        return 0.5 * this.base * this.height
    }
}
export class Rectangle {
    constructor(private width: number, private height: number) {

    }
    public area(): number {
        return this.width * this.height
    }

}