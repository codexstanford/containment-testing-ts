import { Formula } from "./Formula.js";

class Conjunction {

    readonly conjuncts: Formula[];

    constructor(conjuncts: Formula[]) {

        if (conjuncts.length === 0) {
            console.warn("Warning: created the empty conjunction");
        }

        this.conjuncts = conjuncts;
    }

    toString() {
        if (this.conjuncts.length === 0) { 
            return "()";
        }
        
        let str = "(";

        for (let conjunct of this.conjuncts) {
            str += conjunct.toString() + " ∧ ";
        }

        str = str.slice(0, -3);
        str += ")";

        return str;

    }
}


export {
    Conjunction
}