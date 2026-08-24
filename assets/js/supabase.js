/* ====================================================================
   SUPABASE CLIENT & API DATA HELPERS
   ==================================================================== */

const SUPABASE_URL = 'https://tqgbxuyzbcrekeshxino.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRxZ2J4dXl6YmNyZWtlc2h4aW5vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODYyMDU2NjgsImV4cCI6MjEwMTc4MTY2OH0.GlbzHcAbGhlGnswHZvl1UyMKIfE8bTdUsoOt7XNlM00';

// Default Supabase Storage Bucket Name (can be configured in Admin Dashboard or localStorage)
function getSupabaseBucketName() {
  try {
    const saved = localStorage.getItem('portfolio_supabase_bucket');
    if (saved && saved.trim()) return saved.trim();
  } catch (e) { }
  return window.SUPABASE_STORAGE_BUCKET || 'portfolio';
}

function setSupabaseBucketName(name) {
  try {
    if (name && name.trim()) {
      localStorage.setItem('portfolio_supabase_bucket', name.trim());
      window.SUPABASE_STORAGE_BUCKET = name.trim();
    }
  } catch (e) { }
}

let supabaseClient = null;

if (typeof supabase !== 'undefined' && SUPABASE_URL && !SUPABASE_URL.includes('your-project')) {
  try {
    supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  } catch (err) {
    console.warn('[Supabase CDN] Failed to initialize client:', err);
    supabaseClient = null;
  }
}

/* Fallback Realistic Portfolio Data */
const FALLBACK_DATA = {
  projects: [
    {
      id: 'p1',
      title: 'Neural Telemetry Analyzer',
      description: 'Deep learning pipeline for real-time telemetry stream anomaly detection using PyTorch, Pandas, and Flask API.',
      tech_stack: ['Python', 'PyTorch', 'Pandas', 'Flask'],
      github_url: 'https://github.com/krishnagoyal597/neural-telemetry',
      live_url: 'https://neural-telemetry-demo.vercel.app',
      featured: true,
      created_at: '2026-01-15T00:00:00Z'
    },
    {
      id: 'p2',
      title: 'Autonomous Data ETL Pipeline',
      description: 'High-throughput data extraction and automated classification engine integrated with PostgreSQL database.',
      tech_stack: ['Python', 'SQL', 'Supabase', 'Docker'],
      github_url: 'https://github.com/krishnagoyal597/data-pipeline',
      live_url: 'https://data-pipeline-demo.vercel.app',
      featured: true,
      created_at: '2026-02-01T00:00:00Z'
    },
    {
      id: 'p3',
      title: 'Generative Portfolio Copywriter',
      description: 'Automated personal portfolio generator utilizing Google Gemini API for personalized resume summaries.',
      tech_stack: ['Python', 'Gemini API', 'Jinja2', 'HTML/CSS'],
      github_url: 'https://github.com/krishnagoyal597/gemini-portfolio',
      live_url: 'https://gemini-portfolio-demo.vercel.app',
      featured: false,
      created_at: '2026-02-10T00:00:00Z'
    }
  ],
  skills: [
    { id: 's1', name: 'Python', category: 'Programming', proficiency: 90 },
    { id: 's2', name: 'Machine Learning', category: 'AI / ML', proficiency: 85 },
    { id: 's3', name: 'Data Analytics', category: 'Databases', proficiency: 88 },
    { id: 's4', name: 'SQL & PostgreSQL', category: 'Databases', proficiency: 82 },
    { id: 's5', name: 'HTML5 & CSS3', category: 'Web', proficiency: 88 },
    { id: 's6', name: 'JavaScript (ES6+)', category: 'Web', proficiency: 80 },
    { id: 's7', name: 'Git & GitHub', category: 'Tools', proficiency: 85 },
    { id: 's8', name: 'Flask', category: 'Web', proficiency: 78 }
  ],
  certifications: [
    {
      id: 'c1',
      name: 'Machine Learning Specialization',
      platform: 'Coursera / DeepLearning.AI',
      date_earned: '2025-11-20',
      certificate_url: '#',
      image_url: 'assets/images/cert-ml.svg'
    },
    {
      id: 'c2',
      name: 'Python for Data Science & AI',
      platform: 'IBM / DataCamp',
      date_earned: '2025-08-14',
      certificate_url: '#',
      image_url: 'assets/images/cert-python.svg'
    },
    {
      id: 'c3',
      name: 'SQL for Data Engineering',
      platform: 'Udemy',
      date_earned: '2025-06-10',
      certificate_url: '#',
      image_url: 'assets/images/cert-sql.svg'
    }
  ],
  experience: [
    {
      id: 'e1',
      company: 'GLA University AI Lab',
      role: 'Student AI Researcher',
      start_date: '2025-09-01',
      end_date: null,
      is_current: true,
      description: [
        'Developing predictive data models using Python and PyTorch.',
        'Collaborating on machine learning benchmarking and telemetry analytics pipelines.',
        'Organizing technical workshops for B.Tech AI & Data Analytics peers.'
      ]
    }
  ],
  achievements: [
    {
      id: 'a1',
      title: 'National AI Hackathon Top 10 Finalist',
      category: 'Competition',
      date_achieved: '2025-10-15',
      description: 'Developed an autonomous real-time anomaly detection pipeline using PyTorch.',
      image_url: 'assets/images/cert-ml.svg'
    },
    {
      id: 'a2',
      title: 'GLA University Academic Excellence Award',
      category: 'Academic',
      date_achieved: '2025-12-01',
      description: 'Recognized for top percentile performance in AI & Data Analytics coursework.',
      image_url: 'assets/images/cert-python.svg'
    }
  ],
  academics: [
    {
      id: 'acad-1',
      semester: 'Semester 1 (Fall 2025)',
      degree_program: 'B.Tech AI & Data Analytics',
      sgpa_cgpa: '9.20 SGPA',
      percentage: '87.5%',
      session_year: '2025-2026',
      subjects: 'Python Programming, Linear Algebra, Discrete Mathematics, Digital Systems',
      marksheet_url: ''
    }
  ],
  links: [
    { key: 'github', value: 'https://github.com/krishnagoyal597' },
    { key: 'linkedin', value: 'https://linkedin.com/in/krishnagoyal' },
    { key: 'twitter', value: 'https://twitter.com/krishnagoyal' },
    { key: 'resume_url', value: '#' }
  ],
  meta: [
    { key: 'bio', value: 'I am a first-year B.Tech student at GLA University specializing in Artificial Intelligence and Data Analytics. I enjoy building practical projects, learning new technologies and solving real-world problems through code.' },
    { key: 'tagline', value: 'B.Tech AI & Data Analytics Student @ GLA University' },
    { key: 'resume_summary', value: 'Krishna Goyal — B.Tech AI & Data Analytics Student at GLA University (Class of 2029). Skilled in Python, Machine Learning, Data Analytics, and SQL.' },
    { key: 'profile_photo_url', value: 'assets/images/profile.svg' }
  ],
  messages: []
};

/* LocalStorage Sync Helpers */
function getLocalCache(key, fallback) {
  try {
    const saved = localStorage.getItem('portfolio_' + key);
    if (saved) return JSON.parse(saved);
  } catch (e) { }
  return fallback;
}

function setLocalCache(key, data) {
  try {
    localStorage.setItem('portfolio_' + key, JSON.stringify(data));
  } catch (e) { }
}

/* Data Retrieval Helpers */
async function fetchProjects() {
  if (supabaseClient) {
    try {
      const { data, error } = await supabaseClient.from('projects').select('*').order('created_at', { ascending: false });
      if (!error && data && data.length > 0) {
        setLocalCache('projects', data);
        return data;
      }
    } catch (e) { }
  }
  try {
    const res = await fetch('/api/data/projects');
    if (res.ok) {
      const json = await res.json();
      if (json.data && json.data.length > 0) {
        setLocalCache('projects', json.data);
        return json.data;
      }
    }
  } catch (e) { }
  return getLocalCache('projects', FALLBACK_DATA.projects);
}

async function fetchSkills() {
  if (supabaseClient) {
    try {
      const { data, error } = await supabaseClient.from('skills').select('*').order('category');
      if (!error && data && data.length > 0) {
        setLocalCache('skills', data);
        return data;
      }
    } catch (e) { }
  }
  try {
    const res = await fetch('/api/data/skills');
    if (res.ok) {
      const json = await res.json();
      if (json.data && json.data.length > 0) {
        setLocalCache('skills', json.data);
        return json.data;
      }
    }
  } catch (e) { }
  return getLocalCache('skills', FALLBACK_DATA.skills);
}

async function fetchCertifications() {
  if (supabaseClient) {
    try {
      const { data, error } = await supabaseClient.from('certifications').select('*').order('date_earned', { ascending: false });
      if (!error && data && data.length > 0) {
        setLocalCache('certifications', data);
        return data;
      }
    } catch (e) { }
  }
  try {
    const res = await fetch('/api/data/certifications');
    if (res.ok) {
      const json = await res.json();
      if (json.data && json.data.length > 0) {
        setLocalCache('certifications', json.data);
        return json.data;
      }
    }
  } catch (e) { }
  return getLocalCache('certifications', FALLBACK_DATA.certifications);
}

async function fetchExperience() {
  if (supabaseClient) {
    try {
      const { data, error } = await supabaseClient.from('experience').select('*').order('start_date', { ascending: false });
      if (!error && data && data.length > 0) {
        setLocalCache('experience', data);
        return data;
      }
    } catch (e) { }
  }
  try {
    const res = await fetch('/api/data/experience');
    if (res.ok) {
      const json = await res.json();
      if (json.data && json.data.length > 0) {
        setLocalCache('experience', json.data);
        return json.data;
      }
    }
  } catch (e) { }
  return getLocalCache('experience', FALLBACK_DATA.experience);
}

async function fetchAchievements() {
  if (supabaseClient) {
    try {
      const { data, error } = await supabaseClient.from('achievements').select('*').order('date_achieved', { ascending: false });
      if (!error && data && data.length > 0) {
        setLocalCache('achievements', data);
        return data;
      }
    } catch (e) { }
  }
  try {
    const res = await fetch('/api/data/achievements');
    if (res.ok) {
      const json = await res.json();
      if (json.data && json.data.length > 0) {
        setLocalCache('achievements', json.data);
        return json.data;
      }
    }
  } catch (e) { }
  return getLocalCache('achievements', FALLBACK_DATA.achievements);
}

async function fetchAcademics() {
  if (supabaseClient) {
    try {
      const { data, error } = await supabaseClient.from('academics').select('*').order('created_at', { ascending: false });
      if (!error && data && data.length > 0) {
        setLocalCache('academics', data);
        return data;
      }
    } catch (e) { }
  }
  try {
    const res = await fetch('/api/data/academics');
    if (res.ok) {
      const json = await res.json();
      if (json.data && json.data.length > 0) {
        setLocalCache('academics', json.data);
        return json.data;
      }
    }
  } catch (e) { }
  return getLocalCache('academics', FALLBACK_DATA.academics);
}

async function fetchLinks() {
  if (supabaseClient) {
    try {
      const { data, error } = await supabaseClient.from('links').select('*');
      if (!error && data && data.length > 0) {
        setLocalCache('links', data);
        return data;
      }
    } catch (e) { }
  }
  try {
    const res = await fetch('/api/data/links');
    if (res.ok) {
      const json = await res.json();
      if (json.data) {
        setLocalCache('links', json.data);
        return json.data;
      }
    }
  } catch (e) { }
  return getLocalCache('links', FALLBACK_DATA.links);
}

async function fetchMeta() {
  if (supabaseClient) {
    try {
      const { data, error } = await supabaseClient.from('meta').select('*');
      if (!error && data && data.length > 0) {
        setLocalCache('meta', data);
        return data;
      }
    } catch (e) { }
  }
  try {
    const res = await fetch('/api/data/meta');
    if (res.ok) {
      const json = await res.json();
      if (json.data) {
        setLocalCache('meta', json.data);
        return json.data;
      }
    }
  } catch (e) { }
  return getLocalCache('meta', FALLBACK_DATA.meta);
}

async function fetchMessages() {
  if (supabaseClient) {
    try {
      const { data, error } = await supabaseClient.from('messages').select('*').order('received_at', { ascending: false });
      if (!error && data) return data;
    } catch (e) { }
  }
  try {
    const res = await fetch('/api/data/messages');
    if (res.ok) {
      const json = await res.json();
      if (json.data) return json.data;
    }
  } catch (e) { }
  return FALLBACK_DATA.messages;
}

/* ====================================================================
   SUPABASE STORAGE UPLOAD HELPER
   ==================================================================== */
async function uploadToSupabaseStorage(fileOrBlob, filename, bucketName = null) {
  const bucket = bucketName || getSupabaseBucketName();
  const cleanName = filename || (fileOrBlob.name ? fileOrBlob.name.replace(/[^a-zA-Z0-9._-]/g, '_') : `upload_${Date.now()}.jpg`);
  const filePath = `uploads/${Date.now()}_${cleanName}`;
  const contentType = fileOrBlob.type || (cleanName.endsWith('.pdf') ? 'application/pdf' : 'image/jpeg');

  // 1. Try direct Supabase JS Storage Client Upload
  if (supabaseClient && supabaseClient.storage) {
    try {
      const { data, error } = await supabaseClient.storage
        .from(bucket)
        .upload(filePath, fileOrBlob, {
          cacheControl: '3600',
          upsert: true,
          contentType: contentType
        });

      if (!error && data) {
        const { data: urlData } = supabaseClient.storage.from(bucket).getPublicUrl(filePath);
        if (urlData && urlData.publicUrl) {
          console.log('✓ [Supabase Storage Direct] Uploaded to:', urlData.publicUrl);
          return { success: true, url: urlData.publicUrl, filename: filePath, source: 'supabase_storage' };
        }
      } else if (error) {
        console.warn('[Supabase Storage Direct Warning]', error.message);
      }
    } catch (err) {
      console.warn('[Supabase Storage Direct Catch]', err);
    }
  }

  // 2. Try backend API upload (/api/upload) which also uploads to Supabase Storage via Python Client
  try {
    const formData = new FormData();
    formData.append('file', fileOrBlob, cleanName);
    formData.append('bucket', bucket);

    const res = await fetch('/api/upload', {
      method: 'POST',
      body: formData
    });

    if (res.ok) {
      const json = await res.json();
      if (json.url) {
        console.log('✓ [Backend API Upload] Uploaded:', json.url);
        return { success: true, url: json.url, filename: json.filename || cleanName, source: json.source || 'api_upload' };
      }
    }
  } catch (err) {
    console.warn('[Backend API Upload Catch]', err);
  }

  // 3. Fallback: Convert to Base64 data URL so nothing ever fails or blocks the user
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      console.log('ℹ [Storage Base64 Fallback] Generated data URL');
      resolve({ success: true, url: reader.result, filename: cleanName, source: 'base64_fallback' });
    };
    reader.onerror = () => {
      resolve({ success: false, url: '', error: 'Failed to read file locally' });
    };
    reader.readAsDataURL(fileOrBlob);
  });
}

/* Dedicated helpers for key-value tables (meta & links) with multi-layer fallback */
async function saveMetaKey(key, value) {
  // 1. Update local cache immediately
  let meta = getLocalCache('meta', FALLBACK_DATA.meta || []);
  if (Array.isArray(meta)) {
    const idx = meta.findIndex(m => m && m.key === key);
    if (idx !== -1) meta[idx].value = value;
    else meta.push({ key, value });
  } else if (typeof meta === 'object' && meta !== null) {
    meta[key] = value;
  }
  setLocalCache('meta', meta);

  // 2. Direct Supabase write with automatic conflict resolution
  if (supabaseClient) {
    try {
      const { data, error } = await supabaseClient
        .from('meta')
        .upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: 'key' })
        .select();
      if (!error && data && data.length > 0) return data[0];
    } catch (e) { }

    try {
      const { data, error } = await supabaseClient
        .from('meta')
        .update({ value, updated_at: new Date().toISOString() })
        .eq('key', key)
        .select();
      if (!error && data && data.length > 0) return data[0];
    } catch (e) { }
  }

  // 3. Sync to Python backend API
  try {
    const res = await fetch('/api/data/meta', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key, value })
    });
    if (res.ok) {
      const json = await res.json();
      return json.data || { key, value };
    }
  } catch (e) { }

  return { key, value };
}

async function saveLinkKey(key, value) {
  // 1. Update local cache immediately
  let links = getLocalCache('links', FALLBACK_DATA.links || []);
  if (Array.isArray(links)) {
    const idx = links.findIndex(m => m && m.key === key);
    if (idx !== -1) links[idx].value = value;
    else links.push({ key, value });
  } else if (typeof links === 'object' && links !== null) {
    links[key] = value;
  }
  setLocalCache('links', links);

  // 2. Direct Supabase write with automatic conflict resolution
  if (supabaseClient) {
    try {
      const { data, error } = await supabaseClient
        .from('links')
        .upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: 'key' })
        .select();
      if (!error && data && data.length > 0) return data[0];
    } catch (e) { }

    try {
      const { data, error } = await supabaseClient
        .from('links')
        .update({ value, updated_at: new Date().toISOString() })
        .eq('key', key)
        .select();
      if (!error && data && data.length > 0) return data[0];
    } catch (e) { }
  }

  // 3. Sync to Python backend API
  try {
    const res = await fetch('/api/data/links', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key, value })
    });
    if (res.ok) {
      const json = await res.json();
      return json.data || { key, value };
    }
  } catch (e) { }

  return { key, value };
}

/* CRUD Helpers */
async function insertRow(table, rowData) {
  if (table === 'meta' && rowData && rowData.key && rowData.value !== undefined) {
    return await saveMetaKey(rowData.key, rowData.value);
  }
  if (table === 'links' && rowData && rowData.key && rowData.value !== undefined) {
    return await saveLinkKey(rowData.key, rowData.value);
  }

  // 1. Update local cache
  let list = getLocalCache(table, FALLBACK_DATA[table] || []);
  let insertedItem = { ...rowData };
  if (!insertedItem.id) {
    insertedItem.id = (table.slice(0, 4)) + '-' + Date.now();
  }

  if (Array.isArray(list)) {
    const idx = list.findIndex(item => String(item.id) === String(insertedItem.id));
    if (idx !== -1) {
      list[idx] = { ...list[idx], ...insertedItem };
    } else {
      list.unshift(insertedItem);
    }
    setLocalCache(table, list);
  }

  // 2. Direct Supabase write
  if (supabaseClient) {
    try {
      const { data, error } = await supabaseClient.from(table).insert([rowData]).select();
      if (!error && data && data.length > 0) {
        return data[0];
      }
    } catch (err) {
      console.warn(`[Supabase insertRow warn: ${table}]`, err);
    }
  }

  // 3. Sync to Python backend API
  try {
    const res = await fetch(`/api/data/${table}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(rowData)
    });
    if (res.ok) {
      const json = await res.json();
      if (json.data) return json.data;
    }
  } catch (e) { }

  return insertedItem;
}

async function updateRow(table, id, rowData) {
  let list = getLocalCache(table, FALLBACK_DATA[table] || []);
  if (Array.isArray(list)) {
    const idx = list.findIndex(item => String(item.id) === String(id));
    if (idx !== -1) {
      list[idx] = { ...list[idx], ...rowData };
      setLocalCache(table, list);
    }
  }

  if (supabaseClient) {
    try {
      const { data, error } = await supabaseClient.from(table).update(rowData).eq('id', id).select();
      if (!error && data && data.length > 0) return data[0];
    } catch (e) { }
  }

  try {
    const res = await fetch(`/api/data/${table}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(rowData)
    });
    if (res.ok) {
      const json = await res.json();
      if (json.data) return json.data;
    }
  } catch (e) { }

  return rowData;
}

async function deleteRow(table, id) {
  let list = getLocalCache(table, FALLBACK_DATA[table] || []);
  if (Array.isArray(list)) {
    list = list.filter(item => String(item.id) !== String(id));
    setLocalCache(table, list);
  }

  if (supabaseClient) {
    try {
      await supabaseClient.from(table).delete().eq('id', id);
    } catch (e) { }
  }

  try {
    await fetch(`/api/data/${table}/${id}`, { method: 'DELETE' });
  } catch (e) { }

  return true;
}

async function saveMessage(name, email, message) {
  return await insertRow('messages', {
    name,
    email,
    message,
    received_at: new Date().toISOString()
  });
}
