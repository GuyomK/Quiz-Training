const themeFiles = [
  "themes/Capitales.json",
  "themes/Star Wars.json"
];

let quizData = {}; // Global

document.getElementById("launch-btn").addEventListener("click", () => {
  document.getElementById("welcome-screen").style.display = "none";
  document.getElementById("start-screen").style.display = "block";
});

async function chargerTousLesThemes() {
  const chargements = themeFiles.map(async (file) => {
    const themeName = file.split("/").pop().replace(".json", "");
    const response = await fetch(file);
    const data = await response.json();
    quizData[themeName] = data;
  });

  // Attend que tous les fichiers soient chargés
  await Promise.all(chargements);

  // Maintenant que tout est chargé, affiche les thèmes
  afficherThemes();
}

// Appeler le chargement au bon moment
window.addEventListener("DOMContentLoaded", () => {
  chargerTousLesThemes();
});

let currentQuestion = 0;
let score = 0;
let timerInterval;
let timeLeft = 15; // temps en secondes
// Mélange les questions une fois au lancement
let shuffledQuizData = [];

const quizEl = document.getElementById("quiz");
const nextBtn = document.getElementById("next");
const scoreEl = document.getElementById("score");
const restartBtn = document.getElementById("restart");
const startScreen = document.getElementById("start-screen");
const quizContainer = document.getElementById("quiz-container");
const themesContainer = document.getElementById("themes");
const startBtn = document.getElementById("start-btn");

function shuffleArray(array) {
  return array.sort(() => Math.random() - 0.5);
}

function afficherThemes() {
  const themesContainer = document.getElementById("themes");
  themesContainer.innerHTML = "";

  for (const theme in quizData) {
    const label = document.createElement("label");
    label.innerHTML = `
      <input type="checkbox" value="${theme}" checked> 
      ${theme.charAt(0).toUpperCase() + theme.slice(1)}
    `;
    themesContainer.appendChild(label);
    themesContainer.appendChild(document.createElement("br"));
  }
}

function showQuestion() {
  const q = shuffledQuizData[currentQuestion];

  // Réinitialise le contenu HTML du quiz
  quizEl.innerHTML = `
    <div id="question-number">Question ${currentQuestion + 1} / ${shuffledQuizData.length}</div>
    <div class="progress-bar-container">
      <div id="progress-bar" class="progress-bar"></div>
    </div>
    <div class="question">${q.question}</div>
    <div class="choices">
      ${shuffleArray([...q.choices]).map(choice => `<button class="choice-btn">${choice}</button>`).join('')}
    </div>
    <div id="explanation" class="explanation"> </div>
  `;

  quizEl.style.display = "block";

  // Réinitialise le style de l’explication
  const explanationEl = document.getElementById("explanation");
  /*explanationEl.classList.remove("visible");*/
  explanationEl.style.visibility = "hidden";
  explanationEl.style.opacity = 0;

  // Ajoute les événements sur les boutons
  const buttons = document.querySelectorAll('.choice-btn');
  buttons.forEach(btn => {
    btn.addEventListener('click', () => selectAnswer(btn, q.answer, buttons, q.explanation));
  });

  // Cache le bouton "Suivant" jusqu’à réponse ou fin du temps
  nextBtn.style.display = "none";

  // Chrono visuel
  timeLeft = 15;

  const progressBar = document.getElementById("progress-bar");
  progressBar.style.width = "100%";
  progressBar.style.backgroundColor = "green";

  clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    timeLeft--;

    const pourcentage = (timeLeft / 15) * 100;
    progressBar.style.width = `${pourcentage}%`;

    if (timeLeft <= 5) {
      progressBar.style.backgroundColor = "red";
    } else if (timeLeft <= 10) {
      progressBar.style.backgroundColor = "orange";
    }

    if (timeLeft === 0) {
      clearInterval(timerInterval);
      handleTimeUp();
    }
  }, 1000);
}

function selectAnswer(selectedBtn, correctAnswer, allButtons, explanationText) {
  clearInterval(timerInterval);
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
  /*explanationEl.classList.add("visible");*/
  explanationEl.style.visibility = "visible";
  explanationEl.style.opacity = 1;

  nextBtn.style.display = "inline-block";
}

function handleTimeUp() {
  const q = shuffledQuizData[currentQuestion];
  const buttons = document.querySelectorAll('.choice-btn');

  buttons.forEach(btn => {
    btn.disabled = true;
    if (btn.textContent === q.answer) {
      btn.classList.add("correct");
    }
  });

  const explanationEl = document.getElementById("explanation");
  explanationEl.textContent = q.explanation;
  /*explanationEl.classList.add("visible");*/
  explanationEl.style.visibility = "visible";
  explanationEl.style.opacity = 1;

  nextBtn.style.display = "inline-block";
}

function startQuiz() {
  currentQuestion = 0;
  score = 0;
  scoreEl.style.display = "none";
  restartBtn.style.display = "none";
  nextBtn.style.display = "inline-block";

  const selectedThemes = Array.from(document.querySelectorAll('#themes input:checked'))
    .map(input => input.value);

  const questionCount = parseInt(document.getElementById("question-count").value);

  if (selectedThemes.length === 0) {
    alert("Veuillez sélectionner au moins un thème.");
    return;
  }

  // 🔽 Charge les fichiers JSON pour les thèmes sélectionnés
  Promise.all(
    selectedThemes.map(theme =>
      fetch(`themes/${theme}.json`).then(res => res.json())
    )
  )
  .then(allQuestionsArrays => {
    const totalAvailable = allQuestionsArrays.flat().length;

    if (totalAvailable < questionCount) {
      alert(`Il n'y a que ${totalAvailable} questions disponibles pour les thèmes choisis.`);
      return;
    }

    const themeCount = allQuestionsArrays.length;
    const questionsPerTheme = Math.floor(questionCount / themeCount);
    let remaining = questionCount;

    let selectedQuestions = [];

    // Sélection équitable dans chaque thème
    allQuestionsArrays.forEach((questions, index) => {
      let count = index === themeCount - 1 ? remaining : Math.min(questionsPerTheme, questions.length);
      const shuffled = shuffleArray([...questions]);
      selectedQuestions.push(...shuffled.slice(0, count));
      remaining -= count;
    });

    // Complément si certains thèmes n’avaient pas assez de questions
    if (remaining > 0) {
      const allRemaining = allQuestionsArrays.flat().filter(q => !selectedQuestions.includes(q));
      selectedQuestions.push(...shuffleArray(allRemaining).slice(0, remaining));
    }

    // Mélange final
    shuffledQuizData = shuffleArray([...selectedQuestions]);

    // Affiche le quiz
    document.getElementById("start-screen").style.display = "none";
    document.getElementById("quiz-container").style.display = "block";

    showQuestion();
  })
  .catch(err => {
    console.error("Erreur lors du chargement des questions :", err);
    alert("Impossible de charger les questions. Vérifiez les fichiers JSON.");
  });
}




nextBtn.addEventListener("click", () => {
  // Ajoute la classe fade-out pour déclencher le fondu de sortie
  quizEl.classList.add("fade-out");

  // Après la durée de la transition (400ms), change la question et fais réapparaître
  setTimeout(() => {
    currentQuestion++;
    if (currentQuestion < shuffledQuizData.length) {
      showQuestion();
      quizEl.classList.remove("fade-out"); // remet l'opacité à 1, question visible
    } else {
      quizEl.innerHTML = "";
      nextBtn.style.display = "none";
      scoreEl.textContent = `Votre score : ${score}/${shuffledQuizData.length}`;
      scoreEl.style.display = "inline-block";
      restartBtn.style.display = "inline-block";  // Montre le bouton relancer
      quizEl.classList.remove("fade-out");
    }
  }, 400); // Durée en ms, doit correspondre au CSS transition
});

// Gestion du bouton "Relancer"
restartBtn.addEventListener("click", () => {
  // Retour à l’écran d’accueil
  quizContainer.style.display = "none";
  startScreen.style.display = "block";
  scoreEl.style.display = "none";
  restartBtn.style.display = "none";
  nextBtn.style.display = "inline-block";

  // Réinitialise la sélection de thèmes (optionnel)
  const checkboxes = document.querySelectorAll('#themes input[type=checkbox]');
  checkboxes.forEach(box => box.checked = true);
});

// Démarre le quiz au clic sur "Commencer"
startBtn.addEventListener("click", startQuiz);

// Génère dynamiquement les thèmes au chargement
window.addEventListener("DOMContentLoaded", afficherThemes);
