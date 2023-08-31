import { readFileSync, writeFile } from "fs";
import { ShimProps } from "./types";
import path from "path";

export function getSwaggerConfig() {
  try {
    const configPath = path.join(process.cwd(), "shim-swagger.config.json");

    const config = JSON.parse(readFileSync(configPath).toString());
    if (!config) {
      throw "";
    }
    const { url, excludesEndsPoints, includeEndPoints, fileName } = config;
    shim({ url, excludesEndsPoints, includeEndPoints, fileName });
  } catch (error) {
    console.error("\x1b[31m", "Error: Please define shim-swagger.config.json");
    // throw new Error("Please define swagger.config.json");
  }
}

export function shim({
  fileName,
  url,
  excludesEndsPoints,
  includeEndPoints,
}: ShimProps) {
  if (!fileName || !url) {
    console.error("\x1b[31m", "config file error!");
    return;
  }
  fetch(url)
    .then((res) => {
      return res.json();
    })
    .then((data) => {
      const filteredEndPoints = Object.fromEntries(
        Object.entries(data.paths)
          .filter(([key]) => {
            return !excludesEndsPoints.find((word) => {
              const reg = new RegExp(word);
              return reg.test(key);
            });
          })
          .filter(([key]) => {
            return includeEndPoints.find((word) => {
              const reg = new RegExp(word);
              return reg.test(key);
            });
          })
      );

      const newSwagger = {
        ...data,
        paths: filteredEndPoints,
      };

      const objectString = JSON.stringify(newSwagger);
      writeFile(fileName, objectString, (err) => {
        if (err) {
          console.error("\x1b[31m", "Error writing to file:", err);
          return;
        }
        console.log(
          "\x1b[32m",
          "swagger has been written to the file successfully!"
        );
      });
    })
    .catch(() => {});
}