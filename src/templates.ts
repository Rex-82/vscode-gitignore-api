import fs from "fs";
import path from "path";
const directoryPath = path.join(__dirname, "../templates");
import env from "./utils/env";

// TODO: Set source directory from environment variable and/or docker volume
// TODO: Consider downloading templates from github when starting the server (check if they exist first)

export default async function count() {
  console.log("Listing .gitignore files in folder");

  const files = await fs.promises.readdir(directoryPath, {
    recursive: true,
    withFileTypes: true,
  });

  const response: any[] = [];
  const count = files.length;
  var filesCount = 0,
    dirCount = 0,
    othersCount = 0;

  files.forEach(async (element) => {
    const fileExtension = path.extname(element.name);
    if (fileExtension == ".gitignore") {
      filesCount++;
      response.push({
        name: element.name,
        path: `${element.path}${env.PATH_TYPE}${element.name}`,
        type: "file",
        // sha: "",
        // size: "",
        download_url: `http://${env.HOSTNAME}:${env.PORT}${env.URL}/${element.name}`,
      });
    } if (element.isDirectory()) {
      dirCount++;
    } else {
      othersCount++;
    }
  });

  if (env.OUTPUT_TO_FILE == "true") {
    console.log("-----------------------------------");
    console.log("Output to file is enabled");
    console.log("Generating output file...");

    const output = JSON.stringify(response, null, 2);
    const outputExists = await fs.existsSync(
      `${env.OUTPUT_PATH}\\${env.OUTPUT_NAME}.json`
    );
    if (outputExists)
      await fs.promises.unlink(`${env.OUTPUT_PATH}${env.PATH_TYPE}${env.OUTPUT_NAME}.json`);
    await fs.promises.appendFile(
      `${env.OUTPUT_PATH}${env.PATH_TYPE}${env.OUTPUT_NAME}.json`,
      output
    );
    console.log(
      `Output appended to file ${directoryPath}${env.PATH_TYPE}${env.OUTPUT_PATH}${env.PATH_TYPE}${env.OUTPUT_NAME}.json`
    );
  }

  console.log("-----------------------------------");
  console.log(count, " files found");
  console.log(filesCount, " .gitignore files found");
  console.log(dirCount, " directories found");
  console.log(othersCount, " others found");
  console.log("-----------------------------------");
  return response;
}
