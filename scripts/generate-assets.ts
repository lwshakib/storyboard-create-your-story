import fs from "fs";
import path from "path";
import https from "https";

const INSPIRATIONS_DIR = path.join(process.cwd(), "inspirations");
const PUBLIC_DIR = path.join(process.cwd(), "public", "generated");

if (!fs.existsSync(PUBLIC_DIR)) {
  fs.mkdirSync(PUBLIC_DIR, { recursive: true });
}

async function downloadImage(url: string, dest: string): Promise<void> {
  return new Promise((resolve, reject) => {
    https
      .get(url, (response) => {
        if (response.statusCode === 200) {
          const file = fs.createWriteStream(dest);
          response.pipe(file);
          file.on("finish", () => {
            file.close();
            resolve();
          });
        } else if (response.statusCode === 302 || response.statusCode === 301) {
          // Handle redirects for LoremFlickr
          let redirectUrl = response.headers.location!;
          if (redirectUrl.startsWith("/")) {
            const originalUrl = new URL(url);
            redirectUrl = `${originalUrl.protocol}//${originalUrl.host}${redirectUrl}`;
          }
          downloadImage(redirectUrl, dest).then(resolve).catch(reject);
        } else {
          reject(new Error(`Failed to download image: ${response.statusCode}`));
        }
      })
      .on("error", (err) => {
        reject(err);
      });
  });
}

async function generateAssets() {
  const folders = fs
    .readdirSync(INSPIRATIONS_DIR)
    .filter((f) => fs.statSync(path.join(INSPIRATIONS_DIR, f)).isDirectory());

  let avatarCount = 0;

  for (const folder of folders) {
    const folderPath = path.join(INSPIRATIONS_DIR, folder);
    const files = fs.readdirSync(folderPath).filter((f) => f.endsWith(".html"));

    console.log(`Processing template: ${folder}`);

    for (const [index, file] of files.entries()) {
      const filePath = path.join(folderPath, file);
      let content = fs.readFileSync(filePath, "utf8");
      let modified = false;

      // Regex to find <img> tags
      const imgRegex = /<img([^>]+)src="([^">]+)"([^>]*)>/g;
      let match;
      const replacements: { original: string; newSrc: string }[] = [];

      let imgIndex = 0;
      while ((match = imgRegex.exec(content)) !== null) {
        const fullTag = match[0];
        const attributesBefore = match[1];
        const originalSrc = match[2];
        const attributesAfter = match[3];

        // Combine attributes to search for alt or classes
        const allAttributes = attributesBefore + attributesAfter;

        // Extract alt text
        const altMatch = allAttributes.match(/alt="([^"]*)"/i);
        const altText = altMatch ? altMatch[1] : "";

        // Determine if it's an avatar
        const portraitKeywords = [
          "avatar",
          "rounded-full",
          "person",
          "smiling",
          "man",
          "woman",
          "face",
          "ceo",
          "cto",
          "coo",
          "cmo",
          "jenkins",
          "chen",
          "rodriguez",
          "lee",
          "clip-hex",
        ];
        const isAvatar = portraitKeywords.some(
          (kw) =>
            allAttributes.toLowerCase().includes(kw) ||
            originalSrc.toLowerCase().includes(kw) ||
            altText.toLowerCase().includes(kw),
        );

        let imageUrl = "";
        let imageName = "";

        if (isAvatar) {
          avatarCount++;
          imageUrl = `https://i.pravatar.cc/150?u=${folder}-${index}-${imgIndex}-${avatarCount}`;
          imageName = `avatar-${avatarCount}.jpg`;
        } else {
          imgIndex++;
          // Use alt text if available, otherwise use folder name
          const boringWords = [
            "high",
            "large",
            "modern",
            "professional",
            "executive",
            "simple",
            "clean",
            "best",
            "great",
            "this",
            "that",
            "with",
            "from",
            "small",
            "using",
            "working",
            "some",
            "many",
          ];
          const keyword = altText
            ? altText
                .toLowerCase()
                .replace(/[^a-z0-9\s,]/g, "")
                .split(/[\s,]+/)
                .filter((w) => w.length > 2 && !boringWords.includes(w))
                .sort((a, b) => b.length - a.length)[0] || "business"
            : folder.split("-").find((w) => !boringWords.includes(w)) ||
              folder.split("-")[0];
          // Add a random seed to ensure unique images from LoremFlickr
          imageUrl = `https://loremflickr.com/1024/576/${keyword}?random=${index}-${imgIndex}`;
          imageName = `${folder}-slide-${index + 1}-img-${imgIndex}.jpg`;
        }

        const imagePath = path.join(PUBLIC_DIR, imageName);

        console.log(`  Downloading image: ${imageUrl}`);
        try {
          await downloadImage(imageUrl, imagePath);
          console.log(`  Saved to ${imagePath}`);

          // Prepare replacement for this specific tag
          const newSrc = `/generated/${imageName}`;
          replacements.push({ original: fullTag, newSrc: newSrc });
          modified = true;
        } catch (error) {
          console.error(`  Failed to download ${imageUrl}:`, error);
        }
      }

      // Apply replacements one by one to the HTML content
      // We do this carefully to only replace the src of the specific tags found
      if (modified) {
        for (const replacement of replacements) {
          // We need to replace the src inside the specific original tag
          const newTag = replacement.original.replace(
            /src="([^">]+)"/,
            `src="${replacement.newSrc}"`,
          );
          content = content.replace(replacement.original, newTag);
        }
        fs.writeFileSync(filePath, content);
      }
    }
  }

  console.log("Asset generation complete.");
}

generateAssets();
