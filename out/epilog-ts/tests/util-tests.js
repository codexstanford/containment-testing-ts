import { printTestingMessage_Start, runTest } from "../../testing/testing.js";
import { EpilogJSToTS } from "../parsing/epilog-js-to-epilog-ts.js";
import { standardizeRuleVars } from "../utils/standardize.js";
// Unit tests for {epilog-ts/utils} files
function runTests() {
    runStandardizeTests();
}
function runStandardizeTests() {
    printTestingMessage_Start("Standardizing");
    runTest("Standardize-rule-vars-success", () => {
        let strToRead = "p(X, Y, Z) :- q(X, A) & r(Z, Y) & s(B) & t(C, d)";
        let epilogJSRule = EpilogJSToTS.parseRule(read(strToRead));
        return standardizeRuleVars(epilogJSRule).toString() === "p(V0, V1, V2) :- q(V0, EV0) & r(V2, V1) & s(EV1) & t(EV2, d)";
    }, {});
}
export { runTests };
//# sourceMappingURL=util-tests.js.map