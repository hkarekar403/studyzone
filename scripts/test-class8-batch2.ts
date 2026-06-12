import generateClass8Question from '../lib/generators/class8';
import { Difficulty, Curriculum } from '../lib/generators/shared/types';

const topics = ['comparing-quantities', 'algebraic-expressions', 'data-handling', 'mensuration'];
const difficulties: Difficulty[] = ['Easy', 'Medium', 'Hard'];
const curriculum: Curriculum = 'CBSE';

console.log('═══════════════════════════════════════════════════════════════');
console.log('CLASS 8 BATCH 2 GENERATOR TEST');
console.log('═══════════════════════════════════════════════════════════════\n');

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

for (const topic of topics) {
  console.log(`\n📚 TOPIC: ${topic.toUpperCase()}`);
  console.log('─'.repeat(60));

  for (const difficulty of difficulties) {
    try {
      for (let i = 0; i < 3; i++) {
        totalTests++;
        const question = generateClass8Question(topic, difficulty, curriculum);

        // Validation checks
        const hasNaN = JSON.stringify(question).includes('NaN');
        const hasUndefined = JSON.stringify(question).includes('undefined');
        const hasInfinity = JSON.stringify(question).includes('Infinity');

        if (hasNaN || hasUndefined || hasInfinity) {
          console.log(`  ❌ ${difficulty} (attempt ${i + 1}): Invalid value in question`);
          console.log(`     ${JSON.stringify(question, null, 2).substring(0, 100)}...`);
          failedTests++;
        } else if (!question.displayAnswer || question.displayAnswer === '') {
          console.log(`  ❌ ${difficulty} (attempt ${i + 1}): Empty displayAnswer`);
          failedTests++;
        } else {
          console.log(`  ✓ ${difficulty} (attempt ${i + 1})`);
          console.log(`    Q: ${question.text.substring(0, 60)}...`);
          console.log(`    A: ${question.displayAnswer}`);
          passedTests++;
        }
      }
    } catch (error) {
      failedTests += 3;
      console.log(`  ❌ ${difficulty}: Error - ${(error as Error).message}`);
    }
  }
}

console.log('\n' + '═'.repeat(60));
console.log(`SUMMARY: ${passedTests}/${totalTests} tests passed`);
if (failedTests > 0) {
  console.log(`⚠️  ${failedTests} tests FAILED`);
  process.exit(1);
} else {
  console.log('✅ All tests PASSED');
  process.exit(0);
}
