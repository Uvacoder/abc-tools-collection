// a list of all possible problem types
const ALL_PROBLEM_TYPES = ["forLoop", "stringQuoteMismatch", "closureMismatch", "equalityOperator"];

// create a CodeMirror editor that will be used by the user to make syntax corrections
const editor = CodeMirror(document.getElementById("editor"), {
    mode: { name: "javascript" },
    lineNumbers: true,
    indentWithTabs: true,
    indentUnit: 4,
    lineWrapping: true
});

// globals
let score = 0;
let selectedProblemTypes = ["forLoop", "stringQuoteMismatch", "closureMismatch", "equalityOperator"];
let promptText = generateProblem();

// initialize UI components
setPrompt(promptText);
createProblemTypeCheckboxes();

/**
 * Create the problem type checkboxes that allow users to customize what types of problems they
 * get to practice.
 */
function createProblemTypeCheckboxes() {
    // create checkboxes for the user to be able to customize problem types that they practice
    ALL_PROBLEM_TYPES.forEach(problemType => {
        // create list item element
        const li = document.createElement("li");

        // create a checkbox element
        const input = document.createElement("input");
        input.type = "checkbox";
        input.id = problemType;
        input.name = problemType;
        input.value = problemType;
        input.checked = true;

        // define click action to add/remove problem type from selected problem types
        input.onclick = () => {
            // get the value of the input element
            const val = input.value;

            // if the input is checked, add to list of selected problem types
            if (input.checked) {
                selectedProblemTypes.push(val);
            }
            // if input is unchecked, remove it from the list of selected problem types
            else {
                selectedProblemTypes.splice(selectedProblemTypes.indexOf(val), 1);
            }

            // update prompt
            promptText = generateProblem();
            setPrompt(promptText);
        }

        // create label for checkbox input
        const label = document.createElement("label");
        label.htmlFor = problemType;
        label.innerText = problemType;

        // add checkbox and label to list item
        li.appendChild(input);
        li.appendChild(label);

        // add list item to the problem types list element
        document.getElementById("problemTypes").appendChild(li);
    });
}

/**
 * Set the contents of the code prompt view to formatted code text.
 * @param {String} code 
 */
function setPrompt(code) {
    const exampleEl = document.getElementById("example");

    // clear out anything that could still be in the code prompt element
    exampleEl.innerHTML = "";

    // add code mirror className so syntax highlighting works
    exampleEl.className = "cm-s-default";

    // run CodeMirror syntax highlighting on the code
    CodeMirror.runMode(code, { name: "javascript" }, example);
}

/**
 * Select and return a random element from an array.
 * @param {Array} arr
 * @returns {Any} element
 */
function selectRandom(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * Checkd the code to see if it has valid syntax.
 * @param {String} code 
 * @returns {Boolean} isValidSyntax
 */
function checkCode(code) {
    try {
        esprima.parse(code);
    } 
    catch(e) {
        return false;
    }
    
    return true;
}

/**
 * Get random string of text.
 * @returns {String} text
 */
function getRandomText() {
    return Math.random().toString(36).replace(/[^a-z]+/g, '');
}

/**
* Generate a code example to display to the user as a syntax problem.
* @returns {String} problemText
*/
function generateProblem() {
    let problemType = selectRandom(selectedProblemTypes);
    let problemText;

    if (problemType == "forLoop") {
        const variants = ["missingFirstSemi", "missingSecondSemi", "correct"];
        let variant = selectRandom(variants);

        if (variant == "missingFirstSemi") {
            problemText = "for (let x = 0 x < 5; x++) {\n\n}";
        }
        else if (variant == "missingSecondSemi") {
            problemText = "for (let x = 0; x < 5 x++) {\n\n}";
        }
        else if (variant == "correct") {
            problemText = "for (let x = 0; x < 5; x++) {\n\n}";
        }
    }
    else if (problemType == "stringQuoteMismatch") {
        const firstQuote  = Math.round(Math.random()) ? "\"" : "'";
        const secondQuote = Math.round(Math.random()) ? "\"" : "'";
        const text = getRandomText();

        problemText = `${firstQuote}${text}${secondQuote}`;
    }
    else if (problemType == "closureMismatch") {
        const openings = ["{", "(", "["];
        const closings = ["}", ")", "]"];

        const variants = [
            `if ${selectRandom(openings)}true${selectRandom(closings)} {\n\tconsole.log("${getRandomText()}");\n}`,
            `function myFunction() ${selectRandom(openings)}\n\tconsole.log("${getRandomText()}");\n${selectRandom(closings)}`,
            `let arr = ${selectRandom(["{", "["])}1, 2, 3, 4, 5${selectRandom(["}", "]"])};`
        ];

        problemText = selectRandom(variants);
    }
    else if (problemType == "equalityOperator") {
        const operator = Math.round(Math.random()) ? "=" : "==";

        problemText = `if (1 ${operator} 2) {\n\tconsole.log("${getRandomText()}");\n}`;
    }

    return problemText;
}

/**
 * Change the score UI element.
 * @param {Number} delta 
 */
function setScore(delta) {
    // change score by delta value
    score += delta;

    // update score UI element
    document.getElementById("score").innerText = "Score: " + score;
}

/**
 * Check the user's answer.
 * @param {String} response 
 */
function answerPrompt(response) {
    // show the notification alert
    const notif = document.getElementById("notification");
    notif.style.display = "";

    // if the code syntax is correct
    if (checkCode(promptText)) {
        if (response == "correct") {
            // give the user feedback that they're right
            notif.innerHTML = "That's right!";
            notif.className = "success";

            // generate a new problem
            promptText = generateProblem();
            setPrompt(promptText);

            // add ten to score for correct answer
            setScore(10);
        }
        else {
            // give the user feedback that they're wrong
            notif.innerHTML = "That's wrong.";
            notif.className = "failure";

            // take away five points for incorrect answer
            setScore(-5);
        }
    }
    // if the problem syntax is incorrect
    else {
        if (response == "correct") {
            // give the user feedback that they're wrong
            notif.innerHTML = "That's wrong.";
            notif.className = "failure";

            // take away five points for incorrect answer
            setScore(-5);
        }
        else {
            // give the user feedback that they're right
            notif.innerHTML = "That's right!";
            notif.className = "success";

            // show the editor and focus on it
            document.getElementById("makeCorrections").style.display = "";
            editor.refresh();
            editor.focus();

            // set the value to current prompt text and go to end of line
            editor.setValue(promptText);
            editor.setCursor(editor.lineCount(), 0);

            // give five points for correct identification of improper syntax
            setScore(5);
        }
    }

    // hide the notification alert after 1 second
    setTimeout(() => notif.style.display = "none", 1000);
}

/**
 * Correct the syntax of the prompt
 */
function correctPrompt() {
    // show the notification alert
    const notif = document.getElementById("notification");
    notif.style.display = "";

    // if the user types in syntatically correct code
    // this is just checks if it is syntactically correct, not that it is the right code
    if (checkCode(editor.getValue())) {
        // give the user feedback that they're right
        notif.innerHTML = "That's right!";
        notif.className = "success";

        // hide the make corrections div since we're done correcting
        document.getElementById("makeCorrections").style.display = "none";

        // generate a new problem
        promptText = generateProblem();
        setPrompt(promptText);

        // add ten to score for correct answer
        setScore(10);
    }
    else {
        // give the user feedback that they're wrong
        notif.innerHTML = "That's wrong.";
        notif.className = "failure";

        // take away five points for incorrect answer
        setScore(-5);
    }

    // hide the notification alert after 1 second
    setTimeout(() => notif.style.display = "none", 1000);
}

// bind onclick functions to the buttons
document.getElementById("correct").onclick = () => answerPrompt("correct");
document.getElementById("incorrect").onclick = () => answerPrompt("incorrect");
document.getElementById("submit").onclick = correctPrompt;
