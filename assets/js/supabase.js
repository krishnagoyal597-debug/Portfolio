/* ====================================================================
   SUPABASE CLIENT & API DATA HELPERS
   ==================================================================== */

const SUPABASE_URL = 'https://your-project.supabase.co';
const SUPABASE_ANON_KEY = 'your_supabase_anon_key';

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
  links: [
    { key: 'github', value: 'https://github.com/krishnagoyal597' },
    { key: 'linkedin', value: 'https://linkedin.com/in/krishnagoyal' },
    { key: 'twitter', value: 'https://twitter.com/krishnagoyal' },
    { key: 'resume_url', value: '#' }
  ],
  meta: [
    { key: 'bio', value: 'I am a first-year B.Tech student at GLA University specializing in Artificial Intelligence and Data Analytics. I enjoy building practical projects, learning new technologies and solving real-world problems through code.' },
    { key: 'tagline', value: 'B.Tech AI & Data Analytics Student @ GLA University' },
    { key: 'resume_summary', value: 'Krishna Goyal — B.Tech AI & Data Analytics Student at GLA University (Class of 2028). Skilled in Python, Machine Learning, Data Analytics, and SQL.' },
    { key: 'profile_photo_url', value: 'assets/images/profile.svg' }
  ],
  messages: []
};

/* Data Retrieval Helpers */
async function fetchProjects() {
  if (supabaseClient) {
    try {
      const { data, error } = await supabaseClient.from('projects').select('*').order('created_at', { ascending: false });
      if (!error && data && data.length > 0) return data;
    } catch (e) {}
  }
  try {
    const res = await fetch('/api/data/projects');
    if (res.ok) {
      const json = await res.json();
      if (json.data) return json.data;
    }
  } catch (e) {}
  return FALLBACK_DATA.projects;
}

async function fetchSkills() {
  if (supabaseClient) {
    try {
      const { data, error } = await supabaseClient.from('skills').select('*').order('category');
      if (!error && data && data.length > 0) return data;
    } catch (e) {}
  }
  try {
    const res = await fetch('/api/data/skills');
    if (res.ok) {
      const json = await res.json();
      if (json.data) return json.data;
    }
  } catch (e) {}
  return FALLBACK_DATA.skills;
}

async function fetchCertifications() {
  if (supabaseClient) {
    try {
      const { data, error } = await supabaseClient.from('certifications').select('*').order('date_earned', { ascending: false });
      if (!error && data) return data;
    } catch (e) {}
  }
  try {
    const res = await fetch('/api/data/certifications');
    if (res.ok) {
      const json = await res.json();
      if (json.data) return json.data;
    }
  } catch (e) {}
  return FALLBACK_DATA.certifications;
}

async function fetchExperience() {
  if (supabaseClient) {
    try {
      const { data, error } = await supabaseClient.from('experience').select('*').order('start_date', { ascending: false });
      if (!error && data && data.length > 0) return data;
    } catch (e) {}
  }
  try {
    const res = await fetch('/api/data/experience');
    if (res.ok) {
      const json = await res.json();
      if (json.data) return json.data;
    }
  } catch (e) {}
  return FALLBACK_DATA.experience;
}

async function fetchAchievements() {
  if (supabaseClient) {
    try {
      const { data, error } = await supabaseClient.from('achievements').select('*').order('date_achieved', { ascending: false });
      if (!error && data && data.length > 0) return data;
    } catch (e) {}
  }
  try {
    const res = await fetch('/api/data/achievements');
    if (res.ok) {
      const json = await res.json();
      if (json.data) return json.data;
    }
  } catch (e) {}
  return FALLBACK_DATA.achievements;
}

async function fetchAcademics() {
  if (supabaseClient) {
    try {
      const { data, error } = await supabaseClient.from('academics').select('*');
      if (!error && data && data.length > 0) return data;
    } catch (e) {}
  }
  try {
    const res = await fetch('/api/data/academics');
    if (res.ok) {
      const json = await res.json();
      if (json.data) return json.data;
    }
  } catch (e) {}
  return FALLBACK_DATA.academics || [];
}

async function fetchLinks() {
  if (supabaseClient) {
    try {
      const { data, error } = await supabaseClient.from('links').select('*');
      if (!error && data && data.length > 0) return data;
    } catch (e) {}
  }
  try {
    const res = await fetch('/api/data/links');
    if (res.ok) {
      const json = await res.json();
      if (json.data) return json.data;
    }
  } catch (e) {}
  return FALLBACK_DATA.links;
}

async function fetchMeta() {
  if (supabaseClient) {
    try {
      const { data, error } = await supabaseClient.from('meta').select('*');
      if (!error && data && data.length > 0) return data;
    } catch (e) {}
  }
  try {
    const res = await fetch('/api/data/meta');
    if (res.ok) {
      const json = await res.json();
      if (json.data) return json.data;
    }
  } catch (e) {}
  return FALLBACK_DATA.meta;
}

async function fetchMessages() {
  if (supabaseClient) {
    try {
      const { data, error } = await supabaseClient.from('messages').select('*').order('received_at', { ascending: false });
      if (!error && data) return data;
    } catch (e) {}
  }
  try {
    const res = await fetch('/api/data/messages');
    if (res.ok) {
      const json = await res.json();
      if (json.data) return json.data;
    }
  } catch (e) {}
  return FALLBACK_DATA.messages;
}

/* CRUD Helpers */
async function insertRow(table, rowData) {
  if (FALLBACK_DATA[table]) {
    const newRow = { id: 'mock-' + Date.now(), ...rowData };
    FALLBACK_DATA[table].push(newRow);
  }
  if (!supabaseClient) {
    try {
      await fetch(`/api/data/${table}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(rowData)
      });
    } catch (e) {}
    return rowData;
  }
  const { data, error } = await supabaseClient.from(table).insert([rowData]).select();
  if (error) throw error;
  try {
    await fetch(`/api/data/${table}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(rowData)
    });
  } catch (e) {}
  return data ? data[0] : rowData;
}

async function updateRow(table, id, rowData) {
  if (FALLBACK_DATA[table]) {
    const idx = FALLBACK_DATA[table].findIndex(item => item.id === id);
    if (idx !== -1) FALLBACK_DATA[table][idx] = { ...FALLBACK_DATA[table][idx], ...rowData };
  }
  if (!supabaseClient) {
    try {
      await fetch(`/api/data/${table}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(rowData)
      });
    } catch (e) {}
    return rowData;
  }
  const { data, error } = await supabaseClient.from(table).update(rowData).eq('id', id).select();
  if (error) throw error;
  try {
    await fetch(`/api/data/${table}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(rowData)
    });
  } catch (e) {}
  return data ? data[0] : rowData;
}

async function deleteRow(table, id) {
  if (FALLBACK_DATA[table]) {
    FALLBACK_DATA[table] = FALLBACK_DATA[table].filter(item => String(item.id) !== String(id));
  }
  try {
    await fetch(`/api/data/${table}/${id}`, { method: 'DELETE' });
  } catch (e) {}

  if (supabaseClient) {
    try {
      await supabaseClient.from(table).delete().eq('id', id);
    } catch (e) {}
  }
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
