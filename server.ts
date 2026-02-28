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
const supabase = createClient(supabaseUrl, supabaseAnonKey);

app.use(express.json());

// API Routes

/**
 * 获取所有占卜记录
 */
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

/**
 * 获取单条占卜记录详情
 */
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

/**
 * 保存新的占卜记录
 */
app.post("/api/readings", async (req, res) => {
  try {
    const { date, title, cards, interpretation, reflection, question, spreadType, layoutType } = req.body;
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
          layout_type: layoutType 
        }
      ])
      .select();

    if (error) throw error;
    res.status(201).json(data[0]);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * 更新占卜记录（通常是更新感悟）
 */
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

/**
 * 删除占卜记录
 */
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
