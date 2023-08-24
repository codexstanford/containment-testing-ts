import { isEpilogVariable } from "../utils/string-utils.js";



class Substitution {
    private varMap: Map<string, string>;

    constructor(varMap: Map<string, string> = new Map()) {

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

    getSub(varName: string) : string {
        if (!this.varMap.has(varName)) {
            console.error("Tried to access a substitution for an element not in the Substitution's domain:",varName);
            return "error";
        }

        return this.varMap.get(varName);
    }

    setSub(varName: string, varSub: string) : void {
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
}

export {
    Substitution
}