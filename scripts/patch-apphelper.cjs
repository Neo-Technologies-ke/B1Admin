#!/usr/bin/env node

/**
 * Post-install patch script for @churchapps/apphelper
 * Replaces B1.Church and Lessons.church labels with Portal and Lessons
 * Uses REACT_APP_B1_WEBSITE_URL and REACT_APP_LESSONS_URL env vars so
 * staging and production get their respective portal/lessons URLs.
 */

const fs = require('fs');
const path = require('path');

const APPHELPER_PATH = path.join(__dirname, '../node_modules/@churchapps/apphelper/dist/components/wrapper/AppList.js');

const portalUrl = process.env.REACT_APP_B1_WEBSITE_URL || 'https://portal.lifereformationcentre.org';
const lessonsUrl = process.env.REACT_APP_LESSONS_URL || 'https://lessons.lifereformationcentre.org';

try {
  if (!fs.existsSync(APPHELPER_PATH)) {
    process.exit(0);
  }

  let content = fs.readFileSync(APPHELPER_PATH, 'utf8');

  const originalB1Block = 'url: `${CommonEnvironmentHelper.B1Root.replace("{key}", props.currentUserChurch.church.subDomain)}/login?jwt=${jwt}&churchId=${churchId}`, selected: props.appName === "B1.church", external: true, label: "B1.Church"';
  const originalLessonsBlock = 'url: `${CommonEnvironmentHelper.LessonsRoot}/login?jwt=${jwt}&churchId=${churchId}`, selected: props.appName === "Lessons.church", external: true, label: "Lessons.church"';

  const patchedB1Block = `url: \`${portalUrl}/login?jwt=\${jwt}&churchId=\${churchId}\`, selected: props.appName === "Portal", external: true, label: "Portal"`;
  const patchedLessonsBlock = `url: \`${lessonsUrl}/login?jwt=\${jwt}&churchId=\${churchId}\`, selected: props.appName === "Lessons", external: true, label: "Lessons"`;

  if (content.includes(patchedB1Block) && content.includes(patchedLessonsBlock)) {
    process.exit(0);
  }

  let patched = false;
  if (content.includes(originalB1Block)) {
    content = content.replace(originalB1Block, patchedB1Block);
    patched = true;
  }
  if (content.includes(originalLessonsBlock)) {
    content = content.replace(originalLessonsBlock, patchedLessonsBlock);
    patched = true;
  }

  if (patched) {
    fs.writeFileSync(APPHELPER_PATH, content, 'utf8');
  }

} catch (error) {
  // Do not fail the install if patching fails
  process.exit(0);
}
