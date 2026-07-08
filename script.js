const messages = [];
let currentStep = null;
let packageNumberAttempts = 0;
let packageLookupAttempts = 0;
let foundPackageNumber = null;

const GREETING_OPTIONS = [
  "Package Status / Lost Package",
  "Product Selection",
  "Technical Issue / Troubleshoot",
  "Other",
];

const DEMO_ONLY_MESSAGE =
  "This option is for display purposes only in this demo. Press 1 to try the lost package scenario.";

function addBot(text) {
  messages.push({ type: "bot", text });
}

function addOptions(items) {
  messages.push({ type: "options", items });
}

function handoffToLiveAgent(reason) {
  getLiveAgentHandoffMessages(reason).forEach(addBot);
  currentStep = "done";
  showRestartButton();
}

function showRestartButton() {
  document.getElementById("restart-button").classList.remove("hidden");
}

function hideRestartButton() {
  document.getElementById("restart-button").classList.add("hidden");
}

function handlePackageLookup(pkgId) {
  const record = lookupPackage(pkgId);

  if (record) {
    foundPackageNumber = pkgId;
    packageLookupAttempts = 0;
    addBot(getPackageLookupMessage(pkgId));
    addBot("Did this resolve your issue? (yes/no)");
    currentStep = "package_resolved_check";
    return;
  }

  if (packageLookupAttempts < 2) {
    packageLookupAttempts++;
    currentStep = "package_lookup_retry";

    if (packageLookupAttempts === 1) {
      addBot(
        "That package number wasn't found in our system. Please double-check and try again.",
      );
    } else {
      addBot("Still no match. Please try one more time.");
    }
    return;
  }

  handoffToLiveAgent(
    "I wasn't able to find your package in our system. I'm connecting you with a live agent — please have your receipt number handy when they join.",
  );
}

function renderMessages() {
  const chatLog = document.getElementById("chat-log");
  chatLog.innerHTML = "";

  const inner = document.createElement("div");
  inner.className = "chat-log-inner";

  for (const msg of messages) {
    if (msg.type === "bot") {
      const el = document.createElement("div");
      el.className = "msg msg-bot";
      el.textContent = msg.text;
      inner.appendChild(el);
    } else if (msg.type === "user") {
      const el = document.createElement("div");
      el.className = "msg msg-user";
      el.textContent = msg.text;
      inner.appendChild(el);
    } else if (msg.type === "options") {
      const el = document.createElement("div");
      el.className = "msg-options";
      msg.items.forEach((item, index) => {
        const option = document.createElement("div");
        option.textContent = `[${index + 1}] ${item}`;
        el.appendChild(option);
      });
      inner.appendChild(el);
    }
  }

  const pending = document.createElement("div");
  pending.className = "msg msg-pending";
  pending.textContent = "(waiting for input...)";
  inner.appendChild(pending);

  chatLog.appendChild(inner);
  chatLog.scrollTop = chatLog.scrollHeight;
}
let menuAttempts = 0;
function handleStep(input) {
  if (currentStep === "greeting") {
    if (input === "1") {
      addBot("Please describe what happened with your package.");
      currentStep = "lost_package_describe";
    } else if (input === "2") {
      addBot(DEMO_ONLY_MESSAGE);
    } else if (input === "3") {
      addBot(DEMO_ONLY_MESSAGE);
    } else if (input === "4") {
      addBot(DEMO_ONLY_MESSAGE);
    } else {
      menuAttempts++;
      if (menuAttempts >= 3) {
        handoffToLiveAgent(
          "I'm having trouble understanding your selection. I'm connecting you with a live agent."
        );
        return;
      }
      addBot("Please enter a number from the list above (1–4).");
    }
    
    return;
  }

  if (currentStep === "lost_package_describe") {
    const pkgId = extractPackageNumber(input);

    if (pkgId) {
      handlePackageLookup(pkgId);
    } else {
      packageNumberAttempts = 0;
      packageLookupAttempts = 0;
      currentStep = "lost_package_ask_number";
      addBot(
        "I couldn't find a package number in your message. Please provide your package number (e.g. PKG123456).",
      );
    }
    return;
  }

  if (currentStep === "lost_package_ask_number") {
    const pkgId = extractPackageNumber(input);

    if (pkgId) {
      handlePackageLookup(pkgId);
    } else if (packageNumberAttempts === 0) {
      packageNumberAttempts = 1;
      addBot(
        "That doesn't look like a valid package number. Please try again (format: PKG followed by letters/numbers).",
      );
    } else {
      handoffToLiveAgent(
        "I wasn't able to find a valid package number. I'm connecting you with a live agent — please have your receipt number handy when they join.",
      );
    }
    return;
  }

  if (currentStep === "package_lookup_retry") {
    const pkgId = extractPackageNumber(input);

    if (pkgId) {
      handlePackageLookup(pkgId);
    } else {
      addBot(
        "Please enter a valid package number (format: PKG followed by letters/numbers).",
      );
    }
    return;
  }

  if (currentStep === "package_resolved_check") {
    const answer = input.trim().toLowerCase();

    if (answer === "yes" || answer === "y") {
      addBot("Glad we could help! Feel free to reach out again anytime.");
      currentStep = "done";
      showRestartButton();
    } else if (answer === "no" || answer === "n") {
      handoffToLiveAgent(
        "I'm sorry that didn't resolve your issue. I'm connecting you with a live agent — please have your receipt number handy when they join.",
      );
    } else {
      addBot("Please answer yes or no.");
    }
    return;
  }

  if (currentStep !== "done") {
    addBot(DEMO_ONLY_MESSAGE);
  }
}

function startChat() {
  const helpButton = document.querySelector("#helpbutton");
  if (helpButton) {
    helpButton.remove();
  }

  const pageCenter = document.querySelector(".page-center");
  const chatApp = document.getElementById("chat-app");

  pageCenter.classList.add("chat-active");
  chatApp.classList.remove("hidden");

  addBot("Hello, what can I help you with?");
  addOptions(GREETING_OPTIONS);
  currentStep = "greeting";
  packageNumberAttempts = 0;
  packageLookupAttempts = 0;
  foundPackageNumber = null;
  hideRestartButton();

  renderMessages();
  document.getElementById("chat-input").focus();
}

function showHelp() {
  const helpButton = document.createElement("button");
  helpButton.id = "helpbutton";
  helpButton.type = "button";
  helpButton.textContent = "Need Help ?";
  helpButton.addEventListener("click", startChat);

  document.querySelector(".page-center").appendChild(helpButton);
}

function initChatForm() {
  const chatForm = document.getElementById("chat-form");
  const chatInput = document.getElementById("chat-input");

  chatForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const input = chatInput.value.trim();
    if (!input) {
      return;
    }

    messages.push({ type: "user", text: input });
    chatInput.value = "";

    handleStep(input);
    renderMessages();
    chatInput.focus();
  });
}

showHelp();
initChatForm();
hideRestartButton();

document.getElementById("restart-button").addEventListener("click", () => {
  location.reload();
});
