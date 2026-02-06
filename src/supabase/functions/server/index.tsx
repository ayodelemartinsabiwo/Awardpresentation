import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "npm:@supabase/supabase-js@2";
import * as kv from "./kv_store.tsx";

const app = new Hono();

// Initialize Supabase client with service role for admin operations
const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
);

// Storage bucket name
const BUCKET_NAME = 'make-b6556629-awards';

// Initialize storage bucket on startup
(async () => {
  const { data: buckets } = await supabase.storage.listBuckets();
  const bucketExists = buckets?.some(bucket => bucket.name === BUCKET_NAME);
  if (!bucketExists) {
    await supabase.storage.createBucket(BUCKET_NAME, { public: false });
    console.log(`Created private bucket: ${BUCKET_NAME}`);
  }
})();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Health check endpoint
app.get("/make-server-b6556629/health", (c) => {
  return c.json({ status: "ok" });
});

// Get all awardees
app.get("/make-server-b6556629/awardees", async (c) => {
  try {
    const awardees = await kv.getByPrefix("awardee:");
    
    // Sort awardees by order field (if exists) or by ID
    const sortedAwardees = awardees.sort((a, b) => {
      if (a.order !== undefined && b.order !== undefined) {
        return a.order - b.order;
      }
      return a.id - b.id;
    });
    
    // Get signed URLs for photos
    const awardeesWithSignedUrls = await Promise.all(
      sortedAwardees.map(async (awardee) => {
        if (awardee.photoPath) {
          const { data } = await supabase.storage
            .from(BUCKET_NAME)
            .createSignedUrl(awardee.photoPath, 3600); // 1 hour expiry
          
          return {
            ...awardee,
            photo: data?.signedUrl || awardee.photo
          };
        }
        return awardee;
      })
    );

    return c.json({ awardees: awardeesWithSignedUrls });
  } catch (error) {
    console.log(`Error fetching awardees: ${error}`);
    return c.json({ error: String(error) }, 500);
  }
});

// Create or update an awardee
app.post("/make-server-b6556629/awardees", async (c) => {
  try {
    const awardee = await c.req.json();
    await kv.set(`awardee:${awardee.id}`, awardee);
    return c.json({ success: true, awardee });
  } catch (error) {
    console.log(`Error saving awardee: ${error}`);
    return c.json({ error: String(error) }, 500);
  }
});

// Delete an awardee
app.delete("/make-server-b6556629/awardees/:id", async (c) => {
  try {
    const id = c.req.param("id");
    
    // Get awardee to check for photo
    const awardee = await kv.get(`awardee:${id}`);
    
    // Delete photo from storage if exists
    if (awardee?.photoPath) {
      await supabase.storage.from(BUCKET_NAME).remove([awardee.photoPath]);
    }
    
    // Delete from KV store
    await kv.del(`awardee:${id}`);
    
    return c.json({ success: true });
  } catch (error) {
    console.log(`Error deleting awardee: ${error}`);
    return c.json({ error: String(error) }, 500);
  }
});

// Upload photo
app.post("/make-server-b6556629/upload-photo", async (c) => {
  try {
    const formData = await c.req.formData();
    const file = formData.get('photo') as File;
    
    if (!file) {
      return c.json({ error: 'No file uploaded' }, 400);
    }

    // Generate unique filename
    const timestamp = Date.now();
    const filename = `${timestamp}-${file.name}`;
    
    // Convert file to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filename, uint8Array, {
        contentType: file.type,
        upsert: false
      });

    if (error) {
      console.log(`Storage upload error: ${error.message}`);
      return c.json({ error: error.message }, 500);
    }

    // Get signed URL
    const { data: signedUrlData } = await supabase.storage
      .from(BUCKET_NAME)
      .createSignedUrl(filename, 3600);

    return c.json({ 
      success: true, 
      photoPath: filename,
      photoUrl: signedUrlData?.signedUrl 
    });
  } catch (error) {
    console.log(`Error uploading photo: ${error}`);
    return c.json({ error: String(error) }, 500);
  }
});

Deno.serve(app.fetch);