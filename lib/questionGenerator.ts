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
    const t = Math.floor(Math.random() * 4);

    if (t === 0) {
      const boxes = Math.floor(Math.random() * 7) + 3;
      const pencils = Math.floor(Math.random() * 5) + 4;
      return {
        question: `A shopkeeper has ${boxes} boxes. Each box has ${pencils} pencils.\nHow many pencils are there in all?`,
        answer: (boxes * pencils).toString(),
        working: `Working:\n${boxes} boxes × ${pencils} pencils = ${boxes * pencils} pencils`,
      };
    } else if (t === 1) {
      const coaches = Math.floor(Math.random() * 8) + 3;
      const seats = Math.floor(Math.random() * 12) + 8;
      return {
        question: `A train has ${coaches} coaches. Each coach has ${seats} seats.\nHow many seats are there in total?`,
        answer: (coaches * seats).toString(),
        working: `Working:\n${coaches} coaches × ${seats} seats = ${coaches * seats} seats`,
      };
    } else if (t === 2) {
      const rows = Math.floor(Math.random() * 6) + 3;
      const perRow = Math.floor(Math.random() * 7) + 4;
      const students = rows * perRow;
      return {
        question: `${students} students sit in ${rows} equal rows.\nHow many students are in each row?`,
        answer: perRow.toString(),
        working: `Working:\n${students} ÷ ${rows} = ${perRow} students per row`,
      };
    } else {
      const rows = Math.floor(Math.random() * 6) + 3;
      const perRow = Math.floor(Math.random() * 8) + 4;
      const trees = rows * perRow;
      return {
        question: `A farmer plants ${trees} trees in ${rows} equal rows.\nHow many trees are in each row?`,
        answer: perRow.toString(),
        working: `Working:\n${trees} ÷ ${rows} = ${perRow} trees per row`,
      };
    }
  }

  private mediumMultiplication(): Question {
    const a = Math.floor(Math.random() * 19) + 11;
    const b = Math.floor(Math.random() * 7) + 3;
    const product = a * b;
    const t = Math.floor(Math.random() * 4);

    if (t === 0) {
      return {
        question: `Find the product:\n${a} × ${b} = ?`,
        answer: product.toString(),
        working: `Working:\n${a} × ${b} = ${product}`,
      };
    } else if (t === 1) {
      return {
        question: `Multiply ${a} by ${b}.`,
        answer: product.toString(),
        working: `Working:\n${a} × ${b} = ${product}`,
      };
    } else if (t === 2) {
      return {
        question: `A rectangle is ${a} cm long and ${b} cm wide.\nWhat is its area?`,
        answer: `${product} cm²`,
        working: `Working:\nArea = length × width\n= ${a} × ${b}\n= ${product} cm²`,
      };
    } else {
      return {
        question: `${a} packets each contain ${b} biscuits.\nHow many biscuits are there in total?`,
        answer: product.toString(),
        working: `Working:\n${a} × ${b} = ${product} biscuits`,
      };
    }
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
    const t = Math.floor(Math.random() * 4);

    if (t === 0) {
      const rows = Math.floor(Math.random() * 5) + 3;
      const perRow = Math.floor(Math.random() * 7) + 6;
      const extra = Math.floor(Math.random() * 16) + 10;
      const total = rows * perRow + extra;
      return {
        question: `There are ${rows} rows of chairs with ${perRow} chairs in each row.\n${extra} extra chairs are added later. How many chairs are there now?`,
        answer: total.toString(),
        working: `Working:\nChairs in rows = ${rows} × ${perRow} = ${rows * perRow}\nAdd extra chairs = ${rows * perRow} + ${extra} = ${total}`,
      };
    } else if (t === 1) {
      const sold = Math.floor(Math.random() * 30) + 10;
      const added = Math.floor(Math.random() * 20) + 5;
      const initial = sold + Math.floor(Math.random() * 20) + 15;
      const result = initial - sold + added;
      return {
        question: `A shopkeeper had ${initial} items. He sold ${sold} items and then received ${added} new ones.\nHow many items does he have now?`,
        answer: result.toString(),
        working: `Working:\nStart: ${initial}\nAfter selling: ${initial} - ${sold} = ${initial - sold}\nAfter receiving: ${initial - sold} + ${added} = ${result}`,
      };
    } else if (t === 2) {
      const initial = Math.floor(Math.random() * 20) + 30;
      const left = Math.floor(Math.random() * 10) + 5;
      const joined = Math.floor(Math.random() * 10) + 5;
      const result = initial - left + joined;
      return {
        question: `A class has ${initial} students. ${left} students left and then ${joined} new students joined.\nHow many students are there now?`,
        answer: result.toString(),
        working: `Working:\nStart: ${initial}\nAfter leaving: ${initial} - ${left} = ${initial - left}\nAfter joining: ${initial - left} + ${joined} = ${result}`,
      };
    } else {
      const used = Math.floor(Math.random() * 30) + 10;
      const added = Math.floor(Math.random() * 20) + 5;
      const initial = used + Math.floor(Math.random() * 20) + 15;
      const result = initial - used + added;
      return {
        question: `A tank holds ${initial} litres of water. ${used} litres are used, then ${added} litres are added.\nHow many litres remain in the tank?`,
        answer: result.toString(),
        working: `Working:\nStart: ${initial} litres\nAfter using: ${initial} - ${used} = ${initial - used} litres\nAfter adding: ${initial - used} + ${added} = ${result} litres`,
      };
    }
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
    const t = Math.floor(Math.random() * 4);

    if (t === 0) {
      const digitIndex = Math.floor(Math.random() * numStr.length);
      const digit = numStr[digitIndex];
      const placeValue = parseInt(digit) * Math.pow(10, numStr.length - digitIndex - 1);
      return {
        question: `What is the place value of ${digit} in the number ${num}?`,
        answer: placeValue.toString(),
        working: `Working:\nThe digit ${digit} is in the ${this.getPlaceName(numStr.length - digitIndex - 1)} position.\nPlace value = ${digit} × ${Math.pow(10, numStr.length - digitIndex - 1)} = ${placeValue}`,
      };
    } else if (t === 1) {
      const placeIndex = Math.floor(Math.random() * numStr.length);
      const placeName = this.getPlaceName(numStr.length - placeIndex - 1);
      const digit = numStr[placeIndex];
      return {
        question: `In the number ${num}, which digit is in the ${placeName} place?`,
        answer: digit,
        working: `Working:\n${num} has digits: ${numStr.split('').join(', ')}\nThe digit in the ${placeName} place is ${digit}.`,
      };
    } else if (t === 2) {
      const parts = numStr.split('').map((d, i) => parseInt(d) * Math.pow(10, numStr.length - i - 1)).filter(v => v > 0);
      const answer = parts.join(' + ');
      const workingLines = numStr.split('').map((d, i) => `${d} × ${Math.pow(10, numStr.length - i - 1)} = ${parseInt(d) * Math.pow(10, numStr.length - i - 1)}`);
      return {
        question: `Write the expanded form of ${num}.`,
        answer: answer,
        working: `Working:\n${workingLines.join('\n')}\nExpanded form = ${answer}`,
      };
    } else {
      const digitIndex = Math.floor(Math.random() * numStr.length);
      const digit = numStr[digitIndex];
      return {
        question: `What is the face value of ${digit} in the number ${num}?`,
        answer: digit,
        working: `Working:\nFace value of a digit is the digit itself, regardless of its position.\nFace value of ${digit} = ${digit}`,
      };
    }
  }

  private easyOddEven(): Question {
    const t = Math.floor(Math.random() * 4);

    if (t === 0) {
      const num = Math.floor(Math.random() * 200) + 1;
      const isOdd = num % 2 === 1;
      const answer = isOdd ? "Odd" : "Even";
      return {
        question: `Is ${num} an odd or even number?`,
        answer: answer,
        working: `Working:\n${num} ÷ 2 = ${Math.floor(num / 2)}${isOdd ? " remainder 1" : " exactly"}\nTherefore, ${num} is ${answer}.`,
      };
    } else if (t === 1) {
      const oddNum = Math.floor(Math.random() * 50) * 2 + 1;
      let even1 = Math.floor(Math.random() * 50) * 2 + 2;
      let even2 = Math.floor(Math.random() * 50) * 2 + 2;
      while (even2 === even1) even2 = Math.floor(Math.random() * 50) * 2 + 2;
      const nums = [oddNum, even1, even2].sort(() => Math.random() - 0.5);
      return {
        question: `Which of these is an odd number?\n${nums.join(', ')}`,
        answer: oddNum.toString(),
        working: `Working:\nA number is odd if it cannot be divided equally by 2.\n${nums.map(n => `${n}: ${n % 2 === 0 ? 'Even' : 'Odd'}`).join(', ')}\nThe odd number is ${oddNum}.`,
      };
    } else if (t === 2) {
      const num = Math.floor(Math.random() * 100) + 1;
      const nextEven = num % 2 === 0 ? num + 2 : num + 1;
      return {
        question: `What is the next even number after ${num}?`,
        answer: nextEven.toString(),
        working: `Working:\nEven numbers are multiples of 2.\n${num % 2 === 0 ? `${num} is even, so the next even number is ${num} + 2 = ${nextEven}.` : `${num} is odd, so the next even number is ${num} + 1 = ${nextEven}.`}`,
      };
    } else {
      const a = Math.floor(Math.random() * 20) + 1;
      const b = a + Math.floor(Math.random() * 10) + 5;
      const odds = [];
      for (let i = a + 1; i < b; i++) { if (i % 2 !== 0) odds.push(i); }
      return {
        question: `How many odd numbers are there between ${a} and ${b}?`,
        answer: odds.length.toString(),
        working: `Working:\nOdd numbers between ${a} and ${b}: ${odds.length > 0 ? odds.join(', ') : 'none'}\nCount = ${odds.length}`,
      };
    }
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
    const allPrimes = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47];
    const composites = [4, 6, 8, 9, 10, 12, 14, 15, 16, 18, 20];
    const t = Math.floor(Math.random() * 4);

    if (t === 0) {
      const pool = [...allPrimes.slice(0, 11), ...composites];
      const num = pool[Math.floor(Math.random() * pool.length)];
      const isPrime = allPrimes.includes(num);
      return {
        question: `Is ${num} a prime or composite number?`,
        answer: isPrime ? "Prime" : "Composite",
        working: `Working:\n${isPrime ? `${num} has only 2 factors: 1 and ${num}. It is PRIME.` : `${num} has more than 2 factors. It is COMPOSITE.`}`,
      };
    } else if (t === 1) {
      const ranges: [number, number][] = [[1, 20], [10, 30], [20, 40], [1, 15]];
      const [a, b] = ranges[Math.floor(Math.random() * ranges.length)];
      const inRange = allPrimes.filter(p => p > a && p < b);
      return {
        question: `List all prime numbers between ${a} and ${b}.`,
        answer: inRange.join(', '),
        working: `Working:\nPrime numbers have exactly 2 factors: 1 and themselves.\nPrimes between ${a} and ${b}: ${inRange.join(', ')}`,
      };
    } else if (t === 2) {
      const startOptions = [10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30];
      const startNum = startOptions[Math.floor(Math.random() * startOptions.length)];
      const nextPrime = allPrimes.find(p => p > startNum)!;
      return {
        question: `What is the smallest prime number greater than ${startNum}?`,
        answer: nextPrime.toString(),
        working: `Working:\nChecking numbers after ${startNum}...\n${nextPrime} has only 2 factors: 1 and ${nextPrime}.\nIt is the smallest prime greater than ${startNum}.`,
      };
    } else {
      const upToOptions = [10, 15, 20, 25, 30];
      const upTo = upToOptions[Math.floor(Math.random() * upToOptions.length)];
      const primesUpTo = allPrimes.filter(p => p <= upTo);
      return {
        question: `How many prime numbers are there between 1 and ${upTo}?`,
        answer: primesUpTo.length.toString(),
        working: `Working:\nPrimes up to ${upTo}: ${primesUpTo.join(', ')}\nCount = ${primesUpTo.length}`,
      };
    }
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
    const t = Math.floor(Math.random() * 4);

    if (t === 0) {
      const num1 = Math.floor(Math.random() * (denom - 1)) + 1;
      const num2 = Math.floor(Math.random() * (denom - num1)) + 1;
      const sum = num1 + num2;
      return {
        question: `Add the fractions:\n${num1}/${denom} + ${num2}/${denom} = ?`,
        answer: `${sum}/${denom}`,
        working: `Working:\nBoth fractions have the same denominator.\n${num1}/${denom} + ${num2}/${denom} = (${num1} + ${num2})/${denom} = ${sum}/${denom}`,
      };
    } else if (t === 1) {
      const bigger = Math.floor(Math.random() * (denom - 2)) + 2;
      const smaller = Math.floor(Math.random() * (bigger - 1)) + 1;
      const diff = bigger - smaller;
      return {
        question: `Subtract the fractions:\n${bigger}/${denom} - ${smaller}/${denom} = ?`,
        answer: `${diff}/${denom}`,
        working: `Working:\nBoth fractions have the same denominator.\n${bigger}/${denom} - ${smaller}/${denom} = (${bigger} - ${smaller})/${denom} = ${diff}/${denom}`,
      };
    } else if (t === 2) {
      const num1 = Math.floor(Math.random() * Math.floor(denom / 2)) + 1;
      const num2 = Math.floor(Math.random() * (denom - num1 - 1)) + 1;
      const sum = num1 + num2;
      return {
        question: `A pizza is cut into ${denom} slices. Ravi ate ${num1} slices and Meena ate ${num2} slices.\nWhat fraction of the pizza was eaten?`,
        answer: `${sum}/${denom}`,
        working: `Working:\nRavi ate ${num1}/${denom}, Meena ate ${num2}/${denom}\nTotal eaten = (${num1} + ${num2})/${denom} = ${sum}/${denom}`,
      };
    } else {
      const num1 = Math.floor(Math.random() * (denom - 1)) + 1;
      const complement = denom - num1;
      return {
        question: `What fraction must be added to ${num1}/${denom} to make 1 whole?`,
        answer: `${complement}/${denom}`,
        working: `Working:\n1 whole = ${denom}/${denom}\n${denom}/${denom} - ${num1}/${denom} = ${complement}/${denom}`,
      };
    }
  }

  private mediumPerimeter(): Question {
    const t = Math.floor(Math.random() * 4);

    if (t === 0) {
      const length = Math.floor(Math.random() * 8) + 3;
      const width = Math.floor(Math.random() * 6) + 2;
      const perimeter = 2 * (length + width);
      return {
        question: `Find the perimeter of a rectangle with length ${length} cm and width ${width} cm.`,
        answer: `${perimeter} cm`,
        working: `Working:\nPerimeter of rectangle = 2 × (length + width)\n= 2 × (${length} + ${width})\n= 2 × ${length + width}\n= ${perimeter} cm`,
      };
    } else if (t === 1) {
      const side = Math.floor(Math.random() * 12) + 3;
      return {
        question: `A square has a side of ${side} cm. Find its perimeter.`,
        answer: `${4 * side} cm`,
        working: `Working:\nPerimeter of square = 4 × side\n= 4 × ${side}\n= ${4 * side} cm`,
      };
    } else if (t === 2) {
      const width = Math.floor(Math.random() * 6) + 2;
      const length = Math.floor(Math.random() * 8) + 3;
      const perimeter = 2 * (length + width);
      return {
        question: `The perimeter of a rectangle is ${perimeter} cm and its length is ${length} cm.\nFind its width.`,
        answer: `${width} cm`,
        working: `Working:\nPerimeter = 2 × (length + width)\n${perimeter} = 2 × (${length} + width)\n${perimeter / 2} = ${length} + width\nwidth = ${perimeter / 2} - ${length} = ${width} cm`,
      };
    } else {
      const length = Math.floor(Math.random() * 20) + 10;
      const width = Math.floor(Math.random() * 10) + 5;
      const perimeter = 2 * (length + width);
      return {
        question: `A park is ${length} m long and ${width} m wide.\nHow much fencing is needed to go all the way around it?`,
        answer: `${perimeter} m`,
        working: `Working:\nFencing needed = Perimeter = 2 × (length + width)\n= 2 × (${length} + ${width})\n= 2 × ${length + width}\n= ${perimeter} m`,
      };
    }
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
        question: `In a triangle, two angles are ${angle1}° and ${angle2}°. What is the third angle?\n\n[[TALLY_SVG]]${this.generateShapeSVG('Triangle')}`,
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
        question: `Classify this angle: ${angle}°\n\n[[TALLY_SVG]]${this.generateAngleSVG(angle)}`,
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

  private generateShapeSVG(shape: string): string {
    const fill = '#eff6ff';
    const stroke = '#2563eb';
    const sw = 2.5;
    const W = 120, H = 120;
    const cx = 60, cy = 60;

    const polyPoints = (n: number, r: number): string =>
      Array.from({ length: n }, (_, i) => {
        const a = -Math.PI / 2 + (i * 2 * Math.PI) / n;
        return `${(cx + r * Math.cos(a)).toFixed(1)},${(cy + r * Math.sin(a)).toFixed(1)}`;
      }).join(' ');

    let shapeEl: string;
    switch (shape) {
      case 'Triangle':
        shapeEl = `<polygon points="${polyPoints(3, 52)}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}" stroke-linejoin="round"/>`;
        break;
      case 'Square':
        shapeEl = `<rect x="20" y="20" width="80" height="80" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"/>`;
        break;
      case 'Rectangle':
        shapeEl = `<rect x="10" y="30" width="100" height="60" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"/>`;
        break;
      case 'Pentagon':
        shapeEl = `<polygon points="${polyPoints(5, 50)}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}" stroke-linejoin="round"/>`;
        break;
      case 'Hexagon':
        shapeEl = `<polygon points="${polyPoints(6, 50)}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}" stroke-linejoin="round"/>`;
        break;
      case 'Circle':
        shapeEl = `<circle cx="${cx}" cy="${cy}" r="45" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"/>`;
        break;
      default:
        shapeEl = `<circle cx="${cx}" cy="${cy}" r="45" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"/>`;
    }

    return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${shapeEl}</svg>`;
  }

  private generateAngleSVG(degrees: number): string {
    const W = 150, H = 120;
    const ox = 75, oy = 95;
    const rayLen = 65;
    const arcR = 28;

    const rad = (degrees * Math.PI) / 180;
    const rayEndX = (ox + rayLen * Math.cos(rad)).toFixed(1);
    const rayEndY = (oy - rayLen * Math.sin(rad)).toFixed(1);
    const arcEndX = (ox + arcR * Math.cos(rad)).toFixed(1);
    const arcEndY = (oy - arcR * Math.sin(rad)).toFixed(1);
    const largeArc = degrees > 180 ? 1 : 0;

    const halfRad = (degrees / 2) * (Math.PI / 180);
    const labelX = (ox + (arcR + 18) * Math.cos(halfRad)).toFixed(1);
    const labelY = (oy - (arcR + 18) * Math.sin(halfRad)).toFixed(1);

    return (
      `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">` +
      `<line x1="${ox}" y1="${oy}" x2="${ox + rayLen}" y2="${oy}" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round"/>` +
      `<line x1="${ox}" y1="${oy}" x2="${rayEndX}" y2="${rayEndY}" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round"/>` +
      `<path d="M ${ox + arcR} ${oy} A ${arcR} ${arcR} 0 ${largeArc} 0 ${arcEndX} ${arcEndY}" fill="none" stroke="#f59e0b" stroke-width="2" stroke-linecap="round"/>` +
      `<text x="${labelX}" y="${labelY}" text-anchor="middle" dominant-baseline="middle" font-size="12" fill="#374151" font-family="inherit">${degrees}°</text>` +
      `</svg>`
    );
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
      { name: 'Hexagon', sides: 6, angles: 6 },
    ];
    const reverseShapes = [
      { name: 'Triangle', sides: 3 },
      { name: 'Pentagon', sides: 5 },
      { name: 'Hexagon', sides: 6 },
    ];
    const t = Math.floor(Math.random() * 4);

    if (t === 0) {
      const shape = shapes[Math.floor(Math.random() * shapes.length)];
      return {
        question: `How many sides does a ${shape.name} have?\n\n[[TALLY_SVG]]${this.generateShapeSVG(shape.name)}`,
        answer: shape.sides.toString(),
        working: `Working:\nA ${shape.name} has ${shape.sides} sides.`,
      };
    } else if (t === 1) {
      const shape = shapes[Math.floor(Math.random() * shapes.length)];
      return {
        question: `How many angles does a ${shape.name} have?\n\n[[TALLY_SVG]]${this.generateShapeSVG(shape.name)}`,
        answer: shape.angles.toString(),
        working: `Working:\nA ${shape.name} has ${shape.angles} angles.`,
      };
    } else if (t === 2) {
      const shape = reverseShapes[Math.floor(Math.random() * reverseShapes.length)];
      return {
        question: `A shape has ${shape.sides} sides. What is it called?`,
        answer: shape.name,
        working: `Working:\nA polygon with ${shape.sides} sides is called a ${shape.name}.`,
      };
    } else {
      const shape = reverseShapes[Math.floor(Math.random() * reverseShapes.length)];
      return {
        question: `Which shape has ${shape.sides} sides and ${shape.sides} angles?`,
        answer: shape.name,
        working: `Working:\nA ${shape.name} has ${shape.sides} sides and ${shape.sides} angles.`,
      };
    }
  }

  private mediumBarGraph(): Question {
    const categories = ['Math', 'Science', 'English', 'Art'];
    const students: Record<string, number> = {};
    categories.forEach(cat => {
      students[cat] = Math.floor(Math.random() * 15) + 5;
    });
    const data = categories.map(cat => ({ label: cat, count: students[cat] }));
    const svg = this.generateBarChartSVG(data);
    const t = Math.floor(Math.random() * 4);

    if (t === 0) {
      const category = categories[Math.floor(Math.random() * categories.length)];
      return {
        question: `Based on the bar graph:\n\n[[TALLY_SVG]]${svg}\n\nHow many students prefer ${category}?`,
        answer: students[category].toString(),
        working: `Working:\nLooking at the bar graph, ${category} has ${students[category]} students.`,
      };
    } else if (t === 1) {
      const maxCount = Math.max(...Object.values(students));
      const mostPopular = categories.find(c => students[c] === maxCount)!;
      return {
        question: `Based on the bar graph:\n\n[[TALLY_SVG]]${svg}\n\nWhich subject is the most popular?`,
        answer: mostPopular,
        working: `Working:\n${categories.map(c => `${c}: ${students[c]}`).join(', ')}\nHighest count = ${maxCount} (${mostPopular})`,
      };
    } else if (t === 2) {
      let cat1 = categories[Math.floor(Math.random() * categories.length)];
      let cat2 = categories[Math.floor(Math.random() * categories.length)];
      while (cat2 === cat1) cat2 = categories[Math.floor(Math.random() * categories.length)];
      const moreCat = students[cat1] >= students[cat2] ? cat1 : cat2;
      const lessCat = students[cat1] >= students[cat2] ? cat2 : cat1;
      const diff = students[moreCat] - students[lessCat];
      return {
        question: `Based on the bar graph:\n\n[[TALLY_SVG]]${svg}\n\nHow many more students prefer ${moreCat} than ${lessCat}?`,
        answer: diff.toString(),
        working: `Working:\n${moreCat}: ${students[moreCat]} students\n${lessCat}: ${students[lessCat]} students\nDifference = ${students[moreCat]} - ${students[lessCat]} = ${diff}`,
      };
    } else {
      const total = Object.values(students).reduce((sum, v) => sum + v, 0);
      return {
        question: `Based on the bar graph:\n\n[[TALLY_SVG]]${svg}\n\nWhat is the total number of students surveyed?`,
        answer: total.toString(),
        working: `Working:\n${categories.map(c => `${c}: ${students[c]}`).join('\n')}\nTotal = ${Object.values(students).join(' + ')} = ${total}`,
      };
    }
  }

  private medium3DShapes(): Question {
    const shapes = [
      { name: 'Cube', faces: 6, edges: 12, vertices: 8 },
      { name: 'Cuboid', faces: 6, edges: 12, vertices: 8 },
      { name: 'Cylinder', faces: 3, edges: 2, vertices: 0 },
      { name: 'Cone', faces: 2, edges: 1, vertices: 1 },
      { name: 'Sphere', faces: 1, edges: 0, vertices: 0 },
    ];
    const reverseShapes = [
      { name: 'Sphere', faces: 1 },
      { name: 'Cone', faces: 2 },
      { name: 'Cylinder', faces: 3 },
    ];
    const t = Math.floor(Math.random() * 4);

    if (t === 0) {
      const shape = shapes[Math.floor(Math.random() * shapes.length)];
      return {
        question: `How many faces does a ${shape.name} have?`,
        answer: shape.faces.toString(),
        working: `Working:\nA ${shape.name} has ${shape.faces} face${shape.faces !== 1 ? 's' : ''}.`,
      };
    } else if (t === 1) {
      const shape = shapes[Math.floor(Math.random() * shapes.length)];
      return {
        question: `How many edges does a ${shape.name} have?`,
        answer: shape.edges.toString(),
        working: `Working:\nA ${shape.name} has ${shape.edges} edge${shape.edges !== 1 ? 's' : ''}.`,
      };
    } else if (t === 2) {
      const shape = shapes[Math.floor(Math.random() * shapes.length)];
      return {
        question: `How many vertices does a ${shape.name} have?`,
        answer: shape.vertices.toString(),
        working: `Working:\nA ${shape.name} has ${shape.vertices} ${shape.vertices !== 1 ? 'vertices' : 'vertex'}.`,
      };
    } else {
      const shape = reverseShapes[Math.floor(Math.random() * reverseShapes.length)];
      return {
        question: `A 3D shape has ${shape.faces} face${shape.faces !== 1 ? 's' : ''}. What is this shape called?`,
        answer: shape.name,
        working: `Working:\nA shape with ${shape.faces} face${shape.faces !== 1 ? 's' : ''} is a ${shape.name}.`,
      };
    }
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
      question: `How many lines of symmetry does a ${shape} have?\n\n[[TALLY_SVG]]${this.generateShapeSVG(shape)}`,
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
