
const { getAdminCred,getTeamsCred, insertAnswer, updateMTF,updateTrackerAnswer,updateDecodeAnswer,insertUserIntoTables,incrementTabSwitch} = require('./db');
const express = require('express');
const cors = require("cors");
const session = require('express-session');
const app = express();
const path = require('path');

app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));

app.use(session({
    secret: , // Replace with a strong secret for production
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false } // Use secure: true if serving over HTTPS
  }));

app.use(cors());

// Database query for admin usernames and passwords
async function Admin() {
    const adminData = await getAdminCred();  // Get admin data from DB
    return adminData;  // Return the resolved data (Array of admin objects)
}

async function Teams() {
    const teamData = await getTeamsCred();  // Get admin data from DB
    return teamData;  // Return the resolved data (Array of admin objects)
}


// Start the server asynchronously
async function initializeServer() {
    const adminname = await Admin();  // Resolve the admin data
    const teamname = await Teams();
    app.locals.teamname= teamname;
    app.locals.adminname = adminname;  // Store it in the app locals for access in routes
}

initializeServer();  // Call the function to initialize the server with admin data

// Serve static files from 'public' folder
app.use(express.static(path.join(__dirname, 'public')));

const port = 8000;

// Define route for root (home page)
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, 'main.html'));
});

// Define route for login page
app.get("/login", (req, res) => {
    res.sendFile(path.join(__dirname, 'login.html'));
});

// Route for handling login submission
app.post('/submit', async (req, res) => {
  const name = req.body.name;       // Note: Use req.body instead of req.query for POST data
  const pass = req.body.password;
  const teamname = req.app.locals.teamname;
  const adminname = req.app.locals.adminname;

  // Check teams
  for (let i = 0; i < teamname.length; i++) {
      if (name === teamname[i].Username && pass === teamname[i].pass) {
          req.session.username = name; // Store in session
          await insertUserIntoTables(name);
          return res.redirect("/mind");
      }
  } 

  // Check admins
  for (let i = 0; i < adminname.length; i++) {
      if (name === adminname[i].username && pass === adminname[i].pass) {
          req.session.username = name; // Store in session
          return res.redirect("/admin");
      }
  }
  
  return res.redirect("/login");
});



// Define routes for various pages
app.get("/mind", (req, res) => {
    res.sendFile(path.join(__dirname, 'mind.html'));
});

app.get("/decode", (req, res) => {
    res.sendFile(path.join(__dirname, 'decode.html'));
});

app.get("/case", (req, res) => {
    res.sendFile(path.join(__dirname, 'case.html'));
});

app.get("/admin", (req, res) => {
    res.sendFile(path.join(__dirname, 'admin.html'));
});

app.get("/trackers", (req, res) => {
    res.sendFile(path.join(__dirname, 'trackers.html'));
});

app.get("/match", (req, res) => {
    res.sendFile(path.join(__dirname, 'match.html'));
});

app.get('/logout', (req, res) => {
  req.session.destroy(err => {
      if (err) {
          console.error('Logout error:', err);
      }
      res.redirect('/login');
  });
});


app.post("/api/switch", async (req, res) => {
  const username = req.session.username;
  if (!username) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  try {
    const result = await incrementTabSwitch(username);
    console.log("Tab switch count updated for", username);
    return res.json({ message: "Tab switch count updated", result });
  } catch (error) {
    console.error("Error updating tab switch count", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});
 

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});

app.post("/api/quiz", async (req, res) => {
    console.log("Received POST request to /api/quiz");
    console.log("Request Body:", req.body);

    const {  answer } = req.body;

    if (!answer) { 
        console.log("Error: Missing username or answer!");
        return res.status(400).json({ message: "Username and answer are required" });
    }

    try {
        const insertId = await insertAnswer("Hunters", answer);
        console.log(`Answer stored in DB with ID: ${insertId}`);

        // Ensure only one response is sent
        return res.json({ message: `Answer saved successfully!`, id: insertId });
    } catch (error) {
        console.error("❌ Database Insert Error:", error);

        // Ensure only one response is sent
        return res.status(500).json({ message: "Internal Server Error" });
    }
});
  

app.post("/match/submit", async (req, res) => {
    console.log("Received POST request to /match/submit");
  
    const { answers } = req.body;
    const username = req.session.username;

  
    if (!answers) {
      console.log("Error: Missing answers!");
      return res.status(400).json({ message: "Answers are required" });
    }
  
    console.log("Received Answers:", answers);
  
    try {
      // Update the MTF table using the updateMTF function.
      const result = await updateMTF(username, answers);
      console.log("MTF update result:", result);
      return res.json({ message: "Answer saved successfully!", received: answers });
    } catch (error) {
      console.error("Database update error:", error);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  });

  app.post("/api/trackers", async (req, res) => {
    console.log("Received POST request to /api/trackers");
    console.log("Request Body:", req.body);
  
    const { answer, questionNumber } = req.body;
    const username = req.session.username;
  
    if (!answer || !questionNumber) {
      console.log("Error: Missing answer or question number!");
      return res.status(400).json({ message: "Answer and question number are required" });
    }
  
    try {
      // Construct the column name using the question number
      const columnName = `Ques${questionNumber}`;
      await updateTrackerAnswer(username, answer, columnName);
      console.log("Tracker answer updated successfully for user:", username);
      return res.json({ message: "Tracker answer updated successfully!" });
    } catch (error) {
      console.error("❌ Database Update Error:", error);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  });

  
  app.get("/api/trackers/progress", async (req, res) => {
    // For example purposes, we can assume progress is stored in session or default to 1
    const currentQuestion = req.session.currentQuestion || 1;
    res.json({ currentQuestion });
  });

  // index.js

app.post("/api/decode", async (req, res) => {
    console.log("Received POST request to /api/decode");
    console.log("Request Body:", req.body);
  
    const { questionNumber, answer } = req.body;
    const username = req.session.username;
  
    if (!answer || !questionNumber) {
      console.log("Error: Missing answer or question number!");
      return res.status(400).json({ message: "Both questionNumber and answer are required" });
    }
  
    try {
      const result = await updateDecodeAnswer(username,questionNumber, answer);
      console.log(`Decode table updated successfully for user ${username}:`, result);
      return res.json({ message: "Decode answer updated successfully!", result });
    } catch (error) {
      console.error("❌ Database Update Error:", error);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  });
  

  app.get("/session", (req, res) => {
    if (req.session && req.session.username) {
        res.json({ username: req.session.username });
    } else {
        res.json({ username: null });
    }
});
