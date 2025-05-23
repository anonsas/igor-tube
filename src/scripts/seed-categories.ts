import { db } from "@/db/schema";
import { categories } from "@/db/schema/categories";

const categoryNames = [
  "Cars and vehicles",
  "Comedy",
  "Education",
  "Gaming",
  "Entertainment",
  "Film and animation",
  "How-to and style",
  "Music",
  "News and politics",
  "People and blogs",
  "Pets and animals",
  "Science and technology",
  "Sports",
  "Travel and events",
];

async function main() {
  try {
    console.log("Seeding categories...");
    const values = categoryNames.map((name) => ({
      name,
      description: `Videos related to ${name.toLowerCase()}`,
    }));

    await db.insert(categories).values(values);
    console.log("Seeding categories succesfully!");
  } catch (error) {
    console.log("Error seeding categories: ", error);
    process.exit(1);
  }
}

main();
