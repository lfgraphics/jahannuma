/**
 * Script to fix getBaseIdForTable imports in all page files
 */

const fs = require("fs");
const path = require("path");

const filesToFix = [
  "app/Rubai/page.tsx",
  "app/HI/Nazmen/page.tsx",
  "app/Ghazlen/page.tsx",
  "app/Ashaar/page.tsx",
  "app/E-Books/page.tsx",
  "app/EN/E-Books/page.tsx",
  "app/EN/Rubai/page.tsx",
  "app/EN/Nazmen/page.tsx",
];

filesToFix.forEach((filePath) => {
  try {
    let content = fs.readFileSync(filePath, "utf8");

    // Add the import if it doesn't exist
    if (!content.includes("import { getBaseIdForTable }")) {
      content = content.replace(
        'import { fetchList } from "@/lib/universal-data-fetcher";',
        'import { fetchList } from "@/lib/universal-data-fetcher";\nimport { getBaseIdForTable } from "@/src/lib/airtable";'
      );
    }

    // Remove the dynamic import
    content = content.replace(
      /\s*const { getBaseIdForTable } = await import\("@\/src\/lib\/airtable"\);\s*/g,
      ""
    );

    // Clean up any extra whitespace
    content = content.replace(/\n\n\n+/g, "\n\n");

    fs.writeFileSync(filePath, content, "utf8");
    console.log(`✅ Fixed ${filePath}`);
  } catch (error) {
    console.error(`❌ Error fixing ${filePath}:`, error.message);
  }
});

console.log("🎉 Import fixes completed!");
