const ipadd='10.2.106.249';

document.addEventListener("DOMContentLoaded", function () {
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
    const questionLabel = document.getElementById("tec-label");
    const answerInput = document.getElementById("answer");
    const quizForm = document.getElementById("quiz-form");
    const nextBtn=document.getElementById("next-btn");

    // Load the first question
    function loadQuestion() {
        if (currentQuestionIndex < questions.length) {
            questionLabel.textContent = (currentQuestionIndex + 1) + ". " + questions[currentQuestionIndex];
            answerInput.value = ""; // Clear input field
            answerInput.focus(); // Auto-focus input field
        } else {
            document.querySelector(".Question").innerHTML = "<h2>Thank you for completing the quiz!</h2>";
        }
    }

    // Handle form submission
    quizForm.addEventListener("submit", function (event) {
        event.preventDefault(); // Prevent page refresh

        const answerText = answerInput.value.trim(); // Trim whitespace
        if (answerText === "") { // Correct validation check
            alert("Please enter an answer!");
            return;
        }

        // Send answer to the server
        fetch(`http://${ipadd}:7000/api/trackers`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ answer: answerText })
        })
            .then(response => response.json())
            .then(data => {
                console.log("Server Response:", data);
                currentQuestionIndex++; // Move to the next question
                loadQuestion(); // Load next question
            })
            .catch(error => console.error("Error:", error));
    });





    // Prevent tab switching
    document.addEventListener("visibilitychange", function () {
        if (document.hidden) {
            alert("Tab switching is not allowed!");
        }
    });

    // Load the first question on page load
    loadQuestion();
});
