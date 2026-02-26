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
 * 使用原生 HTTP + 签名方式调用阿里云 SMS API，支持通信号码认证服务
 */
async function sendAliyunSms(phone: string, code: string): Promise<void> {
  // 检查是否是通信号码认证服务
  // 根据您提供的SDK示例，模板代码100001是通信号码认证服务
  const isPhoneNumberVerification = aliyunSmsTemplateCode === "100001" || 
                                   (aliyunSmsTemplateCode.startsWith("SMS_1") && 
                                   !aliyunSmsTemplateCode.startsWith("SMS_15"));
  
  // 根据服务类型选择不同的API端点
  const endpoint = isPhoneNumberVerification 
    ? "dypnsapi.aliyuncs.com"  // 通信号码认证服务
    : "dysmsapi.aliyuncs.com"; // 通用短信服务
    
  const action = isPhoneNumberVerification 
    ? "SendSmsVerifyCode"      // 通信号码认证服务API
    : "SendSms";               // 通用短信服务API

  const params: Record<string, string> = {
    AccessKeyId: aliyunAccessKeyId,
    Action: action,
    Format: "JSON",
    PhoneNumber: phone,
    RegionId: "cn-hangzhou",
    SignName: aliyunSmsSignName,
    SignatureMethod: "HMAC-SHA1",
    SignatureNonce: crypto.randomUUID(),
    SignatureVersion: "1.0",
    TemplateCode: aliyunSmsTemplateCode,
    Timestamp: new Date().toISOString().replace(/\.\d{3}Z$/, 'Z'),
    Version: "2017-05-25",
  };

  // 根据服务类型添加不同的参数
  if (isPhoneNumberVerification) {
    // 通信号码认证服务参数
    params.PhoneNumber = phone;
    params.TemplateParam = `{"code":"${code}","min":"5"}`;
    params.OutId = "lenormand_oracle";
  } else {
    // 通用短信服务参数
    params.PhoneNumbers = phone;
    params.TemplateParam = JSON.stringify({ code: code, min: "5" });
  }

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

  const url = `https://${endpoint}/?${canonicalQuery}&Signature=${encodeURIComponent(signature)}`;

  console.log(`SMS Service Type: ${isPhoneNumberVerification ? 'Phone Number Verification' : 'General SMS'}`);
  console.log(`Endpoint: ${endpoint}, Action: ${action}`);
  console.log(`Template Code: ${aliyunSmsTemplateCode}`);
  console.log(`Sign Name: ${aliyunSmsSignName}`);
  console.log(`Phone: ${phone}`);
  console.log(`Code: ${code}`);
  console.log(`AccessKeyId: ${aliyunAccessKeyId.substring(0, 8)}...`); // 只显示前8位
  console.log(`Full URL (without signature): https://${endpoint}/?${canonicalQuery}`);
  console.log(`All Parameters:`, params);

  const response = await fetch(url);
  const result = await response.json();

  console.log(`SMS API Response:`, result);
  console.log(`Full Request URL: ${url}`);

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
      
      // 存储验证码（5分钟有效期）
      verificationCodes.set(phone, {
        code,
        expiresAt: Date.now() + 5 * 60 * 1000 // 5分钟
      });
      
      res.json({ message: "Code sent successfully" });
    } else {
      // 开发环境：直接存储验证码
      verificationCodes.set(phone, {
        code,
        expiresAt: Date.now() + 5 * 60 * 1000
      });
      
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

// 验证码存储（生产环境应使用Redis等）
const verificationCodes = new Map();

// 会话管理（生产环境应使用JWT等）
const sessions = new Map();

// 中间件：验证用户会话
const authenticateUser = (req: any, res: any, next: any) => {
  const sessionId = req.headers.authorization?.replace('Bearer ', '');
  
  if (!sessionId || !sessions.has(sessionId)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  req.user = sessions.get(sessionId);
  next();
};

/**
 * 用户登录/注册
 */
app.post("/api/auth/login", async (req, res) => {
  const { phone, code } = req.body;
  
  if (!phone || !code) {
    return res.status(400).json({ error: "Phone and code are required" });
  }
  
  // 验证验证码
  const storedCode = verificationCodes.get(phone);
  if (!storedCode || storedCode.code !== code || Date.now() > storedCode.expiresAt) {
    return res.status(400).json({ error: "Invalid or expired verification code" });
  }
  
  try {
    // 查找或创建用户
    let { data: user } = await supabase
      .from("users")
      .select("*")
      .eq("phone", phone)
      .single();
    
    if (!user) {
      // 创建新用户
      const { data: newUser, error } = await supabase
        .from("users")
        .insert([{
          phone,
          username: `User_${phone.slice(-4)}`,
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${phone}`
        }])
        .select()
        .single();
      
      if (error) throw error;
      user = newUser;
    }
    
    // 创建会话
    const sessionId = crypto.randomUUID();
    sessions.set(sessionId, user);
    
    // 清理验证码
    verificationCodes.delete(phone);
    
    res.json({
      user,
      token: sessionId,
      message: "Login successful"
    });
    
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Login failed" });
  }
});

/**
 * 获取当前用户信息
 */
app.get("/api/auth/me", authenticateUser, async (req: any, res) => {
  res.json({ user: req.user });
});

/**
 * 用户登出
 */
app.post("/api/auth/logout", authenticateUser, async (req: any, res) => {
  const sessionId = req.headers.authorization?.replace('Bearer ', '');
  if (sessionId) {
    sessions.delete(sessionId);
  }
  res.json({ message: "Logout successful" });
});

/**
 * 更新用户资料
 */
app.put("/api/auth/profile", authenticateUser, async (req: any, res) => {
  const { username, avatar } = req.body;
  
  try {
    const { data, error } = await supabase
      .from("users")
      .update({ username, avatar })
      .eq("id", req.user.id)
      .select()
      .single();
    
    if (error) throw error;
    
    // 更新会话中的用户信息
    const sessionId = req.headers.authorization?.replace('Bearer ', '');
    if (sessionId) {
      sessions.set(sessionId, data);
    }
    
    res.json({ user: data, message: "Profile updated successfully" });
  } catch (error) {
    console.error("Profile update error:", error);
    res.status(500).json({ error: "Profile update failed" });
  }
});

// 占卜记录相关API

/**
 * 获取用户的所有占卜记录
 */
app.get("/api/readings", authenticateUser, async (req: any, res) => {
  try {
    const { data, error } = await supabase
      .from("readings")
      .select("*"))
      .order("created_at", { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (err) {
    const error = err as Error;
    res.status(500).json({ error: error.message });
  }
});

/**
 * 获取单个占卜记录详情
 */
app.get("/api/readings/:id", authenticateUser, async (req: any, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from("readings")
      .select("*")
      .eq("id", id)
      .eq("user_id", req.user.id)
      .single();

    if (error) throw error;
    if (!data) {
      return res.status(404).json({ error: "Reading not found" });
    }
    res.json(data);
  } catch (err) {
    const error = err as Error;
    res.status(500).json({ error: error.message });
  }
});

/**
 * 创建新的占卜记录
 */
app.post("/api/readings", authenticateUser, async (req: any, res) => {
  try {
    const { date, title, cards, interpretation, spreadType } = req.body;
    
    if (!date || !title || !cards || !interpretation || !spreadType) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    
    const { data, error } = await supabase
      .from("readings")
      .insert([{
        user_id: req.user.id,
        date,
        title,
        cards,
        interpretation,
        spread_type: spreadType,
        created_at: new Date().toISOString()
      }])
      .select();

    if (error) throw error;
    res.status(201).json(data[0]);
  } catch (err) {
    const error = err as Error;
    res.status(500).json({ error: error.message });
  }
});

/**
 * 更新占卜记录的个人感悟
 */
app.patch("/api/readings/:id", authenticateUser, async (req: any, res) => {
  try {
    const { id } = req.params;
    const { reflection } = req.body;
    
    // 验证记录属于当前用户
    const { data: existingReading } = await supabase
      .from("readings")
      .select("id")
      .eq("id", id)
      .eq("user_id", req.user.id)
      .single();
    
    if (!existingReading) {
      return res.status(404).json({ error: "Reading not found" });
    }
    
    const { data, error } = await supabase
      .from("readings")
      .update({ 
        reflection,
        updated_at: new Date().toISOString()
      })
      .eq("id", id)
      .select();

    if (error) throw error;
    res.json(data[0]);
  } catch (err) {
    const error = err as Error;
    res.status(500).json({ error: error.message });
  }
});

/**
 * 删除占卜记录
 */
app.delete("/api/readings/:id", authenticateUser, async (req: any, res) => {
  try {
    const { id } = req.params;
    
    // 验证记录属于当前用户
    const { data: existingReading } = await supabase
      .from("readings")
      .select("id")
      .eq("id", id)
      .eq("user_id", req.user.id)
      .single();
    
    if (!existingReading) {
      return res.status(404).json({ error: "Reading not found" });
    }
    
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
