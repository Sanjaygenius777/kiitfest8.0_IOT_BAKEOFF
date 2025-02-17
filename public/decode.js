// Prevent tab switching
let config = {};

fetch('/config.json')
  .then(response => response.json())
  .then(data => {
    config = data;
    // Now load your first question or start your app logic
    loadQuestion();
  })
  .catch(error => console.error('Error loading config:', error));

  
  function handleVisibilityChange() {
    if (document.hidden) {
      alert("Tab switching is not allowed!");
      // Call the API to update the tab switch counter
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
  
  document.addEventListener("visibilitychange", handleVisibilityChange);

// Define each question with its own options
const questions = [
  {
    text: "What does IoT stand for?",
    options: [
      "Internet of Technology",
      "Internet of Things",
      "Interconnection of Tools",
      "Intelligent Operating Tech"
    ]
  },
  {
    text: "I have three valence electrons and am often added to silicon to create p-type semiconductors. I play a crucial role in making electronic devices more efficient. What am I?",
    options: [
      "Arsenic",
      "Antimony",
      "Boron",
      "Phosphorous"
    ]
  },
  {
    text: "I have colorful stripes that reveal my identity. My resistance value is 53 ohms—can you figure out my color code?",
    options: [
      "Brown, Black, Gold, Gold",
      "Brown ,Black ,Black, Gold",
      "Green, Orange, Black ,Gold",
      "Yellow, Black ,Black, Gold"
    ]
  },
  {
    text: "I help microcontrollers interact with the real world by detecting temperature and humidity levels. Who am I?",
    options: [
      "PIR Sensor",
      "DHT11 Sensor",
      "IR Sensor",
      "LDR Sensor"
    ]
  },
  {
    text: " I enable real-time tracking and navigation by providing location data based on satellites. Who am I?  ",
    options: [
      "GSM Module",
      "RF Module",
      "GPS Module",
      "Bluetooth Module"
    ]
  },
  {
    text: "What am I ?My mother has only one son.The boy in the photograph is my son.What am I to him?",
    options: [
      "Brother",
      "Father",
      "Uncle",
      "Cousin"
    ]
  },
  {
    text: "I am an actuator that can rotate precisely to a given angle and am used in robotics and automation. Who am I?",
    options: [
      "DC Motor",
      "Stepper Motor",
      "BLDC Motor",
      "Servo Motor"
    ]
  },
  {
    text: "Bhai ne bola karne ka matlab karne ka...Guess the movie?",
    options: [
      "Wanted (2009)",
      "Munna Bhai M.B.B.S (2003)",
      "Dhoom (2004)",
      "Hera Pheri (2000)"
    ]
  },
  {
    text: "I allow IoT devices to communicate securely over an untrusted network using tunneling and encryption techniques. Without me, data breaches would be common. What am I?",
    options: [
      "Plain MQTT Protocol",
      "Virtual Private Network (VPN)",
      "Unencrypted HTTP Communication",
      "Open Wi-Fi Network"
    ]
  },
  {
    text: " Why is February 14th observed as a Black Day in India?",
    options: [
      "Due to the Pulwama terror attack in 2019",
      "Due to the 2008 Mumbai attacks",
      "Due to the Parliament attack in 2001",
      "Due to the Kargil War in 1999"
    ]
  }
];

let currentQuestionIndex = 0;
const form = document.getElementById("ques");

// Function to dynamically load a question and its options
function loadQuestion() {
  const questionPart = document.getElementById("question-part");

  if (currentQuestionIndex < questions.length) {
    const currentQuestion = questions[currentQuestionIndex];

    // Build the HTML for the question text and options list
    let html = `<label id="question">${currentQuestionIndex + 1}. ${currentQuestion.text}</label>`;
    html += "<ul>";
    currentQuestion.options.forEach((option, index) => {
      // Create a unique id for each radio input (e.g., ques0, ques1, etc.)
      html += `
        <li>
          <input type="radio" id="ques${index}" name="ques" value="${option}">
          <label for="ques${index}">${option}</label>
        </li>
      `;
    });
    html += "</ul>";

    // Replace the current question-part inner HTML with the new question and options
    questionPart.innerHTML = html;
  } else {
    // Remove the tab switch listener when questions are done
    document.removeEventListener("visibilitychange", handleVisibilityChange);

    // Replace the question area with a submission message
    questionPart.innerHTML = `
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
  fetch(`http://${config.ip_address}:${config.port}/api/decode`, {
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

      // Move on to the next question
      currentQuestionIndex++;
      loadQuestion();
    })
    .catch(error => {
      console.error("Error:", error);
    });
});

// Load the first question on page load
// loadQuestion();

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

document.addEventListener("selectstart", function(event) {
  event.preventDefault();
  console.log("Text selection is disabled!");
});
