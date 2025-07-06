// This script will add a userEmail to any report in reports.json that is missing it.
// You can run this with: `node src/app/api/scripts/migrate-reports-userEmail.js`

const fs = require('fs');
const path = require('path');

const reportsPath = path.join(__dirname, '../reports.json');
const usersPath = path.join(__dirname, '../auth/users.json');

const reports = JSON.parse(fs.readFileSync(reportsPath, 'utf-8'));
const users = JSON.parse(fs.readFileSync(usersPath, 'utf-8'));

let updated = 0;
for (const report of reports) {
  if (report.userEmail && !report.userName) {
    const user = users.find(u => u.email === report.userEmail);
    if (user && user.name) {
      report.userName = user.name;
      updated++;
    }
  }
}

fs.writeFileSync(reportsPath, JSON.stringify(reports, null, 2), 'utf-8');
console.log(`Updated ${updated} reports with user names.`);
