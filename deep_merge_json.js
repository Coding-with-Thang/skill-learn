const fs = require('fs');

function deepMerge(target, source) {
  for (const key in source) {
    if (source[key] !== null && typeof source[key] === 'object' && !Array.isArray(source[key])) {
      if (!(key in target) || typeof target[key] !== 'object') {
        target[key] = {};
      }
      deepMerge(target[key], source[key]);
    } else {
      target[key] = source[key];
    }
  }
}

// Custom parser that handles duplicate keys by deep merging
function parseAndMerge(text) {
  // This is non-trivial to write from scratch for full JSON
  // But we can use a trick: 
  // We'll use a regex to find all top-level objects and merge them manually.
  
  const root = {};
  // Regex to match top-level keys and their values (simple version for this file)
  // This file has a flat structure of many top-level objects.
  
  // Actually, let's use a simpler approach: 
  // We'll split the file by top-level keys.
  
  // 1. Identify all top-level keys
  const topLevelRegex = /^  "([^"]+)": (\{|"[^"]*"|true|false|null|[0-9.]+),?/gm;
  let match;
  const blocks = [];
  
  // This is still fragile.
  
  // Let's use the LINT errors to fix them manually. It's more certain.
}
