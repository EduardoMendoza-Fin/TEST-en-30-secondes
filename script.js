/* ---------------------------
   🔥 FONCTION AIRTABLE
----------------------------- */
async function sendLeadToAirtable(firstName, lastName, email, phone, riskScore, resultLabel) {
  const response = await fetch("/api/airtable", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      firstName,
      lastName,
      email,
      phone,
      score: riskScore,
      result: resultLabel
    })
  });

  if (!response.ok) {
    console.error("Erreur lors de l'envoi du lead:", await response.text());
  } else {
    console.log("Lead envoyé via l'API Vercel !");
  }
}

/* ---------------------------
   ✔️ TON CODE D'ORIGINE
----------------------------- */

const questions = [
  {
    text: 'Qui est le bénéficiaire de votre assurance hypothécaire ?',
    options: ['La banque', 'Vos proches', 'Je ne sais pas'],
  },
  {
    text: 'Votre couverture diminue-t-elle au même rythme que votre hypothèque?',
    options: ['Oui', 'Non', 'Je ne sais pas'],
  },
  {
    text: 'Avez-vous déjà passé une analyse médicale complète?',
    options: ['Oui', 'Non'],
  },
  {
    text: 'Votre assurance vous suit-elle si vous changez de banque?',
    options: ['Oui', 'Non', 'Je ne sais pas'],
  },
  {
    text: 'Votre prime reste-t-elle fixe pendant toute la durée?',
    options: ['Oui', 'Non', 'Je ne sais pas'],
  },
  {
    text: 'Votre banque pourrait-elle refuser le paiement selon votre état de santé?',
    options: ['Oui', 'Non', 'Je ne sais pas'],
  },
];

const state = {
  current: 0,
  answers: [],
};

const questionCard = document.getElementById('question-card');
const nextButton = document.getElementById('next-button');
const progressBar = document.getElementById('progress-bar');
const progressLabel = document.getElementById('progress-label');
const leadForm = document.getElementById('lead-form');
const captureForm = document.getElementById('capture-form');
const resultCard = document.getElementById('result-card');
const resultTitle = document.getElementById('result-title');
const resultDescription = document.getElementById('result-description');

function updateProgress() {
  const percentage = Math.round((state.current / questions.length) * 100);
  progressBar.style.width = `${percentage}%`;
  progressLabel.textContent = `${percentage}%`;
}

function renderQuestion() {
  updateProgress();
  const question = questions[state.current];

  if (!question) {
    questionCard.classList.add('hidden');
    nextButton.classList.add('hidden');
    leadForm.classList.remove('hidden');
    leadForm.classList.add('fade-enter-active');
    progressLabel.textContent = '100%';
    progressBar.style.width = '100%';
    return;
  }

  nextButton.disabled = true;
  questionCard.classList.remove('hidden');
  nextButton.classList.remove('hidden');

  questionCard.innerHTML = `
    <div class="space-y-6 fade-enter fade-enter-active">
      <div class="flex items-center justify-between">
        <p class="text-lg font-semibold">Question ${state.current + 1} sur ${questions.length}</p>
        <span class="text-sm text-[#1C355E]/70">Réponse obligatoire</span>
      </div>
      <p class="text-xl font-medium">${question.text}</p>
      <div class="space-y-3">
        ${question.options
          .map(
            (option) => `
              <label class="flex items-center space-x-3 rounded-2xl border border-[#1C355E]/15 px-4 py-3 transition hover:border-[#1C355E]/40 cursor-pointer">
                <input type="radio" name="question" value="${option}" class="text-[#C62828] focus:ring-[#C62828]" />
                <span>${option}</span>
              </label>
            `,
          )
          .join('')}
      </div>
    </div>
  `;

  questionCard.querySelectorAll('input[type="radio"]').forEach((radio) => {
    radio.addEventListener('change', () => {
      nextButton.disabled = false;
    });
  });
}

nextButton.addEventListener('click', () => {
  const selected = questionCard.querySelector('input[type="radio"]:checked');
  if (!selected) return;

  state.answers[state.current] = selected.value;
  state.current += 1;
  renderQuestion();
});

captureForm.addEventListener('submit', (event) => {
  event.preventDefault();

  if (!captureForm.checkValidity()) {
    captureForm.reportValidity();
    return;
  }

  const riskScore = state.answers.reduce((score, answer) => {
    if (answer === 'Je ne sais pas' || answer === 'La banque') {
      return score + 1;
    }
    return score;
  }, 0);

  let title = 'Protection élevée';
  let description =
    "Votre couverture semble alignée avec vos besoins et protège votre famille. Nordéa Conseil peut tout de même vous proposer des optimisations spécifiques.";

  if (riskScore >= 4) {
    title = 'Risque élevé : votre assurance protège probablement la banque';
    description =
      "Plusieurs réponses indiquent que votre protection priorise la banque. Il est urgent d’obtenir un diagnostic détaillé pour reprendre le contrôle.";
  } else if (riskScore >= 2) {
    title = 'Protection incertaine';
    description =
      "Certaines zones restent floues ou non maîtrisées. Un échange avec un conseiller Nordéa vous donnera une vision claire et des solutions flexibles.";
  }

  /* ---------------------------
     🚀 ENVOI AIRTABLE ICI
  ----------------------------- */
  const firstName = captureForm.firstName.value;
  const lastName = captureForm.lastName.value;
  const email = captureForm.email.value;
  const phone = captureForm.phone.value;

  sendLeadToAirtable(firstName, lastName, email, phone, riskScore, title);

  /* ---------------------------
     🔥 AFFICHAGE RÉSULTAT
  ----------------------------- */
  leadForm.classList.add('hidden');
  resultCard.classList.remove('hidden');
  resultTitle.textContent = title;
  resultDescription.textContent = description;
});


const ctaStart = document.getElementById('cta-start');
if (ctaStart) {
  ctaStart.addEventListener('click', () => {
    document.getElementById('quiz').scrollIntoView({ behavior: 'smooth' });
  });
}

renderQuestion();