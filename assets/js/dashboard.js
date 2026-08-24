/* ====================================================================
   MISSION CONTROL — ADMIN DASHBOARD JAVASCRIPT WITH FULL CONTROL & UPLOADS
   ==================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  checkAdminAuth();
});

function checkAdminAuth() {
  const isAuth = sessionStorage.getItem('admin_auth') === 'true';
  const loginScreen = document.getElementById('login-screen');
  const dashboardScreen = document.getElementById('dashboard-screen');

  if (isAuth) {
    if (loginScreen) loginScreen.style.display = 'none';
    if (dashboardScreen) dashboardScreen.style.display = 'flex';
    initDashboard();
  } else {
    if (loginScreen) loginScreen.style.display = 'flex';
    if (dashboardScreen) dashboardScreen.style.display = 'none';
  }
}

function handleAdminLogin(e) {
  e.preventDefault();
  const password = document.getElementById('admin-password').value;
  const statusEl = document.getElementById('login-status');

  if (password === 'admin123' || password === 'krishna') {
    sessionStorage.setItem('admin_auth', 'true');
    checkAdminAuth();
  } else {
    statusEl.textContent = 'Access denied. Invalid password.';
  }
}

function handleAdminLogout() {
  sessionStorage.removeItem('admin_auth');
  checkAdminAuth();
}

let activeTab = 'overview';

async function initDashboard() {
  initTabNavigation();
  loadOverviewTab();
}

function initTabNavigation() {
  const btns = document.querySelectorAll('.sidebar-nav-item button');
  btns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      btns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const tab = btn.getAttribute('data-tab');
      activeTab = tab;
      loadTabContent(tab);
    });
  });
}

async function loadTabContent(tab) {
  const mainContent = document.getElementById('admin-tab-content');
  if (!mainContent) return;

  if (tab === 'overview') {
    await loadOverviewTab();
  } else if (tab === 'profile') {
    await loadProfileTab();
  } else if (tab === 'projects') {
    await loadProjectsTab();
  } else if (tab === 'skills') {
    await loadSkillsTab();
  } else if (tab === 'certifications') {
    await loadCertsTab();
  } else if (tab === 'achievements') {
    await loadAchievementsTab();
  } else if (tab === 'experience') {
    await loadExperienceTab();
  } else if (tab === 'academics') {
    await loadAcademicsTab();
  } else if (tab === 'links') {
    await loadLinksMetaTab();
  } else if (tab === 'messages') {
    await loadMessagesTab();
  }
}

/* ====================================================================
   FILE UPLOAD HELPER (Direct to Supabase Storage Bucket)
   ==================================================================== */
async function uploadImageFile(fileInput, statusId, callback) {
  const file = fileInput.files[0];
  if (!file) return;

  const statusEl = document.getElementById(statusId);
  if (statusEl) statusEl.textContent = '⏳ Uploading file to Supabase Storage...';

  try {
    const res = await uploadToSupabaseStorage(file, file.name);
    if (res && res.success && res.url) {
      if (statusEl) {
        statusEl.textContent = res.source === 'supabase_storage' ? '✓ Uploaded to Supabase Storage!' : '✓ Uploaded successfully!';
      }
      if (callback) callback(res.url);
    } else {
      if (statusEl) statusEl.textContent = '❌ Upload failed: ' + (res.error || 'Unknown error');
    }
  } catch (e) {
    if (statusEl) statusEl.textContent = '❌ Upload error: ' + e.message;
  }
}

/* 1. OVERVIEW TAB */
async function loadOverviewTab() {
  const mainContent = document.getElementById('admin-tab-content');
  const [projects, skills, certs, achs, academics, msgs] = await Promise.all([
    fetchProjects(),
    fetchSkills(),
    fetchCertifications(),
    fetchAchievements(),
    fetchAcademics(),
    fetchMessages()
  ]);

  mainContent.innerHTML = `
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-card-title">Total Projects</div>
        <div class="stat-card-value">${projects.length}</div>
      </div>
      <div class="stat-card">
        <div class="stat-card-title">Total Skills</div>
        <div class="stat-card-value">${skills.length}</div>
      </div>
      <div class="stat-card">
        <div class="stat-card-title">Certifications</div>
        <div class="stat-card-value">${certs.length}</div>
      </div>
      <div class="stat-card">
        <div class="stat-card-title">Achievements</div>
        <div class="stat-card-value">${achs.length}</div>
      </div>
      <div class="stat-card">
        <div class="stat-card-title">Academic Results</div>
        <div class="stat-card-value">${academics.length}</div>
      </div>
      <div class="stat-card">
        <div class="stat-card-title">Messages Received</div>
        <div class="stat-card-value">${msgs.length}</div>
      </div>
    </div>

    <div class="table-card">
      <div style="padding: 18px 24px; border-bottom: 1px solid var(--admin-border); font-weight: 700;">
        Recent Messages (Last 5)
      </div>
      <table class="admin-table">
        <thead>
          <tr>
            <th>Sender</th>
            <th>Email</th>
            <th>Message</th>
            <th>Received At</th>
          </tr>
        </thead>
        <tbody>
          ${msgs.length === 0 ? '<tr><td colspan="4" style="text-align: center; color: var(--admin-text-muted);">No messages received yet.</td></tr>' : 
            msgs.slice(0, 5).map(m => `
              <tr>
                <td><strong>${m.name}</strong></td>
                <td>${m.email}</td>
                <td>${m.message}</td>
                <td>${m.received_at ? new Date(m.received_at).toLocaleDateString() : 'Recent'}</td>
              </tr>
            `).join('')
          }
        </tbody>
      </table>
    </div>
  `;
}

/* 2. PROFILE & BIO TAB */
async function loadProfileTab() {
  const mainContent = document.getElementById('admin-tab-content');
  const [metaList, linksList] = await Promise.all([fetchMeta(), fetchLinks()]);

  const metaMap = {};
  if (Array.isArray(metaList)) {
    metaList.forEach(m => { if (m && m.key) metaMap[m.key] = m.value; });
  } else if (typeof metaList === 'object') {
    Object.assign(metaMap, metaList);
  }

  const linkMap = {};
  if (Array.isArray(linksList)) {
    linksList.forEach(l => { if (l && l.key) linkMap[l.key] = l.value; });
  } else if (typeof linksList === 'object') {
    Object.assign(linkMap, linksList);
  }

  const profilePhoto = metaMap.profile_photo_url || 'assets/images/profile.svg';
  const tagline = metaMap.tagline || 'B.Tech AI & Data Analytics Student @ GLA University';
  const bio = metaMap.bio || '';
  const resumeUrl = linkMap.resume_url || '#';

  mainContent.innerHTML = `
    <h2 style="font-size: 1.25rem; font-weight: 700; margin-bottom: 20px;">Profile Identity & Core Biography</h2>
    
    <div class="profile-meta-card">
      <div class="avatar-manager">
        <img src="${profilePhoto}" alt="Avatar Preview" class="profile-preview-avatar" id="profile-preview-img">
        <div class="avatar-controls">
          <label style="font-weight: 600; font-size: 0.88rem; color: var(--admin-text-main); margin-bottom: 4px; display: block;">
            Profile Photo
          </label>
          <p style="font-size: 0.8rem; color: var(--admin-text-muted); margin-bottom: 12px;">
            Upload your picture. A crop & zoom tool opens to adjust the fit.
          </p>
          <input type="file" id="profile-crop-file-input" accept="image/*" style="display: none;" onchange="handleProfilePhotoSelected(this)">
          <button type="button" class="btn btn-primary" onclick="document.getElementById('profile-crop-file-input').click()" style="font-size: 0.85rem;">
            📷 Choose Photo & Crop...
          </button>
        </div>
      </div>

      <form onsubmit="saveProfileMeta(event)">
        <div class="form-group">
          <label>Profile Photo URL</label>
          <input type="text" id="profile-url-input" class="form-control" value="${profilePhoto}">
        </div>
        <div class="form-group">
          <label>Hero Headline Tagline</label>
          <input type="text" id="prof-tagline" class="form-control" value="${tagline}" required>
        </div>
        <div class="form-group">
          <label>About Me / Bio</label>
          <textarea id="prof-bio" class="form-control" rows="4" required>${bio}</textarea>
        </div>
        <div class="form-group">
          <label>Resume PDF / Drive Link</label>
          <div style="display: flex; gap: 8px;">
            <input type="text" id="prof-resume" class="form-control" value="${resumeUrl}">
            <label class="btn btn-secondary" style="cursor: pointer; white-space: nowrap; margin: 0;">
              📄 Upload PDF
              <input type="file" accept=".pdf" style="display: none;" onchange="uploadResumePDF(this)">
            </label>
          </div>
          <div id="resume-upload-status" style="font-size: 0.8rem; color: var(--admin-primary); margin-top: 4px;"></div>
        </div>
        <button type="submit" class="btn btn-primary" style="margin-top: 10px;">Save Profile Settings →</button>
      </form>
    </div>
  `;
}

/* PROFILE PHOTO CROPPER FLOW */
let cropperInstance = null;

function handleProfilePhotoSelected(input) {
  const file = input.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    openAdminModal('modal-crop-overlay');
    const cropImgTarget = document.getElementById('crop-image-target');
    cropImgTarget.src = e.target.result;

    if (cropperInstance) {
      cropperInstance.destroy();
      cropperInstance = null;
    }

    setTimeout(() => {
      cropperInstance = new Cropper(cropImgTarget, {
        aspectRatio: 1,
        viewMode: 1,
        dragMode: 'move',
        autoCropArea: 0.9,
        restore: false,
        guides: true,
        center: true,
        highlight: false,
        cropBoxMovable: true,
        cropBoxResizable: true,
        toggleDragModeOnDblclick: false
      });
    }, 150);
  };
  reader.readAsDataURL(file);
}

function zoomCrop(ratio) {
  if (cropperInstance) cropperInstance.zoom(ratio);
}

function rotateCrop(deg) {
  if (cropperInstance) cropperInstance.rotate(deg);
}

function resetCrop() {
  if (cropperInstance) cropperInstance.reset();
}

function closeCropModal() {
  if (cropperInstance) {
    cropperInstance.destroy();
    cropperInstance = null;
  }
  closeAdminModal('modal-crop-overlay');
}

async function saveCroppedProfilePhoto() {
  if (!cropperInstance) return;

  const statusEl = document.getElementById('crop-upload-status');
  if (statusEl) statusEl.textContent = '⏳ Processing and uploading photo to Supabase Storage...';

  const canvas = cropperInstance.getCroppedCanvas({
    width: 600,
    height: 600,
    imageSmoothingEnabled: true,
    imageSmoothingQuality: 'high'
  });

  if (!canvas) {
    if (statusEl) statusEl.textContent = '❌ Cropping failed.';
    return;
  }

  try {
    // 1. Convert Canvas to JPEG Blob
    const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.90));
    const filename = `profile_crop_${Date.now()}.jpg`;

    // 2. Upload to Supabase Storage Bucket
    const uploadRes = await uploadToSupabaseStorage(blob, filename);
    const finalUrl = (uploadRes && uploadRes.url) ? uploadRes.url : canvas.toDataURL('image/jpeg', 0.88);

    // 3. Update input field and preview avatar immediately
    const inputUrl = document.getElementById('profile-url-input');
    if (inputUrl) inputUrl.value = finalUrl;
    const prevImg = document.getElementById('profile-preview-img');
    if (prevImg) prevImg.src = finalUrl;

    // 4. Save directly to Supabase meta table
    await saveMetaKey('profile_photo_url', finalUrl);

    if (statusEl) statusEl.textContent = '✓ Saved successfully!';
    closeCropModal();
    alert('✓ Profile photo cropped and uploaded to Supabase Storage!');
    triggerRegenerate();
  } catch (err) {
    console.error('Error saving cropped photo:', err);
    if (statusEl) statusEl.textContent = '❌ Error saving cropped photo: ' + (err.message || 'Unknown error');
  }
}

function uploadResumePDF(input) {
  uploadImageFile(input, 'resume-upload-status', (url) => {
    document.getElementById('prof-resume').value = url;
  });
}

async function saveProfileMeta(e) {
  e.preventDefault();
  const tagline = document.getElementById('prof-tagline').value;
  const bio = document.getElementById('prof-bio').value;
  const profile_photo_url = document.getElementById('profile-url-input').value;
  const resume_url = document.getElementById('prof-resume').value;

  try {
    await saveMetaKey('tagline', tagline);
    await saveMetaKey('bio', bio);
    if (profile_photo_url) {
      await saveMetaKey('profile_photo_url', profile_photo_url);
    }
    if (resume_url) {
      await saveLinkKey('resume_url', resume_url);
    }

    alert('✓ Profile settings saved! Syncing portfolio...');
    triggerRegenerate();
  } catch (err) {
    alert('Save failed: ' + err.message);
  }
}

/* 3. PROJECTS TAB */
async function loadProjectsTab() {
  const mainContent = document.getElementById('admin-tab-content');
  const projects = await fetchProjects();

  mainContent.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
      <h2 style="font-size: 1.25rem; font-weight: 700;">Projects Database</h2>
      <button class="btn btn-primary" onclick="openAddProjectModal()">+ Add Project</button>
    </div>
    <div class="table-card">
      <table class="admin-table">
        <thead>
          <tr>
            <th>Title</th>
            <th>Tech Stack</th>
            <th>GitHub</th>
            <th>Live Demo</th>
            <th>Featured</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          ${projects.map(p => `
            <tr>
              <td><strong>${p.title}</strong></td>
              <td>${(p.tech_stack || []).join(', ')}</td>
              <td>${p.github_url ? `<a href="${p.github_url}" target="_blank" style="color: var(--admin-primary);">GitHub ↗</a>` : 'N/A'}</td>
              <td>${p.live_url ? `<a href="${p.live_url}" target="_blank" style="color: var(--admin-primary);">Demo ↗</a>` : 'N/A'}</td>
              <td>${p.featured ? '<span style="color: var(--admin-primary); font-weight: 700;">Yes</span>' : 'No'}</td>
              <td>
                <button class="btn-sm-action btn-del-sm" onclick="handleDeleteRow('projects', '${p.id}')">Delete</button>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}

/* 4. SKILLS TAB */
async function loadSkillsTab() {
  const mainContent = document.getElementById('admin-tab-content');
  const skills = await fetchSkills();

  mainContent.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
      <h2 style="font-size: 1.25rem; font-weight: 700;">Skills Matrix</h2>
      <button class="btn btn-primary" onclick="openAddSkillModal()">+ Add Skill</button>
    </div>
    <div class="table-card">
      <table class="admin-table">
        <thead>
          <tr>
            <th>Skill Name</th>
            <th>Category</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          ${skills.map(s => `
            <tr>
              <td><strong>${s.name}</strong></td>
              <td>${s.category}</td>
              <td>
                <button class="btn-sm-action btn-del-sm" onclick="handleDeleteRow('skills', '${s.id}')">Delete</button>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}

/* 5. CERTIFICATIONS TAB */
async function loadCertsTab() {
  const mainContent = document.getElementById('admin-tab-content');
  const certs = await fetchCertifications();

  mainContent.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
      <h2 style="font-size: 1.25rem; font-weight: 700;">Certifications</h2>
      <button class="btn btn-primary" onclick="openAddCertModal()">+ Add Certification</button>
    </div>
    <div class="table-card">
      <table class="admin-table">
        <thead>
          <tr>
            <th>Certification Name</th>
            <th>Issuer / Platform</th>
            <th>Date Earned</th>
            <th>Certificate Link</th>
            <th>Image Graphic</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          ${certs.map(c => `
            <tr>
              <td><strong>${c.name}</strong></td>
              <td>${c.platform}</td>
              <td>${c.date_earned}</td>
              <td>${c.certificate_url && c.certificate_url !== '#' ? `<a href="${c.certificate_url}" target="_blank" style="color: var(--admin-primary);">View ↗</a>` : 'N/A'}</td>
              <td>${c.image_url ? `<a href="${c.image_url}" target="_blank" style="color: var(--admin-primary);">Image ↗</a>` : 'N/A'}</td>
              <td>
                <button class="btn-sm-action btn-del-sm" onclick="handleDeleteRow('certifications', '${c.id}')">Delete</button>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}

/* 6. ACHIEVEMENTS & EXTRACURRICULAR ACTIVITIES TAB */
async function loadAchievementsTab() {
  const mainContent = document.getElementById('admin-tab-content');
  const achs = await fetchAchievements();

  mainContent.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
      <h2 style="font-size: 1.25rem; font-weight: 700;">Achievements & Extracurricular Activities</h2>
      <button class="btn btn-primary" onclick="openAddAchievementModal()">+ Add Achievement</button>
    </div>
    <div class="table-card">
      <table class="admin-table">
        <thead>
          <tr>
            <th>Title</th>
            <th>Category</th>
            <th>Date</th>
            <th>Description</th>
            <th>Image</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          ${achs.map(a => `
            <tr>
              <td><strong>${a.title}</strong></td>
              <td>${a.category}</td>
              <td>${a.date_achieved}</td>
              <td>${a.description}</td>
              <td>${a.image_url ? `<a href="${a.image_url}" target="_blank" style="color: var(--admin-primary);">View ↗</a>` : 'N/A'}</td>
              <td>
                <button class="btn-sm-action btn-del-sm" onclick="handleDeleteRow('achievements', '${a.id}')">Delete</button>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}

/* 7. EXPERIENCE TAB */
async function loadExperienceTab() {
  const mainContent = document.getElementById('admin-tab-content');
  const experience = await fetchExperience();

  mainContent.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
      <h2 style="font-size: 1.25rem; font-weight: 700;">Experience Chronicle</h2>
      <button class="btn btn-primary" onclick="openAddExperienceModal()">+ Add Experience</button>
    </div>
    <div class="table-card">
      <table class="admin-table">
        <thead>
          <tr>
            <th>Organization / Company</th>
            <th>Role Title</th>
            <th>Duration</th>
            <th>Bullet Highlights</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          ${experience.map(e => `
            <tr>
              <td><strong>${e.company}</strong></td>
              <td>${e.role}</td>
              <td>${e.start_date} — ${e.end_date || 'Present'}</td>
              <td>${(Array.isArray(e.description) ? e.description : [e.description]).join('; ')}</td>
              <td>
                <button class="btn-sm-action btn-del-sm" onclick="handleDeleteRow('experience', '${e.id}')">Delete</button>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}

/* 8. LINKS & META TAB + STORAGE BUCKET CONFIG */
async function loadLinksMetaTab() {
  const mainContent = document.getElementById('admin-tab-content');
  const [links, meta] = await Promise.all([fetchLinks(), fetchMeta()]);

  const currentBucket = getSupabaseBucketName();

  mainContent.innerHTML = `
    <!-- Storage Bucket Configuration Card -->
    <div class="table-card" style="margin-bottom: 28px; padding: 22px;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
        <h3 style="font-size: 1.15rem; font-weight: 700; color: var(--admin-text-main);">
          🪣 Supabase Storage Bucket Configuration
        </h3>
        <span class="mono-chip" style="color: var(--admin-primary); background: rgba(37,99,235,0.08); font-weight: 700;">Active: ${currentBucket}</span>
      </div>
      <p style="font-size: 0.85rem; color: var(--admin-text-muted); margin-bottom: 16px;">
        Uploaded photos, marksheets, and PDFs will be saved directly to this Supabase Storage bucket. Ensure this bucket is created in your Supabase Dashboard under <strong>Storage &gt; Buckets</strong> with <strong>Public Bucket</strong> enabled.
      </p>
      <div style="display: flex; gap: 10px; align-items: center; max-width: 520px;">
        <input type="text" id="setting-supabase-bucket" class="form-control" value="${currentBucket}" placeholder="e.g. portfolio">
        <button class="btn btn-primary" onclick="updateStorageBucketSetting()" style="white-space: nowrap;">✓ Save Bucket Name</button>
      </div>
      <div id="bucket-setting-status" style="font-size: 0.8rem; color: var(--admin-primary); margin-top: 8px;"></div>
    </div>

    <!-- Links Section -->
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
      <h2 style="font-size: 1.25rem; font-weight: 700;">Links & Social Handles</h2>
      <button class="btn btn-primary" onclick="openAddLinkModal()">+ Add/Update Link</button>
    </div>
    <div class="table-card" style="margin-bottom: 32px;">
      <table class="admin-table">
        <thead>
          <tr>
            <th>Key</th>
            <th>URL Value</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          ${links.map(l => `
            <tr>
              <td><strong>${l.key}</strong></td>
              <td style="max-width: 320px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${l.value}</td>
              <td>
                <button class="btn-sm-action btn-edit-sm" onclick="handleEditLink('${l.key}')">Edit</button>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>

    <!-- Meta Section -->
    <h2 style="font-size: 1.25rem; font-weight: 700; margin-bottom: 16px;">Headline & Bio Settings</h2>
    <div class="table-card">
      <table class="admin-table">
        <thead>
          <tr>
            <th>Key</th>
            <th>Meta Text</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          ${meta.map(m => `
            <tr>
              <td><strong>${m.key}</strong></td>
              <td style="max-width: 380px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                ${m.value && m.value.startsWith('data:image') ? `<span class="mono-chip" style="font-size: 0.75rem;">[Base64 Image Data - ${m.value.length} chars]</span>` : (m.value || '—')}
              </td>
              <td>
                <button class="btn-sm-action btn-edit-sm" onclick="handleEditMeta('${m.key}')">Edit</button>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}

function updateStorageBucketSetting() {
  const input = document.getElementById('setting-supabase-bucket');
  const statusEl = document.getElementById('bucket-setting-status');
  if (!input) return;

  const bucketName = input.value.trim();
  if (!bucketName) {
    alert('Please enter a valid bucket name.');
    return;
  }

  setSupabaseBucketName(bucketName);
  if (statusEl) statusEl.textContent = `✓ Bucket updated to "${bucketName}"! All future uploads will use this bucket.`;
  alert(`✓ Supabase Storage Bucket updated to: ${bucketName}`);
}

window.handleEditLink = function(key) {
  fetchLinks().then(links => {
    let currentVal = '';
    if (Array.isArray(links)) {
      const item = links.find(l => l && l.key === key);
      if (item) currentVal = item.value;
    }
    const newVal = prompt(`Enter new URL for ${key}:`, currentVal);
    if (newVal === null || newVal === currentVal) return;
    saveLinkKey(key, newVal).then(() => {
      alert('✓ Link updated!');
      loadLinksMetaTab();
      triggerRegenerate();
    });
  });
};

window.handleEditMeta = function(key) {
  fetchMeta().then(meta => {
    let currentVal = '';
    if (Array.isArray(meta)) {
      const item = meta.find(m => m && m.key === key);
      if (item) currentVal = item.value;
    }
    const newVal = prompt(`Enter new text for ${key}:`, currentVal);
    if (newVal === null || newVal === currentVal) return;
    saveMetaKey(key, newVal).then(() => {
      alert('✓ Meta updated!');
      loadLinksMetaTab();
      triggerRegenerate();
    });
  });
};

/* 9. MESSAGES TAB */
async function loadMessagesTab() {
  const mainContent = document.getElementById('admin-tab-content');
  const msgs = await fetchMessages();

  mainContent.innerHTML = `
    <h2 style="font-size: 1.25rem; font-weight: 700; margin-bottom: 20px;">Incoming Contacts / Signals</h2>
    <div class="table-card">
      <table class="admin-table">
        <thead>
          <tr>
            <th>Sender Name</th>
            <th>Email</th>
            <th>Message Body</th>
            <th>Received At</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          ${msgs.length === 0 ? '<tr><td colspan="5" style="text-align: center; color: var(--admin-text-muted);">No messages found.</td></tr>' :
            msgs.map(m => `
              <tr>
                <td><strong>${m.name}</strong></td>
                <td><a href="mailto:${m.email}" style="color: var(--admin-primary);">${m.email}</a></td>
                <td>${m.message}</td>
                <td>${m.received_at ? new Date(m.received_at).toLocaleDateString() : 'Recent'}</td>
                <td>
                  <button class="btn-sm-action btn-del-sm" onclick="handleDeleteRow('messages', '${m.id}')">Delete</button>
                </td>
              </tr>
            `).join('')
          }
        </tbody>
      </table>
    </div>
  `;
}

/* MODALS & ADD ACTION HANDLERS WITH COMPUTER FILE SELECTION */
function openAdminModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.classList.add('active');
}

function closeAdminModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.classList.remove('active');
}

function handleModalFileUpload(fileInput, targetInputId, statusId) {
  uploadImageFile(fileInput, statusId, (url) => {
    document.getElementById(targetInputId).value = url;
  });
}

function openAddCertModal() {
  const dateInput = document.getElementById('cert-date');
  if (dateInput) dateInput.value = new Date().toISOString().split('T')[0];
  openAdminModal('modal-cert-overlay');
}

async function submitCertForm(e) {
  e.preventDefault();
  const name = document.getElementById('cert-title').value;
  const platform = document.getElementById('cert-platform').value;
  const date_earned = document.getElementById('cert-date').value;
  const certificate_url = document.getElementById('cert-url').value || '#';
  const image_url = document.getElementById('cert-img-url').value || 'assets/images/cert-ml.svg';

  try {
    await insertRow('certifications', { name, platform, date_earned, certificate_url, image_url });
    alert('✓ Certification added successfully! Syncing portfolio...');
    closeAdminModal('modal-cert-overlay');
    loadCertsTab();
    triggerRegenerate();
  } catch (err) {
    alert('Failed to add certification: ' + err.message);
  }
}

function openAddProjectModal() {
  openAdminModal('modal-project-overlay');
}

async function submitProjectForm(e) {
  e.preventDefault();
  const title = document.getElementById('proj-title').value;
  const description = document.getElementById('proj-desc').value;
  const stackStr = document.getElementById('proj-stack').value;
  const github_url = document.getElementById('proj-github').value;
  const live_url = document.getElementById('proj-demo').value;
  const image_url = document.getElementById('proj-img-url').value || '';
  const featured = document.getElementById('proj-featured').checked;

  const tech_stack = stackStr.split(',').map(s => s.trim()).filter(Boolean);

  try {
    await insertRow('projects', {
      title,
      description,
      tech_stack,
      github_url,
      live_url,
      image_url: image_url || null,
      featured
    });
    alert('✓ Project added successfully! Syncing portfolio...');
    closeAdminModal('modal-project-overlay');
    loadProjectsTab();
    triggerRegenerate();
  } catch (err) {
    alert('Failed to add project: ' + err.message);
  }
}

function openAddAchievementModal() {
  const dateInput = document.getElementById('ach-date');
  if (dateInput) dateInput.value = new Date().toISOString().split('T')[0];
  openAdminModal('modal-achievement-overlay');
}

async function submitAchievementForm(e) {
  e.preventDefault();
  const title = document.getElementById('ach-title').value;
  const category = document.getElementById('ach-category').value;
  const date_achieved = document.getElementById('ach-date').value;
  const description = document.getElementById('ach-desc').value;
  const image_url = document.getElementById('ach-img-url').value || 'assets/images/cert-ml.svg';

  try {
    await insertRow('achievements', {
      title,
      category,
      date_achieved,
      description,
      image_url
    });
    alert('✓ Achievement added successfully! Syncing portfolio...');
    closeAdminModal('modal-achievement-overlay');
    loadAchievementsTab();
    triggerRegenerate();
  } catch (err) {
    alert('Failed to add achievement: ' + err.message);
  }
}

function openAddSkillModal() {
  openAdminModal('modal-skill-overlay');
}

async function submitSkillForm(e) {
  e.preventDefault();
  const name = document.getElementById('skill-name').value;
  const category = document.getElementById('skill-category').value;

  try {
    await insertRow('skills', {
      name,
      category,
      proficiency: 85
    });
    alert('✓ Skill added successfully! Syncing portfolio...');
    closeAdminModal('modal-skill-overlay');
    loadSkillsTab();
    triggerRegenerate();
  } catch (err) {
    alert('Failed to add skill: ' + err.message);
  }
}

function openAddExperienceModal() {
  openAdminModal('modal-experience-overlay');
}

async function submitExperienceForm(e) {
  e.preventDefault();
  const company = document.getElementById('exp-company').value;
  const role = document.getElementById('exp-role').value;
  const start_date = document.getElementById('exp-start').value;
  const end_date = document.getElementById('exp-end').value || null;
  const bullets = document.getElementById('exp-bullets').value;

  const description = bullets ? bullets.split(';').map(b => b.trim()) : [];

  try {
    await insertRow('experience', {
      company,
      role,
      start_date,
      end_date,
      is_current: !end_date,
      description
    });
    alert('✓ Experience role added successfully! Syncing portfolio...');
    closeAdminModal('modal-experience-overlay');
    loadExperienceTab();
    triggerRegenerate();
  } catch (err) {
    alert('Failed to add experience: ' + err.message);
  }
}

async function openAddLinkModal() {
  const key = prompt('Link Key (e.g. resume_url, github, linkedin, twitter):');
  if (!key) return;
  const value = prompt(`Enter URL for ${key}:`);
  if (!value) return;

  try {
    await saveLinkKey(key, value);
    alert('✓ Link updated successfully! Syncing portfolio...');
    loadLinksMetaTab();
    triggerRegenerate();
  } catch (e) {
    alert('Failed to update link: ' + e.message);
  }
}

/* DELETE ACTION */
async function handleDeleteRow(table, id) {
  if (confirm(`Are you sure you want to delete this ${table} entry?`)) {
    try {
      await deleteRow(table, id);
      loadTabContent(activeTab);
      triggerRegenerate();
    } catch (err) {
      alert('Delete failed: ' + err.message);
    }
  }
}

/* ACADEMICS TAB */
async function loadAcademicsTab() {
  const mainContent = document.getElementById('admin-tab-content');
  const academics = await fetchAcademics();

  mainContent.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
      <h2 style="font-size: 1.25rem; font-weight: 700;">Academic Results & Marksheets</h2>
      <button class="btn btn-primary" onclick="openAddAcademicModal()">+ Add Academic Result</button>
    </div>
    <div class="table-card">
      <table class="admin-table">
        <thead>
          <tr>
            <th>Semester / Term</th>
            <th>Program</th>
            <th>SGPA / CGPA</th>
            <th>Percentage</th>
            <th>Key Subjects</th>
            <th>Marksheet</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          ${academics.map(a => `
            <tr>
              <td><strong>${a.semester}</strong></td>
              <td>${a.degree_program || 'B.Tech AI & DA'}</td>
              <td><span class="mono-chip" style="color: var(--admin-primary); font-weight: 700;">${a.sgpa_cgpa}</span></td>
              <td>${a.percentage || '—'}</td>
              <td style="max-width: 260px;">${a.subjects || '—'}</td>
              <td>${a.marksheet_url ? `<a href="${a.marksheet_url}" target="_blank" style="color: var(--admin-primary); font-weight: 600;">View File ↗</a>` : '—'}</td>
              <td>
                <button class="btn-sm-action btn-del-sm" onclick="handleDeleteRow('academics', '${a.id}')">Delete</button>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}

function openAddAcademicModal() {
  openAdminModal('modal-academic-overlay');
}

function uploadAcademicMarksheet() {
  const fileInput = document.getElementById('acad-marksheet-file');
  uploadImageFile(fileInput, 'acad-upload-status', (url) => {
    document.getElementById('acad-marksheet-url').value = url;
  });
}

async function submitAcademicForm(e) {
  e.preventDefault();
  const semester = document.getElementById('acad-semester').value;
  const program = document.getElementById('acad-program').value;
  const score = document.getElementById('acad-score').value;
  const percentage = document.getElementById('acad-percentage').value;
  const year = document.getElementById('acad-year').value;
  const subjects = document.getElementById('acad-subjects').value;
  const marksheetUrl = document.getElementById('acad-marksheet-url').value;

  const newRecord = {
    id: 'acad-' + Date.now(),
    semester: semester,
    degree_program: program,
    sgpa_cgpa: score,
    percentage: percentage,
    session_year: year,
    subjects: subjects,
    marksheet_url: marksheetUrl
  };

  try {
    await insertRow('academics', newRecord);
    closeAdminModal('modal-academic-overlay');
    loadAcademicsTab();
    triggerRegenerate();
  } catch (err) {
    alert('Failed to save academic result: ' + err.message);
  }
}

/* REGENERATE PORTFOLIO BUTTON */
async function triggerRegenerate() {
  const statusEl = document.getElementById('admin-regen-status');
  if (statusEl) statusEl.textContent = '⏳ Syncing live portfolio...';

  try {
    const res = await fetch('/api/regenerate', { method: 'POST' });
    const data = await res.json();
    if (res.ok) {
      if (statusEl) statusEl.textContent = '✓ Portfolio synced successfully!';
    } else {
      if (statusEl) statusEl.textContent = '❌ Sync warning: ' + (data.message || 'Error');
    }
  } catch (e) {
    if (statusEl) statusEl.textContent = '✓ Portfolio synced (Local mode).';
  }
}
