import { isEpilogVariable } from "../utils/string-utils.js";

import { ERROR_TERM, Term } from "./Term.js";



class Substitution {
    private varMap: Map<string, Term>;

    constructor(varMap: Map<string, Term> = new Map()) {

        // Ensure domain only consists of variables
        for (let varName of varMap.keys()) {
            if (varName === "_") {
                console.error("Substitution can only substitute named variables, but domain element is anonymous.");
                this.varMap = new Map();
                return;
            }

            if (!isEpilogVariable(varName)) {
                console.error("Substitution can only substitute variables, but domain element is not a variable:",varName);
                this.varMap = new Map();
                return;
            }
        }

        this.varMap = varMap;

        // Check whether there is an overlapping domain and range. Only reports the first overlap
        const RANGE : Set<string> = this.getRange();
        for (let domainElem of this.getDomain()) {
            if (RANGE.has(domainElem)) {
                console.warn("Substitution has overlapping domain and range. Both contain", domainElem);
                break;
            }
        }
    }

    toString() : string {
        let str = "{\n";

        for (let [varName, varAssignment] of this.varMap.entries()) {
            str += "\t" + varName + " ⟶ " + varAssignment + ", \n";
        }

        // No dangling comma if the map is empty.
        if (this.varMap.size > 0) {
            str = str.slice(0, -3);
        }

        str += "\n}";

        return str;
    }

    // Should check whether a sub exists with hasSub() before calling getSub(), unless it is known to exist.
    getSub(varName: string) : Term {
        if (!this.varMap.has(varName)) {
            console.error("Tried to access a substitution for an element not in the Substitution's domain:",varName);
            return ERROR_TERM;
        }

        return this.varMap.get(varName);
    }

    setSub(varName: string, varSub: Term) : void {
        if (varName === "_") {
            console.error("Substitution can only substitute named variables, but proposed domain element is anonymous.");
            return;
        }

        if (!isEpilogVariable(varName)) {
            console.error("Substitution can only substitute variables, but proposed domain element is not a variable:",varName);
            return;
        }

        this.varMap.set(varName, varSub);
    }

    hasSub(varName: string) : boolean {
        return this.varMap.has(varName);
    }

    // Get the set of strings mapped from by the substitution
    getDomain() : Set<string> {
        return new Set(...this.varMap.keys());
    }

    // Get the set of strings corresponding to object mapped to by the substitution
    getRange() : Set<string> {
        let rangeSet : Set<string> = new Set();

        for (let val of this.varMap.values()) {
            rangeSet.add(val.toString());
        }

        return rangeSet;
    }
}

export {
    Substitution
}