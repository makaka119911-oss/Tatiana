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
  archiveBtn.innerHTML = '📄';
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
        <h2 style="color: #8B4352; margin: 0;">📄 Archive</h2>
        <button id="archive-close-btn" style="background: none; border: none; font-size: 28px; cursor: pointer; color: #999;">×</button>
      </div>

      <!-- Login Form -->
      <div id="archive-login">
        <p style="color: #666; margin-bottom: 1rem;">Enter password to access archive</p>
        <input type="password" id="archive-password" placeholder="Enter password" style="width: 100%; padding: 10px; margin-bottom: 10px; border: 1px solid #ddd; border-radius: 5px;">
        <button id="archive-submit-btn" style="width: 100%; padding: 10px; background: #8B4352; color: white; border: none; border-radius: 5px; cursor: pointer; font-size: 16px;">Access Archive</button>
        <div id="archive-error" style="color: red; margin-top: 10px; display: none;"></div>
      </div>

      <!-- Archive Table -->
      <div id="archive-content" style="display: none;">
        <div style="margin-bottom: 1rem;">
          <input type="text" id="archive-search" placeholder="Search..." style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 5px; margin-bottom: 10px;">
          <button id="archive-export-btn" style="padding: 8px 16px; background: #8B4352; color: white; border: none; border-radius: 5px; cursor: pointer;">📥 Export CSV</button>
        </div>
        <div style="overflow-x: auto;">
          <table id="archive-table" style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="background: #f5f5f5;">
                <th style="padding: 12px; text-align: left; border-bottom: 1px solid #ddd;">ID</th>
                <th style="padding: 12px; text-align: left; border-bottom: 1px solid #ddd;">Name</th>
                <th style="padding: 12px; text-align: left; border-bottom: 1px solid #ddd;">Score</th>
                <th style="padding: 12px; text-align: left; border-bottom: 1px solid #ddd;">Level</th>
                <th style="padding: 12px; text-align: left; border-bottom: 1px solid #ddd;">Date</th>
              </tr>
            </thead>
            <tbody id="archive-tbody"></tbody>
          </table>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  // Event listeners
  document.getElementById('archive-close-btn').onclick = closeArchiveModal;
  document.getElementById('archive-submit-btn').onclick = submitArchivePassword;
  document.getElementById('archive-password').onkeypress = (e) => {
    if (e.key === 'Enter') submitArchivePassword();
  };
}

function openArchiveModal() {
  const modal = document.getElementById('archive-modal');
  modal.style.display = 'flex';
}

function closeArchiveModal() {
  const modal = document.getElementById('archive-modal');
  modal.style.display = 'none';
  document.getElementById('archive-login').style.display = 'block';
  document.getElementById('archive-content').style.display = 'none';
  document.getElementById('archive-password').value = '';
  document.getElementById('archive-error').style.display = 'none';
}

async function submitArchivePassword() {
  const password = document.getElementById('archive-password').value;
  const errorDiv = document.getElementById('archive-error');
  errorDiv.style.display = 'none';

  if (!password) {
    errorDiv.textContent = 'Please enter a password';
    errorDiv.style.display = 'block';
    return;
  }

  try {
    console.log('Sending password to:', API_BASE_URL);
    console.log('Headers being sent:', {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${password}`,
      'X-Requested-With': 'XMLHttpRequest'
    });

    const response = await fetch(API_BASE_URL, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${password}`,
        'X-Requested-With': 'XMLHttpRequest'
      }
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', {
      'Content-Type': response.headers.get('Content-Type'),
      'Content-Length': response.headers.get('Content-Length')
    });

    if (!response.ok) {
      console.error('Response error:', response.status, response.statusText);
      const errorText = await response.text();
      console.error('Error body:', errorText);
      
      if (response.status === 401) {
        errorDiv.textContent = 'Invalid password';
      } else if (response.status === 403) {
        errorDiv.textContent = 'Access forbidden';
      } else {
        errorDiv.textContent = `Error: ${response.status} ${response.statusText}`;
      }
      errorDiv.style.display = 'block';
      return;
    }

    const data = await response.json();
    console.log('Received data:', data);

    displayArchiveData(data);
    document.getElementById('archive-login').style.display = 'none';
    document.getElementById('archive-content').style.display = 'block';

  } catch (error) {
    console.error('Fetch error:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    errorDiv.textContent = `Error: ${error.message}`;
    errorDiv.style.display = 'block';
  }
}

function displayArchiveData(data) {
  const tbody = document.getElementById('archive-tbody');
  tbody.innerHTML = '';

  if (!data || data.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" style="padding: 20px; text-align: center; color: #999;">No data available</td></tr>';
    return;
  }

  data.forEach((item, index) => {
    const row = document.createElement('tr');
    if (index % 2 === 0) {
      row.style.background = '#f9f9f9';
    }
    row.style.borderBottom = '1px solid #eee';
    row.innerHTML = `
      <td style="padding: 12px; border-bottom: 1px solid #eee;">${item.id || index + 1}</td>
      <td style="padding: 12px; border-bottom: 1px solid #eee;">${item.name || 'N/A'}</td>
      <td style="padding: 12px; border-bottom: 1px solid #eee;">${item.score || 'N/A'}</td>
      <td style="padding: 12px; border-bottom: 1px solid #eee;">${item.level || 'N/A'}</td>
      <td style="padding: 12px; border-bottom: 1px solid #eee;">${new Date(item.date).toLocaleDateString() || 'N/A'}</td>
    `;
    tbody.appendChild(row);
  });
}

// Search functionality
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    const searchInput = document.getElementById('archive-search');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        const rows = document.querySelectorAll('#archive-tbody tr');
        rows.forEach(row => {
          const text = row.textContent.toLowerCase();
          row.style.display = text.includes(searchTerm) ? '' : 'none';
        });
      });
    }
  }, 100);
});

// CSV Export functionality
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    const exportBtn = document.getElementById('archive-export-btn');
    if (exportBtn) {
      exportBtn.addEventListener('click', () => {
        const table = document.getElementById('archive-table');
        let csv = '';
        const rows = table.querySelectorAll('tr');
        rows.forEach(row => {
          const cells = row.querySelectorAll('td, th');
          const rowData = Array.from(cells).map(cell => `"${cell.textContent.trim()}"`).join(',');
          csv += rowData + '\n';
        });

        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `archive_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
      });
    }
  }, 100);
});
