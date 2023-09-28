import { Clause } from "../classes/Clause.js";
import { Formula } from "../classes/Formula.js";
import { Negation } from "../classes/Negation.js";
import { toClausal } from "../transformations/clausal.js";
import { CNFOptions } from "../transformations/cnf.js";
import { resolve } from "./resolution.js";

type RunOptions = {
    msTimeout?: number, 
    maxResolutions?: number,
    verbose?: boolean
};

class ResolutionEngine {

    private proofLines : Clause[];
    private clauseStrSet : Set<string>;
    private cnfOptions : CNFOptions;

    private goalLine: number;

    constructor(cnfOptions : CNFOptions = {algorithm: "tseitins"}) {
        this.proofLines = [];
        this.clauseStrSet = new Set<string>();
        this.cnfOptions = cnfOptions;
        this.goalLine = 0;
    }

    // Simply adds the input clauses to the proof. Does not filter out e.g. tautologies and identical clauses.
    addProofLines(clauses : Clause[]) : void {
        for (let c of clauses) {
            this.proofLines.push(c);
            this.clauseStrSet.add(c.toString());
        }
    }
    
    // Converts all premises to Clausal form before adding them
    addPremises(premises : Formula[]) : void {

        for (let p of premises) {
            let clausalPremise : Clause[] = toClausal(p, this.cnfOptions);

            for (let c of clausalPremise) {
                if (c.isTautology()) {
                    continue;
                }
    
                if (this.clauseStrSet.has(c.toString())) {
                    continue;
                }

                this.proofLines.push(c);
                this.clauseStrSet.add(c.toString());
            }
        }
        
    }

    // Negates and converts to Clausal form before adding to the premises.
        // Filters out tautologies and identical clauses.
    addGoal(goal : Formula) : void {
        let clausalNegatedGoal : Clause[] = toClausal(new Negation(goal), this.cnfOptions);
        
        this.goalLine = this.proofLines.length;

        for (let c of clausalNegatedGoal) {
            if (c.isTautology()) {
                continue;
            }
            
            if (this.clauseStrSet.has(c.toString())) {
                continue;
            }
            
            this.proofLines.push(c);
            this.clauseStrSet.add(c.toString());
        }
    }

    // Runs the resolution procedure, returning true if the empty clause is derived, and false if it could not be derived.
    // Perform resolution until:
        // (i) the specified maximum amount of time has passed, at which point "timeout" will be returned.
        // (ii) the specified maximum number of resolutions has been performed, at which point "maxresolutions" will be returned
        // (iii) the empty clause is derived, at which point true will be returned.
        // (iv) no more clauses can be derived, at which point false will be returned.
    // Employs the following strategies:
        // Tautology elimination
        // Naive Identical Clause Elimination
    run({msTimeout = null, maxResolutions = null, verbose = false} : RunOptions) : boolean | "timeout" | "maxresolutions"  {
        let msStartTime : number = Date.now();
        let numResolutions : number = 0;

        let slowPtr : number = this.goalLine;
        
        //let tautologiesEliminated = 0;
        //let identicalClausesEliminated = 0;

        while (slowPtr < this.proofLines.length) {
            let fastPtr : number = 0;
            let slowPtrClause : Clause = this.proofLines[slowPtr]; 
            
            while (fastPtr <= slowPtr) {
                let fastPtrClause : Clause = this.proofLines[fastPtr]; 

                let resolvents : Clause[] = resolve(slowPtrClause, fastPtrClause);
                numResolutions++;
                
                // Check whether the empty clause has been derived, and filter out clauses according to our strategies.
                for (let r of resolvents) {
                    // Derived the empty clause! A successful refutation.
                    if (r.literals.length === 0) {
                        if (verbose) {
                            console.log("Time elapsed:", Date.now()-msStartTime, "milliseconds");
                            console.log("Resolutions Performed:", numResolutions);
                        }
                        this.proofLines.push(r);
                        this.clauseStrSet.add(r.toString());
                        return true;
                    }

                    // Exclude tautologies
                    if (r.isTautology()) {
                        //tautologiesEliminated++;
                        //console.log("Tautology:", r.toString());
                        continue;
                    }

                    // Exclude identical clauses, naively
                    if (this.clauseStrSet.has(r.toString())) {
                        //identicalClausesEliminated++;
                        //console.log("Identical clause:", r.toString());
                        continue;
                    }

                    if (verbose) {
                        console.log(r.toString());
                    }

                    this.proofLines.push(r);
                    this.clauseStrSet.add(r.toString());
                }

                // Check that too much time has not elapsed
                if (msTimeout !== null && Date.now() - msStartTime > msTimeout) {
                    if (verbose) {
                        console.log("Time elapsed:", Date.now()-msStartTime, "milliseconds");
                        console.log("Resolutions Performed:", numResolutions);
                        //console.log("Tautologies eliminated:", tautologiesEliminated);
                        //console.log("Identical clauses eliminated:", identicalClausesEliminated);
                        console.log("Proof length:",this.proofLines.length);
                        console.log("Slow pointer:",slowPtr);
                    }
                    return "timeout";
                }

                // Check that we haven't reached the resolution limit
                if (maxResolutions !== null &&numResolutions >= maxResolutions) {
                    if (verbose) {
                        console.log("Time elapsed:", Date.now()-msStartTime, "milliseconds");
                        console.log("Resolutions Performed:", numResolutions);
                    }
                    return "maxresolutions";
                }

                fastPtr++;
            } 
            slowPtr++;
        }

        // Failed to derive the empty clause.
        if (verbose) {
            console.log("Time elapsed:", Date.now()-msStartTime, "milliseconds");
            console.log("Resolutions Performed:", numResolutions);
        }
        return false;
    }

    printAllLines() : void {
        for (let line of this.proofLines) {
            console.log(line.toString());
        }
    }

}

export {
    ResolutionEngine
}