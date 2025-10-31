/**
 * Test script for description generation and hashtag logic
 * Run with: node backend/utils/test-description-gen.js
 */

import { generateContentAwareHashtags, mergeHashtags, filterSpamHashtags } from './hashtagGenerator.js';
import { buildDescription } from './descriptionBuilder.js';

console.log('=== Testing Content-Aware Hashtag Generation ===\n');

// Test 1: SEO tutorial
const test1 = {
  title: "SEO Tips for Beginners: Rank #1 on Google in 2026",
  transcript: "In this video, we'll cover everything you need to know about SEO optimization...",
  profile: {
    niche: "Digital Marketing",
    content_type: "tutorial",
    primary_goal: "growth",
    brand_name: "SEO Mastery"
  }
};

const hashtags1 = generateContentAwareHashtags(
  test1.title,
  test1.transcript,
  test1.profile,
  'long-form'
);

console.log('Test 1: SEO Tutorial');
console.log('Title:', test1.title);
console.log('Generated Hashtags:', hashtags1.join(' '));
console.log('Expected: #seo, #digitalmarketing, #tutorial, #seomastery, #youtubegrowth');
console.log('');

// Test 2: Fitness short-form
const test2 = {
  title: "30-Day Abs Challenge - Get Shredded Fast",
  transcript: "Welcome to the 30-day abs challenge. We'll do this workout every day...",
  profile: {
    niche: "Fitness",
    content_type: "shorts",
    primary_goal: "engagement",
    brand_name: "FitLife"
  }
};

const hashtags2 = generateContentAwareHashtags(
  test2.title,
  test2.transcript,
  test2.profile,
  'short-form'
);

console.log('Test 2: Fitness Short');
console.log('Title:', test2.title);
console.log('Generated Hashtags:', hashtags2.join(' '));
console.log('Expected: #challenge, #fitness, #shorts, #fitlife, #viral');
console.log('');

// Test 3: Filter spam hashtags
const userHashtags = ['#titleiq', '#fyp', '#viral', '#coding', '#tech', '#aitools'];
const filtered = filterSpamHashtags(userHashtags, 'long-form');

console.log('Test 3: Spam Filter (long-form)');
console.log('Input:', userHashtags.join(' '));
console.log('Filtered:', filtered.join(' '));
console.log('Expected: #coding, #tech (removed #titleiq, #aitools, #fyp, #viral)');
console.log('');

// Test 4: Merge hashtags
const generated = ['#seo', '#digitalmarketing', '#tutorial'];
const userProvided = ['#marketing', '#contentcreation', '#titleiq', '#fyp'];
const merged = mergeHashtags(generated, userProvided, 'long-form');

console.log('Test 4: Merge Hashtags');
console.log('Generated:', generated.join(' '));
console.log('User Provided:', userProvided.join(' '));
console.log('Merged:', merged.join(' '));
console.log('Expected: Prioritize generated, filter spam, limit to 7');
console.log('');

// Test 5: Full description build
console.log('=== Testing Full Description Builder ===\n');

const descTest = {
  transcript: "In this video, we explore SEO strategies that actually work in 2026...",
  profile: {
    niche: "Digital Marketing",
    brand_name: "SEO Mastery",
    website_url: "https://seomastery.com",
    primary_goal: "growth",
    content_type: "tutorial",
    social_links: {
      youtube: "https://youtube.com/@seomastery",
      twitter: "https://twitter.com/seomastery"
    }
  },
  keyTakeaways: [
    "How to find low-competition keywords",
    "On-page SEO best practices for 2026",
    "Link building strategies that work"
  ],
  title: "SEO Tips for Beginners: Rank #1 on Google in 2026",
  leadText: "Want to rank #1 on Google? This complete SEO guide covers everything beginners need to know."
};

const fullDescription = buildDescription(descTest);

console.log('Test 5: Full Description');
console.log('---');
console.log(fullDescription);
console.log('---');
console.log('');

// Verify structure
const hasHook = fullDescription.includes('Want to rank #1');
const hasBullets = fullDescription.includes("You'll see:");
const hasCTA = fullDescription.includes('Subscribe');
const hasWebsite = fullDescription.includes('seomastery.com');
const hasSocial = fullDescription.includes('YouTube:');
const hasHashtags = fullDescription.includes('#');
const noBranding = !fullDescription.includes('TitleIQ') && !fullDescription.includes('titleiq');

console.log('Structure Validation:');
console.log('✓ Hook:', hasHook ? 'PASS' : 'FAIL');
console.log('✓ Bullets:', hasBullets ? 'PASS' : 'FAIL');
console.log('✓ CTA:', hasCTA ? 'PASS' : 'FAIL');
console.log('✓ Website:', hasWebsite ? 'PASS' : 'FAIL');
console.log('✓ Social Links:', hasSocial ? 'PASS' : 'FAIL');
console.log('✓ Hashtags:', hasHashtags ? 'PASS' : 'FAIL');
console.log('✓ No Branding:', noBranding ? 'PASS' : 'FAIL');
console.log('');

if (hasHook && hasBullets && hasCTA && hasWebsite && hasSocial && hasHashtags && noBranding) {
  console.log('🎉 ALL TESTS PASSED!');
} else {
  console.log('❌ SOME TESTS FAILED - Review output above');
}
