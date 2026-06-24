import express from 'express';
import cors from 'cors';
import multer from 'multer';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';
import Razorpay from 'razorpay';
import { mockProducts } from '../src/data/products.js';

// Set up directory paths for local fallback storage
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from absolute path
dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS and JSON parsing
app.use(cors());
app.use(express.json());

const UPLOADS_DIR = path.join(__dirname, 'uploads');
const DATA_DIR = path.join(__dirname, 'data');
const QUOTES_FILE = path.join(DATA_DIR, 'quotes.json');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const CARTS_FILE = path.join(DATA_DIR, 'carts.json');
const PRODUCTS_FILE = path.join(DATA_DIR, 'products.json');

// Ensure local folders exist
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(QUOTES_FILE)) {
  fs.writeFileSync(QUOTES_FILE, JSON.stringify([], null, 2));
}
if (!fs.existsSync(USERS_FILE)) {
  fs.writeFileSync(USERS_FILE, JSON.stringify([], null, 2));
}
if (!fs.existsSync(CARTS_FILE)) {
  fs.writeFileSync(CARTS_FILE, JSON.stringify([], null, 2));
}
if (!fs.existsSync(PRODUCTS_FILE)) {
  fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(mockProducts, null, 2));
}

// Serve local uploads statically (fallback mode)
app.use('/uploads', express.static(UPLOADS_DIR));

// Initialize Supabase client if keys are provided
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const isSupabaseConfigured = !!(supabaseUrl && supabaseKey && supabaseUrl !== 'your_supabase_project_url');

let supabase = null;
if (isSupabaseConfigured) {
  try {
    supabase = createClient(supabaseUrl, supabaseKey);
    console.log('[Database] Connected to Supabase backend.');
  } catch (err) {
    console.error('[Database] Failed to initialize Supabase client:', err.message);
  }
} else {
  console.log('[Database] Running in Local Fallback Mode (saving uploads to /uploads and data to quotes.json).');
}

// Initialize Razorpay client if keys are provided
const razorpayKeyId = process.env.RAZORPAY_KEY_ID;
const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET;
const isRazorpayConfigured = !!(razorpayKeyId && razorpayKeySecret && !razorpayKeyId.includes('XXXX'));

let razorpayInstance = null;
if (isRazorpayConfigured) {
  try {
    razorpayInstance = new Razorpay({
      key_id: razorpayKeyId,
      key_secret: razorpayKeySecret
    });
    console.log('[Payment] Razorpay gateway initialized (Key:', razorpayKeyId.substring(0, 12) + '...).');
  } catch (err) {
    console.error('[Payment] Failed to initialize Razorpay:', err.message);
  }
} else {
  console.log('[Payment] Razorpay not configured — payment endpoints will use sandbox/test mode.');
}

// Configure multer (memory storage to stream files directly to local disk or Supabase)
const storage = multer.memoryStorage();
const upload = multer({ limits: { fileSize: 50 * 1024 * 1024 } }); // 50MB limit

// --- LOCAL DATA HELPERS ---
const readLocalQuotes = () => {
  try {
    const data = fs.readFileSync(QUOTES_FILE, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Error reading local quotes:', err);
    return [];
  }
};

const writeLocalQuotes = (quotes) => {
  try {
    fs.writeFileSync(QUOTES_FILE, JSON.stringify(quotes, null, 2));
  } catch (err) {
    console.error('Error writing local quotes:', err);
  }
};

const readLocalUsers = () => {
  try {
    const data = fs.readFileSync(USERS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Error reading local users:', err);
    return [];
  }
};

const writeLocalUsers = (users) => {
  try {
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
  } catch (err) {
    console.error('Error writing local users:', err);
  }
};

const readLocalCarts = () => {
  try {
    const data = fs.readFileSync(CARTS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Error reading local carts:', err);
    return [];
  }
};

const writeLocalCarts = (carts) => {
  try {
    fs.writeFileSync(CARTS_FILE, JSON.stringify(carts, null, 2));
  } catch (err) {
    console.error('Error writing local carts:', err);
  }
};

const readLocalProducts = () => {
  try {
    const data = fs.readFileSync(PRODUCTS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Error reading local products:', err);
    return [];
  }
};

const writeLocalProducts = (products) => {
  try {
    fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(products, null, 2));
  } catch (err) {
    console.error('Error writing local products:', err);
  }
};

const mapProductDbToFrontend = (p) => {
  if (!p) return null;
  return {
    ...p,
    categoryLabel: p.category_label !== undefined ? p.category_label : p.categoryLabel,
    originalPrice: p.original_price !== undefined ? p.original_price : p.originalPrice,
    reviewsCount: p.reviews_count !== undefined ? p.reviews_count : p.reviewsCount,
    inStock: p.in_stock !== undefined ? p.in_stock : p.inStock
  };
};


const hashPassword = (password) => {
  return crypto.createHash('sha256').update(password).digest('hex');
};

// --- FILE UPLOAD HELPER ---
// Returns the public URL of the uploaded file
const uploadFileHelper = async (file, subFolder) => {
  const fileExtension = path.extname(file.originalname);
  const uniqueFileName = `${Date.now()}-${Math.floor(Math.random() * 100000)}${fileExtension}`;
  const bucketName = 'zylix-quotes';

  if (isSupabaseConfigured && supabase) {
    // 1. Upload to Supabase Storage
    const storagePath = `${subFolder}/${uniqueFileName}`;
    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(storagePath, file.buffer, {
        contentType: file.mimetype,
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('[Supabase Storage Upload Error]:', error);
      throw new Error(`Failed to upload to Supabase Storage: ${error.message}`);
    }

    // Get public URL
    const { data: publicUrlData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(storagePath);

    return {
      fileUrl: publicUrlData.publicUrl,
      fileName: file.originalname
    };
  } else {
    // 2. Upload Locally
    const localPath = path.join(UPLOADS_DIR, uniqueFileName);
    fs.writeFileSync(localPath, file.buffer);
    const localUrl = `http://localhost:${PORT}/uploads/${uniqueFileName}`;
    return {
      fileUrl: localUrl,
      fileName: file.originalname
    };
  }
};

// ==========================================
// API ENDPOINTS
// ==========================================

// 1. Submit CAD Slicer Quote Request
app.post('/api/quotes/slicer', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'CAD file is required.' });
    }

    const {
      material = 'PLA',
      color = 'Matte Black',
      quantity = 1,
      notes = '',
      customerName = '',
      customerEmail = '',
      customerPhone = ''
    } = req.body;

    // Upload file
    const fileResult = await uploadFileHelper(req.file, 'slicer');

    // Create quote object
    const ticketId = `ZYL-SLI-${1000 + Math.floor(Math.random() * 9000)}`;
    const quoteData = {
      id: ticketId,
      created_at: new Date().toISOString(),
      type: 'slicer',
      status: 'Pending',
      material,
      color,
      quantity: parseInt(quantity) || 1,
      notes,
      customer_name: customerName,
      customer_email: customerEmail,
      customer_phone: customerPhone,
      file_url: fileResult.fileUrl,
      file_name: fileResult.fileName,
      price_estimate: null,
      admin_notes: '',
      extra_data: null
    };

    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.from('quotes').insert(quoteData);
      if (error) throw error;
    } else {
      const quotes = readLocalQuotes();
      quotes.push(quoteData);
      writeLocalQuotes(quotes);
    }

    res.status(201).json({ success: true, ticketId, quote: quoteData });
  } catch (err) {
    console.error('Slicer quote error:', err);
    res.status(500).json({ error: err.message });
  }
});

// 2. Submit Prototype Lab Quote Request
app.post('/api/quotes/prototype', upload.array('files', 10), async (req, res) => {
  try {
    const {
      projectType = 'College Project',
      customProjectType = '',
      projectName = '',
      description = '',
      quantity = 1,
      customQuantity = '',
      requiredDate = '',
      customerName = '',
      customerEmail = '',
      customerPhone = ''
    } = req.body;

    const uploadedFilesData = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const result = await uploadFileHelper(file, 'prototype');
        uploadedFilesData.push(result);
      }
    }

    const ticketId = `ZYL-PROTO-${1000 + Math.floor(Math.random() * 9000)}`;
    const finalQty = quantity === 'Other' ? parseInt(customQuantity) : parseInt(quantity);
    const quoteData = {
      id: ticketId,
      created_at: new Date().toISOString(),
      type: 'prototype',
      status: 'Pending',
      material: 'Prototype (Engineered)',
      color: 'Custom Specs',
      quantity: finalQty || 1,
      notes: description,
      customer_name: customerName,
      customer_email: customerEmail,
      customer_phone: customerPhone,
      file_url: uploadedFilesData[0]?.fileUrl || '',
      file_name: uploadedFilesData[0]?.fileName || '',
      price_estimate: null,
      admin_notes: '',
      extra_data: {
        projectName,
        projectType: projectType === 'Other' ? customProjectType : projectType,
        requiredDate,
        files: uploadedFilesData
      }
    };

    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.from('quotes').insert(quoteData);
      if (error) throw error;
    } else {
      const quotes = readLocalQuotes();
      quotes.push(quoteData);
      writeLocalQuotes(quotes);
    }

    res.status(201).json({ success: true, ticketId, quote: quoteData });
  } catch (err) {
    console.error('Prototype quote error:', err);
    res.status(500).json({ error: err.message });
  }
});

// 2. Submit Custom Product Designer Request
app.post('/api/quotes/designer', upload.single('referenceFile'), async (req, res) => {
  try {
    const {
      productType = 'keychain',
      customProductType = '',
      nameText = '',
      designerColor = 'Gold',
      customColor = '',
      designerSize = 'Medium',
      customSize = '',
      additionalNotes = '',
      customerName = '',
      customerEmail = '',
      customerPhone = ''
    } = req.body;

    let fileResult = { fileUrl: '', fileName: '' };
    if (req.file) {
      fileResult = await uploadFileHelper(req.file, 'designer');
    }

    const ticketId = `ZYL-DSN-${1000 + Math.floor(Math.random() * 9000)}`;
    const quoteData = {
      id: ticketId,
      created_at: new Date().toISOString(),
      type: 'designer',
      status: 'Pending',
      material: 'N/A (Designer Draft)',
      color: designerColor === 'Other' ? customColor : designerColor,
      quantity: 1,
      notes: additionalNotes,
      customer_name: customerName,
      customer_email: customerEmail,
      customer_phone: customerPhone,
      file_url: fileResult.fileUrl,
      file_name: fileResult.fileName,
      price_estimate: null,
      admin_notes: '',
      extra_data: {
        productType,
        customProductType,
        nameText,
        designerSize: designerSize === 'Custom' ? customSize : designerSize
      }
    };

    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.from('quotes').insert(quoteData);
      if (error) throw error;
    } else {
      const quotes = readLocalQuotes();
      quotes.push(quoteData);
      writeLocalQuotes(quotes);
    }

    res.status(201).json({ success: true, ticketId, quote: quoteData });
  } catch (err) {
    console.error('Designer quote error:', err);
    res.status(500).json({ error: err.message });
  }
});

// 3. Submit Spare Parts Re-Creation Request
app.post('/api/quotes/spareparts', upload.single('photo'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Part photograph is required.' });
    }

    const {
      partName = '',
      length = '',
      width = '',
      height = '',
      notes = '',
      customerName = '',
      customerEmail = '',
      customerPhone = ''
    } = req.body;

    const fileResult = await uploadFileHelper(req.file, 'spareparts');

    const ticketId = `ZYL-PART-${1000 + Math.floor(Math.random() * 9000)}`;
    const quoteData = {
      id: ticketId,
      created_at: new Date().toISOString(),
      type: 'spareparts',
      status: 'Pending',
      material: 'Duplication (Engineered)',
      color: 'Technical Black/Grey',
      quantity: 1,
      notes,
      customer_name: customerName,
      customer_email: customerEmail,
      customer_phone: customerPhone,
      file_url: fileResult.fileUrl,
      file_name: fileResult.fileName,
      price_estimate: null,
      admin_notes: '',
      extra_data: {
        partName,
        dimensions: {
          length: length || '?',
          width: width || '?',
          height: height || '?'
        }
      }
    };

    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.from('quotes').insert(quoteData);
      if (error) throw error;
    } else {
      const quotes = readLocalQuotes();
      quotes.push(quoteData);
      writeLocalQuotes(quotes);
    }

    res.status(201).json({ success: true, ticketId, quote: quoteData });
  } catch (err) {
    console.error('Spare parts quote error:', err);
    res.status(500).json({ error: err.message });
  }
});

// 4. Fetch all quotes (Admin Dashboard or Customer Track Orders page)
app.get('/api/quotes', async (req, res) => {
  try {
    const { email } = req.query;
    let quotesList = [];
    
    if (isSupabaseConfigured && supabase) {
      let query = supabase.from('quotes').select('*').order('created_at', { ascending: false });
      if (email) {
        query = query.eq('customer_email', email.trim());
      }
      const { data, error } = await query;
      if (error) throw error;
      quotesList = data;
    } else {
      quotesList = readLocalQuotes();
      if (email) {
        const cleanEmail = email.trim().toLowerCase();
        quotesList = quotesList.filter(q => q.customer_email?.toLowerCase() === cleanEmail);
      }
      // Sort local quotes descending
      quotesList.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    }
    res.json(quotesList);
  } catch (err) {
    console.error('Fetch quotes error:', err);
    res.status(500).json({ error: err.message });
  }
});

// 5. Update quote status and details (Admin Panel action)
app.patch('/api/quotes/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, price_estimate, admin_notes } = req.body;

    const updatedFields = {
      status,
      price_estimate: price_estimate ? parseFloat(price_estimate) : null,
      admin_notes
    };

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('quotes')
        .update(updatedFields)
        .eq('id', id)
        .select();
      if (error) throw error;
      if (!data || data.length === 0) {
        return res.status(404).json({ error: 'Quote ticket not found.' });
      }
      res.json({ success: true, quote: data[0] });
    } else {
      const quotes = readLocalQuotes();
      const index = quotes.findIndex(q => q.id === id);
      if (index === -1) {
        return res.status(404).json({ error: 'Quote ticket not found.' });
      }

      quotes[index] = {
        ...quotes[index],
        ...updatedFields
      };
      writeLocalQuotes(quotes);
      res.json({ success: true, quote: quotes[index] });
    }
  } catch (err) {
    console.error('Update quote error:', err);
    res.status(500).json({ error: err.message });
  }
});

// --- AUTHENTICATION ENDPOINTS ---

// Register
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const hashedPassword = hashPassword(password);

    let useLocal = !isSupabaseConfigured || !supabase;
    if (!useLocal) {
      try {
        const { data: existingUser, error: selectError } = await supabase
          .from('users')
          .select('*')
          .eq('email', cleanEmail)
          .maybeSingle();

        if (selectError) {
          if (selectError.code === '42P01' || selectError.message?.includes('does not exist') || selectError.message?.includes('schema cache')) {
            useLocal = true;
          } else {
            throw selectError;
          }
        } else {
          if (existingUser) {
            return res.status(400).json({ error: 'Email address already registered.' });
          }
          const { error: insertError } = await supabase
            .from('users')
            .insert({ name, email: cleanEmail, password: hashedPassword });
          if (insertError) throw insertError;
          return res.status(201).json({ success: true, user: { name, email: cleanEmail } });
        }
      } catch (err) {
        console.warn('[Supabase Fallback] Users table query error, trying local fallback:', err.message);
        useLocal = true;
      }
    }

    if (useLocal) {
      const users = readLocalUsers();
      const userExists = users.some(u => u.email.toLowerCase() === cleanEmail);
      if (userExists) {
        return res.status(400).json({ error: 'Email address already registered.' });
      }

      const newUser = {
        id: crypto.randomUUID(),
        created_at: new Date().toISOString(),
        name,
        email: cleanEmail,
        password: hashedPassword
      };

      users.push(newUser);
      writeLocalUsers(users);
      return res.status(201).json({ success: true, user: { name, email: cleanEmail } });
    }
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const hashedPassword = hashPassword(password);

    let useLocal = !isSupabaseConfigured || !supabase;
    if (!useLocal) {
      try {
        const { data: user, error: selectError } = await supabase
          .from('users')
          .select('*')
          .eq('email', cleanEmail)
          .maybeSingle();

        if (selectError) {
          if (selectError.code === '42P01' || selectError.message?.includes('does not exist') || selectError.message?.includes('schema cache')) {
            useLocal = true;
          } else {
            throw selectError;
          }
        } else {
          if (!user || user.password !== hashedPassword) {
            return res.status(401).json({ error: 'Invalid email or password.' });
          }
          return res.json({ success: true, user: { name: user.name, email: user.email } });
        }
      } catch (err) {
        console.warn('[Supabase Fallback] Login table query error, trying local fallback:', err.message);
        useLocal = true;
      }
    }

    if (useLocal) {
      const users = readLocalUsers();
      const user = users.find(u => u.email.toLowerCase() === cleanEmail);
      if (!user || user.password !== hashedPassword) {
        return res.status(401).json({ error: 'Invalid email or password.' });
      }
      return res.json({ success: true, user: { name: user.name, email: user.email } });
    }
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: err.message });
  }
});

// --- CART SYNC ENDPOINTS ---

// Fetch Cart
app.get('/api/cart', async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) {
      return res.status(400).json({ error: 'Email parameter is required.' });
    }

    const cleanEmail = email.trim().toLowerCase();

    let useLocal = !isSupabaseConfigured || !supabase;
    if (!useLocal) {
      try {
        const { data, error } = await supabase
          .from('carts')
          .select('items')
          .eq('email', cleanEmail)
          .maybeSingle();

        if (error) {
          if (error.code === '42P01' || error.message?.includes('does not exist') || error.message?.includes('schema cache')) {
            useLocal = true;
          } else {
            throw error;
          }
        } else {
          return res.json(data ? data.items : []);
        }
      } catch (err) {
        console.warn('[Supabase Fallback] Cart fetch error, trying local fallback:', err.message);
        useLocal = true;
      }
    }

    if (useLocal) {
      const carts = readLocalCarts();
      const cart = carts.find(c => c.email.toLowerCase() === cleanEmail);
      return res.json(cart ? cart.items : []);
    }
  } catch (err) {
    console.error('Fetch cart error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Save/Update Cart
app.post('/api/cart', async (req, res) => {
  try {
    const { email, items } = req.body;
    if (!email || !Array.isArray(items)) {
      return res.status(400).json({ error: 'Email and items array are required.' });
    }

    const cleanEmail = email.trim().toLowerCase();

    let useLocal = !isSupabaseConfigured || !supabase;
    if (!useLocal) {
      try {
        const { error } = await supabase
          .from('carts')
          .upsert({ email: cleanEmail, items, updated_at: new Date().toISOString() }, { onConflict: 'email' });

        if (error) {
          if (error.code === '42P01' || error.message?.includes('does not exist') || error.message?.includes('schema cache')) {
            useLocal = true;
          } else {
            throw error;
          }
        } else {
          return res.json({ success: true });
        }
      } catch (err) {
        console.warn('[Supabase Fallback] Cart save error, trying local fallback:', err.message);
        useLocal = true;
      }
    }

    if (useLocal) {
      const carts = readLocalCarts();
      const index = carts.findIndex(c => c.email.toLowerCase() === cleanEmail);

      if (index > -1) {
        carts[index].items = items;
        carts[index].updated_at = new Date().toISOString();
      } else {
        carts.push({
          id: crypto.randomUUID(),
          email: cleanEmail,
          items,
          updated_at: new Date().toISOString()
        });
      }

      writeLocalCarts(carts);
      return res.json({ success: true });
    }
  } catch (err) {
    console.error('Save cart error:', err);
    res.status(500).json({ error: err.message });
  }
});

// --- CATALOG ORDER ENDPOINT ---

// Submit Pre-made Catalog Checkout Order
app.post('/api/orders', async (req, res) => {
  try {
    const {
      customerName,
      customerEmail,
      customerPhone,
      items,
      totalAmount,
      shippingAddress = 'N/A',
      paymentDetails = {}
    } = req.body;

    if (!customerEmail || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Customer email and cart items are required.' });
    }

    const ticketId = `ZYL-ORD-${100000 + Math.floor(Math.random() * 900000)}`;
    const orderData = {
      id: ticketId,
      created_at: new Date().toISOString(),
      type: 'order',
      status: 'Approved', // Approved = Paid/Confirmed
      material: 'N/A (Pre-made Catalog)',
      color: 'Standard Catalog Specs',
      quantity: items.reduce((sum, item) => sum + (item.quantity || 1), 0),
      notes: `E-Commerce order placed directly from catalog. Shipping Address: ${shippingAddress}`,
      customer_name: customerName || 'Valued Customer',
      customer_email: customerEmail,
      customer_phone: customerPhone || 'N/A',
      file_url: '',
      file_name: '',
      price_estimate: parseFloat(totalAmount) || 0,
      admin_notes: `Sandboxed check completed. Payment Card Holder: ${paymentDetails.name || 'N/A'}`,
      extra_data: {
        items,
        shippingAddress,
        receiptId: paymentDetails.receiptId || `REC-${Math.floor(100000 + Math.random() * 900000)}`
      }
    };

    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.from('quotes').insert(orderData);
      if (error) throw error;
    } else {
      const quotes = readLocalQuotes();
      quotes.push(orderData);
      writeLocalQuotes(quotes);
    }

    // Also clear the user's saved cart in the database upon successful order checkout
    let cartClearedInSupabase = false;
    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase.from('carts').upsert({ email: customerEmail.trim().toLowerCase(), items: [] }, { onConflict: 'email' });
        if (!error) cartClearedInSupabase = true;
      } catch (err) {
        console.warn('[Supabase Fallback] Failed to clear cart in Supabase:', err.message);
      }
    }
    
    if (!cartClearedInSupabase) {
      const carts = readLocalCarts();
      const cIndex = carts.findIndex(c => c.email.toLowerCase() === customerEmail.trim().toLowerCase());
      if (cIndex > -1) {
        carts[cIndex].items = [];
        writeLocalCarts(carts);
      }
    }

    res.status(201).json({ success: true, ticketId, receiptId: orderData.extra_data.receiptId });
  } catch (err) {
    console.error('Checkout order submission error:', err);
    res.status(500).json({ error: err.message });
  }
});



// --- RAZORPAY PAYMENT ENDPOINTS ---

// Create Razorpay Order
app.post('/api/payment/create-order', async (req, res) => {
  try {
    const { amount, email, name } = req.body;
    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Valid amount is required.' });
    }

    if (isRazorpayConfigured && razorpayInstance) {
      // Create a real Razorpay order
      const options = {
        amount: Math.round(amount * 100), // Razorpay expects paise (INR * 100)
        currency: 'INR',
        receipt: `zylix_${Date.now()}`,
        notes: {
          customer_email: email || '',
          customer_name: name || ''
        }
      };

      const order = await razorpayInstance.orders.create(options);
      return res.json({
        success: true,
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        keyId: razorpayKeyId
      });
    } else {
      // Sandbox fallback — return a fake order ID for testing without Razorpay keys
      const fakeOrderId = `order_sandbox_${Date.now()}`;
      return res.json({
        success: true,
        orderId: fakeOrderId,
        amount: Math.round(amount * 100),
        currency: 'INR',
        keyId: 'rzp_sandbox_mode',
        sandbox: true
      });
    }
  } catch (err) {
    console.error('Razorpay create order error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Verify Razorpay Payment & Save Order
app.post('/api/payment/verify', async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      customerName,
      customerEmail,
      customerPhone,
      items,
      totalAmount,
      shippingAddress = 'N/A',
      sandbox = false
    } = req.body;

    if (!customerEmail || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Customer email and cart items are required.' });
    }

    // Verify signature (skip for sandbox mode)
    let paymentVerified = false;
    if (sandbox || !isRazorpayConfigured) {
      // Sandbox mode — auto-verify
      paymentVerified = true;
    } else {
      // Real Razorpay signature verification using HMAC SHA256
      const body = razorpay_order_id + '|' + razorpay_payment_id;
      const expectedSignature = crypto
        .createHmac('sha256', razorpayKeySecret)
        .update(body)
        .digest('hex');

      paymentVerified = (expectedSignature === razorpay_signature);
    }

    if (!paymentVerified) {
      return res.status(400).json({ error: 'Payment verification failed. Invalid signature.' });
    }

    // Payment verified — save the order
    const ticketId = `ZYL-ORD-${100000 + Math.floor(Math.random() * 900000)}`;
    const receiptId = `REC-${Math.floor(100000 + Math.random() * 900000)}`;
    const orderData = {
      id: ticketId,
      created_at: new Date().toISOString(),
      type: 'order',
      status: 'Approved',
      material: 'N/A (Pre-made Catalog)',
      color: 'Standard Catalog Specs',
      quantity: items.reduce((sum, item) => sum + (item.quantity || 1), 0),
      notes: `E-Commerce order. Shipping: ${shippingAddress}. Payment: ${sandbox ? 'Sandbox' : 'Razorpay'} (${razorpay_payment_id || 'N/A'})`,
      customer_name: customerName || 'Valued Customer',
      customer_email: customerEmail,
      customer_phone: customerPhone || 'N/A',
      file_url: '',
      file_name: '',
      price_estimate: parseFloat(totalAmount) || 0,
      admin_notes: `Payment ID: ${razorpay_payment_id || 'sandbox'}. Order ID: ${razorpay_order_id || 'sandbox'}.`,
      extra_data: {
        items,
        shippingAddress,
        receiptId,
        razorpay_order_id: razorpay_order_id || null,
        razorpay_payment_id: razorpay_payment_id || null
      }
    };

    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.from('quotes').insert(orderData);
      if (error) throw error;
    } else {
      const quotes = readLocalQuotes();
      quotes.push(orderData);
      writeLocalQuotes(quotes);
    }

    // Clear user's cart
    let cartClearedInSupabase = false;
    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase.from('carts').upsert({ email: customerEmail.trim().toLowerCase(), items: [] }, { onConflict: 'email' });
        if (!error) cartClearedInSupabase = true;
      } catch (err) {
        console.warn('[Supabase Fallback] Failed to clear cart:', err.message);
      }
    }
    if (!cartClearedInSupabase) {
      const carts = readLocalCarts();
      const cIndex = carts.findIndex(c => c.email.toLowerCase() === customerEmail.trim().toLowerCase());
      if (cIndex > -1) {
        carts[cIndex].items = [];
        writeLocalCarts(carts);
      }
    }

    res.status(201).json({ success: true, ticketId, receiptId });
  } catch (err) {
    console.error('Payment verify error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Verify Razorpay Payment for custom Quote & Approve it
app.post('/api/payment/verify-quote', async (req, res) => {
  try {
    const {
      quoteId,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      customerPhone,
      shippingAddress,
      sandbox = false
    } = req.body;

    if (!quoteId) {
      return res.status(400).json({ error: 'Quote ticket ID is required.' });
    }

    // Verify signature (skip for sandbox mode)
    let paymentVerified = false;
    if (sandbox || !isRazorpayConfigured) {
      paymentVerified = true;
    } else {
      const body = razorpay_order_id + '|' + razorpay_payment_id;
      const expectedSignature = crypto
        .createHmac('sha256', razorpayKeySecret)
        .update(body)
        .digest('hex');

      paymentVerified = (expectedSignature === razorpay_signature);
    }

    if (!paymentVerified) {
      return res.status(400).json({ error: 'Payment verification failed. Invalid signature.' });
    }

    // Load quote and update its status
    let updatedQuote = null;
    const notesUpdate = ` | Shipping: ${shippingAddress} | Payment: ${sandbox ? 'Sandbox' : 'Razorpay'} (${razorpay_payment_id || 'N/A'})`;

    if (isSupabaseConfigured && supabase) {
      // 1. Fetch current quote
      const { data: quote, error: fetchErr } = await supabase
        .from('quotes')
        .select('*')
        .eq('id', quoteId)
        .maybeSingle();

      if (fetchErr) throw fetchErr;
      if (!quote) return res.status(404).json({ error: 'Quote ticket not found.' });

      // 2. Prepare update payload
      const currentNotes = quote.notes || '';
      const updatedNotes = currentNotes.includes('Shipping:') ? currentNotes : currentNotes + notesUpdate;
      const extra = quote.extra_data || {};
      extra.shippingAddress = shippingAddress;
      extra.razorpay_payment_id = razorpay_payment_id || 'sandbox';
      extra.razorpay_order_id = razorpay_order_id || 'sandbox';

      const { data, error: updateErr } = await supabase
        .from('quotes')
        .update({
          status: 'Approved',
          customer_phone: customerPhone,
          notes: updatedNotes,
          extra_data: extra
        })
        .eq('id', quoteId)
        .select();

      if (updateErr) throw updateErr;
      updatedQuote = data[0];
    } else {
      const quotes = readLocalQuotes();
      const index = quotes.findIndex(q => q.id === quoteId);
      if (index === -1) {
        return res.status(404).json({ error: 'Quote ticket not found.' });
      }

      const quote = quotes[index];
      const currentNotes = quote.notes || '';
      const updatedNotes = currentNotes.includes('Shipping:') ? currentNotes : currentNotes + notesUpdate;
      const extra = quote.extra_data || {};
      extra.shippingAddress = shippingAddress;
      extra.razorpay_payment_id = razorpay_payment_id || 'sandbox';
      extra.razorpay_order_id = razorpay_order_id || 'sandbox';

      quotes[index] = {
        ...quote,
        status: 'Approved',
        customer_phone: customerPhone,
        notes: updatedNotes,
        extra_data: extra
      };

      writeLocalQuotes(quotes);
      updatedQuote = quotes[index];
    }

    res.json({ success: true, quote: updatedQuote });
  } catch (err) {
    console.error('Verify quote payment error:', err);
    res.status(500).json({ error: err.message });
  }
});


// --- PRODUCTS ENDPOINTS ---

// Fetch all products (seeding empty Supabase table if needed)
app.get('/api/products', async (req, res) => {
  try {
    let productsList = [];
    let useLocal = !isSupabaseConfigured || !supabase;
    if (!useLocal) {
      try {
        let { data, error } = await supabase.from('products').select('*').order('id', { ascending: true });
        if (error) {
          if (error.code === '42P01' || error.message?.includes('does not exist')) {
            useLocal = true;
          } else {
            throw error;
          }
        } else {
          // If Supabase table is empty, auto-seed it with the 24 default products
          if (data.length === 0 && mockProducts && mockProducts.length > 0) {
            console.log('[Database] Seeding empty Supabase products table with default products...');
            const seedPayload = mockProducts.map(p => ({
              name: p.name,
              category: p.category,
              category_label: p.categoryLabel,
              price: p.price,
              original_price: p.originalPrice,
              discount: p.discount,
              rating: p.rating,
              reviews_count: p.reviewsCount,
              image: p.image,
              description: p.description,
              specs: p.specs,
              materials: p.materials,
              badge: p.badge,
              in_stock: p.inStock
            }));
            const { data: seededData, error: seedError } = await supabase
              .from('products')
              .insert(seedPayload)
              .select();

            if (seedError) {
              console.error('[Database] Failed to seed Supabase products:', seedError.message);
            } else if (seededData) {
              data = seededData;
            }
          }
          productsList = data || [];
        }
      } catch (err) {
        console.warn('[Supabase Fallback] Products table select error, trying local fallback:', err.message);
        useLocal = true;
      }
    }
    if (useLocal) {
      productsList = readLocalProducts();
    }
    
    // Map db snake_case properties to frontend camelCase properties
    const frontendProducts = productsList.map(mapProductDbToFrontend);
    res.json(frontendProducts);
  } catch (err) {
    console.error('Fetch products error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Create product (supports image upload)
app.post('/api/products', upload.single('image'), async (req, res) => {
  try {
    const {
      name,
      category,
      categoryLabel,
      price,
      originalPrice,
      discount,
      badge = '',
      description = '',
      specs = '{}',
      materials = '[]',
      inStock = 'true'
    } = req.body;

    if (!name || !category || !price) {
      return res.status(400).json({ error: 'Name, category, and price are required.' });
    }

    let imageUrl = '';
    if (req.file) {
      try {
        const fileResult = await uploadFileHelper(req.file, 'products');
        imageUrl = fileResult.fileUrl;
      } catch (uploadErr) {
        console.error('[Product Image Upload Error]:', uploadErr.message);
      }
    }

    // Parse specs and materials structure
    let parsedSpecs = {};
    try {
      parsedSpecs = typeof specs === 'string' ? JSON.parse(specs) : specs;
    } catch (e) {
      console.warn('Failed to parse specs JSON, defaulting to empty object');
    }

    let parsedMaterials = [];
    try {
      parsedMaterials = typeof materials === 'string' ? JSON.parse(materials) : materials;
    } catch (e) {
      console.warn('Failed to parse materials JSON, defaulting to empty array');
    }

    const newProduct = {
      name,
      category,
      category_label: categoryLabel || category,
      price: parseFloat(price),
      original_price: originalPrice ? parseFloat(originalPrice) : null,
      discount: discount ? parseFloat(discount) : null,
      rating: 5.0,
      reviews_count: 0,
      image: imageUrl,
      description,
      specs: parsedSpecs,
      materials: parsedMaterials,
      badge: badge || null,
      in_stock: inStock === 'true' || inStock === true
    };

    let useLocal = !isSupabaseConfigured || !supabase;
    let savedProduct = null;

    if (!useLocal) {
      try {
        const { data, error } = await supabase
          .from('products')
          .insert(newProduct)
          .select();

        if (error) {
          if (error.code === '42P01' || error.message?.includes('does not exist')) {
            useLocal = true;
          } else {
            throw error;
          }
        } else {
          savedProduct = data[0];
        }
      } catch (err) {
        console.warn('[Supabase Fallback] Product insert error, trying local fallback:', err.message);
        useLocal = true;
      }
    }

    if (useLocal) {
      const products = readLocalProducts();
      const maxId = products.reduce((max, p) => (p.id > max ? p.id : max), 0);
      savedProduct = {
        id: maxId + 1,
        created_at: new Date().toISOString(),
        ...newProduct,
        categoryLabel: newProduct.category_label,
        inStock: newProduct.in_stock
      };
      products.push(savedProduct);
      writeLocalProducts(products);
    }

    res.status(201).json({ success: true, product: mapProductDbToFrontend(savedProduct) });
  } catch (err) {
    console.error('Create product error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Delete product
app.delete('/api/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const numericId = parseInt(id);

    let useLocal = !isSupabaseConfigured || !supabase;
    let deletedSuccess = false;

    if (!useLocal) {
      try {
        let query = supabase.from('products').delete();
        if (!isNaN(numericId)) {
          query = query.eq('id', numericId);
        } else {
          query = query.eq('id', id);
        }
        const { data, error } = await query.select();

        if (error) {
          if (error.code === '42P01' || error.message?.includes('does not exist')) {
            useLocal = true;
          } else {
            throw error;
          }
        } else {
          deletedSuccess = true;
        }
      } catch (err) {
        console.warn('[Supabase Fallback] Product delete error, trying local fallback:', err.message);
        useLocal = true;
      }
    }

    if (useLocal) {
      const products = readLocalProducts();
      const initialLength = products.length;
      const filteredProducts = products.filter(p => String(p.id) !== String(id));
      if (filteredProducts.length < initialLength) {
        writeLocalProducts(filteredProducts);
        deletedSuccess = true;
      }
    }

    if (deletedSuccess) {
      res.json({ success: true, message: `Product ${id} deleted successfully.` });
    } else {
      res.status(404).json({ error: 'Product not found.' });
    }
  } catch (err) {
    console.error('Delete product error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Update product (supports image upload)
app.put('/api/products/:id', upload.single('image'), async (req, res) => {
  try {
    const { id } = req.params;
    const numericId = parseInt(id);
    const {
      name,
      category,
      categoryLabel,
      price,
      originalPrice,
      discount,
      badge,
      description,
      specs,
      materials,
      inStock
    } = req.body;

    if (!name || !category || !price) {
      return res.status(400).json({ error: 'Name, category, and price are required.' });
    }

    // Get current product first to know the existing image URL
    let currentProduct = null;
    let useLocal = !isSupabaseConfigured || !supabase;

    if (!useLocal) {
      try {
        let query = supabase.from('products').select('*');
        if (!isNaN(numericId)) {
          query = query.eq('id', numericId);
        } else {
          query = query.eq('id', id);
        }
        const { data, error } = await query.maybeSingle();
        if (error) {
          if (error.code === '42P01' || error.message?.includes('does not exist')) {
            useLocal = true;
          } else {
            throw error;
          }
        } else {
          currentProduct = data;
        }
      } catch (err) {
        console.warn('[Supabase Fallback] Error checking current product, trying local fallback:', err.message);
        useLocal = true;
      }
    }

    if (useLocal) {
      const products = readLocalProducts();
      currentProduct = products.find(p => String(p.id) === String(id));
    }

    if (!currentProduct) {
      return res.status(404).json({ error: 'Product not found.' });
    }

    let imageUrl = currentProduct.image || currentProduct.image_url || '';
    if (req.file) {
      try {
        const fileResult = await uploadFileHelper(req.file, 'products');
        imageUrl = fileResult.fileUrl;
      } catch (uploadErr) {
        console.error('[Product Image Upload Error]:', uploadErr.message);
      }
    }

    // Parse specs and materials structure
    let parsedSpecs = {};
    try {
      parsedSpecs = typeof specs === 'string' ? JSON.parse(specs) : specs;
    } catch (e) {
      console.warn('Failed to parse specs JSON, defaulting to empty object');
    }

    let parsedMaterials = [];
    try {
      parsedMaterials = typeof materials === 'string' ? JSON.parse(materials) : materials;
    } catch (e) {
      console.warn('Failed to parse materials JSON, defaulting to empty array');
    }

    const updatedProductData = {
      name,
      category,
      category_label: categoryLabel || category,
      price: parseFloat(price),
      original_price: originalPrice ? parseFloat(originalPrice) : null,
      discount: discount ? parseFloat(discount) : null,
      image: imageUrl,
      description,
      specs: parsedSpecs,
      materials: parsedMaterials,
      badge: badge || null,
      in_stock: inStock === 'true' || inStock === true
    };

    let updatedProduct = null;

    if (!useLocal) {
      try {
        let query = supabase.from('products').update(updatedProductData);
        if (!isNaN(numericId)) {
          query = query.eq('id', numericId);
        } else {
          query = query.eq('id', id);
        }
        const { data, error } = await query.select();

        if (error) {
          throw error;
        } else {
          updatedProduct = data[0];
        }
      } catch (err) {
        console.warn('[Supabase Fallback] Product update error, trying local fallback:', err.message);
        useLocal = true;
      }
    }

    if (useLocal) {
      const products = readLocalProducts();
      const index = products.findIndex(p => String(p.id) === String(id));
      if (index === -1) {
        return res.status(404).json({ error: 'Product not found.' });
      }
      products[index] = {
        ...products[index],
        ...updatedProductData,
        categoryLabel: updatedProductData.category_label,
        inStock: updatedProductData.in_stock
      };
      writeLocalProducts(products);
      updatedProduct = products[index];
    }

    res.json({ success: true, product: mapProductDbToFrontend(updatedProduct) });
  } catch (err) {
    console.error('Update product error:', err);
    res.status(500).json({ error: err.message });
  }
});


// --- PINCODE DATABASE LOGIC ---
const pincodeMap = new Map();

function splitCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

function toTitleCase(str) {
  if (!str) return '';
  return str.toLowerCase().split(/\s+/).map(word => {
    if (!word) return '';
    return word.charAt(0).toUpperCase() + word.slice(1);
  }).join(' ');
}

const loadPincodes = () => {
  const csvPath = path.join(__dirname, 'data', 'pincode.csv');
  if (!fs.existsSync(csvPath)) {
    console.error(`[Pincode] CSV file not found at ${csvPath}`);
    return;
  }

  console.log('[Pincode] Loading pincode database...');
  const startTime = Date.now();

  try {
    const content = fs.readFileSync(csvPath, 'utf8');
    const lines = content.split(/\r?\n/);

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      if (!line) continue;

      const parts = splitCSVLine(line);
      if (parts.length > 8) {
        const pincode = parts[4];
        const district = parts[7];
        const statename = parts[8];

        if (pincode && district && statename) {
          if (!pincodeMap.has(pincode)) {
            pincodeMap.set(pincode, {
              city: toTitleCase(district),
              state: toTitleCase(statename)
            });
          }
        }
      }
    }
    console.log(`[Pincode] Loaded ${pincodeMap.size} unique pincodes in ${Date.now() - startTime}ms`);
  } catch (err) {
    console.error('[Pincode] Error loading pincodes:', err);
  }
};

// Load pincodes at startup
loadPincodes();

// Pincode lookup endpoint
app.get('/api/pincode/:pincode', (req, res) => {
  const { pincode } = req.params;
  const info = pincodeMap.get(pincode);
  if (info) {
    return res.json({ success: true, city: info.city, state: info.state });
  }
  return res.status(404).json({ error: 'Pincode not found.' });
});





// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy', mode: isSupabaseConfigured ? 'supabase' : 'local', razorpay: isRazorpayConfigured ? 'active' : 'sandbox' });
});

app.listen(PORT, () => {
  console.log(`[Server] Zylix 3D backend running on http://localhost:${PORT}`);
});
