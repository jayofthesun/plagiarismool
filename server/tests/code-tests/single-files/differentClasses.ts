//program 1 
export class Triangle {
    private base : number; 
    private height : number; 

    constructor(base: number, height: number) {

    }
    public area(): number {
        return 0.5 * this.base * this.height
    }
}

//program 1
class Dog { 
    private breed : string; 
    private age : number; 
    private size : string; 
    private noise : string; 
    private noiseType: string
    private owner : string; 
    private rabiesVaccine : boolean; 

    public makeNoise() : string { 
        let result : string = ""
        result = this.noiseType;
        for (let i = 0;  i < 10; i++){
            result = result + this.noise + " ";
        }
        return result 
    }

    public getBasicInfo() : Object { 
        let result : Object = {
            "breed": this.breed, 
            "rabiesVaccine" : this.rabiesVaccine
        } 
        let result2 : Object = {
            "age" : this.age, 
            "owner" : this.owner
        }
        if (Math.random() < 0.5) { 
            return result; 
        }
        return result2; 
    }
}

class Cat { 
    private breed : string; 
    private age : number; 
    private size : string; 
    private noise : string; 
    private noiseType: string
    private owner : string; 
    private rabiesVaccine : boolean; 

    public makeNoise() : string { 
        let result : string = ""
        result = this.noiseType;
        for (let i = 0;  i < 10; i++){
            result = result + this.noise + " ";
        }
        return result 
    }

    public getBasicInfo() : Object { 
        let result : Object = {
            "breed": this.breed, 
            "rabiesVaccine" : this.rabiesVaccine
        } 
        let result2 : Object = {
            "age" : this.age, 
            "owner" : this.owner
        }
        if (Math.random() < 0.5) { 
            return result; 
        }
        return result2; 
    }
}

//program 2 
export class Rectangle {
    private width: number 
    private height : number

    constructor(width: number height: number) {

    }
    public area(): number {
        return this.width * this.height
    }

}