/**
 * Test Rubai fallback data to see what's being shown on the page
 */

// We need to simulate the getBuildSafeFallback function
// Let's check if there are any static fallback files

const fs = require("fs");
const path = require("path");

function findFallbackFiles() {
  console.log("🔍 SEARCHING FOR RUBAI FALLBACK DATA");
  console.log("====================================");

  const possiblePaths = [
    "lib/build-safe-fallbacks",
    "data/fallbacks",
    "public/data",
    "fallbacks",
    ".next/static/data",
  ];

  for (const dir of possiblePaths) {
    try {
      if (fs.existsSync(dir)) {
        console.log(`📁 Found directory: ${dir}`);
        const files = fs.readdirSync(dir, { recursive: true });
        const rubaiFiles = files.filter((file) =>
          file.toString().toLowerCase().includes("rubai")
        );

        if (rubaiFiles.length > 0) {
          console.log(`📋 Rubai-related files in ${dir}:`);
          rubaiFiles.forEach((file) => {
            console.log(`   - ${file}`);
            try {
              const fullPath = path.join(dir, file.toString());
              const content = fs.readFileSync(fullPath, "utf8");
              console.log(
                `   Content preview: ${content.substring(0, 200)}...`
              );
            } catch (e) {
              console.log(`   (Could not read file: ${e.message})`);
            }
          });
        }
      }
    } catch (error) {
      // Directory doesn't exist or can't be read
    }
  }

  // Also check for any JSON files that might contain rubai data
  console.log("\n🔍 Searching for JSON files with rubai data...");

  function searchInDirectory(dir, depth = 0) {
    if (depth > 2) return; // Limit search depth

    try {
      const items = fs.readdirSync(dir);

      for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);

        if (
          stat.isDirectory() &&
          !item.startsWith(".") &&
          !item.includes("node_modules")
        ) {
          searchInDirectory(fullPath, depth + 1);
        } else if (item.endsWith(".json")) {
          try {
            const content = fs.readFileSync(fullPath, "utf8");
            if (content.toLowerCase().includes("rubai")) {
              console.log(`📄 Found rubai reference in: ${fullPath}`);
              console.log(`   Preview: ${content.substring(0, 300)}...`);
            }
          } catch (e) {
            // Can't read file
          }
        }
      }
    } catch (error) {
      // Can't read directory
    }
  }

  searchInDirectory(".");
}

findFallbackFiles();
