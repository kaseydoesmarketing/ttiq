#!/usr/bin/env node

/**
 * Test Description Generator Pro with 4 Layouts
 * Validates all 4 layouts meet requirements
 */

import { generateAllLayouts, validateAllLayouts } from './descriptionGeneratorPro.js';

// Test user data based on new onboarding schema
const testUserData = {
  brand_name: 'Tech Insights',
  content_type: 'Tech Review',
  website_url: 'https://techinsights.com',
  social_links: {
    youtube: 'https://youtube.com/@techinsights',
    instagram: 'https://instagram.com/techinsights',
    twitter: 'https://twitter.com/techinsights',
    tiktok: 'https://tiktok.com/@techinsights'
  },
  primary_offer_label: 'Work with me',
  primary_offer_url: 'https://techinsights.com/consulting',
  secondary_offer_label: 'Free Tech Newsletter',
  secondary_offer_url: 'https://techinsights.com/newsletter',
  contact_email: 'hello@techinsights.com',
  affiliates: [
    { label: 'Camera I use', url: 'https://amazon.com/camera-abc' },
    { label: 'My favorite mic', url: 'https://amazon.com/mic-xyz' },
    { label: 'Tech Course', url: 'https://techinsights.com/course' }
  ],
  sponsor_mention: 'This episode brought to you by TechTools'
};

const testVideoTitle = 'iPhone 16 Pro Review - 3 Months Later';

const testTimestamps = [
  { time: '00:00', label: 'Intro' },
  { time: '02:15', label: 'Design & Build Quality' },
  { time: '05:30', label: 'Camera System' },
  { time: '10:45', label: 'Performance & Battery' },
  { time: '14:20', label: 'Final Verdict' }
];

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('📋 TESTING DESCRIPTION GENERATOR PRO');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log();
console.log('📺 Video Title:', testVideoTitle);
console.log('👤 Brand:', testUserData.brand_name);
console.log('🎯 Content Type:', testUserData.content_type);
console.log();

// Generate all 4 layouts
console.log('🔄 Generating all 4 layouts...');
console.log();

const layouts = generateAllLayouts(testVideoTitle, testUserData, {
  timestamps: testTimestamps
});

// Validate all layouts
const validation = validateAllLayouts(layouts);

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('✅ VALIDATION RESULTS');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log();

Object.keys(validation.stats).forEach(layout => {
  const charCount = validation.stats[layout];
  const status = charCount <= 5000 ? '✅' : '❌';
  const percentage = ((charCount / 5000) * 100).toFixed(1);
  console.log(`${status} ${layout.toUpperCase()}: ${charCount} / 5000 chars (${percentage}%)`);
});

console.log();

if (validation.valid) {
  console.log('✅ ALL LAYOUTS PASS VALIDATION');
} else {
  console.log('❌ VALIDATION FAILED:');
  validation.errors.forEach(err => console.log(`   - ${err}`));
}

console.log();
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('📄 LAYOUT PREVIEWS');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log();

const layoutNames = {
  layout_a: 'Creator/Educational (Think Media style)',
  layout_b: 'Show/Podcast (Shawn Ryan style)',
  layout_c: 'News/Commentary (Daily Show style)',
  layout_d: 'Tech/Product Review (MKBHD style)'
};

Object.keys(layouts).forEach((key, index) => {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`📌 LAYOUT ${key.split('_')[1].toUpperCase()}: ${layoutNames[key]}`);
  console.log(`${'='.repeat(60)}\n`);
  console.log(layouts[key]);
  console.log();
});

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('✅ QUALITY GATE VALIDATION');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log();

// Quality gate checks
const gates = {
  'All 4 layouts generated': Object.keys(layouts).length === 4,
  'Each < 5000 characters': validation.valid,
  'Contains user main link (website)': layouts.layout_a.includes(testUserData.website_url),
  'Contains at least 1 CTA': layouts.layout_a.includes(testUserData.primary_offer_label),
  'SEO line in top 3 lines': layouts.layout_a.split('\n')[0].length > 50,
  'No TitleIQ branding': !layouts.layout_a.toLowerCase().includes('titleiq')
};

let allPassed = true;
Object.entries(gates).forEach(([check, passed]) => {
  const status = passed ? '✅' : '❌';
  console.log(`${status} ${check}`);
  if (!passed) allPassed = false;
});

console.log();

if (allPassed) {
  console.log('🎉 GATE:DESC_GENERATOR_PRO=PASS');
  console.log();
  console.log('✨ All quality gates passed! Ready for production.');
  process.exit(0);
} else {
  console.log('❌ GATE:DESC_GENERATOR_PRO=FAIL');
  console.log();
  console.log('⚠️  Some quality gates failed. Review output above.');
  process.exit(1);
}
