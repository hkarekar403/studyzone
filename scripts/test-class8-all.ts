import generateClass8Question, { CLASS8_TOPICS } from '../lib/generators/class8';
import { Difficulty, Curriculum } from '../lib/generators/shared/types';

const difficulties: Difficulty[] = ['Easy', 'Medium', 'Hard'];
const curriculum: Curriculum = 'CBSE';

console.log('═══════════════════════════════════════════════════════════════');
console.log('CLASS 8 — ALL 11 TOPICS COMPREHENSIVE TEST');
console.log('═══════════════════════════════════════════════════════════════\n');

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;
const topicResults: { topic: string; passed: number; total: number }[] = [];

for (const topicDef of CLASS8_TOPICS) {
  const topic = topicDef.id;
  let topicPassed = 0;
  let topicTotal = 0;

  console.log(`\n📚 TOPIC ${CLASS8_TOPICS.indexOf(topicDef) + 1}: ${topicDef.label.toUpperCase()}`);
  console.log('─'.repeat(60));

  for (const difficulty of difficulties) {
    try {
      for (let i = 0; i < 2; i++) {
        totalTests++;
        topicTotal++;
        const question = generateClass8Question(topic, difficulty, curriculum);

        // Validation checks
        const hasNaN = JSON.stringify(question).includes('NaN');
        const hasUndefined = JSON.stringify(question).includes('undefined');
        const hasInfinity = JSON.stringify(question).includes('Infinity');

        if (hasNaN || hasUndefined || hasInfinity) {
          console.log(`  ❌ ${difficulty} (attempt ${i + 1}): Invalid value in question`);
          failedTests++;
        } else if (!question.displayAnswer || question.displayAnswer === '') {
          console.log(`  ❌ ${difficulty} (attempt ${i + 1}): Empty displayAnswer`);
          failedTests++;
        } else {
          console.log(`  ✓ ${difficulty} (attempt ${i + 1}): ${question.displayAnswer}`);
          passedTests++;
          topicPassed++;
        }
      }
    } catch (error) {
      failedTests += 2;
      console.log(`  ❌ ${difficulty}: Error - ${(error as Error).message}`);
    }
  }

  topicResults.push({ topic: topicDef.label, passed: topicPassed, total: topicTotal });
}

console.log('\n' + '═'.repeat(60));
console.log('RESULTS BY TOPIC:');
console.log('─'.repeat(60));

for (const result of topicResults) {
  const emoji = result.passed === result.total ? '✅' : '⚠️ ';
  console.log(`${emoji} ${result.topic.padEnd(35)} ${result.passed}/${result.total} passed`);
}

console.log('\n' + '═'.repeat(60));
console.log(`OVERALL: ${passedTests}/${totalTests} tests passed`);
if (failedTests > 0) {
  console.log(`⚠️  ${failedTests} tests FAILED`);
  process.exit(1);
} else {
  console.log('✅ All tests PASSED — Ready for production!');
  process.exit(0);
}
