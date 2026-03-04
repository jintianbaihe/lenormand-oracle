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
 * 发送短信验证码，并持久化到 Supabase
 */
app.post("/api/auth/send-code", async (req, res) => {
  const { phone } = req.body;
  if (!phone) {
    return res.status(400).json({ error: "Phone number is required" });
  }

  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10分钟有效期

  try {
    // 持久化到 Supabase，同一手机号覆盖旧验证码
    const { error: upsertError } = await supabase
      .from("verification_codes")
      .upsert({ phone, code, expires_at: expiresAt }, { onConflict: "phone" });

    if (upsertError) {
      console.error("Supabase upsert error:", upsertError);
      return res.status(500).json({ error: "Failed to store verification code: " + upsertError.message });
    }

    if (aliyunAccessKeyId && aliyunAccessKeySecret && aliyunSmsSignName && aliyunSmsTemplateCode) {
      await sendAliyunSms(phone, code);
      res.json({ message: "Code sent successfully" });
    } else {
      res.json({
        message: "Alibaba Cloud SMS not configured.",
        demoCode: code
      });
    }
  } catch (err) {
    const error = err as Error;
    console.error("SMS Error:", error);
    res.status(500).json({ error: "Failed to send SMS: " + error.message });
  }
});

/**
 * 验证验证码并登录/注册
 */
app.post("/api/auth/login", async (req, res) => {
  const { phone, code } = req.body;
  if (!phone || !code) {
    return res.status(400).json({ error: "Phone and code are required" });
  }

  try {
    // 从 Supabase 查询验证码记录
    const { data: record, error: fetchError } = await supabase
      .from("verification_codes")
      .select("code, expires_at")
      .eq("phone", phone)
      .single();

    if (fetchError || !record) {
      return res.status(401).json({ error: "Verification code is incorrect. Please try again." });
    }

    // 检查是否过期
    if (new Date() > new Date(record.expires_at)) {
      await supabase.from("verification_codes").delete().eq("phone", phone);
      return res.status(401).json({ error: "Verification code has expired. Please request a new one." });
    }

    // 校验验证码是否匹配
    if (record.code !== code) {
      return res.status(401).json({ error: "Verification code is incorrect. Please try again." });
    }

    // 验证通过，删除已使用的验证码（一次性）
    await supabase.from("verification_codes").delete().eq("phone", phone);

    // 查找或创建用户
    let { data: profile, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("phone", phone)
      .single();

    if (error && error.code === "PGRST116") {
      // 用户不存在，创建新用户
      const { data: newProfile, error: createError } = await supabase
        .from("profiles")
        .insert([{
          phone,
          username: `User_${phone.slice(-4)}`,
          avatar: `https://api.dicebear.com/7.x/shapes/svg?seed=${phone}&backgroundColor=0a0a1a`
        }])
        .select()
        .single();

      if (createError) {
        console.error("Create Profile Error:", createError);
        return res.status(500).json({ error: `Failed to create profile: ${createError.message}` });
      }
      profile = newProfile;
    } else if (error) {
      console.error("Supabase Profile Query Error:", error);
      return res.status(500).json({ error: `Database error: ${error.message}. Please ensure the 'profiles' table exists.` });
    }

    res.json(profile);
  } catch (err) {
    const error = err as Error;
    res.status(500).json({ error: error.message });
  }
});

/**
 * 更新用户信息
 */
app.post("/api/auth/update-profile", async (req, res) => {
  const { id, username, avatar } = req.body;
  if (!id) {
    return res.status(400).json({ error: "User ID is required" });
  }

  try {
    const { data, error } = await supabase
      .from("profiles")
      .update({ username, avatar, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (err) {
    const error = err as Error;
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/readings", async (req, res) => {
  try {
    const { userId } = req.query;
    let query = supabase.from("readings").select("*");
    
    if (userId) {
      query = query.eq("user_id", userId);
    }

    const { data, error } = await query
      .order("created_at", { ascending: false })
      .limit(50);

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
    const { date, title, cards, interpretation, reflection, question, spreadType, layoutType, userId } = req.body;
    
    // 如果有 userId，执行记录数量限制逻辑
    if (userId) {
      // 1. 获取该用户的记录总数
      const { count, error: countError } = await supabase
        .from("readings")
        .select("*", { count: 'exact', head: true })
        .eq("user_id", userId);

      if (countError) throw countError;

      // 2. 如果记录数达到或超过 50 条，删除最旧的记录
      if (count !== null && count >= 50) {
        // 找出最旧的记录（按 created_at 升序排列，取超出部分）
        const deleteCount = count - 49; // 留出 49 个位置给新记录
        const { data: oldestReadings, error: fetchOldestError } = await supabase
          .from("readings")
          .select("id")
          .eq("user_id", userId)
          .order("created_at", { ascending: true })
          .limit(deleteCount);

        if (fetchOldestError) throw fetchOldestError;

        if (oldestReadings && oldestReadings.length > 0) {
          const idsToDelete = oldestReadings.map(r => r.id);
          const { error: deleteError } = await supabase
            .from("readings")
            .delete()
            .in("id", idsToDelete);
          
          if (deleteError) throw deleteError;
        }
      }
    }

    const { data, error } = await supabase
      .from("readings")
      .insert([{ 
        date, 
        title, 
        cards, 
        interpretation, 
        reflection, 
        question, 
        spread_type: spreadType, 
        layout_type: layoutType,
        user_id: userId
      }])
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
