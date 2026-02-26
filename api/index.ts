import express from "express";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import { createRequire } from "module";

dotenv.config();

const require = createRequire(import.meta.url);

// 使用 require 方式导入阿里云 SDK（解决 ESM 兼容问题）
const Dysmsapi20170525 = require('@alicloud/dysmsapi20170525');
const OpenApi = require('@alicloud/openapi-client');
const $Util = require('@alicloud/tea-util');

const app = express();

// Supabase Client Initialization
const supabaseUrl = process.env.SUPABASE_URL || "";
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Alibaba Cloud SMS Initialization
const aliyunAccessKeyId = process.env.ALIBABA_CLOUD_ACCESS_KEY_ID;
const aliyunAccessKeySecret = process.env.ALIBABA_CLOUD_ACCESS_KEY_SECRET;
const aliyunSmsSignName = process.env.ALIBABA_CLOUD_SMS_SIGN_NAME;
const aliyunSmsTemplateCode = process.env.ALIBABA_CLOUD_SMS_TEMPLATE_CODE;
const aliyunEndpoint = process.env.ALIBABA_CLOUD_SMS_ENDPOINT || "dysmsapi.aliyuncs.com";

const createAliyunClient = () => {
  if (!aliyunAccessKeyId || !aliyunAccessKeySecret) return null;
  const config = new OpenApi.Config({
    accessKeyId: aliyunAccessKeyId,
    accessKeySecret: aliyunAccessKeySecret,
  });
  config.endpoint = aliyunEndpoint;
  return new Dysmsapi20170525.default(config);
};

const aliyunSmsClient = createAliyunClient();

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

  // 生成 6 位随机验证码
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  console.log(`Verification code for ${phone}: ${code}`);

  try {
    if (aliyunSmsClient && aliyunSmsSignName && aliyunSmsTemplateCode) {
      const sendSmsRequest = new Dysmsapi20170525.SendSmsRequest({
        phoneNumbers: phone,
        signName: aliyunSmsSignName,
        templateCode: aliyunSmsTemplateCode,
        templateParam: JSON.stringify({ code }),
      });
      
      const runtime = new $Util.RuntimeOptions({});
      await aliyunSmsClient.sendSmsWithOptions(sendSmsRequest, runtime);
      res.json({ message: "Code sent successfully" });
    } else {
      res.json({ 
        message: "Alibaba Cloud SMS not configured. Code printed to server logs.",
        demoCode: process.env.NODE_ENV !== 'production' ? code : undefined 
      });
    }
  } catch (error: any) {
    console.error("SMS Error:", error);
    res.status(500).json({ error: "Failed to send SMS" });
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
  } catch (error: any) {
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
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/readings", async (req, res) => {
  try {
    const { date, title, cards, interpretation, reflection } = req.body;
    const { data, error } = await supabase
      .from("readings")
      .insert([
        { date, title, cards, interpretation, reflection }
      ])
      .select();

    if (error) throw error;
    res.status(201).json(data[0]);
  } catch (error: any) {
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
  } catch (error: any) {
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
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Export the app for Vercel
export default app;
