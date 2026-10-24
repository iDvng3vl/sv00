
import fs from "node:fs/promises";
import path from "node:path";

const files = ["src/App.jsx", "src/App.css"];
const outputDir = "public/images";

await fs.mkdir(outputDir, { recursive: true });

const sources = [];

for (const file of files) {
  try {
    const content = await fs.readFile(file, "utf8");
    const urls =
      content.match(/https:\/\/images\.unsplash\.com\/[^"'`\s)]+/g) || [];

    for (const url of urls) {
      if (!sources.some((item) => item.url === url)) {
        sources.push({ url, files: [file] });
      } else {
        const item = sources.find((entry) => entry.url === url);
        if (!item.files.includes(file)) item.files.push(file);
      }
    }
  } catch {
    console.log(`Skipping ${file} — file not found.`);
  }
}

if (!sources.length) {
  console.log(
    "No Unsplash image URLs found in src/App.jsx or src/App.css."
  );
  process.exit(0);
}

const replacements = new Map();

for (let i = 0; i < sources.length; i++) {
  const { url } = sources[i];
  const number = String(i + 1).padStart(2, "0");

  try {
    console.log(`Downloading image ${i + 1}/${sources.length}...`);

    const response = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0" },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const contentType = (
      response.headers.get("content-type") || ""
    )
      .split(";")[0]
      .trim()
      .toLowerCase();

    const extensions = {
      "image/jpeg": "jpg",
      "image/png": "png",
      "image/webp": "webp",
      "image/avif": "avif",
      "image/gif": "gif",
    };

    const extension = extensions[contentType];

    if (!extension) {
      throw new Error(`Unexpected image type: ${contentType || "unknown"}`);
    }

    const filename = `shangrila-${number}.${extension}`;
    const destination = path.join(outputDir, filename);

    await fs.writeFile(destination, Buffer.from(await response.arrayBuffer()));

    replacements.set(url, `/images/${filename}`);

    console.log(`Saved ${destination}`);
  } catch (error) {
    console.error(`Could not download image ${i + 1}: ${error.message}`);
  }
}

// Replace downloaded URLs with local public-folder paths.
for (const file of files) {
  try {
    let content = await fs.readFile(file, "utf8");
    let changed = false;

    for (const [url, localPath] of replacements) {
      if (content.includes(url)) {
        content = content.replaceAll(url, localPath);
        changed = true;
      }
    }

    if (changed) {
      await fs.writeFile(file, content, "utf8");
      console.log(`Updated local image paths in ${file}`);
    }
  } catch {
    // File may not exist; already reported above.
  }
}

console.log("\nFinished.");
console.log(`Downloaded ${replacements.size} unique image(s).`);
console.log(`Assets folder: ${outputDir}`);

if (replacements.size < sources.length) {
  console.log(
    "Some downloads failed. Check the messages above; failed URLs remain unchanged."
  );
}
