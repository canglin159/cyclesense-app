import { predictNextCycle } from './src/lib/services/prediction.js';
import fs from 'fs';

const testData = JSON.parse(fs.readFileSync('/home/team/shared/cycle-test-data.json', 'utf8'));

let passed = 0;
let failed = 0;

console.log('Running Prediction Algorithm Validation...\n');

testData.test_cases.forEach(testCase => {
    const result = predictNextCycle(testCase.cycles, testCase.user_settings);
    const expected = testCase.expected_predictions;

    let testFailed = false;
    const failures = [];

    const check = (field, res, exp) => {
        if (exp === null) {
            if (res !== null) {
                testFailed = true;
                failures.push(`${field}: expected null, got ${res}`);
            }
            return;
        }
        
        if (res !== exp) {
            // Allow 1 day tolerance for dates as per usage notes
            const resDate = new Date(res);
            const expDate = new Date(exp);
            const diff = Math.abs((resDate - expDate) / (1000 * 60 * 60 * 24));
            
            if (diff > 1) {
                testFailed = true;
                failures.push(`${field}: expected ${exp}, got ${res} (diff: ${diff} days)`);
            }
        }
    };

    check('next_period_start', result.nextPeriodStart, expected.next_period_start);
    check('next_period_end', result.nextPeriodEnd, expected.next_period_end);
    check('ovulation_window_start', result.fertileWindowStart, expected.ovulation_window_start);
    check('ovulation_window_end', result.fertileWindowEnd, expected.ovulation_window_end);
    
    // Confidence check
    if (result.confidence !== expected.confidence && expected.confidence) {
        testFailed = true;
        failures.push(`confidence: expected ${expected.confidence}, got ${result.confidence}`);
    }

    if (testFailed) {
        failed++;
        console.log(`[FAIL] ${testCase.id}: ${testCase.description}`);
        failures.forEach(f => console.log(`  - ${f}`));
    } else {
        passed++;
        console.log(`[PASS] ${testCase.id}`);
    }
});

console.log(`\nResults: ${passed} passed, ${failed} failed.`);
if (failed > 0) process.exit(1);
