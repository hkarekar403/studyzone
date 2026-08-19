// Topic landing page configuration.
//
// Each entry drives one statically-generated page at /topics/<slug>. The
// `generatorKey` MUST match a key in the topic maps in lib/questionGenerator.ts —
// it is what the quiz CTA passes through as ?topic=, and a mismatch silently
// drops the child on a random topic instead. The `curriculums` list is likewise
// derived from which curriculum maps actually contain that key, so the badges
// on the page are true rather than aspirational.

export type Difficulty = "Easy" | "Medium" | "Hard"
export type Curriculum = "CBSE" | "ICSE" | "IGCSE"

export interface SampleQuestion {
  text: string
  answer: string
  difficulty: Difficulty
}

export interface TopicConfig {
  slug: string
  title: string
  /** Key in lib/questionGenerator.ts topic maps — used for the ?topic= deep link. */
  generatorKey: string
  /** One-line summary, reused as the meta description seed. */
  description: string
  /** Longer, teacher-facing framing shown on the page. */
  intro: string
  educationalLevel: string
  curriculums: Curriculum[]
  sampleQuestions: SampleQuestion[]
  learningObjectives: string[]
  keywords: string[]
}

export const TOPIC_CONFIGS: TopicConfig[] = [
  {
    slug: "addition",
    title: "Addition",
    generatorKey: "Addition",
    description: "Add multi-digit numbers with carrying, and apply addition to everyday word problems.",
    intro:
      "Addition in Class 4 moves beyond single digits into three- and four-digit numbers where carrying matters. Questions start with straightforward sums and build towards word problems where the child has to decide that addition is the right operation in the first place.",
    educationalLevel: "Grade 4",
    curriculums: ["CBSE", "ICSE", "IGCSE"],
    sampleQuestions: [
      { text: "234 + 145 = ?", answer: "379", difficulty: "Easy" },
      { text: "2456 + 3789 = ?", answer: "6245", difficulty: "Medium" },
      { text: "A shop has 1234 apples and buys 2567 more. How many apples does the shop have now?", answer: "3801", difficulty: "Hard" },
    ],
    learningObjectives: [
      "Add two- and three-digit numbers without carrying",
      "Add four-digit numbers with carrying across place values",
      "Recognise when a word problem calls for addition",
      "Estimate a sum before calculating it",
    ],
    keywords: ["addition class 4", "grade 4 addition", "adding with carrying", "free addition practice", "column addition"],
  },
  {
    slug: "subtraction",
    title: "Subtraction",
    generatorKey: "Subtraction",
    description: "Subtract numbers with borrowing across place values, including zeros in the middle.",
    intro:
      "Subtraction is where borrowing trips most Class 4 children up, especially when there is a zero to borrow across. These questions deliberately mix clean subtractions with ones that force regrouping, so the skill is practised rather than avoided.",
    educationalLevel: "Grade 4",
    curriculums: ["CBSE", "ICSE", "IGCSE"],
    sampleQuestions: [
      { text: "856 - 342 = ?", answer: "514", difficulty: "Easy" },
      { text: "5004 - 2876 = ?", answer: "2128", difficulty: "Medium" },
      { text: "A library has 3250 books. 1485 books are borrowed. How many books are left in the library?", answer: "1765", difficulty: "Hard" },
    ],
    learningObjectives: [
      "Subtract three-digit numbers without regrouping",
      "Borrow across one or more place values",
      "Handle subtraction where the top number contains zeros",
      "Check a subtraction by adding the answer back",
    ],
    keywords: ["subtraction class 4", "grade 4 subtraction", "borrowing subtraction", "regrouping practice", "free subtraction practice"],
  },
  {
    slug: "multiplication",
    title: "Multiplication",
    generatorKey: "Multiplication",
    description: "Multiply up to three-digit numbers and solve multi-step multiplication word problems.",
    intro:
      "Class 4 multiplication rests on fluent times tables, then extends to multiplying larger numbers by a single digit and into two-digit multipliers. The harder questions are multi-step: the child multiplies, then does something with the result.",
    educationalLevel: "Grade 4",
    curriculums: ["CBSE", "ICSE", "IGCSE"],
    sampleQuestions: [
      { text: "12 x 4 = ?", answer: "48", difficulty: "Easy" },
      { text: "234 x 5 = ?", answer: "1170", difficulty: "Medium" },
      { text: "A bookshop sells 45 books each day. How many books does it sell in 12 days?", answer: "540", difficulty: "Hard" },
    ],
    learningObjectives: [
      "Recall times tables up to 12 x 12",
      "Multiply a two- or three-digit number by a single digit",
      "Multiply by a two-digit number",
      "Solve multi-step word problems involving multiplication",
    ],
    keywords: ["multiplication class 4", "grade 4 multiplication", "times tables practice", "free multiplication practice", "multiplication word problems"],
  },
  {
    slug: "division",
    title: "Division",
    generatorKey: "Division",
    description: "Divide with and without remainders, and interpret what a remainder means in context.",
    intro:
      "Division at this level covers sharing equally, grouping, and long division by one- and two-digit divisors. The step that matters most is interpretation: a remainder of 3 means something different when sharing sweets than when packing boxes.",
    educationalLevel: "Grade 4",
    curriculums: ["CBSE", "ICSE", "IGCSE"],
    sampleQuestions: [
      { text: "48 / 6 = ?", answer: "8", difficulty: "Easy" },
      { text: "456 / 12 = ?", answer: "38", difficulty: "Medium" },
      { text: "5 friends share 23 cookies equally. How many cookies does each friend get, and how many are left over?", answer: "4 each, remainder 3", difficulty: "Hard" },
    ],
    learningObjectives: [
      "Divide by a single-digit number",
      "Divide by a two-digit number using long division",
      "Understand and interpret remainders",
      "Decide whether a word problem needs division",
    ],
    keywords: ["division class 4", "grade 4 division", "long division practice", "division with remainders", "free division practice"],
  },
  {
    slug: "place-value",
    title: "Place Value",
    generatorKey: "Place Value",
    description: "Understand ones, tens, hundreds and thousands, and spot place-value errors in worked examples.",
    intro:
      "Place value underpins every other topic in Class 4 — carrying, borrowing and rounding all depend on it. Alongside straight identification questions, this topic includes spot-the-error diagrams where the child has to find the mistake in someone else's reasoning.",
    educationalLevel: "Grade 4",
    curriculums: ["CBSE"],
    sampleQuestions: [
      { text: "In the number 4738, what is the place value of the digit 7?", answer: "700", difficulty: "Easy" },
      { text: "Which digit is in the thousands place in 62415?", answer: "2", difficulty: "Medium" },
      { text: "Rahul says the 5 in 3542 has a value of 50. Is he right? If not, what is its value?", answer: "No - its value is 500", difficulty: "Hard" },
    ],
    learningObjectives: [
      "Identify the place of each digit in a number up to five digits",
      "State the place value of a digit, not just its place",
      "Write numbers in expanded form",
      "Spot and correct place-value mistakes",
    ],
    keywords: ["place value class 4", "grade 4 place value", "expanded form", "thousands hundreds tens ones", "free place value practice"],
  },
  {
    slug: "odd-even-numbers",
    title: "Odd & Even Numbers",
    generatorKey: "Odd/Even",
    description: "Identify and classify odd and even numbers, and reason about what happens when you combine them.",
    intro:
      "Odd and even is quick to state and easy to test, which makes it a good early confidence win. The more interesting questions ask what happens when odds and evens are added together — the first taste of a general rule rather than a single answer.",
    educationalLevel: "Grade 4",
    curriculums: ["CBSE"],
    sampleQuestions: [
      { text: "Is 47 an odd number or an even number?", answer: "Odd", difficulty: "Easy" },
      { text: "Which of these numbers is even: 23, 31, 46, 59?", answer: "46", difficulty: "Easy" },
      { text: "If you add two odd numbers together, is the answer always odd or always even?", answer: "Even", difficulty: "Medium" },
    ],
    learningObjectives: [
      "Classify a number as odd or even",
      "Use the ones digit as the test for evenness",
      "Predict whether a sum of odd and even numbers is odd or even",
      "Sort a list of numbers into odd and even groups",
    ],
    keywords: ["odd and even numbers class 4", "grade 4 odd even", "odd even practice", "free odd and even numbers", "number classification"],
  },
  {
    slug: "fractions",
    title: "Fractions",
    generatorKey: "Fractions",
    description: "Compare, add and subtract fractions, using fraction walls and percentage grids as visual support.",
    intro:
      "Fractions are the single biggest conceptual jump in Class 4. Practice pairs symbolic work — comparing, adding and subtracting — with visual fraction walls and percentage grids, so the child can see why 1/2 is larger than 1/3 rather than memorising it.",
    educationalLevel: "Grade 4",
    curriculums: ["CBSE", "ICSE", "IGCSE"],
    sampleQuestions: [
      { text: "Which fraction is bigger: 1/2 or 3/4?", answer: "3/4", difficulty: "Easy" },
      { text: "1/4 + 2/4 = ?", answer: "3/4", difficulty: "Easy" },
      { text: "5/6 - 2/6 = ?", answer: "3/6 (or 1/2)", difficulty: "Medium" },
      { text: "You eat 1/3 of a pizza and your friend eats 1/6 of it. What fraction of the pizza is left?", answer: "1/2", difficulty: "Hard" },
    ],
    learningObjectives: [
      "Compare fractions with the same and different denominators",
      "Add and subtract fractions with the same denominator",
      "Recognise equivalent fractions",
      "Solve word problems involving parts of a whole",
    ],
    keywords: ["fractions class 4", "grade 4 fractions", "compare fractions", "adding fractions practice", "free fractions practice", "equivalent fractions"],
  },
  {
    slug: "factors-multiples",
    title: "Factors & Multiples",
    generatorKey: "Factors & Multiples",
    description: "Find factors, multiples, HCF and LCM, and solve find-all-solutions style problems.",
    intro:
      "Factors and multiples are the groundwork for fractions, ratio and everything algebraic that follows. This topic also includes find-all-solutions questions, where the child must list every answer that fits rather than stopping at the first one.",
    educationalLevel: "Grade 4",
    curriculums: ["CBSE", "ICSE"],
    sampleQuestions: [
      { text: "List all the factors of 12.", answer: "1, 2, 3, 4, 6, 12", difficulty: "Easy" },
      { text: "Write the first three multiples of 7.", answer: "7, 14, 21", difficulty: "Medium" },
      { text: "What is the HCF (highest common factor) of 18 and 24?", answer: "6", difficulty: "Hard" },
    ],
    learningObjectives: [
      "List all factors of a given number",
      "Generate multiples of a number",
      "Find the highest common factor of two numbers",
      "Find the lowest common multiple of two numbers",
    ],
    keywords: ["factors and multiples class 4", "grade 4 factors", "HCF and LCM practice", "free factors multiples", "common factors"],
  },
  {
    slug: "prime-composite-numbers",
    title: "Prime & Composite Numbers",
    generatorKey: "Prime/Composite",
    description: "Classify numbers as prime or composite and justify the classification with factors.",
    intro:
      "A number is prime when it has exactly two factors. Getting children to justify the answer — naming an actual factor pair for composite numbers — matters more than the label itself, and the questions push for that.",
    educationalLevel: "Grade 4",
    curriculums: ["CBSE"],
    sampleQuestions: [
      { text: "Is 17 a prime number or a composite number?", answer: "Prime", difficulty: "Easy" },
      { text: "Is 21 prime or composite? Give a reason.", answer: "Composite - it is 3 x 7", difficulty: "Medium" },
      { text: "List all the prime numbers between 10 and 20.", answer: "11, 13, 17, 19", difficulty: "Hard" },
    ],
    learningObjectives: [
      "Define a prime number as having exactly two factors",
      "Classify numbers as prime or composite",
      "Justify a composite classification by naming a factor pair",
      "Recall the prime numbers below 20",
    ],
    keywords: ["prime and composite numbers class 4", "grade 4 prime numbers", "composite numbers practice", "free prime numbers", "prime number list"],
  },
  {
    slug: "squares-cubes",
    title: "Squares & Cubes",
    generatorKey: "Squares & Cubes",
    description: "Calculate squares and cubes of small numbers and recognise perfect squares.",
    intro:
      "Squares and cubes introduce repeated multiplication in a compact notation. Fluency with the first dozen squares pays off later in area, and in almost everything from Class 6 onwards.",
    educationalLevel: "Grade 4",
    curriculums: ["CBSE"],
    sampleQuestions: [
      { text: "What is 6 squared?", answer: "36", difficulty: "Easy" },
      { text: "What is the square of 12?", answer: "144", difficulty: "Medium" },
      { text: "What is 4 cubed?", answer: "64", difficulty: "Medium" },
    ],
    learningObjectives: [
      "Understand squaring as multiplying a number by itself",
      "Recall the squares of numbers up to 12",
      "Calculate the cube of a small number",
      "Recognise perfect squares in a list",
    ],
    keywords: ["squares and cubes class 4", "grade 4 square numbers", "perfect squares practice", "cube numbers", "free squares cubes practice"],
  },
  {
    slug: "geometry",
    title: "Geometry",
    generatorKey: "Geometry",
    description: "Angles, symmetry and 3D shapes, with diagrams drawn directly into the question.",
    intro:
      "Class 4 geometry covers naming and comparing angles, finding lines of symmetry, and describing 3D solids by their faces, edges and vertices. Angle and shape questions come with a drawn diagram rather than a description alone.",
    educationalLevel: "Grade 4",
    curriculums: ["CBSE", "ICSE", "IGCSE"],
    sampleQuestions: [
      { text: "How many lines of symmetry does a square have?", answer: "4", difficulty: "Easy" },
      { text: "How many faces does a cube have?", answer: "6", difficulty: "Medium" },
      { text: "An angle measures 45 degrees. Is it acute, right or obtuse?", answer: "Acute", difficulty: "Hard" },
    ],
    learningObjectives: [
      "Classify angles as acute, right, obtuse or straight",
      "Find lines of symmetry in 2D shapes",
      "Count faces, edges and vertices of 3D solids",
      "Read an angle from a diagram",
    ],
    keywords: ["geometry class 4", "grade 4 geometry", "lines of symmetry practice", "types of angles", "3d shapes faces edges vertices", "free geometry practice"],
  },
  {
    slug: "perimeter-area",
    title: "Perimeter & Area",
    generatorKey: "Perimeter & Area",
    description: "Calculate the perimeter and area of squares and rectangles, and work backwards from a given perimeter.",
    intro:
      "Perimeter is distance around, area is space inside — and children routinely mix them up. These questions keep both in play together, including inverse problems where the perimeter is given and a missing side must be found.",
    educationalLevel: "Grade 4",
    curriculums: ["CBSE"],
    sampleQuestions: [
      { text: "A square has sides of 7 cm. What is its perimeter?", answer: "28 cm", difficulty: "Easy" },
      { text: "A rectangle is 12 cm long and 5 cm wide. What is its area?", answer: "60 sq cm", difficulty: "Medium" },
      { text: "A rectangle has a perimeter of 30 cm and a length of 9 cm. What is its breadth?", answer: "6 cm", difficulty: "Hard" },
    ],
    learningObjectives: [
      "Calculate the perimeter of squares and rectangles",
      "Calculate the area of a rectangle using length x breadth",
      "Distinguish between perimeter and area, including units",
      "Find a missing side from a given perimeter or area",
    ],
    keywords: ["perimeter and area class 4", "grade 4 perimeter", "area of rectangle practice", "free perimeter area practice", "measurement geometry"],
  },
  {
    slug: "money",
    title: "Money",
    generatorKey: "Money",
    description: "Solve real-world rupee and paise problems, including shopkeeper-style change and profit questions.",
    intro:
      "Money problems make arithmetic concrete. Beyond adding prices and working out change, this topic includes shopkeeper challenges where the child tracks cost, selling price and whether there was a profit or a loss.",
    educationalLevel: "Grade 4",
    curriculums: ["CBSE", "ICSE"],
    sampleQuestions: [
      { text: "Rs 25 + Rs 40 = ?", answer: "Rs 65", difficulty: "Easy" },
      { text: "A pen costs Rs 128. You pay with a Rs 200 note. How much change do you get?", answer: "Rs 72", difficulty: "Medium" },
      { text: "Meera buys 3 notebooks costing Rs 45 each and pays with a Rs 200 note. How much change does she get?", answer: "Rs 65", difficulty: "Hard" },
    ],
    learningObjectives: [
      "Add and subtract amounts of money",
      "Calculate change from a given note",
      "Solve multi-item shopping problems",
      "Work out whether a sale made a profit or a loss",
    ],
    keywords: ["money problems class 4", "grade 4 money maths", "rupees and paise practice", "calculating change", "free money word problems"],
  },
  {
    slug: "time",
    title: "Time",
    generatorKey: "Time",
    description: "Read clocks, convert between units of time, and calculate durations across the hour.",
    intro:
      "Time is the one measurement system that is not base ten, which is exactly why children find it hard. Questions cover reading a clock face, converting hours to minutes, and finding durations that cross an hour boundary.",
    educationalLevel: "Grade 4",
    curriculums: ["CBSE", "ICSE"],
    sampleQuestions: [
      { text: "How many minutes are there in 2 hours?", answer: "120", difficulty: "Easy" },
      { text: "A film starts at 3:15 pm and runs for 90 minutes. What time does it end?", answer: "4:45 pm", difficulty: "Medium" },
      { text: "What time is 45 minutes after 2:30?", answer: "3:15", difficulty: "Medium" },
    ],
    learningObjectives: [
      "Read the time from an analogue clock face",
      "Convert between hours, minutes and seconds",
      "Calculate a duration between two times",
      "Add a duration to a start time across the hour",
    ],
    keywords: ["time class 4", "grade 4 telling time", "clock reading practice", "time duration problems", "free time maths practice"],
  },
  {
    slug: "patterns",
    title: "Patterns",
    generatorKey: "Patterns",
    description: "Recognise and extend number and shape patterns, and describe the rule behind them.",
    intro:
      "Pattern work is early algebra in disguise. The skill being built is not spotting the next term but articulating the rule that produces it — which is why these questions mix adding patterns, multiplying patterns and square-number sequences.",
    educationalLevel: "Grade 4",
    curriculums: ["CBSE", "ICSE", "IGCSE"],
    sampleQuestions: [
      { text: "What comes next: 5, 10, 15, 20, ?", answer: "25", difficulty: "Easy" },
      { text: "What comes next: 2, 6, 18, 54, ?", answer: "162", difficulty: "Medium" },
      { text: "What comes next: 1, 4, 9, 16, ?", answer: "25", difficulty: "Hard" },
    ],
    learningObjectives: [
      "Extend a number sequence by one or more terms",
      "Describe the rule of a pattern in words",
      "Recognise multiplying as well as adding patterns",
      "Identify square numbers in a sequence",
    ],
    keywords: ["number patterns class 4", "grade 4 patterns", "sequences practice", "what comes next maths", "free pattern practice"],
  },
  {
    slug: "algebra",
    title: "Algebra",
    generatorKey: "Algebra",
    description: "Solve simple equations for an unknown value using inverse operations.",
    intro:
      "Class 4 algebra is about the idea that a letter can stand for a missing number, and that you find it by undoing what was done to it. Questions run from single-step equations up to two-step ones.",
    educationalLevel: "Grade 4",
    curriculums: ["CBSE", "IGCSE"],
    sampleQuestions: [
      { text: "Solve for x: x + 7 = 12", answer: "5", difficulty: "Easy" },
      { text: "Solve for y: 3y = 27", answer: "9", difficulty: "Medium" },
      { text: "Solve for n: 4n + 5 = 29", answer: "6", difficulty: "Hard" },
    ],
    learningObjectives: [
      "Understand a letter as a placeholder for an unknown number",
      "Solve one-step equations using inverse operations",
      "Solve two-step equations",
      "Check a solution by substituting it back",
    ],
    keywords: ["algebra class 4", "grade 4 algebra", "solve for x practice", "simple equations", "free algebra practice primary"],
  },
  {
    slug: "measurement",
    title: "Measurement",
    generatorKey: "Measurement",
    description: "Convert and compare units of length, weight and capacity.",
    intro:
      "Measurement in Class 4 is mostly conversion: metres to centimetres, kilograms to grams, litres to millilitres. The harder questions combine mixed units, where the child must convert before they can add.",
    educationalLevel: "Grade 4",
    curriculums: ["CBSE", "ICSE", "IGCSE"],
    sampleQuestions: [
      { text: "How many centimetres are there in 3 metres?", answer: "300 cm", difficulty: "Easy" },
      { text: "Convert 2.5 kilograms into grams.", answer: "2500 g", difficulty: "Medium" },
      { text: "Add 2 litres 350 ml and 1 litre 800 ml. Give your answer in litres and millilitres.", answer: "4 litres 150 ml", difficulty: "Hard" },
    ],
    learningObjectives: [
      "Convert between metres, centimetres and millimetres",
      "Convert between kilograms and grams",
      "Convert between litres and millilitres",
      "Add and compare quantities given in mixed units",
    ],
    keywords: ["measurement class 4", "grade 4 measurement", "unit conversion practice", "length weight capacity", "free measurement practice"],
  },
  {
    slug: "data-handling",
    title: "Data Handling",
    generatorKey: "Data Handling",
    description: "Read tally charts and bar graphs, and answer basic probability and likelihood questions.",
    intro:
      "Data handling asks children to read information off a chart and then reason with it. Tally charts and bar graphs are drawn into the question itself, and probability is introduced through likelihood language before any fractions appear.",
    educationalLevel: "Grade 4",
    curriculums: ["CBSE", "ICSE"],
    sampleQuestions: [
      { text: "A tally chart shows 12 for football and 8 for cricket. How many more children chose football?", answer: "4", difficulty: "Easy" },
      { text: "A bar graph shows Monday 15, Tuesday 22, Wednesday 18. On which day were the most books borrowed?", answer: "Tuesday", difficulty: "Medium" },
      { text: "A bag has 3 red balls and 5 blue balls. What is the probability of picking a red ball?", answer: "3/8", difficulty: "Hard" },
    ],
    learningObjectives: [
      "Read and interpret a tally chart",
      "Read values from a bar graph",
      "Compare quantities shown in a chart",
      "Describe events as certain, likely, unlikely or impossible",
    ],
    keywords: ["data handling class 4", "grade 4 data handling", "tally chart practice", "bar graph questions", "probability for kids", "free data handling"],
  },
  {
    slug: "2d-shapes",
    title: "2D Shapes",
    generatorKey: "2D Shapes",
    description: "Identify and classify 2D shapes by their sides, vertices and properties.",
    intro:
      "Naming shapes is the easy half; describing them by their properties is the half that lasts. These questions ask about sides and vertices as well as names, with the shape drawn alongside the question.",
    educationalLevel: "Grade 4",
    curriculums: ["CBSE"],
    sampleQuestions: [
      { text: "How many sides does a pentagon have?", answer: "5", difficulty: "Easy" },
      { text: "Which shape has 4 equal sides and 4 right angles?", answer: "Square", difficulty: "Easy" },
      { text: "How many vertices does a hexagon have?", answer: "6", difficulty: "Medium" },
    ],
    learningObjectives: [
      "Name common 2D shapes up to eight sides",
      "Count sides and vertices of a polygon",
      "Classify shapes by their properties",
      "Tell regular and irregular shapes apart",
    ],
    keywords: ["2d shapes class 4", "grade 4 shapes", "polygon names practice", "sides and vertices", "free 2d shapes practice"],
  },
  {
    slug: "number-line",
    title: "Number Line",
    generatorKey: "Number Line",
    description: "Locate numbers, midpoints and equal parts on a number line.",
    intro:
      "The number line turns abstract numbers into positions, which makes midpoints, intervals and counting-on visible. It is also the bridge to fractions and, later, to negative numbers and coordinates.",
    educationalLevel: "Grade 4",
    curriculums: ["CBSE", "ICSE", "IGCSE"],
    sampleQuestions: [
      { text: "What number is exactly halfway between 0 and 10 on a number line?", answer: "5", difficulty: "Easy" },
      { text: "A number line from 0 to 20 is divided into 4 equal parts. What is the value of each part?", answer: "5", difficulty: "Medium" },
      { text: "Start at 34 on a number line and count on 5. Where do you land?", answer: "39", difficulty: "Medium" },
    ],
    learningObjectives: [
      "Locate a number on a marked number line",
      "Find the midpoint between two numbers",
      "Work out the size of each interval on a divided line",
      "Count on and back along a number line",
    ],
    keywords: ["number line class 4", "grade 4 number line", "midpoint practice", "counting on number line", "free number line practice"],
  },
  {
    slug: "word-problems",
    title: "Word Problems",
    generatorKey: "Word Problems",
    description: "Apply maths skills to real-life, multi-step problems — including ones with misleading extra information.",
    intro:
      "Word problems are where arithmetic meets comprehension. The harder questions are deliberately awkward: some need two or three steps, some contain a number that is not needed at all, and some ask the child to estimate before they calculate.",
    educationalLevel: "Grade 4",
    curriculums: ["CBSE", "ICSE", "IGCSE"],
    sampleQuestions: [
      { text: "Ravi has 5 apples. His mother gives him 3 more. How many apples does he have now?", answer: "8", difficulty: "Easy" },
      { text: "A class has 24 students. They sit in groups of 4. How many groups are there?", answer: "6", difficulty: "Medium" },
      { text: "A baker makes 48 cupcakes and packs them 12 to a box. He sells 3 boxes. How many cupcakes are left?", answer: "12", difficulty: "Hard" },
    ],
    learningObjectives: [
      "Read a problem and identify what is being asked",
      "Choose the correct operation for the situation",
      "Work through multi-step problems in order",
      "Ignore information that is not needed",
    ],
    keywords: ["word problems class 4", "grade 4 word problems", "maths story problems", "multi step problems", "free word problems practice"],
  },
  {
    slug: "explain-and-reason",
    title: "Explain & Reason",
    generatorKey: "Explain & Reason",
    description: "Explain your thinking and spot errors in someone else's worked example.",
    intro:
      "These questions have no single number to type. The child is shown a claim or a worked answer and asked whether it is right and why. Because they are self-assessed, they are the closest thing here to how a teacher would actually probe understanding.",
    educationalLevel: "Grade 4",
    curriculums: ["CBSE", "ICSE", "IGCSE"],
    sampleQuestions: [
      { text: "Meera says 1/3 is bigger than 1/2 because 3 is bigger than 2. Is she right? Explain your thinking.", answer: "No - the more parts a whole is cut into, the smaller each part is, so 1/3 is less than 1/2", difficulty: "Medium" },
      { text: "Is 6 x 8 the same as 8 x 6? Explain why.", answer: "Yes - multiplication can be done in either order, and both give 48", difficulty: "Medium" },
      { text: "Arun works out 400 - 176 and gets 336. Without doing the full sum, explain how you can tell he is wrong.", answer: "400 - 176 must be less than 400 - 100 = 300, so 336 is too big. The correct answer is 224", difficulty: "Hard" },
    ],
    learningObjectives: [
      "Explain a method in words rather than only giving an answer",
      "Find the mistake in a worked example",
      "Use estimation to check whether an answer is reasonable",
      "Justify a claim with a mathematical reason",
    ],
    keywords: ["maths reasoning class 4", "grade 4 explain your answer", "spot the error maths", "mathematical reasoning primary", "free reasoning practice"],
  },
]

export const TOPIC_SLUGS = TOPIC_CONFIGS.map((t) => t.slug)

export function getTopicBySlug(slug: string): TopicConfig | undefined {
  return TOPIC_CONFIGS.find((t) => t.slug === slug)
}

// ---------------------------------------------------------------------------
// Class level registry
//
// URLs carry the class because a slug like "fractions" will exist once per
// class once 5-8 land, and because "class 6 fractions" is the shape of the
// query people actually type. Adding a class means adding an entry here; the
// routes, sitemap and llms.txt all derive from it.
// ---------------------------------------------------------------------------

export interface ClassDef {
  level: number
  /** URL segment, e.g. "class-4". */
  slug: string
  label: string
  ageRange: string
  curriculums: Curriculum[]
  topics: TopicConfig[]
}

export const CLASSES: ClassDef[] = [
  {
    level: 4,
    slug: "class-4",
    label: "Class 4",
    ageRange: "9-10",
    curriculums: ["CBSE", "ICSE", "IGCSE"],
    topics: TOPIC_CONFIGS,
  },
]

export function getClassBySlug(slug: string): ClassDef | undefined {
  return CLASSES.find((c) => c.slug === slug)
}

export function getTopicIn(classSlug: string, topicSlug: string): TopicConfig | undefined {
  return getClassBySlug(classSlug)?.topics.find((t) => t.slug === topicSlug)
}

/** Every (class, topic) pair — the source for static params and the sitemap. */
export function allTopicPaths(): { classSlug: string; topicSlug: string }[] {
  return CLASSES.flatMap((c) => c.topics.map((t) => ({ classSlug: c.slug, topicSlug: t.slug })))
}
