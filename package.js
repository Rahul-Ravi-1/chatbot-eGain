const PACKAGE_DB = {
  PKG123456: { status: "In transit", lastUpdate: "Arrived at regional facility" },
  PKG789012: { status: "Delivered", lastUpdate: "Left at front door" },
  PKG000001: { status: "Lost", lastUpdate: "No scan in 7 days" },
};

function extractPackageNumber(text) {
  const match = text.match(/PKG[A-Z0-9]+/i);
  return match ? match[0].toUpperCase() : null;
}

function lookupPackage(pkgId) {
  return PACKAGE_DB[pkgId] ?? null;
}

function getPackageLookupMessage(pkgId) {
  const record = lookupPackage(pkgId);
  return `Found package ${pkgId}. Status: ${record.status}. ${record.lastUpdate}.`;
}
