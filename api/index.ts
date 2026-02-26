import express from "express";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
<<<<<<< HEAD
=======
import Dysmsapi20170525, * as $Dysmsapi20170525 from '@alicloud/dysmsapi20170525';
import OpenApi, * as $OpenApi from '@alicloud/openapi-client';
import * as $Util from '@alicloud/tea-util';
>>>>>>> 34c53ed (Initial commit: 增加雷诺曼占卜应用及用户系统)

dotenv.config();

const app = express();

// Supabase Client Initialization
const supabaseUrl = process.env.SUPABASE_URL || "";
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

<<<<<<< HEAD
=======
// Alibaba Cloud SMS Initialization
const aliyunAccessKeyId = process.env.ALIBABA_CLOUD_ACCESS_KEY_ID;
const aliyunAccessKeySecret = process.env.ALIBABA_CLOUD_ACCESS_KEY_SECRET;
const aliyunSmsSignName = process.env.ALIBABA_CLOUD_SMS_SIGN_NAME;
const aliyunSmsTemplateCode = process.env.ALIBABA_CLOUD_SMS_TEMPLATE_CODE;
const aliyunEndpoint = process.env.ALIBABA_CLOUD_SMS_ENDPOINT || "dysmsapi.aliyuncs.com";

const createAliyunClient = () => {
  if (!aliyunAccessKeyId || !aliyunAccessKeySecret) return null;
  const config = new $OpenApi.Config({
    accessKeyId: aliyunAccessKeyId,
    accessKeySecret: aliyunAccessKeySecret,
  });
  config.endpoint = aliyunEndpoint;
  return new Dysmsapi20170525(config);
};

const aliyunSmsClient = createAliyunClient();

>>>>>>> 34c53ed (Initial commit: 增加雷诺曼占卜应用及用户系统)
app.use(express.json());

// API Routes
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "API is running on Vercel" });
});

<<<<<<< HEAD
=======
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
  
  // 在实际生产中，你应该将这个验证码存储在 Redis 或数据库中，并设置过期时间
  // 这里我们仅模拟发送逻辑，或者如果配置了 Twilio 则真实发送
  console.log(`Verification code for ${phone}: ${code}`);

  try {
    if (aliyunSmsClient && aliyunSmsSignName && aliyunSmsTemplateCode) {
      const sendSmsRequest = new $Dysmsapi20170525.SendSmsRequest({
        phoneNumbers: phone,
        signName: aliyunSmsSignName,
        templateCode: aliyunSmsTemplateCode,
        templateParam: JSON.stringify({ code }),
      });
      
      const runtime = new $Util.RuntimeOptions({});
      await aliyunSmsClient.sendSmsWithOptions(sendSmsRequest, runtime);
      res.json({ message: "Code sent successfully" });
    } else {
      // 如果没有配置阿里云，返回成功但仅在控制台打印（用于演示）
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

>>>>>>> 34c53ed (Initial commit: 增加雷诺曼占卜应用及用户系统)
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
