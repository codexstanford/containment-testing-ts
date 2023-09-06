import { Formula } from "./Formula.js";

class Implication {

    readonly antecedent: Formula;
    readonly consequent: Formula;

    constructor(antecedent: Formula, consequent: Formula) {
        this.antecedent = antecedent;
        this.consequent = consequent;
    }

    toString() {
        return "(" + this.antecedent.toString() + " ⇒ " + this.consequent.toString() + ")";
    }
}


export {
    Implication
}