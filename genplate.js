import dotenv from "dotenv";
dotenv.config();
import * as fs from "fs";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.API_KEY);

function fileToGenerativePart(path, mimeType) {
  return {
    inlineData: {
      data: Buffer.from(fs.readFileSync(path)).toString("base64"),
      mimeType,
    },
  };
}

async function run() {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const prompt =
    "Extract the plate number from the image, and make it JSON for the information about the car. the car type, color, lisence plate";

  const imageParts = [
    fileToGenerativePart("car.jpg", "image/jpeg"),
    fileToGenerativePart("car2.jpg", "image/jpeg"),
  ];

  const result = await model.generateContent([prompt, ...imageParts]);
  const response = await result.response;
  const text = response.text();
  console.log(text);
}

run();
