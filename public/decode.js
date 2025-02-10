// Prevent tab switching
const ipadd='10.2.106.249'
function handleVisibilityChange() {
    if (document.hidden) {
      alert("Tab switching is not allowed!");
    }
  }
  document.addEventListener("visibilitychange", handleVisibilityChange);
  
  // Questions array
  const questions = [
    "How are you?",
    "What is your favorite technology?",
    "How does IoT impact daily life?",
    "What programming languages do you know?",
    "What is your dream project?",
    "What are the challenges in IoT?",
    "How do sensors work in IoT?",
    "What do you think about AI in IoT?",
    "How do you secure an IoT system?",
    "What is the future of IoT?"
  ];
  
  let currentQuestionIndex = 0;
  const questionLabel = document.getElementById("question");
  const form = document.getElementById("ques");
  
  function loadQuestion() {
    if (currentQuestionIndex < questions.length) {
      // Update the question text (e.g., "1. How are you?")
      questionLabel.textContent = (currentQuestionIndex + 1) + ". " + questions[currentQuestionIndex];
    } else {
      // Remove the tab switch listener when questions are done
      document.removeEventListener("visibilitychange", handleVisibilityChange);
  
      // Replace the question area with a submission message
      document.querySelector("#question-part").innerHTML = `
        <h3>Successfully Submitted</h3>
        <p>Click next section to move to next section</p>
      `;
  
      // Replace the button with a redirect button
      document.querySelector("#button").innerHTML = `
        <button type="button" class="btn btn-outline-success" style="width:150px;">
          <a href="/match" style="color:black; text-decoration:none;">Next Section</a>
        </button>
      `;
    }
  }
  
  // Handle the form submission to send the answer to /api/decode
  form.addEventListener("submit", function(event) {
    event.preventDefault(); // Prevent the default form submission
  
    // Retrieve the selected answer from the radio buttons (they have name="ques")
    const selectedOption = document.querySelector('input[name="ques"]:checked');
    if (!selectedOption) {
      alert("Please select an answer!");
      return;
    }
  
    const answer = selectedOption.value;
    // Use currentQuestionIndex + 1 as the question number (since array index starts at 0)
    const questionNumber = currentQuestionIndex + 1;
  
    // Send the answer and question number to the API endpoint
    fetch(`http://${ipadd}:7000/api/decode`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ questionNumber, answer })
    })
    .then(response => response.json())
    .then(data => {
      console.log("Server response:", data.message);
      // Optionally, show the server response in your page
      document.getElementById("response").innerText = "Server Response: " + data.message;
  
      // Optionally, clear the radio selection before moving on
      document.querySelectorAll('input[name="ques"]').forEach(radio => radio.checked = false);
  
      // Move on to the next question
      currentQuestionIndex++;
      loadQuestion();
    })
    .catch(error => {
      console.error("Error:", error);
    });
  });
  
  // Load the first question on page load
  loadQuestion();
  