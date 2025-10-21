/**
 * Script to fix syntax errors caused by the import fix
 */

const fs = require("fs");

const filesToFix = [
  "app/Rubai/page.tsx",
  "app/HI/Nazmen/page.tsx",
  "app/Ghazlen/page.tsx",
  "app/E-Books/page.tsx",
  "app/EN/E-Books/page.tsx",
  "app/EN/Rubai/page.tsx",
  "app/EN/Nazmen/page.tsx",
];

filesToFix.forEach((filePath) => {
  try {
    let content = fs.readFileSync(filePath, "utf8");

    // Fix the merged comment and const declaration
    content = content.replace(
      /\/\/ Fetch some sample data for dynamic metadataconst/g,
      "// Fetch some sample data for dynamic metadata\n    const"
    );

    content = content.replace(
      /\/\/ Fetch sample data for metadata generationconst/g,
      "// Fetch sample data for metadata generation\n    const"
    );

    fs.writeFileSync(filePath, content, "utf8");
    console.log(`✅ Fixed syntax in ${filePath}`);
  } catch (error) {
    console.error(`❌ Error fixing ${filePath}:`, error.message);
  }
});

console.log("🎉 Syntax fixes completed!");
