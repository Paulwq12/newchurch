const texts = [
    "Tribe of Judah Media department Attendance list",
    "Click Login to take your attendance",
     "Click register if you are a new member"
];

let currentTextIndex = 0;
let currentCharIndex = 0;
const dynamicTextElement = document.getElementById('dynamic-text');

function typeText() {
    if (currentCharIndex < texts[currentTextIndex].length) {
        dynamicTextElement.textContent += texts[currentTextIndex].charAt(currentCharIndex);
        currentCharIndex++;
        setTimeout(typeText, 100); // Adjust typing speed here
    } else {
        setTimeout(deleteText, 1000); // Pause before deleting
    }
}

function deleteText() {
    if (currentCharIndex > 0) {
        dynamicTextElement.textContent = texts[currentTextIndex].substring(0, currentCharIndex - 1);
        currentCharIndex--;
        setTimeout(deleteText, 50); // Adjust deleting speed here
    } else {
        currentTextIndex = (currentTextIndex + 1) % texts.length; // Move to the next text
        setTimeout(typeText, 500); // Pause before typing next text
    }
}

// Start the typing effect
typeText();
