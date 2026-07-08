function generateCaseNumber() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let suffix = "";

  for (let i = 0; i < 8; i++) {
    suffix += chars[Math.floor(Math.random() * chars.length)];
  }

  return `CASE-${suffix}`;
}

function getLiveAgentHandoffMessages(reason) {
  const caseNumber = generateCaseNumber();

  return [
    reason,
    `Case number: ${caseNumber}`,
  ];
}
