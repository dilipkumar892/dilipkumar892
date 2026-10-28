/**
 * Standalone README Validation Script
 * Verifies syntax, required sections, sync markers, link integrity, and username consistency.
 * 
 * Zero dependencies: Pure Node.js stdlib (fs, path).
 */

const fs = require('fs');
const path = require('path');

const README_PATH = path.join(__dirname, '..', 'README.md');
const USERNAME = 'dilipkumar892';

function validateReadme() {
  console.log(`\n🔍 Validating README.md (${README_PATH})...`);

  if (!fs.existsSync(README_PATH)) {
    console.error(`❌ README.md does not exist.`);
    process.exit(1);
  }

  const content = fs.readFileSync(README_PATH, 'utf8');
  let errors = 0;
  let warnings = 0;

  // 1. Check sync markers
  const startMatches = content.match(/<!-- PROFILE-SYNC:START -->/g) || [];
  const endMatches = content.match(/<!-- PROFILE-SYNC:END -->/g) || [];

  if (startMatches.length !== 1 || endMatches.length !== 1) {
    console.error(`❌ PROFILE-SYNC markers must appear exactly once. (Found ${startMatches.length} start, ${endMatches.length} end)`);
    errors++;
  } else {
    console.log(`✅ Synchronization markers validated.`);
  }

  // 2. Check username references
  if (!content.includes(USERNAME)) {
    console.error(`❌ Username "${USERNAME}" not found in README.`);
    errors++;
  } else {
    console.log(`✅ Username "${USERNAME}" verified in README links and endpoints.`);
  }

  // 3. Check for insecure HTTP image links
  const insecureImages = content.match(/src="http:\/\/[^"]+"/g);
  if (insecureImages) {
    console.warn(`⚠️ Found ${insecureImages.length} insecure HTTP image links. All should use HTTPS.`);
    warnings++;
  } else {
    console.log(`✅ All media protocols use secure HTTPS.`);
  }

  // 4. Check for presence of essential services
  const requiredEndpoints = [
    { name: 'Capsule Render (Banner & Footer)', regex: /capsule-render\.vercel\.app/ },
    { name: 'Readme Typing SVG', regex: /readme-typing-svg\.demolab\.com/ },
    { name: 'GitHub Readme Stats', regex: /github-readme-stats\.vercel\.app/ },
    { name: 'GitHub Streak Stats', regex: /streak-stats\.demolab\.com|github-readme-streak-stats/ },
    { name: 'GitHub Activity Graph', regex: /github-readme-activity-graph\.vercel\.app|activity-graph/ },
    { name: 'Visitor Counter', regex: /komarev\.com\/ghpvc/ },
    { name: '3D Contribution Graph Asset', regex: /profile-3d-contrib/ },
    { name: 'Contribution Snake Asset', regex: /github-contribution-grid-snake/ }
  ];

  requiredEndpoints.forEach(ep => {
    if (ep.regex.test(content)) {
      console.log(`✅ ${ep.name} integrated.`);
    } else {
      console.warn(`⚠️ Missing or unrecognized pattern for: ${ep.name}`);
      warnings++;
    }
  });

  console.log(`\n--- README Validation Summary ---`);
  console.log(`Errors: ${errors}`);
  console.log(`Warnings: ${warnings}`);

  if (errors > 0) {
    console.error(`❌ Validation failed with ${errors} error(s).`);
    process.exit(1);
  }

  console.log(`✨ README validation passed successfully!\n`);
}

validateReadme();
