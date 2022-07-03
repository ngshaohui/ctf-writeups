import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { remark } from "remark";
import html from "remark-html";
import { BlogPost } from "./customTypes";

const postsDirectory = path.join(process.cwd(), "posts");

export function getSortedPostsData() {
  // Get file names under /posts
  const directories = fs.readdirSync(postsDirectory);

  const allPostsData = directories.flatMap((dir) => {
    const dirPath = path.join(postsDirectory, dir);
    const fileNames = fs.readdirSync(dirPath);
    return fileNames.map((fileName) => {
      // Remove ".md" from file name to get id
      const id = fileName.replace(/\.md$/, "");

      // Read markdown file as string
      const fullPath = path.join(dirPath, fileName);
      const fileContents = fs.readFileSync(fullPath, "utf8");

      // Use gray-matter to parse the post metadata section
      const matterResult = matter(fileContents);

      // Combine the data with the id
      return {
        id: path.join(dir, id),
        ...(matterResult.data as BlogPost),
      };
    });
  });
  // Sort posts by date
  return allPostsData.sort((a, b) => {
    if (a.date < b.date) {
      return 1;
    } else {
      return -1;
    }
  });
}

export function getAllPostIds() {
  const dirNames = fs.readdirSync(postsDirectory);
  return dirNames.flatMap((dir) => {
    const dirPath = path.join(postsDirectory, dir);
    const fileNames = fs.readdirSync(dirPath);
    return fileNames.map((fileName) => {
      return {
        params: {
          id: [dir, fileName.replace(/\.md$/, "")],
        },
      };
    })
  });
}

export async function getPostData(id: string) {
  const fullPath = path.join(postsDirectory, `${id}.md`);
  const fileContents = fs.readFileSync(fullPath, "utf8");

  // Use gray-matter to parse the post metadata section
  const matterResult = matter(fileContents);

  // Use remark to convert markdown into HTML string
  const processedContent = await remark()
    .use(html)
    .process(matterResult.content);
  const contentHtml = processedContent.toString();
  console.log(matterResult.data)

  // Combine the data with the id and contentHtml
  return {
    id,
    contentHtml,
    ...(matterResult.data as BlogPost),
  };
}
