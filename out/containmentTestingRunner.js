import { CQContainmentTester } from "./containment-testers/cq-containment.js";
import { ResolutionContainmentTester } from "./containment-testers/resolution-tester.js";
import { ConjunctiveQuery } from "./epilog-ts/classes/Query.js";
// Handles the execution of containment testing, deciding which containment testing procedures to use, when, and for how long.
// Specifically, determines whether q1 is contained within q2, given the facts and rules.
// The output is a two-element tuple indicating 
// (i) whether the containment tester determined that containment holds, and 
// (ii) whether the containment testing algorithm used was complete.
function containmentTestingRunner(q1, q2, facts, rules) {
    let containmentTester = null;
    // CQ's: Simplest case
    if (q1 instanceof ConjunctiveQuery && q2 instanceof ConjunctiveQuery) {
        containmentTester = new CQContainmentTester();
        return [containmentTester.containedWithin(q1, q2), true];
    }
    // Don't have a guaranteed containment testing procedure, so use the resolution tester
    containmentTester = new ResolutionContainmentTester();
    // TODO: Update this to indicate the answer is correct when the tester terminates for a reason other than timeout or maxresolutions
    return [containmentTester.containedWithin(q1, q2), false];
}
export { containmentTestingRunner };
//# sourceMappingURL=containmentTestingRunner.js.map