import express from "express";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import crypto from "crypto";

dotenv.config();

const app = express();

// Supabase Client Initialization
const supabaseUrl = process.env.SUPABASE_URL || "";
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Alibaba Cloud SMS 配置
const aliyunAccessKeyId = process.env.ALIBABA_CLOUD_ACCESS_KEY_ID || "";
const aliyunAccessKeySecret = process.env.ALIBABA_CLOUD_ACCESS_KEY_SECRET || "";
const aliyunSmsSignName = process.env.ALIBABA_CLOUD_SMS_SIGN_NAME || "";
const aliyunSmsTemplateCode = process.env.ALIBABA_CLOUD_SMS_TEMPLATE_CODE || "";

/**
 * 使用原生 HTTP + 签名方式调用阿里云 SMS API，完全不依赖 SDK
 */
async function sendAliyunSms(phone: string, code: string): Promise<void> {
  const params: Record<string, string> = {
    AccessKeyId: aliyunAccessKeyId,
    Action: "SendSms",
    Format: "JSON",
    PhoneNumbers: phone,
    RegionId: "cn-hangzhou",
    SignName: aliyunSmsSignName,
    SignatureMethod: "HMAC-SHA1",
    SignatureNonce: crypto.randomUUID(),
    SignatureVersion: "1.0",
    TemplateCode: aliyunSmsTemplateCode,
    TemplateParam: JSON.stringify({ code: code, min: "5" }),
    Timestamp: new Date().toISOString().replace(/\.\d{3}Z$/, 'Z'),
    Version: "2017-05-25",
  };

  // 按字母顺序排序并编码参数
  const sortedKeys = Object.keys(params).sort();
  const canonicalQuery = sortedKeys
    .map(k => `${encodeURIComponent(k)}=${encodeURIComponent(params[k])}`)
    .join("&");

  const stringToSign = `GET&${encodeURIComponent("/")}&${encodeURIComponent(canonicalQuery)}`;
  const signature = crypto
    .createHmac("sha1", aliyunAccessKeySecret + "&")
    .update(stringToSign)
    .digest("base64");

  const url = `https://dysmsapi.aliyuncs.com/?${canonicalQuery}&Signature=${encodeURIComponent(signature)}`;

  const response = await fetch(url);
  const result = await response.json();

  if (result.Code !== "OK") {
    throw new Error(result.Message || "SMS sending failed");
  }
}

app.use(express.json());

// API Routes
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "API is running on Vercel" });
});

/**
 * 发送短信验证码
 */
app.post("/api/auth/send-code", async (req, res) => {
  const { phone } = req.body;
  if (!phone) {
    return res.status(400).json({ error: "Phone number is required" });
  }

  const code = Math.floor(100000 + Math.random() * 900000).toString();
  console.log(`Verification code for ${phone}: ${code}`);

  try {
    if (aliyunAccessKeyId && aliyunAccessKeySecret && aliyunSmsSignName && aliyunSmsTemplateCode) {
      await sendAliyunSms(phone, code);
      res.json({ message: "Code sent successfully" });
    } else {
      res.json({ 
        message: "Alibaba Cloud SMS not configured. Code printed to server logs.",
        demoCode: process.env.NODE_ENV !== 'production' ? code : undefined 
      });
    }
  } catch (err) {
    const error = err as Error;
    console.error("SMS Error:", error);
    res.status(500).json({ error: "Failed to send SMS: " + error.message });
  }
});

app.get("/api/readings", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("readings")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (err) {
    const error = err as Error;
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/readings/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from("readings")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;
    res.json(data);
  } catch (err) {
    const error = err as Error;
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/readings", async (req, res) => {
  try {
    const { date, title, cards, interpretation, reflection } = req.body;
    const { data, error } = await supabase
      .from("readings")
      .insert([{ date, title, cards, interpretation, reflection }])
      .select();

    if (error) throw error;
    res.status(201).json(data[0]);
  } catch (err) {
    const error = err as Error;
    res.status(500).json({ error: error.message });
  }
});

app.patch("/api/readings/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { reflection } = req.body;
    const { data, error } = await supabase
      .from("readings")
      .update({ reflection })
      .eq("id", id)
      .select();

    if (error) throw error;
    res.json(data[0]);
  } catch (err) {
    const error = err as Error;
    res.status(500).json({ error: error.message });
  }
});

app.delete("/api/readings/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabase
      .from("readings")
      .delete()
      .eq("id", id);

    if (error) throw error;
    res.json({ message: "Successfully deleted" });
  } catch (err) {
    const error = err as Error;
    res.status(500).json({ error: error.message });
  }
});

// Export the app for Vercel
export default app;
