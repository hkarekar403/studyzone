export interface Question {
  question: string;
  answer: string;
  working: string;
  topic?: string;
}

export class MathQuestionGenerator {
  private askedQuestions: Set<string> = new Set();

  private generators: Record<string, (() => Question)[]> = {
    Easy: [
      this.easyAddition,
      this.easySubtraction,
      this.easyMultiplication,
      this.easyPlaceValue,
      this.easyOddEven,
      this.easyFraction,
      this.easyTallyChart,
      this.easyProbability,
      this.easy2DShapes,
    ],
    Medium: [
      this.mediumWordProblem,
      this.mediumMultiplication,
      this.mediumDivision,
      this.mediumFactorsMultiples,
      this.mediumPrimeComposite,
      this.mediumSquareCube,
      this.mediumFractionAddition,
      this.mediumPerimeter,
      this.mediumMoney,
      this.mediumTime,
      this.mediumBarGraph,
      this.medium3DShapes,
    ],
    Hard: [
      this.hardMultiStep,
      this.hardDivisionRemainder,
      this.hardMeasurement,
      this.hardFractionUnlike,
      this.hardGeometryAngles,
      this.hardPatterns,
      this.hardAlgebra,
      this.hardArea,
      this.hardSymmetry,
      this.hardProbability,
    ],
  };

  private topicGenerators: Record<string, (() => Question)[]> = {
    "Addition": [this.easyAddition],
    "Subtraction": [this.easySubtraction],
    "Multiplication": [this.easyMultiplication, this.mediumMultiplication, this.hardMultiStep],
    "Division": [this.mediumDivision, this.hardDivisionRemainder],
    "Place Value": [this.easyPlaceValue],
    "Odd/Even": [this.easyOddEven],
    "Fractions": [this.easyFraction, this.mediumFractionAddition, this.hardFractionUnlike],
    "Factors & Multiples": [this.mediumFactorsMultiples],
    "Prime/Composite": [this.mediumPrimeComposite],
    "Squares & Cubes": [this.mediumSquareCube],
    "Geometry": [this.hardGeometryAngles, this.hardSymmetry, this.medium3DShapes],
    "Perimeter & Area": [this.mediumPerimeter, this.hardArea],
    "Money": [this.mediumMoney],
    "Time": [this.mediumTime],
    "Patterns": [this.hardPatterns],
    "Algebra": [this.hardAlgebra],
    "Measurement": [this.hardMeasurement],
    "Data Handling": [this.easyTallyChart, this.easyProbability, this.mediumBarGraph, this.hardProbability],
    "2D Shapes": [this.easy2DShapes],
  };

  // Maps each generator function to its display topic when randomly selected.
  // Uses prototype method references (stable, not affected by minification).
  private detectTopicMap: Map<() => Question, string> = new Map([
    [this.easyAddition, "Addition"],
    [this.easySubtraction, "Subtraction"],
    [this.easyMultiplication, "Multiplication"],
    [this.easyPlaceValue, "Place Value"],
    [this.easyOddEven, "Odd/Even"],
    [this.easyFraction, "Fractions"],
    [this.easyTallyChart, "Data Handling"],
    [this.easyProbability, "Data Handling"],
    [this.easy2DShapes, "2D Shapes"],
    [this.mediumWordProblem, "Word Problems"],
    [this.mediumMultiplication, "Multiplication"],
    [this.mediumDivision, "Division"],
    [this.mediumFactorsMultiples, "Factors & Multiples"],
    [this.mediumPrimeComposite, "Prime/Composite"],
    [this.mediumSquareCube, "Squares & Cubes"],
    [this.mediumFractionAddition, "Fractions"],
    [this.mediumPerimeter, "Perimeter & Area"],
    [this.mediumMoney, "Money"],
    [this.mediumTime, "Time"],
    [this.mediumBarGraph, "Data Handling"],
    [this.medium3DShapes, "Geometry"],
    [this.hardMultiStep, "Word Problems"],
    [this.hardDivisionRemainder, "Division"],
    [this.hardMeasurement, "Measurement"],
    [this.hardFractionUnlike, "Fractions"],
    [this.hardGeometryAngles, "Geometry"],
    [this.hardPatterns, "Patterns"],
    [this.hardAlgebra, "Algebra"],
    [this.hardArea, "Perimeter & Area"],
    [this.hardSymmetry, "Geometry"],
    [this.hardProbability, "Data Handling"],
  ]);

  getTopics(): string[] {
    return Object.keys(this.topicGenerators).sort();
  }

  clearSession(): void {
    this.askedQuestions.clear();
  }

  generate(difficulty: string, topic?: string): Question {
    let question: Question | null = null;

    for (let attempt = 0; attempt < 6; attempt++) {
      let q: Question;
      if (topic && topic in this.topicGenerators) {
        const fns = this.topicGenerators[topic];
        const fn = fns[Math.floor(Math.random() * fns.length)];
        q = { ...fn.call(this), topic };
      } else {
        const generators = this.generators[difficulty] || this.generators.Easy;
        const fn = generators[Math.floor(Math.random() * generators.length)];
        const result = fn.call(this) as Question;
        q = { ...result, topic: this.detectTopicMap.get(fn) || "General" };
      }

      if (!this.askedQuestions.has(q.question)) {
        question = q;
        break;
      }

      if (attempt === 5) {
        question = q;
      }
    }

    this.askedQuestions.add(question!.question);
    return question!;
  }

  private easyAddition(): Question {
    const a = Math.floor(Math.random() * 90) + 10;
    const b = Math.floor(Math.random() * 90) + 10;
    const total = a + b;
    const t = Math.floor(Math.random() * 4);
    const shopItems = ['pens', 'books', 'chocolates', 'mangoes', 'apples', 'biscuits'];
    const item = shopItems[Math.floor(Math.random() * shopItems.length)];
    switch (t) {
      case 0:
        return { question: `What is ${a} + ${b}?`, answer: total.toString(), working: `Working:\n${a} + ${b} = ${total}` };
      case 1:
        return { question: `A shop has ${a} red ${item} and ${b} blue ${item}. How many ${item} in total?`, answer: total.toString(), working: `Working:\n${a} + ${b} = ${total}` };
      case 2:
        return { question: `Find the sum of ${a} and ${b}.`, answer: total.toString(), working: `Working:\n${a} + ${b} = ${total}` };
      default:
        return { question: `${a} students are in class A and ${b} in class B. How many students altogether?`, answer: total.toString(), working: `Working:\n${a} + ${b} = ${total}` };
    }
  }

  private easySubtraction(): Question {
    const a = Math.floor(Math.random() * 91) + 30;
    const b = Math.floor(Math.random() * (a - 9)) + 10;
    const difference = a - b;
    const t = Math.floor(Math.random() * 4);
    const fruits = ['mangoes', 'apples', 'oranges', 'bananas'];
    const fruit = fruits[Math.floor(Math.random() * fruits.length)];
    const animals = ['birds', 'butterflies', 'cows', 'fish'];
    const animal = animals[Math.floor(Math.random() * animals.length)];
    switch (t) {
      case 0:
        return { question: `What is ${a} - ${b}?`, answer: difference.toString(), working: `Working:\n${a} - ${b} = ${difference}` };
      case 1:
        return { question: `A basket has ${a} ${fruit}. ${b} are eaten. How many are left?`, answer: difference.toString(), working: `Working:\n${a} - ${b} = ${difference}` };
      case 2:
        return { question: `Find the difference between ${a} and ${b}.`, answer: difference.toString(), working: `Working:\n${a} - ${b} = ${difference}` };
      default:
        return { question: `There are ${a} ${animal} on a tree. ${b} fly away. How many remain?`, answer: difference.toString(), working: `Working:\n${a} - ${b} = ${difference}` };
    }
  }

  private easyMultiplication(): Question {
    const a = Math.floor(Math.random() * 11) + 2;
    const b = Math.floor(Math.random() * 9) + 2;
    const product = a * b;
    const t = Math.floor(Math.random() * 4);
    const rowItems = ['apples', 'mangoes', 'oranges', 'chocolates'];
    const rowItem = rowItems[Math.floor(Math.random() * rowItems.length)];
    const handItems = ['pencils', 'notebooks', 'books', 'pens'];
    const handItem = handItems[Math.floor(Math.random() * handItems.length)];
    switch (t) {
      case 0:
        return { question: `What is ${a} × ${b}?`, answer: product.toString(), working: `Working:\n${a} × ${b} = ${product}` };
      case 1:
        return { question: `A box has ${a} rows of ${b} ${rowItem}. How many ${rowItem} in total?`, answer: product.toString(), working: `Working:\n${a} rows × ${b} = ${product} ${rowItem}` };
      case 2:
        return { question: `Find the product of ${a} and ${b}.`, answer: product.toString(), working: `Working:\n${a} × ${b} = ${product}` };
      default:
        return { question: `${a} children each have ${b} ${handItem}. How many ${handItem} altogether?`, answer: product.toString(), working: `Working:\n${a} × ${b} = ${product}` };
    }
  }

  private mediumWordProblem(): Question {
    const boxes = Math.floor(Math.random() * 7) + 3;
    const pencils = Math.floor(Math.random() * 5) + 4;
    const total = boxes * pencils;
    return {
      question: `A shopkeeper has ${boxes} boxes. Each box has ${pencils} pencils.\nHow many pencils are there in all?`,
      answer: total.toString(),
      working: `Working:\n${boxes} boxes x ${pencils} pencils = ${total} pencils`,
    };
  }

  private mediumMultiplication(): Question {
    const a = Math.floor(Math.random() * 19) + 11;
    const b = Math.floor(Math.random() * 7) + 3;
    const product = a * b;
    return {
      question: `Find the product:\n${a} x ${b} = ?`,
      answer: product.toString(),
      working: `Working:\n${a} x ${b} = ${product}`,
    };
  }

  private mediumDivision(): Question {
    const divisor = Math.floor(Math.random() * 7) + 3;
    const quotient = Math.floor(Math.random() * 9) + 4;
    const dividend = divisor * quotient;
    const t = Math.floor(Math.random() * 4);
    const shareItems = ['chocolates', 'mangoes', 'apples', 'biscuits'];
    const shareItem = shareItems[Math.floor(Math.random() * shareItems.length)];
    const arrangeItems = ['books', 'notebooks', 'pencils', 'pens'];
    const arrangeItem = arrangeItems[Math.floor(Math.random() * arrangeItems.length)];
    switch (t) {
      case 0:
        return { question: `What is ${dividend} ÷ ${divisor}?`, answer: quotient.toString(), working: `Working:\n${dividend} ÷ ${divisor} = ${quotient}` };
      case 1:
        return { question: `${dividend} ${shareItem} are shared equally among ${divisor} children. How many does each child get?`, answer: quotient.toString(), working: `Working:\n${dividend} ÷ ${divisor} = ${quotient}` };
      case 2:
        return { question: `Find the quotient when ${dividend} is divided by ${divisor}.`, answer: quotient.toString(), working: `Working:\n${dividend} ÷ ${divisor} = ${quotient}` };
      default:
        return { question: `${dividend} ${arrangeItem} are arranged in ${divisor} equal rows. How many ${arrangeItem} per row?`, answer: quotient.toString(), working: `Working:\n${dividend} ÷ ${divisor} = ${quotient}` };
    }
  }

  private hardMultiStep(): Question {
    const rows = Math.floor(Math.random() * 5) + 3;
    const perRow = Math.floor(Math.random() * 7) + 6;
    const extra = Math.floor(Math.random() * 16) + 10;
    const total = rows * perRow + extra;
    return {
      question: `There are ${rows} rows of chairs with ${perRow} chairs in each row.\n${extra} extra chairs are added later. How many chairs are there now?`,
      answer: total.toString(),
      working: `Working:\nChairs in rows = ${rows} x ${perRow} = ${rows * perRow}\nAdd extra chairs = ${rows * perRow} + ${extra} = ${total}`,
    };
  }

  private hardDivisionRemainder(): Question {
    const divisor = Math.floor(Math.random() * 6) + 4;
    const quotient = Math.floor(Math.random() * 7) + 8;
    const remainder = Math.floor(Math.random() * (divisor - 1)) + 1;
    const dividend = divisor * quotient + remainder;
    return {
      question: `Divide ${dividend} by ${divisor}.\nWrite the answer as quotient and remainder.`,
      answer: `Quotient = ${quotient}, Remainder = ${remainder}`,
      working: `Working:\n${divisor} x ${quotient} = ${divisor * quotient}\n${divisor * quotient} + ${remainder} = ${dividend}\nSo quotient = ${quotient} and remainder = ${remainder}`,
    };
  }

  private hardMeasurement(): Question {
    const metres = Math.floor(Math.random() * 7) + 2;
    const centimetres = Math.floor(Math.random() * 86) + 10;
    const totalCm = metres * 100 + centimetres;
    return {
      question: `Convert this length into centimetres:\n${metres} m ${centimetres} cm = ?`,
      answer: `${totalCm} cm`,
      working: `Working:\n${metres} m = ${metres} x 100 = ${metres * 100} cm\n${metres * 100} cm + ${centimetres} cm = ${totalCm} cm`,
    };
  }

  private easyPlaceValue(): Question {
    const num = Math.floor(Math.random() * 900000) + 100000;
    const numStr = num.toString();
    const digitIndex = Math.floor(Math.random() * numStr.length);
    const digit = numStr[digitIndex];
    const placeValue = parseInt(digit) * Math.pow(10, numStr.length - digitIndex - 1);
    return {
      question: `What is the place value of ${digit} in the number ${num}?`,
      answer: placeValue.toString(),
      working: `Working:\nThe digit ${digit} is in the ${this.getPlaceName(numStr.length - digitIndex - 1)} position.\nPlace value = ${digit} × ${Math.pow(10, numStr.length - digitIndex - 1)} = ${placeValue}`,
    };
  }

  private easyOddEven(): Question {
    const num = Math.floor(Math.random() * 200) + 1;
    const isOdd = num % 2 === 1;
    const answer = isOdd ? "Odd" : "Even";
    return {
      question: `Is ${num} an odd or even number?`,
      answer: answer,
      working: `Working:\n${num} ÷ 2 = ${num / 2}${isOdd ? " with remainder 1" : " exactly"}\nTherefore, ${num} is ${answer}.`,
    };
  }

  private easyFraction(): Question {
    const t = Math.floor(Math.random() * 4);

    if (t === 0) {
      const num1 = Math.floor(Math.random() * 8) + 1;
      const num2 = Math.floor(Math.random() * 8) + 1;
      if (num1 === num2) {
        return { question: `Which fraction is greater: ${num1}/10 or ${num2}/10?`, answer: `They are equal`, working: `Working:\nBoth fractions have denominator 10.\nCompare numerators: ${num1} = ${num2}\nTherefore, ${num1}/10 = ${num2}/10` };
      }
      const greater = Math.max(num1, num2);
      const lesser = Math.min(num1, num2);
      return { question: `Which fraction is greater: ${num1}/10 or ${num2}/10?`, answer: `${greater}/10`, working: `Working:\nBoth fractions have denominator 10.\nCompare numerators: ${greater} > ${lesser}\nTherefore, ${greater}/10 > ${lesser}/10` };
    } else if (t === 1) {
      const num = Math.floor(Math.random() * 7) + 1;
      const greaterNum = num + Math.floor(Math.random() * (9 - num)) + 1;
      return { question: `Write a fraction greater than ${num}/10.`, answer: `${greaterNum}/10`, working: `Working:\nA fraction with denominator 10 is greater if its numerator is larger.\n${num}/10 < ${greaterNum}/10 because ${num} < ${greaterNum}` };
    } else if (t === 2) {
      let n1 = Math.floor(Math.random() * 8) + 1;
      let n2 = Math.floor(Math.random() * 8) + 1;
      let n3 = Math.floor(Math.random() * 8) + 1;
      while (n2 === n1) n2 = Math.floor(Math.random() * 8) + 1;
      while (n3 === n1 || n3 === n2) n3 = Math.floor(Math.random() * 8) + 1;
      const sorted = [n1, n2, n3].sort((a, b) => a - b);
      return { question: `Arrange these fractions in ascending order:\n${n1}/10, ${n2}/10, ${n3}/10`, answer: sorted.map(n => `${n}/10`).join(', '), working: `Working:\nAll have denominator 10, so compare numerators.\nSmallest to largest: ${sorted[0]}, ${sorted[1]}, ${sorted[2]}\nAscending order: ${sorted.map(n => `${n}/10`).join(', ')}` };
    } else {
      const total = (Math.floor(Math.random() * 4) + 2) * (Math.floor(Math.random() * 3) + 2);
      const part = Math.floor(Math.random() * (total - 1)) + 1;
      return { question: `What fraction of ${total} is ${part}?`, answer: `${part}/${total}`, working: `Working:\nFraction = part ÷ total\n= ${part}/${total}` };
    }
  }

  private mediumFactorsMultiples(): Question {
    const type = Math.random() > 0.5 ? 'factors' : 'multiples';

    if (type === 'factors') {
      const num = (Math.floor(Math.random() * 12) + 2) * (Math.floor(Math.random() * 4) + 2);
      const factor = Math.floor(Math.random() * (num - 1)) + 1;
      const isFactorYes = num % factor === 0;
      return {
        question: `Is ${factor} a factor of ${num}?`,
        answer: isFactorYes ? "Yes" : "No",
        working: `Working:\n${num} ÷ ${factor} = ${num / factor}${isFactorYes ? " exactly" : " with remainder"}\nTherefore, ${factor} is ${isFactorYes ? "" : "not "} a factor of ${num}.`,
      };
    } else {
      const num = Math.floor(Math.random() * 12) + 2;
      const multiple = Math.floor(Math.random() * 6) + 1;
      return {
        question: `What is the ${multiple}th multiple of ${num}?`,
        answer: (num * multiple).toString(),
        working: `Working:\n${multiple}th multiple of ${num} = ${num} × ${multiple} = ${num * multiple}`,
      };
    }
  }

  private mediumPrimeComposite(): Question {
    const primes = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31];
    const composites = [4, 6, 8, 9, 10, 12, 14, 15, 16, 18, 20];
    const allNums = [...primes, ...composites];
    const num = allNums[Math.floor(Math.random() * allNums.length)];
    const isPrime = primes.includes(num);

    return {
      question: `Is ${num} a prime or composite number?`,
      answer: isPrime ? "Prime" : "Composite",
      working: `Working:\n${isPrime ? `${num} has only 2 factors: 1 and ${num}. It is PRIME.` : `${num} has more than 2 factors. It is COMPOSITE.`}`,
    };
  }

  private mediumSquareCube(): Question {
    const type = Math.random() > 0.5 ? 'square' : 'cube';
    const num = Math.floor(Math.random() * 8) + 2;

    if (type === 'square') {
      const result = num * num;
      return {
        question: `Find the square of ${num}.\n${num}² = ?`,
        answer: result.toString(),
        working: `Working:\n${num}² = ${num} × ${num} = ${result}`,
      };
    } else {
      const result = num * num * num;
      return {
        question: `Find the cube of ${num}.\n${num}³ = ?`,
        answer: result.toString(),
        working: `Working:\n${num}³ = ${num} × ${num} × ${num} = ${result}`,
      };
    }
  }

  private mediumFractionAddition(): Question {
    const denom = Math.floor(Math.random() * 6) + 4;
    const num1 = Math.floor(Math.random() * (denom - 1)) + 1;
    const num2 = Math.floor(Math.random() * (denom - num1)) + 1;
    const sum = num1 + num2;

    return {
      question: `Add the fractions:\n${num1}/${denom} + ${num2}/${denom} = ?`,
      answer: `${sum}/${denom}`,
      working: `Working:\nBoth fractions have the same denominator.\n${num1}/${denom} + ${num2}/${denom} = (${num1} + ${num2})/${denom} = ${sum}/${denom}`,
    };
  }

  private mediumPerimeter(): Question {
    const length = Math.floor(Math.random() * 8) + 3;
    const width = Math.floor(Math.random() * 6) + 2;
    const perimeter = 2 * (length + width);

    return {
      question: `Find the perimeter of a rectangle with length ${length} cm and width ${width} cm.`,
      answer: `${perimeter} cm`,
      working: `Working:\nPerimeter of rectangle = 2 × (length + width)\n= 2 × (${length} + ${width})\n= 2 × ${length + width}\n= ${perimeter} cm`,
    };
  }

  private mediumMoney(): Question {
    const t = Math.floor(Math.random() * 4);
    const shopItems = ['pen', 'book', 'chocolate', 'mango', 'apple', 'biscuit'];

    if (t === 0) {
      const item1 = shopItems[Math.floor(Math.random() * shopItems.length)];
      const item2 = shopItems.filter(i => i !== item1)[Math.floor(Math.random() * (shopItems.length - 1))];
      const a = Math.floor(Math.random() * 20) + 5;
      const b = Math.floor(Math.random() * 30) + 10;
      return { question: `A ${item1} costs ₹${a} and a ${item2} costs ₹${b}. How much do both cost?`, answer: `₹${a + b}`, working: `Working:\n₹${a} + ₹${b} = ₹${a + b}` };
    } else if (t === 1) {
      const a = Math.floor(Math.random() * 50) + 30;
      const b = Math.floor(Math.random() * (a - 10)) + 10;
      return { question: `You have ₹${a} and spend ₹${b}. How much is left?`, answer: `₹${a - b}`, working: `Working:\n₹${a} - ₹${b} = ₹${a - b}` };
    } else if (t === 2) {
      const item = shopItems[Math.floor(Math.random() * shopItems.length)];
      const qty = Math.floor(Math.random() * 5) + 2;
      const price = Math.floor(Math.random() * 15) + 5;
      return { question: `Find the total cost of ${qty} ${item}s at ₹${price} each.`, answer: `₹${qty * price}`, working: `Working:\n${qty} × ₹${price} = ₹${qty * price}` };
    } else {
      const friends = Math.floor(Math.random() * 4) + 2;
      const totalAmount = friends * (Math.floor(Math.random() * 10) + 5);
      return { question: `Share ₹${totalAmount} equally among ${friends} friends. How much does each get?`, answer: `₹${totalAmount / friends}`, working: `Working:\n₹${totalAmount} ÷ ${friends} = ₹${totalAmount / friends}` };
    }
  }

  private mediumTime(): Question {
    const t = Math.floor(Math.random() * 4);

    if (t === 0) {
      const h1 = Math.floor(Math.random() * 6) + 9;
      const m1 = Math.floor(Math.random() * 6) * 10;
      const durationMins = Math.floor(Math.random() * 90) + 30;
      const totalMins = h1 * 60 + m1 + durationMins;
      const h2 = Math.floor(totalMins / 60);
      const m2 = totalMins % 60;
      const dh = Math.floor(durationMins / 60);
      const dm = durationMins % 60;
      const durationStr = dh > 0 ? `${dh} hour${dh > 1 ? 's' : ''}${dm > 0 ? ` ${dm} minutes` : ''}` : `${durationMins} minutes`;
      return { question: `A movie starts at ${h1}:${m1.toString().padStart(2, '0')} and ends at ${h2}:${m2.toString().padStart(2, '0')}. How long is it?`, answer: durationStr, working: `Working:\nEnd time: ${h2}:${m2.toString().padStart(2, '0')}\nStart time: ${h1}:${m1.toString().padStart(2, '0')}\nDuration = ${durationMins} minutes = ${durationStr}` };
    } else if (t === 1) {
      const h = Math.floor(Math.random() * 10) + 7;
      const m = Math.floor(Math.random() * 6) * 10;
      const n = Math.floor(Math.random() * 5) + 1;
      const newH = h + n;
      return { question: `What time is ${n} hour${n > 1 ? 's' : ''} after ${h}:${m.toString().padStart(2, '0')}?`, answer: `${newH}:${m.toString().padStart(2, '0')}`, working: `Working:\nStart: ${h}:${m.toString().padStart(2, '0')}\nAdd ${n} hour${n > 1 ? 's' : ''}\nAnswer: ${newH}:${m.toString().padStart(2, '0')}` };
    } else if (t === 2) {
      const n = Math.floor(Math.random() * 5) + 1;
      return { question: `How many minutes are in ${n} hour${n > 1 ? 's' : ''}?`, answer: `${n * 60} minutes`, working: `Working:\n1 hour = 60 minutes\n${n} × 60 = ${n * 60} minutes` };
    } else {
      const hour = Math.floor(Math.random() * 12) + 1;
      const minute = Math.floor(Math.random() * 6) * 10;
      const addMinutes = Math.floor(Math.random() * 40) + 10;
      const endMinute = minute + addMinutes;
      const endHour = hour + Math.floor(endMinute / 60);
      const finalMinute = endMinute % 60;
      return { question: `A train leaves at ${hour}:${minute.toString().padStart(2, '0')} and arrives ${addMinutes} minutes later. What time does it arrive?`, answer: `${endHour}:${finalMinute.toString().padStart(2, '0')}`, working: `Working:\nLeave: ${hour}:${minute.toString().padStart(2, '0')}\nAdd ${addMinutes} minutes\nArrive: ${endHour}:${finalMinute.toString().padStart(2, '0')}` };
    }
  }

  private hardFractionUnlike(): Question {
    const denom1 = Math.floor(Math.random() * 4) + 2;
    const denom2 = Math.floor(Math.random() * 4) + 2;
    const num1 = Math.floor(Math.random() * (denom1 - 1)) + 1;
    const num2 = Math.floor(Math.random() * (denom2 - 1)) + 1;
    const lcm = this.lcm(denom1, denom2);
    const newNum1 = num1 * (lcm / denom1);
    const newNum2 = num2 * (lcm / denom2);
    const sumNum = newNum1 + newNum2;

    return {
      question: `Add: ${num1}/${denom1} + ${num2}/${denom2} = ?`,
      answer: `${sumNum}/${lcm}`,
      working: `Working:\nLCM of ${denom1} and ${denom2} = ${lcm}\n${num1}/${denom1} = ${newNum1}/${lcm}\n${num2}/${denom2} = ${newNum2}/${lcm}\n${newNum1}/${lcm} + ${newNum2}/${lcm} = ${sumNum}/${lcm}`,
    };
  }

  private hardGeometryAngles(): Question {
    const types = ['angle_sum', 'right_angle', 'acute_obtuse'];
    const type = types[Math.floor(Math.random() * types.length)];

    if (type === 'angle_sum') {
      const angle1 = Math.floor(Math.random() * 70) + 20;
      const angle2 = Math.floor(Math.random() * 70) + 20;
      const angle3 = 180 - angle1 - angle2;
      return {
        question: `In a triangle, two angles are ${angle1}° and ${angle2}°. What is the third angle?`,
        answer: `${angle3}°`,
        working: `Working:\nSum of angles in a triangle = 180°\n${angle1}° + ${angle2}° + ? = 180°\n? = 180° - ${angle1}° - ${angle2}° = ${angle3}°`,
      };
    } else if (type === 'right_angle') {
      return {
        question: `A right angle measures how many degrees?`,
        answer: `90°`,
        working: `Working:\nA right angle = 90°\nIt's represented by a small square in the corner.`,
      };
    } else {
      const angle = Math.floor(Math.random() * 170) + 1;
      const classification = angle < 90 ? 'acute' : angle === 90 ? 'right' : angle < 180 ? 'obtuse' : 'reflex';
      return {
        question: `Classify this angle: ${angle}°`,
        answer: classification.charAt(0).toUpperCase() + classification.slice(1),
        working: `Working:\n${angle}° is a ${classification} angle.\n${angle < 90 ? '(Less than 90°)' : angle === 90 ? '(Exactly 90°)' : '(Between 90° and 180°)'}`,
      };
    }
  }

  private hardPatterns(): Question {
    const start = Math.floor(Math.random() * 10) + 1;
    const diff = Math.floor(Math.random() * 5) + 1;
    const seq = [start, start + diff, start + 2 * diff, start + 3 * diff, '?'];
    const answer = start + 4 * diff;

    return {
      question: `Find the next number in the sequence:\n${seq.slice(0, 4).join(', ')}, ?`,
      answer: answer.toString(),
      working: `Working:\nPattern: Each number increases by ${diff}\n${start} + ${diff} = ${start + diff}\n${start + diff} + ${diff} = ${start + 2 * diff}\n${start + 2 * diff} + ${diff} = ${start + 3 * diff}\n${start + 3 * diff} + ${diff} = ${answer}`,
    };
  }

  private hardAlgebra(): Question {
    const x = Math.floor(Math.random() * 10) + 1;
    const a = Math.floor(Math.random() * 5) + 1;
    const b = Math.floor(Math.random() * 20) + 5;
    const sum = a * x + b;

    return {
      question: `Solve: ${a}x + ${b} = ${sum}. Find the value of x.`,
      answer: x.toString(),
      working: `Working:\n${a}x + ${b} = ${sum}\n${a}x = ${sum} - ${b}\n${a}x = ${sum - b}\nx = ${sum - b} ÷ ${a}\nx = ${x}`,
    };
  }

  private hardArea(): Question {
    const length = Math.floor(Math.random() * 12) + 5;
    const width = Math.floor(Math.random() * 8) + 3;
    const area = length * width;

    return {
      question: `Find the area of a rectangle with length ${length} cm and width ${width} cm.`,
      answer: `${area} cm²`,
      working: `Working:\nArea of rectangle = length × width\n= ${length} × ${width}\n= ${area} cm²`,
    };
  }

  private getPlaceName(power: number): string {
    const places = ['ones', 'tens', 'hundreds', 'thousands', 'ten thousands', 'hundred thousands'];
    return places[power] || 'higher place';
  }

  private lcm(a: number, b: number): number {
    return (a * b) / this.gcd(a, b);
  }

  private gcd(a: number, b: number): number {
    return b === 0 ? a : this.gcd(b, a % b);
  }

  private generateBarChartSVG(data: { label: string; count: number }[]): string {
    const BAR_H = 24;
    const GAP = 16;
    const LEFT_COL = 80;
    const BASELINE_X = 90;
    const SCALE = 8;
    const SVG_W = 300;
    const PAD_TOP = 8;
    const PAD_BOT = 8;
    const rowH = BAR_H + GAP;
    const totalH = PAD_TOP + data.length * rowH - GAP + PAD_BOT;

    const rows = data.map((d, i) => {
      const y = PAD_TOP + i * rowH;
      const barW = Math.max(d.count * SCALE, 4);
      const labelY = y + BAR_H / 2;
      return [
        `<text x="${LEFT_COL - 6}" y="${labelY}" dominant-baseline="middle" text-anchor="end" font-size="13" fill="#374151" font-family="inherit">${d.label}</text>`,
        `<rect x="${BASELINE_X}" y="${y}" width="${barW}" height="${BAR_H}" rx="4" fill="#2563eb"/>`,
        `<text x="${BASELINE_X + barW + 6}" y="${labelY}" dominant-baseline="middle" font-size="13" fill="#1e40af" font-family="inherit">${d.count}</text>`,
      ].join('');
    });

    return `<svg xmlns="http://www.w3.org/2000/svg" width="${SVG_W}" height="${totalH}" viewBox="0 0 ${SVG_W} ${totalH}">${rows.join('')}</svg>`;
  }

  private generateTallySVG(count: number): string {
    const LS = 8;           // px between vertical lines within a group
    const GG = 12;          // px gap between groups
    const PAD = 6;          // left/right padding
    const H = 50;           // SVG height
    const YT = 5;           // y top of vertical lines
    const YB = 45;          // y bottom (40px tall lines)
    const STROKE = '#2563eb';
    const SW = 2.5;

    const fullGroups = Math.floor(count / 5);
    const partial = count % 5;
    const lines: string[] = [];
    let x = PAD;

    for (let g = 0; g < fullGroups; g++) {
      const gx = x;
      for (let i = 0; i < 4; i++) {
        lines.push(`<line x1="${gx + i * LS}" y1="${YT}" x2="${gx + i * LS}" y2="${YB}" stroke="${STROKE}" stroke-width="${SW}" stroke-linecap="round"/>`);
      }
      // diagonal strike-through: bottom-left to top-right across all 4 lines
      lines.push(`<line x1="${gx - 4}" y1="${YB - 4}" x2="${gx + 3 * LS + 4}" y2="${YT + 4}" stroke="${STROKE}" stroke-width="${SW}" stroke-linecap="round"/>`);
      x = gx + 3 * LS + GG;
    }

    for (let i = 0; i < partial; i++) {
      lines.push(`<line x1="${x + i * LS}" y1="${YT}" x2="${x + i * LS}" y2="${YB}" stroke="${STROKE}" stroke-width="${SW}" stroke-linecap="round"/>`);
    }

    const endX = partial > 0 ? x + (partial - 1) * LS : x - GG;
    const totalWidth = endX + PAD;

    return `<svg xmlns="http://www.w3.org/2000/svg" width="${totalWidth}" height="${H}" viewBox="0 0 ${totalWidth} ${H}">${lines.join('')}</svg>`;
  }

  private easyTallyChart(): Question {
    const items = ['Apples', 'Oranges', 'Bananas', 'Grapes'];
    const item1 = items[Math.floor(Math.random() * items.length)];
    const count1 = Math.floor(Math.random() * 15) + 5;
    const svg = this.generateTallySVG(count1);

    return {
      question: `A tally chart shows:\n${item1}:\n\n[[TALLY_SVG]]${svg}\n\nHow many ${item1.toLowerCase()} were counted?`,
      answer: count1.toString(),
      working: `Working:\nEach group of 5 tally marks represents 5.\nYou have ${Math.floor(count1 / 5)} complete group${Math.floor(count1 / 5) !== 1 ? 's' : ''} = ${Math.floor(count1 / 5) * 5}\nPlus ${count1 % 5} extra = ${count1}`,
    };
  }

  private easyProbability(): Question {
    const outcomes = ['certain', 'impossible', 'possible'];
    const outcome = outcomes[Math.floor(Math.random() * outcomes.length)];

    let question = '';
    let answer = '';
    let working = '';

    if (outcome === 'certain') {
      question = `Is it CERTAIN that the sun will rise tomorrow?`;
      answer = "Yes";
      working = `Working:\nSomething is CERTAIN if it will always happen.\nThe sun always rises every day, so it is CERTAIN.`;
    } else if (outcome === 'impossible') {
      question = `Is it IMPOSSIBLE for a cat to fly without help?`;
      answer = "Yes";
      working = `Working:\nSomething is IMPOSSIBLE if it can never happen.\nCats cannot naturally fly, so it is IMPOSSIBLE.`;
    } else {
      question = `Is it POSSIBLE to roll a 6 on a die?`;
      answer = "Yes";
      working = `Working:\nSomething is POSSIBLE if it might happen.\nA die has 6 sides, so rolling a 6 is POSSIBLE.`;
    }

    return { question, answer, working };
  }

  private easy2DShapes(): Question {
    const shapes = [
      { name: 'Triangle', sides: 3, angles: 3 },
      { name: 'Square', sides: 4, angles: 4 },
      { name: 'Rectangle', sides: 4, angles: 4 },
      { name: 'Pentagon', sides: 5, angles: 5 },
    ];
    const shape = shapes[Math.floor(Math.random() * shapes.length)];
    const property = Math.random() > 0.5 ? 'sides' : 'angles';
    const value = property === 'sides' ? shape.sides : shape.angles;

    return {
      question: `How many ${property} does a ${shape.name} have?`,
      answer: value.toString(),
      working: `Working:\nA ${shape.name} has ${value} ${property}.`,
    };
  }

  private mediumBarGraph(): Question {
    const categories = ['Math', 'Science', 'English', 'Art'];
    const category = categories[Math.floor(Math.random() * categories.length)];
    const students: Record<string, number> = {};

    categories.forEach(cat => {
      students[cat] = Math.floor(Math.random() * 15) + 5;
    });

    const data = categories.map(cat => ({ label: cat, count: students[cat] }));
    const svg = this.generateBarChartSVG(data);

    return {
      question: `Based on the bar graph:\n\n[[TALLY_SVG]]${svg}\n\nHow many students prefer ${category}?`,
      answer: students[category].toString(),
      working: `Working:\nLooking at the bar graph, ${category} has ${students[category]} students.`,
    };
  }

  private medium3DShapes(): Question {
    const shapes = [
      { name: 'Cube', faces: 6, edges: 12, vertices: 8 },
      { name: 'Cuboid', faces: 6, edges: 12, vertices: 8 },
      { name: 'Cylinder', faces: 3, edges: 2, vertices: 0 },
      { name: 'Cone', faces: 2, edges: 1, vertices: 1 },
      { name: 'Sphere', faces: 1, edges: 0, vertices: 0 },
    ];
    const shape = shapes[Math.floor(Math.random() * shapes.length)];
    const property = Math.random() > 0.5 ? 'faces' : (Math.random() > 0.5 ? 'edges' : 'vertices');
    const value = shape[property as keyof typeof shape];

    return {
      question: `How many ${property} does a ${shape.name} have?`,
      answer: value.toString(),
      working: `Working:\nA ${shape.name} has ${value} ${property}.`,
    };
  }

  private hardSymmetry(): Question {
    const shapes = ['Square', 'Rectangle', 'Circle', 'Triangle', 'Pentagon', 'Hexagon'];
    const symmetryLines: Record<string, number | string> = {
      'Square': 4,
      'Rectangle': 2,
      'Circle': 'Infinite',
      'Triangle': 1,
      'Pentagon': 5,
      'Hexagon': 6,
    };
    const shape = shapes[Math.floor(Math.random() * shapes.length)];
    const lines = symmetryLines[shape];

    return {
      question: `How many lines of symmetry does a ${shape} have?`,
      answer: lines === 'Infinite' ? 'Infinite' : lines.toString(),
      working: `Working:\nA ${shape} has ${lines} line(s) of symmetry.\nA line of symmetry divides a shape into two identical halves.`,
    };
  }

  private hardProbability(): Question {
    const colors = ['Red', 'Blue', 'Green', 'Yellow'];
    const marbles: Record<string, number> = {};
    const totalMarbles = Math.floor(Math.random() * 15) + 15;
    let remaining = totalMarbles;

    colors.slice(0, 3).forEach((color, idx) => {
      if (idx === colors.length - 2) {
        marbles[color] = remaining;
      } else {
        const count = Math.floor(Math.random() * Math.floor(remaining / 2)) + 2;
        marbles[color] = count;
        remaining -= count;
      }
    });

    const colorList = Object.entries(marbles)
      .map(([color, count]) => `${count} ${color}`)
      .join(', ');
    const colorKeys = Object.keys(marbles);
    const targetColor = colorKeys[Math.floor(Math.random() * colorKeys.length)];
    const targetCount = marbles[targetColor];
    const probability = `${targetCount}/${totalMarbles}`;

    return {
      question: `A bag contains: ${colorList}.\nIf you pick one marble without looking, what is the probability of picking a ${targetColor} marble?`,
      answer: probability,
      working: `Working:\nTotal marbles = ${totalMarbles}\n${targetColor} marbles = ${targetCount}\nProbability = ${targetCount}/${totalMarbles}`,
    };
  }
}
