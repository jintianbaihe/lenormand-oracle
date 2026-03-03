import express from "express";
import { createServer as createViteServer } from "vite";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

// Supabase Client Initialization
const supabaseUrl = process.env.SUPABASE_URL || "";
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || "";

let supabase: any = null;
try {
  if (supabaseUrl && supabaseAnonKey) {
    supabase = createClient(supabaseUrl, supabaseAnonKey);
    console.log("Supabase client initialized successfully.");
  } else {
    console.warn("Supabase credentials missing. Cloud features will be disabled.");
  }
} catch (err) {
  console.error("Failed to initialize Supabase client:", err);
}

app.use(express.json());

// Helper to check if Supabase is available
const checkSupabase = (res: any) => {
  if (!supabase) {
    res.status(503).json({ error: "Cloud storage is not configured. Please set SUPABASE_URL and SUPABASE_ANON_KEY." });
    return false;
  }
  return true;
};

// API Routes

/**
 * 发送验证码
 */
app.post("/api/auth/send-code", async (req, res) => {
  const { phone } = req.body;
  if (!phone) {
    return res.status(400).json({ error: "Phone number is required" });
  }

  const code = Math.floor(100000 + Math.random() * 900000).toString();
  console.log(`Verification code for ${phone}: ${code}`);

  // In a real app, you'd call an SMS service here
  res.json({ 
    message: "Code sent successfully",
    demoCode: code 
  });
});

/**
 * 验证验证码并登录/注册
 */
app.post("/api/auth/login", async (req, res) => {
  if (!checkSupabase(res)) return;
  const { phone, code } = req.body;
  if (!phone || !code) {
    return res.status(400).json({ error: "Phone and code are required" });
  }

  try {
    let { data: profile, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("phone", phone)
      .single();

    if (error && error.code === "PGRST116") {
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
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * 更新用户信息
 */
app.post("/api/auth/update-profile", async (req, res) => {
  if (!checkSupabase(res)) return;
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
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * 获取所有占卜记录
 */
app.get("/api/readings", async (req, res) => {
  if (!checkSupabase(res)) return;
  try {
    const { userId } = req.query;
    let query = supabase.from("readings").select("*");
    
    if (userId) {
      // 如果是游客 ID (以 guest_ 开头)，由于数据库 user_id 是 UUID 类型，直接查询会报错
      // 游客数据通常不存储在云端，或者以 user_id 为 null 存储
      // 这里我们处理：如果是游客 ID，则查询 user_id 为空的记录，或者直接返回空数组
      if (typeof userId === 'string' && userId.startsWith('guest_')) {
        // 方案 A: 游客不看云端历史，返回空
        return res.json([]);
        // 方案 B: 如果你想让游客看到 user_id 为 null 的记录（慎用，会看到所有人的）：
        // query = query.is("user_id", null);
      } else {
        query = query.eq("user_id", userId);
      }
    }

    const { data, error } = await query
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) throw error;
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * 获取单条占卜记录详情
 */
app.get("/api/readings/:id", async (req, res) => {
  if (!checkSupabase(res)) return;
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

/**
 * 保存新的占卜记录
 */
app.post("/api/readings", async (req, res) => {
  if (!checkSupabase(res)) return;
  try {
    const { date, title, cards, interpretation, reflection, question, spreadType, layoutType, userId } = req.body;

    // 检查是否为游客 ID (通常以 guest_ 开头)
    // 如果是游客，且数据库 user_id 列是 UUID 类型，直接插入会报错
    // 这里我们简单处理：如果是游客 ID，则不传递 user_id 给 Supabase（或者根据你的需求处理）
    const isGuest = userId && userId.startsWith('guest_');
    const dbUserId = isGuest ? null : userId;

    // 如果有有效的 userId，执行记录数量限制逻辑
    if (dbUserId) {
      const { count, error: countError } = await supabase
        .from("readings")
        .select("*", { count: 'exact', head: true })
        .eq("user_id", dbUserId);

      if (countError) {
        console.error("Count Error:", countError);
        // 如果表不存在，这里会报错
        if (countError.code === '42P01') {
          return res.status(500).json({ error: "The 'readings' table does not exist in your Supabase project." });
        }
        throw countError;
      }

      if (count !== null && count >= 50) {
        const deleteCount = count - 49;
        const { data: oldestReadings, error: fetchOldestError } = await supabase
          .from("readings")
          .select("id")
          .eq("user_id", dbUserId)
          .order("created_at", { ascending: true })
          .limit(deleteCount);

        if (fetchOldestError) throw fetchOldestError;

        if (oldestReadings && oldestReadings.length > 0) {
          const idsToDelete = oldestReadings.map(r => r.id);
          await supabase
            .from("readings")
            .delete()
            .in("id", idsToDelete);
        }
      }
    }

    const { data, error } = await supabase
      .from("readings")
      .insert([
        { 
          date, 
          title, 
          cards, 
          interpretation, 
          reflection, 
          question, 
          spread_type: spreadType, 
          layout_type: layoutType,
          user_id: dbUserId
        }
      ])
      .select();

    if (error) {
      console.error("Insert Error:", error);
      return res.status(500).json({ error: `Database error: ${error.message}` });
    }
    
    res.status(201).json(data[0]);
  } catch (error: any) {
    console.error("Save Reading Catch Error:", error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * 更新占卜记录（通常是更新感悟）
 */
app.patch("/api/readings/:id", async (req, res) => {
  if (!checkSupabase(res)) return;
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

/**
 * 删除占卜记录
 */
app.delete("/api/readings/:id", async (req, res) => {
  if (!checkSupabase(res)) return;
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

// Vite Middleware for Development
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static("dist"));
    app.get("*", (req, res) => {
      res.sendFile("dist/index.html", { root: "." });
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
