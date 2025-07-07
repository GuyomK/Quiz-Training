const quizData = [
  {
    question: "Quelle est la capitale de la France ?",
    choices: ["Paris", "Lyon", "Marseille", "Toulouse"],
    answer: "Paris",
    explanation: "Paris est la capitale politique, économique et culturelle de la France."
  },
  {
    question: "Combien y a-t-il de continents ?",
    choices: ["4", "5", "6", "7"],
    answer: "7",
    explanation: "Les 7 continents sont : Afrique, Amérique du Nord, Amérique du Sud, Antarctique, Asie, Europe et Océanie."
  },
  {
    question: "Quel est le plus grand océan du monde ?",
    choices: ["Atlantique", "Arctique", "Indien", "Pacifique"],
    answer: "Pacifique",
    explanation: "L'océan Pacifique est le plus vaste océan du globe, couvrant plus de 30% de la surface terrestre."
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
        <button class="choice-btn">${choice}</button>
      `).join('')}
    </div>
    <div id="explanation" class="explanation" style="margin-top: 10px;"></div>
  `;

  const buttons = document.querySelectorAll('.choice-btn');
  buttons.forEach(btn => {
    btn.addEventListener('click', () => selectAnswer(btn, q.answer, buttons, q.explanation));
  });

  nextBtn.style.display = "none";
}

function selectAnswer(selectedBtn, correctAnswer, allButtons, explanationText) {
  allButtons.forEach(btn => btn.disabled = true);

  const userAnswer = selectedBtn.textContent;

  if (userAnswer === correctAnswer) {
    selectedBtn.classList.add("correct");
    score++;
  } else {
    selectedBtn.classList.add("incorrect");
    allButtons.forEach(btn => {
      if (btn.textContent === correctAnswer) {
        btn.classList.add("correct");
      }
    });
  }

  // 👉 Affiche l'explication
  const explanationEl = document.getElementById("explanation");
  explanationEl.textContent = explanationText;

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

