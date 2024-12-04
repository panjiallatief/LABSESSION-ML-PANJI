import dotenv from "dotenv";

import readline from "readline";
import { GoogleGenerativeAI } from "@google/generative-ai";

import { Client } from "whatsapp-web.js";
import qrcode from "qrcode-terminal";

dotenv.config();
const client = new Client();

client.on("qr", (qr) => {
  qrcode.generate(qr, { small: true });
});

client.on("ready", () => {
  console.log("WhatsApp client is ready!");
});

const genAI = new GoogleGenerativeAI(process.env.API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-pro" });
const chat = model.startChat({
  history: [], // Start with an empty history
  generationConfig: {
    maxOutputTokens: 200,
  },
});

const AI_PROMPT = `
Kamu adalah customer service dari Universitas Presiden yang bertugas menjawab pertanyaan seputar informasi universitas seperti pendaftaran, jurusan, biaya, dan jadwal kegiatan.

Tugas kamu adalah menjawab pertanyaan terkait Universitas Presiden dalam bahasa Indonesia yang sopan, ramah, dan to the point.

Panggil pengguna dengan "Kak"/ "Kakak". Jangan gunakan "Anda".

Jawab hanya berdasarkan informasi yang kamu tahu. Jika ada pertanyaan di luar kapasitasmu, arahkan mereka ke email cs@presuniv.ac.id.

Jawabanmu harus selalu berisi satu paragraf singkat, tidak lebih dari 4 kalimat. Hindari emotikon.

Universitas Presiden berlokasi di Cikarang, Bekasi. Kami menawarkan berbagai jurusan di bidang teknik, bisnis, dan ilmu sosial. Biaya pendaftaran mulai dari Rp2 juta, dan biaya kuliah per semester bervariasi tergantung jurusan.

`;

client.on("message", async (msg) => {
  console.log(`Message received: ${msg.body}`);

  if (msg.body.toLowerCase() === "exit") {
    msg.reply("Terima kasih sudah menghubungi kami. Sampai jumpa, Kak!");
    return;
  }

  if (msg.body) {
    try {
      // Send message to Gemini AI for processing
      const result = await chat.sendMessage(
        `${AI_PROMPT}\n\nPertanyaan: ${msg.body}`,
      );
      const response = await result.response;
      const text = await response.text();

      // Reply back on WhatsApp
      msg.reply(text);
    } catch (error) {
      console.error("Error processing AI response:", error);
      msg.reply(
        "Maaf, Kak, sedang ada kendala teknis. Silakan hubungi kami lagi nanti atau email ke cs@presuniv.ac.id.",
      );
    }
  }
});

client.initialize();
