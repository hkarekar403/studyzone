import {
  Curriculum,
  Difficulty,
  Question,
  TopicDef,
  AnswerSpec,
} from './shared/types';
import {
  randInt,
  gcd,
  reduceFraction,
  addFractions,
  formatFraction,
  primeFactors,
  round,
} from './shared/mathUtils';

const CLASS8_TOPICS: TopicDef[] = [];

// ── TOPIC 1: Rational Numbers ──────────────────────────────────

function generateRationalNumbers(
  difficulty: Difficulty,
  curriculum: Curriculum
): Question {
  const id = `rational-numbers-${difficulty}-${curriculum}`;

  if (difficulty === 'Easy') {
    // Addition of two fractions with different denominators
    const denominators = [3, 4, 5, 6, 8, 9];
    let d1 = denominators[Math.floor(Math.random() * denominators.length)];
    let d2 = denominators[Math.floor(Math.random() * denominators.length)];
    while (d1 === d2) {
      d2 = denominators[Math.floor(Math.random() * denominators.length)];
    }

    let n1 = randInt(1, d1 - 1);
    let n2 = randInt(1, d2 - 1);

    // 50% chance to make n1 negative
    if (Math.random() < 0.5) {
      n1 = -n1;
    }

    const [resultNum, resultDen] = addFractions(n1, d1, n2, d2);

    return {
      id,
      class: 8,
      topic: 'Rational Numbers',
      curriculum,
      difficulty,
      text: `$\\frac{${n1}}{${d1}} + \\frac{${n2}}{${d2}} = ?$`,
      hint: 'Find LCM of denominators first',
      answerSpec: {
        kind: 'fraction',
        numerator: resultNum,
        denominator: resultDen,
      },
      displayAnswer: formatFraction(resultNum, resultDen),
    };
  }

  if (difficulty === 'Medium') {
    // Multiplication equation: x × (a/b) = result
    const b = randInt(3, 9);
    const a = randInt(1, b - 1);
    const x_num = Math.random() < 0.5 ? randInt(1, 5) : -randInt(1, 5);
    const x_den = b;

    // Result = (a/b) × (x_num/x_den)
    const [resultNum, resultDen] = reduceFraction(a * x_num, b * x_den);

    return {
      id,
      class: 8,
      topic: 'Rational Numbers',
      curriculum,
      difficulty,
      text: `Find $x$: $x \\times \\frac{${a}}{${b}} = \\frac{${resultNum}}{${resultDen}}$`,
      hint: 'Divide both sides by the rational coefficient',
      answerSpec: {
        kind: 'fraction',
        numerator: x_num,
        denominator: x_den,
      },
      displayAnswer: formatFraction(x_num, x_den),
    };
  }

  // Hard: Midpoint between two rationals
  const p = randInt(1, 5);
  const q = randInt(2, 8);
  let r = randInt(1, 5);
  let s = randInt(2, 8);
  while (s === q) {
    s = randInt(2, 8);
  }

  // Midpoint = (p/q + r/s) / 2 = (p*s + r*q) / (2*q*s)
  const [sum_num, sum_den] = addFractions(p, q, r, s);
  const [mid_num, mid_den] = reduceFraction(sum_num, sum_den * 2);

  return {
    id,
    class: 8,
    topic: 'Rational Numbers',
    curriculum,
    difficulty,
    text: `Find the rational number exactly halfway between $\\frac{${p}}{${q}}$ and $\\frac{${r}}{${s}}$.`,
    hint: 'Add both fractions, then divide by 2',
    answerSpec: {
      kind: 'fraction',
      numerator: mid_num,
      denominator: mid_den,
    },
    displayAnswer: formatFraction(mid_num, mid_den),
  };
}

CLASS8_TOPICS.push({
  id: 'rational-numbers',
  label: 'Rational Numbers',
  class: 8,
  generate: generateRationalNumbers,
});

// ── TOPIC 2: Linear Equations ──────────────────────────────────

function generateLinearEquations(
  difficulty: Difficulty,
  curriculum: Curriculum
): Question {
  const id = `linear-equations-${difficulty}-${curriculum}`;

  if (difficulty === 'Easy') {
    // ax + b = c
    const a = randInt(2, 5);
    const x = randInt(1, 15);
    const b = randInt(1, 20);
    const c = a * x + b;

    return {
      id,
      class: 8,
      topic: 'Linear Equations in One Variable',
      curriculum,
      difficulty,
      text: `Solve for $x$: $${a}x + ${b} = ${c}$`,
      answerSpec: {
        kind: 'integer',
        value: x,
      },
      displayAnswer: String(x),
    };
  }

  if (difficulty === 'Medium') {
    // (ax + b) / c = (dx + e) / f
    const x = randInt(2, 10);
    const a = randInt(2, 6);
    const c = randInt(2, 6);
    const d = randInt(2, 6);
    const f = randInt(2, 6);
    const e = 2;
    const b = c * (d * x + e) - a * x;

    return {
      id,
      class: 8,
      topic: 'Linear Equations in One Variable',
      curriculum,
      difficulty,
      text: `Solve for $x$: $\\frac{${a}x + ${b}}{${c}} = \\frac{${d}x + ${e}}{${f}}$`,
      hint: 'Cross multiply first',
      answerSpec: {
        kind: 'integer',
        value: x,
      },
      displayAnswer: String(x),
    };
  }

  // Hard: Two-digit number word problem
  const t = randInt(3, 8);
  let u = randInt(1, 9);
  while (u === t) {
    u = randInt(1, 9);
  }

  const number = 10 * t + u;
  const difference = 9 * (t - u);

  return {
    id,
    class: 8,
    topic: 'Linear Equations in One Variable',
    curriculum,
    difficulty,
    text: `The sum of digits of a two-digit number is ${t + u}. When the digits are reversed the number decreases by ${difference}. Find the original number.`,
    answerSpec: {
      kind: 'integer',
      value: number,
    },
    displayAnswer: String(number),
  };
}

CLASS8_TOPICS.push({
  id: 'linear-equations',
  label: 'Linear Equations in One Variable',
  class: 8,
  generate: generateLinearEquations,
});

// ── TOPIC 3: Squares & Square Roots ────────────────────────────

function generateSquaresSquareRoots(
  difficulty: Difficulty,
  curriculum: Curriculum
): Question {
  const id = `squares-square-roots-${difficulty}-${curriculum}`;

  if (difficulty === 'Easy') {
    // √(n²) = n
    const n = randInt(11, 25);
    return {
      id,
      class: 8,
      topic: 'Squares and Square Roots',
      curriculum,
      difficulty,
      text: `Simplify: $\\sqrt{${n * n}}$`,
      answerSpec: {
        kind: 'integer',
        value: n,
      },
      displayAnswer: String(n),
    };
  }

  if (difficulty === 'Medium') {
    // Smallest multiplier to make n a perfect square
    const primes = [2, 3, 5, 7, 11];
    const p = primes[Math.floor(Math.random() * primes.length)];
    let q = primes[Math.floor(Math.random() * primes.length)];
    while (q === p) {
      q = primes[Math.floor(Math.random() * primes.length)];
    }

    // n = p³ × q² → multiplier = p
    const n = Math.pow(p, 3) * Math.pow(q, 2);
    const factors = primeFactors(n);
    let multiplier = 1;
    for (const [prime, exp] of factors) {
      if (exp % 2 === 1) {
        multiplier *= prime;
      }
    }

    return {
      id,
      class: 8,
      topic: 'Squares and Square Roots',
      curriculum,
      difficulty,
      text: `Find the smallest positive integer by which ${n} must be multiplied to make it a perfect square.`,
      answerSpec: {
        kind: 'integer',
        value: multiplier,
      },
      displayAnswer: String(multiplier),
    };
  }

  // Hard: Estimate √n to 1 decimal place
  let n = randInt(150, 500);
  // Ensure it's not a perfect square
  while (Math.sqrt(n) === Math.floor(Math.sqrt(n))) {
    n = randInt(150, 500);
  }

  const sqrtValue = round(Math.sqrt(n), 1);

  return {
    id,
    class: 8,
    topic: 'Squares and Square Roots',
    curriculum,
    difficulty,
    text: `Find $\\sqrt{${n}}$ to 1 decimal place.`,
    hint: 'Find the two perfect squares ' + n + ' lies between',
    answerSpec: {
      kind: 'decimal',
      value: sqrtValue,
      tolerance: 0.05,
    },
    displayAnswer: sqrtValue.toFixed(1),
  };
}

CLASS8_TOPICS.push({
  id: 'squares-square-roots',
  label: 'Squares and Square Roots',
  class: 8,
  generate: generateSquaresSquareRoots,
});

// ── TOPIC 4: Cubes & Cube Roots ────────────────────────────────

function generateCubesCubeRoots(
  difficulty: Difficulty,
  curriculum: Curriculum
): Question {
  const id = `cubes-cube-roots-${difficulty}-${curriculum}`;

  if (difficulty === 'Easy') {
    // ∛(n³) = n
    const n = randInt(5, 15);
    const cubed = n * n * n;
    return {
      id,
      class: 8,
      topic: 'Cubes and Cube Roots',
      curriculum,
      difficulty,
      text: `Simplify: $\\sqrt[3]{${cubed}}$`,
      answerSpec: {
        kind: 'integer',
        value: n,
      },
      displayAnswer: String(n),
    };
  }

  if (difficulty === 'Medium') {
    // Smallest divisor to make n a perfect cube
    const primes = [2, 3, 5, 7];
    const p = primes[Math.floor(Math.random() * primes.length)];
    let q = primes[Math.floor(Math.random() * primes.length)];
    while (q === p) {
      q = primes[Math.floor(Math.random() * primes.length)];
    }

    // n = p⁴ × q³ → divisor = p (leaves p³)
    const n = Math.pow(p, 4) * Math.pow(q, 3);
    const factors = primeFactors(n);
    let divisor = 1;
    for (const [prime, exp] of factors) {
      const remainder = exp % 3;
      if (remainder > 0) {
        divisor *= Math.pow(prime, remainder);
      }
    }

    return {
      id,
      class: 8,
      topic: 'Cubes and Cube Roots',
      curriculum,
      difficulty,
      text: `Find the smallest positive integer by which ${n} must be divided to make it a perfect cube.`,
      answerSpec: {
        kind: 'integer',
        value: divisor,
      },
      displayAnswer: String(divisor),
    };
  }

  // Hard: Perfect cube root
  const base = randInt(10, 20);
  const n = base * base * base;

  return {
    id,
    class: 8,
    topic: 'Cubes and Cube Roots',
    curriculum,
    difficulty,
    text: `Find $\\sqrt[3]{${n}}$.`,
    answerSpec: {
      kind: 'integer',
      value: base,
    },
    displayAnswer: String(base),
  };
}

CLASS8_TOPICS.push({
  id: 'cubes-cube-roots',
  label: 'Cubes and Cube Roots',
  class: 8,
  generate: generateCubesCubeRoots,
});

// ── TOPIC 5: Exponents & Powers ────────────────────────────────

function generateExponentsPowers(
  difficulty: Difficulty,
  curriculum: Curriculum
): Question {
  const id = `exponents-powers-${difficulty}-${curriculum}`;

  if (difficulty === 'Easy') {
    // a^(-n) = 1/(a^n)
    const a = randInt(2, 5);
    const n = randInt(2, 4);
    const aToN = Math.pow(a, n);

    return {
      id,
      class: 8,
      topic: 'Exponents and Powers',
      curriculum,
      difficulty,
      text: `Evaluate $${a}^{-${n}}$ and express as a fraction.`,
      answerSpec: {
        kind: 'fraction',
        numerator: 1,
        denominator: aToN,
      },
      displayAnswer: `1/${aToN}`,
    };
  }

  if (difficulty === 'Medium') {
    // a^p × a^(-q) × a^r = a^(p-q+r)
    const a = randInt(2, 5);
    const p = randInt(2, 5);
    const q = randInt(1, 3);
    const r = randInt(1, 4);

    const k = p - q + r;
    let answer: AnswerSpec;
    let displayAnswer: string;

    if (k >= 0) {
      const value = Math.pow(a, k);
      answer = { kind: 'integer', value };
      displayAnswer = String(value);
    } else {
      answer = {
        kind: 'fraction',
        numerator: 1,
        denominator: Math.pow(a, -k),
      };
      displayAnswer = `1/${Math.pow(a, -k)}`;
    }

    return {
      id,
      class: 8,
      topic: 'Exponents and Powers',
      curriculum,
      difficulty,
      text: `Simplify and evaluate: $${a}^{${p}} \\times ${a}^{-${q}} \\times ${a}^{${r}}$`,
      answerSpec: answer,
      displayAnswer,
    };
  }

  // Hard: Solve (a/b)^(-m) × (a/b)^(2n) = (a/b)^k
  const rationals = [
    { a: 2, b: 3 },
    { a: 3, b: 5 },
    { a: 5, b: 7 },
    { a: 4, b: 9 },
  ];
  const { a, b } = rationals[Math.floor(Math.random() * rationals.length)];

  const m = randInt(2, 4);
  let k = randInt(2, 8);
  // Ensure (k + m) is even so n is an integer
  while ((k + m) % 2 !== 0) {
    k = randInt(2, 8);
  }
  const n = (k + m) / 2;

  return {
    id,
    class: 8,
    topic: 'Exponents and Powers',
    curriculum,
    difficulty,
    text: `Solve for $n$: $(\\frac{${a}}{${b}})^{-${m}} \\times (\\frac{${a}}{${b}})^{2n} = (\\frac{${a}}{${b}})^{${k}}$`,
    answerSpec: {
      kind: 'integer',
      value: n,
    },
    displayAnswer: String(n),
  };
}

CLASS8_TOPICS.push({
  id: 'exponents-powers',
  label: 'Exponents and Powers',
  class: 8,
  generate: generateExponentsPowers,
});

// ── TOPIC 6: Comparing Quantities ──────────────────────────────

function generateComparingQuantities(
  difficulty: Difficulty,
  curriculum: Curriculum
): Question {
  const id = `comparing-quantities-${difficulty}-${curriculum}`;

  if (difficulty === 'Easy') {
    // Percentage of a number
    const percentages = [5, 10, 15, 20, 25, 30, 40, 50, 60, 75];
    const percent = percentages[Math.floor(Math.random() * percentages.length)];
    const number = randInt(5, 25) * 20; // Multiple of 20 in [100, 500]
    const answer = Math.floor((percent * number) / 100);

    return {
      id,
      class: 8,
      topic: 'Comparing Quantities',
      curriculum,
      difficulty,
      text: `Find ${percent}\\% of ${number}.`,
      answerSpec: {
        kind: 'integer',
        value: answer,
      },
      displayAnswer: String(answer),
    };
  }

  if (difficulty === 'Medium') {
    // CP and SP given, find profit percent
    const cp = randInt(4, 12) * 100; // Multiple of 100 in [400, 1200]
    const profit_percent = [5, 10, 12, 15, 20, 25][Math.floor(Math.random() * 6)];
    const sp = Math.floor(cp * (1 + profit_percent / 100));

    return {
      id,
      class: 8,
      topic: 'Comparing Quantities',
      curriculum,
      difficulty,
      text: `CP = ₹${cp}, SP = ₹${sp}. Find profit percent.`,
      answerSpec: {
        kind: 'integer',
        value: profit_percent,
      },
      displayAnswer: String(profit_percent),
    };
  }

  // Hard: Compound Interest, half-yearly
  const principals = [4000, 6000, 8000, 10000];
  const P = principals[Math.floor(Math.random() * principals.length)];
  const annualRate = [8, 10, 12][Math.floor(Math.random() * 3)];
  const halfRate = annualRate / 2;

  // CI = P × ((1 + r/200)² - 1)
  const amount = P * Math.pow(1 + annualRate / 200, 2);
  const ci = Math.round(amount - P);

  return {
    id,
    class: 8,
    topic: 'Comparing Quantities',
    curriculum,
    difficulty,
    text: `Find the compound interest on ₹${P} at ${annualRate}\\% per annum for 1 year, compounded half-yearly.`,
    hint: 'Half-yearly: divide rate by 2, multiply periods by 2',
    answerSpec: {
      kind: 'integer',
      value: ci,
    },
    displayAnswer: String(ci),
  };
}

CLASS8_TOPICS.push({
  id: 'comparing-quantities',
  label: 'Comparing Quantities',
  class: 8,
  generate: generateComparingQuantities,
});

// ── TOPIC 7: Algebraic Expressions ────────────────────────────

function generateAlgebraicExpressions(
  difficulty: Difficulty,
  curriculum: Curriculum
): Question {
  const id = `algebraic-expressions-${difficulty}-${curriculum}`;

  if (difficulty === 'Easy') {
    // Add two polynomials with MCQ
    const a1 = randInt(-5, 5);
    const b1 = randInt(-5, 5);
    const c1 = randInt(-5, 5);
    const a2 = randInt(-5, 5);
    const b2 = randInt(-5, 5);
    const c2 = randInt(-5, 5);

    const resultA = a1 + a2;
    const resultB = b1 + b2;
    const resultC = c1 + c2;

    const correctAnswer = `${resultA}x² + ${resultB}x + ${resultC}`;
    const options = [
      correctAnswer,
      `${resultA}x² + ${resultB + 1}x + ${resultC}`,
      `${resultA + 1}x² + ${resultB}x + ${resultC}`,
      `${resultA}x² + ${resultB}x + ${resultC + 1}`,
    ];

    // Shuffle options
    const shuffled = options.sort(() => Math.random() - 0.5);
    const correctIndex = shuffled.indexOf(correctAnswer);

    return {
      id,
      class: 8,
      topic: 'Algebraic Expressions and Identities',
      curriculum,
      difficulty,
      text: `Add: $(${a1}x² + ${b1}x + ${c1}) + (${a2}x² + ${b2}x + ${c2})$`,
      answerSpec: {
        kind: 'mcq',
        options: shuffled,
        correctIndex,
      },
      displayAnswer: correctAnswer,
    };
  }

  if (difficulty === 'Medium') {
    // Expand (ax + b)(cx + d)
    const a = randInt(1, 4);
    const c = randInt(1, 4);
    const b = randInt(-6, 6);
    const d = randInt(-6, 6);

    const ac = a * c;
    const adbc = a * d + b * c;
    const bd = b * d;

    const correctAnswer = `${ac}x² + ${adbc}x + ${bd}`;
    const options = [
      correctAnswer,
      `${ac}x² + ${adbc + 1}x + ${bd}`,
      `${ac + 1}x² + ${adbc}x + ${bd}`,
      `${ac}x² + ${adbc}x + ${bd + 1}`,
    ];

    const shuffled = options.sort(() => Math.random() - 0.5);
    const correctIndex = shuffled.indexOf(correctAnswer);

    return {
      id,
      class: 8,
      topic: 'Algebraic Expressions and Identities',
      curriculum,
      difficulty,
      text: `Expand: $(${a}x + ${b})(${c}x + ${d})$`,
      answerSpec: {
        kind: 'mcq',
        options: shuffled,
        correctIndex,
      },
      displayAnswer: correctAnswer,
    };
  }

  // Hard: Use identity
  const ns = [97, 98, 99, 101, 102, 103];
  const n = ns[Math.floor(Math.random() * ns.length)];
  const answer = n * n;

  return {
    id,
    class: 8,
    topic: 'Algebraic Expressions and Identities',
    curriculum,
    difficulty,
    text: `Evaluate ${n}² using an algebraic identity.`,
    hint: 'Express as $(a \\pm b)²$ using a round number',
    answerSpec: {
      kind: 'integer',
      value: answer,
    },
    displayAnswer: String(answer),
  };
}

CLASS8_TOPICS.push({
  id: 'algebraic-expressions',
  label: 'Algebraic Expressions and Identities',
  class: 8,
  generate: generateAlgebraicExpressions,
});

// ── TOPIC 8: Data Handling & Probability ───────────────────────

function generateDataHandling(
  difficulty: Difficulty,
  curriculum: Curriculum
): Question {
  const id = `data-handling-${difficulty}-${curriculum}`;

  if (difficulty === 'Easy') {
    // Simple probability with die
    const events = [
      { name: 'even', favorable: 3 }, // 2, 4, 6
      { name: 'odd', favorable: 3 }, // 1, 3, 5
      { name: 'multiple of 3', favorable: 2 }, // 3, 6
      { name: 'greater than 4', favorable: 2 }, // 5, 6
      { name: 'equal to 6', favorable: 1 }, // 6
    ];

    const event = events[Math.floor(Math.random() * events.length)];
    const total = 6;
    const [num, den] = reduceFraction(event.favorable, total);

    return {
      id,
      class: 8,
      topic: 'Data Handling and Probability',
      curriculum,
      difficulty,
      text: `A die is rolled. Find the probability of getting a number that is ${event.name}.`,
      answerSpec: {
        kind: 'fraction',
        numerator: num,
        denominator: den,
      },
      displayAnswer: formatFraction(num, den),
    };
  }

  if (difficulty === 'Medium') {
    // Pie chart reading
    const total = Math.random() < 0.5 ? 360 : 720;
    const angles = [30, 45, 60, 90, 120];
    const angle = angles[Math.floor(Math.random() * angles.length)];
    const students = Math.round((total * angle) / 360);

    return {
      id,
      class: 8,
      topic: 'Data Handling and Probability',
      curriculum,
      difficulty,
      text: `In a pie chart of ${total} students, a sector representing Science has angle ${angle}°. How many students are represented by this sector?`,
      answerSpec: {
        kind: 'integer',
        value: students,
      },
      displayAnswer: String(students),
    };
  }

  // Hard: Complementary probability
  const total = randInt(10, 20);
  let r = randInt(1, total - 2);
  let b = randInt(1, total - r - 1);
  const g = total - r - b;

  const [num, den] = reduceFraction(g, total);

  return {
    id,
    class: 8,
    topic: 'Data Handling and Probability',
    curriculum,
    difficulty,
    text: `A bag contains ${r} red, ${g} green, and ${b} blue balls. One ball is picked at random. Find the probability it is neither red nor blue.`,
    answerSpec: {
      kind: 'fraction',
      numerator: num,
      denominator: den,
    },
    displayAnswer: formatFraction(num, den),
  };
}

CLASS8_TOPICS.push({
  id: 'data-handling',
  label: 'Data Handling and Probability',
  class: 8,
  generate: generateDataHandling,
});

// ── TOPIC 9: Mensuration ──────────────────────────────────────

function generateMensuration(
  difficulty: Difficulty,
  curriculum: Curriculum
): Question {
  const id = `mensuration-${difficulty}-${curriculum}`;

  if (difficulty === 'Easy') {
    // Area of trapezium
    const a = randInt(6, 14);
    const b = randInt(a + 2, a + 8);
    const h = randInt(4, 10);

    // Ensure (a+b)*h is even
    while (((a + b) * h) % 2 !== 0) {
      a;
    }

    const area = Math.floor(((a + b) * h) / 2);

    return {
      id,
      class: 8,
      topic: 'Mensuration',
      curriculum,
      difficulty,
      text: `Find the area of a trapezium with parallel sides ${a} cm and ${b} cm, and height ${h} cm.`,
      answerSpec: {
        kind: 'integer',
        value: area,
      },
      displayAnswer: `${area} cm²`,
    };
  }

  if (difficulty === 'Medium') {
    // Volume of cylinder with π = 22/7
    const r = randInt(1, 3) * 7; // Multiple of 7: 7, 14, 21
    const h = randInt(5, 20);

    // Volume = (22/7) × r² × h
    const volume = Math.round((22 / 7) * r * r * h);

    return {
      id,
      class: 8,
      topic: 'Mensuration',
      curriculum,
      difficulty,
      text: `Find the volume of a cylinder with radius ${r} cm and height ${h} cm. (Use π = 22/7)`,
      answerSpec: {
        kind: 'integer',
        value: volume,
      },
      displayAnswer: `${volume} cm³`,
    };
  }

  // Hard: Hollow cylinder TSA
  const R = randInt(10, 14);
  const rInner = R - randInt(2, 4);
  const hh = randInt(8, 15);

  // TSA = 2π(R²-r²+Rh+rh), using π = 22/7
  const pi_frac = 22 / 7;
  const term1 = R * R - rInner * rInner;
  const term2 = (R + rInner) * hh;
  const tsa = Math.round(2 * pi_frac * (term1 + term2));

  return {
    id,
    class: 8,
    topic: 'Mensuration',
    curriculum,
    difficulty,
    text: `Find the total surface area of a hollow cylinder with outer radius ${R} cm, inner radius ${rInner} cm, and height ${hh} cm. (Use π = 22/7)`,
    hint: 'TSA = 2π(R² − r²) + 2πh(R + r)',
    answerSpec: {
      kind: 'integer',
      value: tsa,
    },
    displayAnswer: `${tsa} cm²`,
  };
}

CLASS8_TOPICS.push({
  id: 'mensuration',
  label: 'Mensuration',
  class: 8,
  generate: generateMensuration,
});

// ── TOPIC 10: Understanding Quadrilaterals ─────────────────────

function generateQuadrilaterals(
  difficulty: Difficulty,
  curriculum: Curriculum
): Question {
  const id = `quadrilaterals-${difficulty}-${curriculum}`;

  if (difficulty === 'Easy') {
    // Find fourth angle of quadrilateral
    const a = randInt(40, 100);
    const b = randInt(40, 100);
    const c = randInt(40, 100);
    while (a + b + c >= 360) {
      // Ensure sum < 360
    }
    const fourth = 360 - a - b - c;

    return {
      id,
      class: 8,
      topic: 'Understanding Quadrilaterals',
      curriculum,
      difficulty,
      text: `A quadrilateral has three angles measuring ${a}°, ${b}°, and ${c}°. Find the fourth angle.`,
      answerSpec: {
        kind: 'integer',
        value: fourth,
      },
      displayAnswer: `${fourth}°`,
    };
  }

  if (difficulty === 'Medium') {
    // Parallelogram angles — MCQ
    const x = randInt(55, 85);
    const supplementary = 180 - x;

    const correctAnswer = `${x}°, ${supplementary}°, ${x}°, ${supplementary}°`;
    const options = [
      correctAnswer,
      `${x}°, ${x}°, ${x}°, ${x}°`,
      `${x}°, ${supplementary}°, ${supplementary}°, ${x}°`,
      `${supplementary}°, ${supplementary}°, ${supplementary}°, ${supplementary}°`,
    ];

    const shuffled = options.sort(() => Math.random() - 0.5);
    const correctIndex = shuffled.indexOf(correctAnswer);

    return {
      id,
      class: 8,
      topic: 'Understanding Quadrilaterals',
      curriculum,
      difficulty,
      text: `In a parallelogram, one angle is ${x}°. What are all four angles?`,
      answerSpec: {
        kind: 'mcq',
        options: shuffled,
        correctIndex,
      },
      displayAnswer: correctAnswer,
    };
  }

  // Hard: Rhombus diagonals to side length
  const pythagorean = [
    [3, 4, 5],
    [5, 12, 13],
    [8, 15, 17],
    [7, 24, 25],
  ];
  const triple = pythagorean[Math.floor(Math.random() * pythagorean.length)];
  const d1 = 2 * triple[0];
  const d2 = 2 * triple[1];
  const side = triple[2];

  return {
    id,
    class: 8,
    topic: 'Understanding Quadrilaterals',
    curriculum,
    difficulty,
    text: `The diagonals of a rhombus are ${d1} cm and ${d2} cm. Find the side length.`,
    answerSpec: {
      kind: 'integer',
      value: side,
    },
    displayAnswer: `${side} cm`,
  };
}

CLASS8_TOPICS.push({
  id: 'quadrilaterals',
  label: 'Understanding Quadrilaterals',
  class: 8,
  generate: generateQuadrilaterals,
});

// ── TOPIC 11: Introduction to Graphs ────────────────────────────

function generateIntroToGraphs(
  difficulty: Difficulty,
  curriculum: Curriculum
): Question {
  const id = `intro-to-graphs-${difficulty}-${curriculum}`;

  if (difficulty === 'Easy') {
    // Coordinate question
    const x = randInt(1, 9);
    const y = randInt(1, 9);
    const askX = Math.random() < 0.5;

    if (askX) {
      return {
        id,
        class: 8,
        topic: 'Introduction to Graphs',
        curriculum,
        difficulty,
        text: `Point A is ${x} units right and ${y} units up from the origin. What is the x-coordinate of A?`,
        answerSpec: {
          kind: 'integer',
          value: x,
        },
        displayAnswer: String(x),
      };
    } else {
      return {
        id,
        class: 8,
        topic: 'Introduction to Graphs',
        curriculum,
        difficulty,
        text: `Point A is ${x} units right and ${y} units up from the origin. What is the y-coordinate of A?`,
        answerSpec: {
          kind: 'integer',
          value: y,
        },
        displayAnswer: String(y),
      };
    }
  }

  if (difficulty === 'Medium') {
    // Linear graph: y = kx
    const k = randInt(2, 7);
    const val = randInt(3, 9);
    const y = k * val;

    return {
      id,
      class: 8,
      topic: 'Introduction to Graphs',
      curriculum,
      difficulty,
      text: `A graph shows $y = ${k}x$. If $x = ${val}$, what is $y$?`,
      answerSpec: {
        kind: 'integer',
        value: y,
      },
      displayAnswer: String(y),
    };
  }

  // Hard: Linear graph: y = mx + c, solve for x
  const m = randInt(2, 5);
  const c = randInt(1, 10);
  const x = randInt(2, 8);
  const target = m * x + c;

  return {
    id,
    class: 8,
    topic: 'Introduction to Graphs',
    curriculum,
    difficulty,
    text: `A graph shows $y = ${m}x + ${c}$. For what value of $x$ is $y = ${target}$?`,
    answerSpec: {
      kind: 'integer',
      value: x,
    },
    displayAnswer: String(x),
  };
}

CLASS8_TOPICS.push({
  id: 'intro-to-graphs',
  label: 'Introduction to Graphs',
  class: 8,
  generate: generateIntroToGraphs,
});

// ── ALL TOPICS IMPLEMENTED ────────────────────────────────────
// Total: 11 topics for Class 8
// 1. Rational Numbers
// 2. Linear Equations
// 3. Squares & Square Roots
// 4. Cubes & Cube Roots
// 5. Exponents & Powers
// 6. Comparing Quantities
// 7. Algebraic Expressions
// 8. Data Handling & Probability
// 9. Mensuration
// 10. Quadrilaterals
// 11. Introduction to Graphs

// ── EXPORTS ────────────────────────────────────────────────────

export { CLASS8_TOPICS };

export function generateClass8Question(
  topic: string,
  difficulty: Difficulty,
  curriculum: Curriculum
): Question {
  const topicDef = CLASS8_TOPICS.find((t) => t.id === topic);
  if (!topicDef) {
    throw new Error(`Unknown topic: ${topic}`);
  }
  return topicDef.generate(difficulty, curriculum);
}

export default generateClass8Question;
