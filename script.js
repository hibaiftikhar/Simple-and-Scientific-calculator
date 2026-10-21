const display = document.getElementById("display");
const message = document.getElementById("message");
const keys = document.querySelector(".keys");

keys.addEventListener("click", (event) => {
  const button = event.target.closest("button");
  if (!button) return;

  if (button.dataset.action === "clear") {
    display.value = "";
    message.textContent = "Cleared.";
    return;
  }
  if (button.dataset.action === "delete") {
    display.value = display.value.slice(0, -1);
    return;
  }
  if (button.dataset.action === "equals") {
    calculate();
    return;
  }
  display.value += button.dataset.value;
  display.focus();
});

display.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    event.preventDefault();
    calculate();
  } else if (event.key === "Escape") {
    display.value = "";
    message.textContent = "Cleared.";
  }
});

// Only allow a small, explicit calculator grammar before evaluation.
function calculate() {
  const original = display.value.trim();
  if (!original) {
    message.textContent = "Enter an expression first.";
    return;
  }

  try {
    let expression = original
      .replace(/\bpi\b/gi, "Math.PI")
      .replace(/\be\b/g, "Math.E")
      .replace(/\bsqrt\s*\(/gi, "Math.sqrt(")
      .replace(/\bsin\s*\(/gi, "Math.sin((Math.PI/180)*(")
      .replace(/\bcos\s*\(/gi, "Math.cos((Math.PI/180)*(")
      .replace(/\btan\s*\(/gi, "Math.tan((Math.PI/180)*(")
      .replace(/\blog\s*\(/gi, "Math.log10(")
      .replace(/\bln\s*\(/gi, "Math.log(")
      .replace(/\^/g, "**")
      .replace(/(\d+(?:\.\d+)?)%/g, "($1/100)");

    // Close the extra parenthesis added for degree-based trig functions.
    expression = expression.replace(/Math\.(sin|cos|tan)\(\(Math\.PI\/180\)\*\(/g, "Math.$1((Math.PI/180)*(");
    const allowed = /^[0-9+\-*/().\s,%A-Za-z_]+$/;
    if (!allowed.test(expression) || /(?:window|document|constructor|prototype|eval|Function)/i.test(expression)) {
      throw new Error("Please use the calculator buttons and valid operators.");
    }
    // Function names are restricted to the Math operations generated above.
    if (/[A-Za-z_]/.test(expression.replace(/Math\.(PI|E|sqrt|sin|cos|tan|log10|log)/g, ""))) {
      throw new Error("Please check your expression.");
    }
    const answer = Function('"use strict"; return (' + expression + ')')();
    if (typeof answer !== "number" || !Number.isFinite(answer)) {
      throw new Error("That calculation does not have a finite result.");
    }
    display.value = String(Number(answer.toPrecision(12)));
    message.textContent = `${original} = ${display.value}`;
  } catch (error) {
    message.textContent = error.message || "Invalid expression. Please check it and try again.";
  }
}
