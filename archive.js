// ===== ARCHIVE WITH PASSWORD =====
// Archive of registrations and test results

const ARCHIVE_PASSWORD = 'tatiana_archive_2024_LBg_makaka_9f3a7c2e8d1b5a4c6';
const API_BASE_URL = 'https://tatiana-server-production.up.railway.app/api/archive';

// Initialize on page load
document.addEventListener('DOMContentLoaded', initArchive);

function initArchive() {
  createArchiveButton();
  createArchiveModal();
}

function createArchiveButton() {
  const archiveBtn = document.createElement('button');
  archiveBtn.id = 'archive-btn';
  archiveBtn.innerHTML = '\ud83d\udcc4';
  archiveBtn.style.cssText = `
    position: fixed;
    bottom: 10px;
    left: 10px;
    width: 45px;
    height: 45px;
    border-radius: 50%;
    background: rgba(139, 67, 82, 0.3);
    border: 2px solid rgba(139, 67, 82, 0.5);
    color: rgba(139, 67, 82, 0.7);
    cursor: pointer;
    opacity: 0.35;
    transition: all 0.3s ease;
    z-index: 999;
    font-size: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
  `;

  archiveBtn.onmouseover = () => {
    archiveBtn.style.opacity = '0.7';
    archiveBtn.style.background = 'rgba(139, 67, 82, 0.6)';
  };

  archiveBtn.onmouseout = () => {
    archiveBtn.style.opacity = '0.35';
    archiveBtn.style.background = 'rgba(139, 67, 82, 0.3)';
  };

  archiveBtn.onclick = openArchiveModal;
  document.body.appendChild(archiveBtn);
}

function createArchiveModal() {
  const modal = document.createElement('div');
  modal.id = 'archive-modal';
  modal.style.cssText = `
    display: none;
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.7);
    z-index: 10000;
    align-items: center;
    justify-content: center;
  `;

  modal.innerHTML = `
    <div style="background: white; border-radius: 20px; padding: 2rem; max-width: 900px; width: 90%; max-height: 80vh; overflow-y: auto; box-shadow: 0 10px 40px rgba(0,0,0,0.3);">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
        <h2 style="color: #8B4352; margin: 0;">\ud83d\udcc4 Archive</h2>
        <button id="archive-close-btn" style="background: none; border: none; font-size: 28px; cursor: pointer; color: #999;">×</button>
      </div>

      <!-- Login Form -->
      <div id="archive-login">
        <p style="color: #666; margin-bottom: 1rem;">Enter password to access archive</p>
        <div style="margin-bottom: 1rem;">
          <input type="password" id="archive-password" placeholder="Password" style="width: 100%; padding: 12px; border: 2px solid #ddd; border-radius: 8px; font-size: 16px; box-sizing: border-box;">
        </div>
        <button id="archive-login-btn" style="width: 100%; padding: 12px; background: linear-gradient(135deg, #D46A6A, #8B6B9E); color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600; font-size: 16px;">Enter Archive</button>
        <div id="archive-error" style="color: #e74c3c; margin-top: 1rem; display: none;">Invalid password!</div>
      </div>

      <!-- Archive Content -->
      <div id="archive-content" style="display: none;">
        <div style="display: flex; justify-content: space-between; margin-bottom: 1.5rem; flex-wrap: wrap; gap: 10px;">
          <div style="display: flex; gap: 10px;">
            <input type="text" id="archive-search" placeholder="\ud83d\udd0d Search by name..." style="padding: 10px; border: 2px solid #ddd; border-radius: 8px; width: 250px; box-sizing: border-box;">
            <select id="archive-filter" style="padding: 10px; border: 2px solid #ddd; border-radius: 8px;">
              <option value="">All libido levels</option>
              <option value="Low">Low libido</option>
              <option value="Medium">Medium libido</option>
              <option value="High">High libido</option>
              <option value="Very high">Very high libido</option>
            </select>
          </div>
          <button id="archive-logout-btn" style="padding: 10px 20px; background: #e74c3c; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;">Exit</button>
        </div>

        <div id="archive-loading" style="display: none; text-align: center; padding: 2rem;">
          <p>Loading data...</p>
        </div>

        <div id="archive-table-container" style="overflow-x: auto;">
          <table id="archive-table" style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="background: #f5f5f5; border-bottom: 2px solid #ddd;">
                <th style="padding: 12px; text-align: left; color: #333; font-weight: 600;">Name</th>
                <th style="padding: 12px; text-align: left; color: #333; font-weight: 600;">Age</th>
                <th style="padding: 12px; text-align: left; color: #333; font-weight: 600;">Phone</th>
                <th style="padding: 12px; text-align: left; color: #333; font-weight: 600;">Telegram</th>
                <th style="padding: 12px; text-align: left; color: #333; font-weight: 600;">Libido Level</th>
                <th style="padding: 12px; text-align: center; color: #333; font-weight: 600;">Score</th>
                <th style="padding: 12px; text-align: center; color: #333; font-weight: 600;">Date</th>
              </tr>
            </thead>
            <tbody id="archive-table-body">
              <tr><td colspan="7" style="padding: 2rem; text-align: center; color: #999;">No records</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  // Event handlers
  document.getElementById('archive-login-btn').onclick = handleArchiveLogin;
  document.getElementById('archive-logout-btn').onclick = handleArchiveLogout;
  document.getElementById('archive-close-btn').onclick = closeArchiveModal;
  document.getElementById('archive-password').onkeypress = (e) => {
    if (e.key === 'Enter') handleArchiveLogin();
  };

  // Search and filter
  document.getElementById('archive-search').onkeyup = filterArchiveTable;
  document.getElementById('archive-filter').onchange = filterArchiveTable;

  modal.onclick = (e) => {
    if (e.target === modal) closeArchiveModal();
  };
}

function openArchiveModal() {
  document.getElementById('archive-modal').style.display = 'flex';
  document.getElementById('archive-password').focus();
}

function closeArchiveModal() {
  document.getElementById('archive-modal').style.display = 'none';
  document.getElementById('archive-password').value = '';
  document.getElementById('archive-error').style.display = 'none';
  document.getElementById('archive-login').style.display = 'block';
  document.getElementById('archive-content').style.display = 'none';
}

function handleArchiveLogin() {
  const password = document.getElementById('archive-password').value;

  if (password === ARCHIVE_PASSWORD) {
    document.getElementById('archive-error').style.display = 'none';
    document.getElementById('archive-login').style.display = 'none';
    document.getElementById('archive-content').style.display = 'block';
    loadArchiveData();
  } else {
    document.getElementById('archive-error').style.display = 'block';
    document.getElementById('archive-password').value = '';
  }
}

function handleArchiveLogout() {
  closeArchiveModal();
}

async function loadArchiveData() {
  const loading = document.getElementById('archive-loading');
  loading.style.display = 'block';

  try {
    const response = await fetch(`${API_BASE_URL}/archive`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${ARCHIVE_PASSWORD}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status}`);
    }

    const data = await response.json();
    window.archiveData = data.records || [];
    populateArchiveTable(window.archiveData);
  } catch (error) {
    console.error('Error loading archive:', error);
    document.getElementById('archive-table-body').innerHTML = 
      `<tr><td colspan="7" style="padding: 2rem; text-align: center; color: #e74c3c;">Error: ${error.message}</td></tr>`;
  } finally {
    loading.style.display = 'none';
  }
}

function populateArchiveTable(records) {
  const tbody = document.getElementById('archive-table-body');

  if (!records || records.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" style="padding: 2rem; text-align: center; color: #999;">No records</td></tr>';
    return;
  }

  tbody.innerHTML = records.map((record, idx) => `
    <tr style="border-bottom: 1px solid #eee; ${idx % 2 === 0 ? 'background: #f9f9f9;' : ''}">
      <td style="padding: 12px; color: #333;">${record.fio || 'N/A'}</td>
      <td style="padding: 12px; color: #666;">${record.age || 'N/A'}</td>
      <td style="padding: 12px; color: #666;">${record.phone || 'N/A'}</td>
      <td style="padding: 12px; color: #666;">${record.telegram || 'N/A'}</td>
      <td style="padding: 12px;">
        <span style="display: inline-block; padding: 6px 12px; border-radius: 20px; font-size: 13px; font-weight: 600;
          ${record.level?.includes('Low') ? 'background: #ffebee; color: #c62828;' : ''}
          ${record.level?.includes('Medium') ? 'background: #fff3e0; color: #ef6c00;' : ''}
          ${record.level?.includes('High') && !record.level?.includes('Very') ? 'background: #e8f5e9; color: #2e7d32;' : ''}
          ${record.level?.includes('Very') ? 'background: #f3e5f5; color: #7b1fa2;' : ''}
        ">${record.level || 'N/A'}</span>
      </td>
      <td style="padding: 12px; text-align: center; color: #333; font-weight: 600;">${record.score || '-'}</td>
      <td style="padding: 12px; text-align: center; color: #999; font-size: 13px;">${new Date(record.date).toLocaleDateString('en-US')}</td>
    </tr>
  `).join('');
}

function filterArchiveTable() {
  const search = document.getElementById('archive-search').value.toLowerCase();
  const filter = document.getElementById('archive-filter').value;
  const tbody = document.getElementById('archive-table-body');

  if (!window.archiveData) return;

  const filtered = window.archiveData.filter(record => {
    const matchSearch = !search || record.fio.toLowerCase().includes(search);
    const matchFilter = !filter || record.level?.includes(filter);
    return matchSearch && matchFilter;
  });

  if (filtered.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" style="padding: 2rem; text-align: center; color: #999;">No matches found</td></tr>';
  } else {
    populateArchiveTable(filtered);
  }
}

// Export for use in main script
window.ArchiveSystem = {
  openArchive: openArchiveModal,
  closeArchive: closeArchiveModal,
  loadData: loadArchiveData
};
