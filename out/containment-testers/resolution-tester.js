import { Literal } from "../epilog-ts/classes/Literal.js";
import { Predicate } from "../epilog-ts/classes/Predicate.js";
import { makeQuery } from "../epilog-ts/classes/Query.js";
import { Rule } from "../epilog-ts/classes/Rule.js";
import { Ruleset } from "../epilog-ts/classes/Ruleset.js";
import { EpilogTSToFOL } from "../epilog-ts/parsing/epilog-ts-to-fol.js";
import { standardizeRuleHead } from "../epilog-ts/utils/standardize.js";
import { Implication } from "../first-order-logic/classes/Implication.js";
import { ResolutionEngine } from "../first-order-logic/resolution/resolution-engine.js";
import { bindFreeVars } from "../first-order-logic/transformations/general.js";
class ResolutionContainmentTester {
    containedWithin(q1, q2) {
        // The query predicates should differ, otherwise containment will always hold immediately.
        // Any other overlap in predicates is assumed to be intentional
        // --- Replace the query predicate of q2 with a new predicate
        let presentPreds = new Set([...q1.getPredNames(), ...q2.getPredNames()]);
        // Generate a predicate that isn't present in either query
        let newPredNameSuffix = 2;
        let newPredName = q1.queryPred.name + "_" + newPredNameSuffix;
        while (presentPreds.has(newPredName)) {
            newPredNameSuffix++;
            newPredName = q1.queryPred.name + "_" + newPredNameSuffix;
        }
        // Rename the q2 queryPred to newPredName
        let q2RenamedRules = [];
        for (let rule of q2.rules) {
            q2RenamedRules.push(Rule.renamePredicate(q2.queryPred.name, newPredName, rule));
        }
        q2 = makeQuery(new Predicate(newPredName), q2RenamedRules);
        // --- Initialize the Resolution Engine, and add the queries as premises
        let resolutionEngine = new ResolutionEngine({ algorithm: "standard" });
        resolutionEngine.addPremises([EpilogTSToFOL.parseRuleset(new Ruleset(q1.rules))]);
        resolutionEngine.addPremises([EpilogTSToFOL.parseRuleset(new Ruleset(q2.rules))]);
        // --- Create the containment testing goal
        let contTestingGoal = bindFreeVars(new Implication(new Literal(standardizeRuleHead(q1.getQueryPredRules()[0]).head, false), new Literal(standardizeRuleHead(q2.getQueryPredRules()[0]).head, false)));
        resolutionEngine.addGoal(contTestingGoal);
        resolutionEngine.printAllLines();
        let resolutionResult = resolutionEngine.run({ msTimeout: 10000, verbose: false });
        // Failed to determine whether containment holds
        if (resolutionResult === "timeout" || resolutionResult === "maxresolutions") {
            console.log("Resolution tester could not determine whether containment holds:", resolutionResult);
            return false;
        }
        // resolutionEngine.printAllLines();
        console.log("Containment is:", resolutionResult);
        return resolutionResult;
    }
}
export { ResolutionContainmentTester };
//# sourceMappingURL=resolution-tester.js.map