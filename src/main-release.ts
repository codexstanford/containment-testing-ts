
import { containmentTestingRunner } from "./containmentTestingRunner.js";
import { Atom } from "./epilog-ts/classes/Atom.js";
import { Dataset } from "./epilog-ts/classes/Dataset.js";
import { Predicate } from "./epilog-ts/classes/Predicate.js";
import { ConjunctiveQuery, Query, makeQuery } from "./epilog-ts/classes/Query.js";
import { Rule } from "./epilog-ts/classes/Rule.js";
import { Ruleset } from "./epilog-ts/classes/Ruleset.js";
import { Variable } from "./epilog-ts/classes/Term.js";
import { EpilogJSToTS } from "./epilog-ts/parsing/epilog-js-to-epilog-ts.js";


const COVERS_PRED = new Predicate("covers");
const SURROUNDING_QUERY_PRED = new Predicate("surroundingquerypred");

// activePolicies: A list of strings denoting the policies within which to check coverage.
// coverageToCheck: A single provision of a flattened policy. Should always be of the form "covers({policyid}, Z) :- {body}"
function cover(
    activePolicies: EpilogJSToTS.EpilogJSConstant[], 
    coverageToCheck: EpilogJSToTS.EpilogJSRule, 
    facts: EpilogJSToTS.EpilogJSDataset, 
    rules: EpilogJSToTS.EpilogJSRuleset
    ) : boolean | undefined 
    {
    // --- Process the arguments into EpilogTS 

    // --- activePolicies: Make a union of queries of the flattened activePolicies
    let activePoliciesAsFlattenedRules : Rule[] = [];
    let activePoliciesSurroundingRules : Rule[] = [];

    for (let policy of activePolicies) {
        // This rule ensures the only argument relevant to containment testing is the claim.
        activePoliciesSurroundingRules.push(EpilogJSToTS.parseRule(read(SURROUNDING_QUERY_PRED + "(X) :- " + COVERS_PRED + "(" + policy + ", X)")));

        let flattenedPolicy: EpilogJSToTS.EpilogJSRule[] = flatten(read((new Atom(COVERS_PRED, [EpilogJSToTS.parseConstant(policy), new Variable('Z')])).toString()), rules)

        for (let rule of flattenedPolicy) {
            activePoliciesAsFlattenedRules.push(EpilogJSToTS.parseRule(rule));
        }
    }

    let activePoliciesQuery : Query = makeQuery(SURROUNDING_QUERY_PRED, [...activePoliciesSurroundingRules, ...activePoliciesAsFlattenedRules]);

    // --- coverageToCheck: process into a non-union Query
        // Will always be of the form "covers({policyid}, Z) :- {body}"
    let epilogTSCoverageToCheck : Rule = EpilogJSToTS.parseRule(coverageToCheck);
        // This rule ensures the only argument relevant to containment testing is the claim.
    let coverageSurroundingRule : Rule = EpilogJSToTS.parseRule(read(SURROUNDING_QUERY_PRED + "(X) :- " + COVERS_PRED + "(" + epilogTSCoverageToCheck.head.args[0].toString() + ", X)"));

    let queryToCheck : Query = makeQuery(SURROUNDING_QUERY_PRED, [coverageSurroundingRule, epilogTSCoverageToCheck]);
    
    console.log("Query to check:", queryToCheck.toString());
    console.log("Active policies query:", activePoliciesQuery.toString());

    // --- facts and rules
    let epilogTSFacts : Dataset = EpilogJSToTS.parseDataset(facts);
    let epilogTSRules : Ruleset = EpilogJSToTS.parseRuleset(rules);

    // --- Actually perform containment testing

    // Returns a two-element tuple indicating 
        // (i) whether the containment testing procedure determined containment holds
        // (ii) whether the containment testing procedure used was complete/whether a negative result is conclusive
    let testResult : [boolean, boolean] = containmentTestingRunner(queryToCheck, activePoliciesQuery, epilogTSFacts, epilogTSRules);

    console.log(testResult);
    // If containment is true, return true.
    if (testResult[0]) {
        return true;
    }
    // If containment is false,
        // Return false if the procedure used is complete.
    if (testResult[1]) {
        return false;
    }
    
    // Otherwise, return undefined
    return undefined
}

// Ensures adding 'cover' to window typechecks
declare global {
    interface Window {
        cover: Function;
    }
}

// Need to set the lambda for the flattening to work. Not necessary when embedded in the actual application
lambda = definemorefacts([], readdata('type(policy1695417536,policy) policy.type(policy1695417536,codex_plana) policy.insuree(policy1695417536,pjames27) policy.startdate(policy1695417536,2023_01_01) policy.enddate(policy1695417536,2023_12_31) policy.type(policytest1, contexperiment1) type(policy1695417537,policy) policy.type(policy1695417537,codex_plana) policy.insuree(policy1695417537,pjames27) policy.startdate(policy1695417537,2023_01_01) policy.enddate(policy1695417537,2023_12_31) policy.type(policytest1, contexperiment1)'));

// Lambda for Logica Resolution example
// lambda = definemorefacts([], readdata(""));

document.addEventListener("DOMContentLoaded", function () {
    window.cover = cover;


    // Example from Logica Resolution. Cannot flatten because of negated existential variables
    // let rules = definemorerules([], readdata("covers(Policy, C) :- policy.type(Policy, contexperiment1) & q1(C) q1(X) :- k(X) & ~p(X) p(X) :- m(X,Y) & n(Y) covers(Policy, C) :- policy.type(Policy, contexperiment2) & q2(C) q2(X) :- k(X) & ~q(X) q(X) :- m(X,Y) & n(Y)"));
    // let provisions : EpilogJSToTS.EpilogJSRule[] = flatten(read("covers(policytest1, Z)"), rules);
    
    let rules = definemorerules([], readdata('covers(Policy,Z) :- policy.type(Policy,codex_plana) & policy.insuree(Policy,I) & policy.startdate(Policy,PS) & policy.enddate(Policy,PE) & hospitalization.patient(Z,I) & hospitalization.hospital(Z,H) & hospital.country(H,usa) & hospitalization.startdate(Z,ZS) & hospitalization.enddate(Z,ZE) covers(Policy,Z) :- policy.type(Policy,codex_plana) & policy.insuree(Policy,I) & policy.startdate(Policy,PS) & policy.enddate(Policy,PE) & hospitalization.patient(Z,P) & person.spouse(P,I) & hospitalization.hospital(Z,H) & hospital.country(H,usa) & hospitalization.startdate(Z,ZS) & hospitalization.enddate(Z,ZE) covers(Policy,Z) :- policy.type(Policy,codex_plana) & policy.insuree(Policy,I) & policy.startdate(Policy,PS) & policy.enddate(Policy,PE) & hospitalization.patient(Z,P) & person.parent(P,I) & hospitalization.hospital(Z,H) & hospital.country(H,usa) & hospitalization.startdate(Z,ZS) & hospitalization.enddate(Z,ZE)'));
    let provisions : EpilogJSToTS.EpilogJSRule[] = flatten(read("covers(policy1695417536, Z)"), rules);

    cover(['policy1695417536'], provisions[0], [], rules); // Returns the correct answer on this
    // cover(['policy1695417537'], provisions[0], [], rules); // Times out on this
});


