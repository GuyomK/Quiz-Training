const quizData = [
  {
    question: "Quelle est la capitale de la France ?",
    choices: ["Paris", "Lyon", "Marseille", "Toulouse"],
    answer: "Paris"
  },
  {
    question: "Combien y a-t-il de continents ?",
    choices: ["4", "5", "6", "7"],
    answer: "7"
  },
  {
    question: "Quel est le plus grand océan du monde ?",
    choices: ["Atlantique", "Arctique", "Indien", "Pacifique"],
    answer: "Pacifique"
  }
];

let currentQuestion = 0;
let score = 0;

const quizEl = document.getElementById("quiz");
const nextBtn = document.getElementById("next");
const scoreEl = document.getElementById("score");

function showQuestion() {
  const q = quizData[currentQuestion];
  quizEl.innerHTML = `
    <div class="question">${q.question}</div>
    <div class="choices">
      ${q.choices.map(choice => `
        <button onclick="selectAnswer('${choice}')">${choice}</button>
      `).join('')}
    </div>
  `;
  nextBtn.style.display = "none";
}

function selectAnswer(choice) {
  const correct = quizData[currentQuestion].answer;
  if (choice === correct) score++;
  nextBtn.style.display = "inline-block";
}

nextBtn.addEventListener("click", () => {
  currentQuestion++;
  if (currentQuestion < quizData.length) {
    showQuestion();
  } else {
    quizEl.innerHTML = "";
    nextBtn.style.display = "none";
    scoreEl.textContent = `Votre score : ${score}/${quizData.length}`;
  }
});

showQuestion();
