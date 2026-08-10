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

/* FILE UPLOD HELPER */
async function uploadImageFile(fileInput, statusId, callback) {
  const file = fileInput.files[0];
  if (!file) return;

  const statusEl = document.getElementById(statusId);
  if (statusEl) statusEl.textContent = '⏳ Uploading image/file...';

  const formData = new FormData();
  formData.append('file', file);

  try {
    const res = await fetch('/api/upload', {
      method: 'POST',
      body: formData
    });
    const data = await res.json();
    if (res.ok && data.url) {
      if (statusEl) statusEl.textContent = '✓ Uploaded successfully!';
      if (callback) callback(data.url);
    } else {
      if (statusEl) statusEl.textContent = '❌ Upload failed: ' + (data.message || 'Error');
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
  metaList.forEach(m => metaMap[m.key] = m.value);
  const linkMap = {};
  linksList.forEach(l => linkMap[l.key] = l.value);

  const profilePhoto = metaMap.profile_photo_url || 'assets/images/profile.svg';
  const tagline = metaMap.tagline || 'B.Tech AI & Data Analytics Student @ GLA University';
  const bio = metaMap.bio || '';
  const resumeUrl = linkMap.resume_url || '#';

  mainContent.innerHTML = `
    <h2 style="font-size: 1.25rem; font-weight: 700; margin-bottom: 20px;">Profile Photo, Bio & Resume Settings</h2>

    <div style="display: grid; grid-template-columns: 280px 1fr; gap: 32px; align-items: start;">
      
      <!-- PROFILE PHOTO CARD -->
      <div class="table-card" style="padding: 24px; text-align: center;">
        <div style="font-weight: 700; margin-bottom: 16px;">Profile Photo</div>
        <div style="width: 140px; height: 140px; border-radius: 50%; overflow: hidden; margin: 0 auto 16px auto; border: 3px solid var(--admin-primary);">
          <img id="profile-preview-img" src="${profilePhoto}" style="width: 100%; height: 100%; object-fit: cover;">
        </div>

        <div class="form-group" style="text-align: left; margin-bottom: 12px;">
          <label style="font-size: 0.8rem;">Upload Image File:</label>
          <input type="file" id="profile-file-input" class="form-control" onchange="uploadProfilePhoto(this)">
        </div>

        <div class="form-group" style="text-align: left;">
          <label style="font-size: 0.8rem;">Image URL:</label>
          <input type="text" id="profile-url-input" class="form-control" value="${profilePhoto}">
        </div>

        <div id="profile-upload-status" style="font-size: 0.8rem; color: var(--admin-primary); margin-top: 8px;"></div>
      </div>

      <!-- BIO & METADATA FORM -->
      <div class="table-card" style="padding: 28px;">
        <form onsubmit="saveProfileMeta(event)">
          <div class="form-group">
            <label for="prof-tagline">Headline / Tagline</label>
            <input type="text" id="prof-tagline" class="form-control" value="${tagline}" required>
          </div>

          <div class="form-group">
            <label for="prof-bio">About Me (Bio Paragraph)</label>
            <textarea id="prof-bio" class="form-control" rows="5" required>${bio}</textarea>
          </div>

          <div class="form-group">
            <label for="prof-resume">Resume PDF Link or File Upload</label>
            <div style="display: flex; gap: 12px;">
              <input type="text" id="prof-resume" class="form-control" value="${resumeUrl}">
              <input type="file" class="form-control" style="width: 220px;" onchange="uploadResumePDF(this)">
            </div>
            <div id="resume-upload-status" style="font-size: 0.8rem; color: var(--admin-primary); margin-top: 4px;"></div>
          </div>

          <button type="submit" class="btn btn-primary" style="margin-top: 16px;">Save Profile Settings →</button>
        </form>
      </div>

    </div>
  `;
}

/* PROFILE PHOTO CROPPER & ADJUSTMENT CONTROLS */
let cropperInstance = null;
let rawProfileFile = null;

function uploadProfilePhoto(input) {
  const file = input.files[0];
  if (!file) return;

  rawProfileFile = file;
  const reader = new FileReader();
  reader.onload = function(e) {
    const cropImgTarget = document.getElementById('crop-image-target');
    if (!cropImgTarget) return;

    cropImgTarget.src = e.target.result;
    openAdminModal('modal-crop-overlay');

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
  if (statusEl) statusEl.textContent = '⏳ Processing and uploading cropped profile photo...';

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

  canvas.toBlob(async (blob) => {
    if (!blob) return;

    const formData = new FormData();
    const filename = rawProfileFile ? rawProfileFile.name : 'profile_photo.jpg';
    formData.append('file', blob, `profile_crop_${filename}`);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();

      if (res.ok && data.url) {
        if (statusEl) statusEl.textContent = '✓ Uploaded successfully!';
        
        // Update input field and preview avatar
        const inputUrl = document.getElementById('profile-url-input');
        if (inputUrl) inputUrl.value = data.url;
        const prevImg = document.getElementById('profile-preview-img');
        if (prevImg) prevImg.src = data.url;

        // Auto save to database
        await insertRow('meta', { key: 'profile_photo_url', value: data.url });

        closeCropModal();
        alert('✓ Profile photo cropped and set successfully! Syncing portfolio...');
        triggerRegenerate();
      } else {
        if (statusEl) statusEl.textContent = '❌ Upload error: ' + (data.message || 'Error');
      }
    } catch (err) {
      if (statusEl) statusEl.textContent = '❌ Error saving cropped photo: ' + err.message;
    }
  }, 'image/jpeg', 0.92);
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
    await insertRow('meta', { key: 'tagline', value: tagline });
    await insertRow('meta', { key: 'bio', value: bio });
    await insertRow('meta', { key: 'profile_photo_url', value: profile_photo_url });
    await insertRow('links', { key: 'resume_url', value: resume_url });

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

/* 8. LINKS & META TAB */
async function loadLinksMetaTab() {
  const mainContent = document.getElementById('admin-tab-content');
  const [links, meta] = await Promise.all([fetchLinks(), fetchMeta()]);

  mainContent.innerHTML = `
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
              <td>${l.value}</td>
              <td>
                <button class="btn-sm-action btn-edit-sm" onclick="editLinkValue('${l.key}', '${l.value}')">Edit</button>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>

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
              <td>${m.value}</td>
              <td>
                <button class="btn-sm-action btn-edit-sm" onclick="editMetaValue('${m.key}', '${m.value.replace(/'/g, "\\'")}')">Edit</button>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}

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
  const techStr = document.getElementById('proj-stack').value;
  const github_url = document.getElementById('proj-github').value || 'https://github.com/krishnagoyal597';
  const live_url = document.getElementById('proj-demo').value || 'https://demo.example.com';
  const image_url = document.getElementById('proj-img-url').value || '';
  const featured = document.getElementById('proj-featured').checked;

  const tech_stack = techStr ? techStr.split(',').map(t => t.trim()) : ['Python'];

  try {
    await insertRow('projects', {
      title,
      description,
      tech_stack,
      github_url,
      live_url,
      image_url,
      featured,
      created_at: new Date().toISOString()
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
  const description = document.getElementById('ach-desc').value || '';
  const image_url = document.getElementById('ach-img-url').value || 'assets/images/cert-ml.svg';

  try {
    await insertRow('achievements', { title, category, date_achieved, description, image_url });
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
    await insertRow('skills', { name, category, proficiency: 90 });
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
    await insertRow('links', { key, value });
    alert('✓ Link updated successfully! Syncing portfolio...');
    loadLinksMetaTab();
    triggerRegenerate();
  } catch (e) {
    alert('Failed to update link: ' + e.message);
  }
}

async function editLinkValue(key, currentVal) {
  const newVal = prompt(`Enter new URL for ${key}:`, currentVal);
  if (!newVal || newVal === currentVal) return;

  try {
    await insertRow('links', { key, value: newVal });
    alert('✓ Link updated! Syncing portfolio...');
    loadLinksMetaTab();
    triggerRegenerate();
  } catch (e) {
    alert('Update failed: ' + e.message);
  }
}

async function editMetaValue(key, currentVal) {
  const newVal = prompt(`Enter new text for ${key}:`, currentVal);
  if (!newVal || newVal === currentVal) return;

  try {
    await insertRow('meta', { key, value: newVal });
    alert('✓ Meta updated! Syncing portfolio...');
    loadLinksMetaTab();
    triggerRegenerate();
  } catch (e) {
    alert('Update failed: ' + e.message);
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
