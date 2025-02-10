function checkAnswers() {
    let answers = { q1: 'p', q2: 'q', q3: 'r', q4: 's', q5: 'p', q6: 'q', q7: 'r', q8: 's' };
    let score = 0;
    
    for (let key in answers) {
        if (document.getElementById(key).value === answers[key]) {
            score++;
        }
    }
    
    document.getElementById("result").innerText = "Your Score: " + score + "/8";
}

function nextSection(){
    checkAnswers();

    document.querySelector("#question-part").innerHTML=`
        <h3>Successfully Submitted</h3>
        <p>Click next section to move to next section </p>
        `

        // ✅ Update button to redirect
        document.querySelector("#button").innerHTML = `
            <button type="button" class="btn btn-outline-success" style="width:150px; ">
                <a href="/case" style="color:black;">Next Section</a>
            </button>
        `;
}