let config = {};

document.addEventListener("DOMContentLoaded", function () {
  const questions = [
    "I fight the flow with all my might,My tolerance band shines gold or white.",
    "I am loud when the current is strong; but measure me, and you might be wrong.",
    "It converts electrical energy into heat, and its value is measured in ohms.",
    "I can change the brightness of an LED or the volume of a speaker, depending on how you turn me.",
    "You can decode my identity using a rainbow, but I’m not a prism. What am I?",
    "I store and release with lightning speed,Charge is my treasure, when circuits need.?",
    "When voltage drops, I save the day,But don't connect me the wrong way!",
    "Twin plates embrace a vacuum dance,In dielectric's realm, we take our stance.What builds and dies, in AC's phase?Yet DC sees me as a maze",
    "Neither switch nor gate alone am I,But when bias flows, signals multiply.In active mode I make waves soar,In saturation, I'm just a door.",
    "Like a water tap that flows with ease,I control current with simple squeeze.?"
  ];

  let currentQuestionIndex = 0;
  const questionLabel = document.getElementById("tec-label");
  const answerInput = document.getElementById("answer");
  const quizForm = document.getElementById("quiz-form");
  const nextBtn = document.getElementById("next-btn");

  // Flag to track if a submission is in progress
  let isSubmitting = false;

  fetch('/config.json')
    .then(response => response.json())
    .then(data => {
      config = data;
      // Now load your first question or start your app logic
      loadQuestion();
    })
    .catch(error => console.error('Error loading config:', error));

  // Fetch current progress from the server
  fetch(`http://${config.ip_address}:7000/api/trackers/progress`, {
    credentials: 'include' // Include cookies for session
  })
    .then(response => response.json())
    .then(data => {
      currentQuestionIndex = data.currentQuestion - 1; // Convert to 0-based index
      if (currentQuestionIndex >= questions.length) {
        window.location.href = "/logout";
      } else {
        loadQuestion();
      }
    })
    .catch(error => {
      console.error("Error fetching progress:", error);
      loadQuestion();
    });

  // Load the question function
  function loadQuestion() {
    if (currentQuestionIndex < questions.length) {
      document.addEventListener("visibilitychange", handleVisibilityChange);
      questionLabel.textContent = (currentQuestionIndex + 1) + ". " + questions[currentQuestionIndex];
      answerInput.value = ""; // Clear input field
      answerInput.focus(); // Auto-focus input field
    } else {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.location.href = "/logout";
    }
  }

  // Updated form submission handler to prevent skipping questions
  quizForm.addEventListener("submit", function (event) {
    event.preventDefault(); // Prevent page refresh

    // If a submission is already in progress, do nothing
    if (isSubmitting) return;

    const answerText = answerInput.value.trim();
    if (answerText === "") {
      alert("Please enter an answer!");
      return;
    }

    // Lock out additional submissions
    isSubmitting = true;
    nextBtn.disabled = true; // Optionally disable the button for visual feedback

    // Create the payload including question number (1-based)
    const payload = {
      answer: answerText,
      questionNumber: currentQuestionIndex + 1
    };

    fetch(`http://${config.ip_address}:${config.port}/api/trackers`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      credentials: 'include'
    })
      .then(response => response.json())
      .then(data => {
        console.log("Server Response:", data);
        // Only increment after receiving server response
        currentQuestionIndex++;
        loadQuestion(); // Load the next question
      })
      .catch(error => console.error("Error:", error))
      .finally(() => {
        // Allow further submissions
        isSubmitting = false;
        nextBtn.disabled = false;
      });
  });

  // Handle tab switching: update the tab switch counter on the server
  function handleVisibilityChange() {
    if (document.hidden) {
      alert("Tab switching is not allowed!");
      fetch('/api/switch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })
        .then(response => response.json())
        .then(data => {
          console.log("Tab switch count updated:", data);
        })
        .catch(error => console.error("Error updating tab switch count:", error));
    }
  }
});

// Disable right-click context menu
document.addEventListener("contextmenu", function(event) {
  event.preventDefault();
  console.log("Right-click is disabled!");
});

// Disable copying
document.addEventListener("copy", function(event) {
  event.preventDefault();
  console.log("Copying is not allowed!");
});

// Disable text selection
document.addEventListener("selectstart", function(event) {
  event.preventDefault();
  console.log("Text selection is disabled!");
});
