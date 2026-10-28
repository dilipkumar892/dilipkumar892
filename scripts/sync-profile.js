/**
 * Standalone Profile Synchronization Script
 * Fetches public GitHub repository data for dilipkumar892 and updates
 * the dynamic project showcase section in README.md.
 * 
 * Zero dependencies: Uses native Node.js stdlib (fs, path) and built-in global fetch.
 */

const fs = require('fs');
const path = require('path');

const GITHUB_USERNAME = 'dilipkumar892';
const README_PATH = path.join(__dirname, '..', 'README.md');

const START_MARKER = '<!-- PROFILE-SYNC:START -->';
const END_MARKER = '<!-- PROFILE-SYNC:END -->';

// 4 Core Planned & Featured Projects for Dileep Kumar's profile
const CORE_FEATURED_PROJECTS = [
  {
    slug: 'windows-troubleshooting-toolkit',
    title: 'Windows Troubleshooting Toolkit',
    description: 'An advanced Windows 10/11 troubleshooting utility for automated system diagnostics, SFC/DISM repairs, event-log triage, network stack resets, and safe recovery workflows.',
    tags: ['PowerShell', 'Windows 11', 'Batch', 'Diagnostics'],
    primaryLang: 'PowerShell'
  },
  {
    slug: 'localhost-port-diagnostic-toolkit',
    title: 'Localhost & Port Diagnostic Toolkit',
    description: 'Lightweight diagnostic utility for local development servers, probing open socket connections, TCP/UDP port conflicts, LAN connectivity, latency benchmarking, and firewall triage.',
    tags: ['Networking', 'TCP/IP', 'DNS', 'Firewall'],
    primaryLang: 'PowerShell / C#'
  },
  {
    slug: 'it-support-automation-tools',
    title: 'IT Support Automation Tools',
    description: 'Enterprise IT operations toolkit: silent application deployments, bulk Active Directory onboarding, workstation provisioning, printer mapping, and automated health telemetry.',
    tags: ['Active Directory', 'Sysadmin', 'GPO', 'Automation'],
    primaryLang: 'PowerShell'
  },
  {
    slug: 'ai-personal-assistant',
    title: 'AI Personal Assistant',
    description: 'AI-powered desktop assistant for IT engineers featuring natural language command execution, automated maintenance routines, documentation search, and repetitive task dispatching.',
    tags: ['Python', 'AI / LLM', 'Automation', 'Desktop'],
    primaryLang: 'Python'
  }
];

async function fetchPublicRepositories() {
  const url = `https://api.github.com/users/${GITHUB_USERNAME}/repos?per_page=100&sort=updated`;
  const headers = {
    'User-Agent': 'dilipkumar892-profile-sync-bot',
    'Accept': 'application/vnd.github.v3+json'
  };

  const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
    console.log('🔑 Authenticated with GitHub Token.');
  } else {
    console.log('⚠️ Running unauthenticated (subject to GitHub 60 req/hr rate limit).');
  }

  try {
    const res = await fetch(url, { headers });
    if (!res.ok) {
      throw new Error(`GitHub API returned HTTP ${res.status}: ${res.statusText}`);
    }
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch (err) {
    console.error('❌ Failed to fetch repositories from GitHub API:', err.message);
    return null;
  }
}

function buildProjectCard(project, matchedRepo) {
  const repoExists = !!matchedRepo;
  const repoUrl = repoExists ? matchedRepo.html_url : `https://github.com/${GITHUB_USERNAME}/${project.slug}`;
  const stars = repoExists ? matchedRepo.stargazers_count : 0;
  const forks = repoExists ? matchedRepo.forks_count : 0;
  const language = (repoExists && matchedRepo.language) ? matchedRepo.language : project.primaryLang;

  const statusBadge = repoExists
    ? `<img src="https://img.shields.io/badge/Status-Active_Repository-00F7FF?style=flat-square&logo=github&logoColor=black" alt="Active Status" />`
    : `<img src="https://img.shields.io/badge/Status-In_Active_Development-7B2FF7?style=flat-square&logo=git&logoColor=white" alt="Roadmap Status" />`;

  const actionButton = repoExists
    ? `<a href="${repoUrl}"><img src="https://img.shields.io/badge/View_Repository-0078D4?style=for-the-badge&logo=github&logoColor=white" alt="View Repository" /></a>`
    : `<a href="https://github.com/${GITHUB_USERNAME}?tab=repositories"><img src="https://img.shields.io/badge/Roadmap_Preview-333333?style=for-the-badge&logo=github&logoColor=white" alt="Preview Roadmap" /></a>`;

  return `    <td width="50%" valign="top" style="padding: 16px; border: 1px solid #1E293B; border-radius: 8px; background-color: #0E1528;">
      <h3 align="center" style="color: #00F7FF; margin-top: 4px;">🛠️ ${project.title}</h3>
      <p align="center">
        ${statusBadge}
        <img src="https://img.shields.io/badge/Language-${encodeURIComponent(language)}-38BDF8?style=flat-square" alt="${language}" />
        ${stars > 0 ? `<img src="https://img.shields.io/badge/Stars-${stars}-FFD700?style=flat-square&logo=star" alt="Stars" />` : ''}
      </p>
      <p style="color: #CBD5E1; font-size: 13.5px; line-height: 1.5; min-height: 72px;">${project.description}</p>
      <p align="center" style="margin-top: 12px;">
        ${actionButton}
      </p>
    </td>`;
}

function buildAdditionalRepoCard(repo) {
  const language = repo.language || 'Code';
  const desc = repo.description || 'Engineering repository maintained by Dileep Kumar.';
  return `    <td width="50%" valign="top" style="padding: 16px; border: 1px solid #1E293B; border-radius: 8px; background-color: #0E1528;">
      <h3 align="center" style="color: #38BDF8; margin-top: 4px;">📦 ${repo.name}</h3>
      <p align="center">
        <img src="https://img.shields.io/badge/Public_Repo-Live-success?style=flat-square&logo=github&logoColor=white" alt="Live Repo" />
        <img src="https://img.shields.io/badge/Lang-${encodeURIComponent(language)}-00F7FF?style=flat-square" alt="${language}" />
        <img src="https://img.shields.io/badge/Stars-${repo.stargazers_count}-FFD700?style=flat-square" alt="Stars" />
      </p>
      <p style="color: #CBD5E1; font-size: 13.5px; line-height: 1.5; min-height: 60px;">${desc}</p>
      <p align="center" style="margin-top: 12px;">
        <a href="${repo.html_url}">
          <img src="https://img.shields.io/badge/Explore_Code-0078D4?style=for-the-badge&logo=github&logoColor=white" alt="Explore Code" />
        </a>
      </p>
    </td>`;
}

function generateDynamicShowcase(repos) {
  const repoMap = new Map();
  if (repos) {
    for (const r of repos) {
      repoMap.set(r.name.toLowerCase(), r);
    }
  }

  // Find matches for the 4 core toolkits
  const card1 = buildProjectCard(CORE_FEATURED_PROJECTS[0], repoMap.get(CORE_FEATURED_PROJECTS[0].slug));
  const card2 = buildProjectCard(CORE_FEATURED_PROJECTS[1], repoMap.get(CORE_FEATURED_PROJECTS[1].slug));
  const card3 = buildProjectCard(CORE_FEATURED_PROJECTS[2], repoMap.get(CORE_FEATURED_PROJECTS[2].slug));
  const card4 = buildProjectCard(CORE_FEATURED_PROJECTS[3], repoMap.get(CORE_FEATURED_PROJECTS[3].slug));

  // Also include highlighted public active repos (excluding user profile meta repo dilipkumar892)
  const additionalPublicRepos = (repos || []).filter(r => 
    r.name.toLowerCase() !== GITHUB_USERNAME.toLowerCase() &&
    !CORE_FEATURED_PROJECTS.some(p => p.slug === r.name.toLowerCase())
  ).slice(0, 2);

  let additionalRows = '';
  if (additionalPublicRepos.length > 0) {
    const addCard1 = buildAdditionalRepoCard(additionalPublicRepos[0]);
    const addCard2 = additionalPublicRepos.length > 1
      ? buildAdditionalRepoCard(additionalPublicRepos[1])
      : `<td width="50%" valign="top"></td>`;
    additionalRows = `
  <tr>
${addCard1}
${addCard2}
  </tr>`;
  }

  const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19) + ' UTC';

  return `${START_MARKER}
<!-- Auto-synchronized by GitHub Actions workflow 'profile-sync.yml' -->
<!-- Last synchronization check: ${timestamp} -->
<table width="100%" cellspacing="10" cellpadding="0" border="0">
  <tr>
${card1}
${card2}
  </tr>
  <tr>
${card3}
${card4}
  </tr>${additionalRows}
</table>
${END_MARKER}`;
}

async function syncProfile() {
  console.log(`\n========================================`);
  console.log(`🚀 Profile Synchronization Starting...`);
  console.log(`Target: ${GITHUB_USERNAME} (${README_PATH})`);
  console.log(`========================================\n`);

  if (!fs.existsSync(README_PATH)) {
    console.error(`❌ README.md not found at path: ${README_PATH}`);
    process.exit(1);
  }

  const currentReadme = fs.readFileSync(README_PATH, 'utf8');

  if (!currentReadme.includes(START_MARKER) || !currentReadme.includes(END_MARKER)) {
    console.error(`❌ Boundary markers missing from README.md!`);
    console.error(`Please ensure ${START_MARKER} and ${END_MARKER} exist in the file.`);
    process.exit(1);
  }

  const repos = await fetchPublicRepositories();
  if (repos === null) {
    console.warn(`⚠️ GitHub API unavailable or rate-limited. Preserving existing README content.`);
    return;
  }

  console.log(`📦 Retrieved ${repos.length} public repositories for user ${GITHUB_USERNAME}.`);

  const updatedShowcase = generateDynamicShowcase(repos);

  const startIndex = currentReadme.indexOf(START_MARKER);
  const endIndex = currentReadme.indexOf(END_MARKER) + END_MARKER.length;

  const newReadme = currentReadme.slice(0, startIndex) + updatedShowcase + currentReadme.slice(endIndex);

  fs.writeFileSync(README_PATH, newReadme, 'utf8');
  console.log(`✅ README.md successfully updated between synchronization markers.`);
  console.log(`\n🎉 Synchronization completed successfully.\n`);
}

syncProfile().catch(err => {
  console.error(`❌ Fatal synchronization error:`, err);
  process.exit(1);
});
