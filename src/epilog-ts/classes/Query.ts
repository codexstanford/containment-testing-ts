import { Predicate } from "./Predicate.js";

import { ERROR_RULE, Rule } from "./Rule.js";

interface Query {
    readonly queryPred: Predicate;
    readonly rules: Rule[];
}

// Classification functions

function isCQ(q: Query) : q is ConjunctiveQuery {
    // Note: temporary test, as we should also check the properties of the rules of the query, in case its class is too conservative
    return q instanceof ConjunctiveQuery;
}


// Classes

type CQ = ConjunctiveQuery;

class ConjunctiveQuery implements Query {
    readonly queryPred: Predicate;
    readonly rule: Rule;
    
    get rules() : Rule[] {
        return [this.rule];
    }

    // Must be a single-rule query with no negation
    constructor(queryPred: Predicate, rule: Rule) {
        this.queryPred = queryPred;
        
        // Check for negated subgoals
        for (let subgoal of rule.body) {
            if (subgoal.isNegated()) {
                console.error("A CQ cannot contain a negated subgoal:", rule.toString());
                this.rule = ERROR_RULE;
                return;
            }
        }

        this.rule = rule;

        // Warn if the query predicate doesn't match the rule head
        if (this.queryPred.toString() !== this.rule.head.pred.toString()) {
            console.warn("Query predicate", this.queryPred.toString(), "doesn't appear in query:",this.rule.toString());
        }
    }

    toString() : string {
        return this.rule.toString();
    }
}

export { 
    Query,

    
    CQ,
    ConjunctiveQuery,
    isCQ,
}
