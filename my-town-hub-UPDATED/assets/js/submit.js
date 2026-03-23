let lastSubmission = null;

function buildSubmissionPayload() {
  return {
    submittedAt: new Date().toISOString(),
    organization: {
      name: document.getElementById('org-name')?.value.trim() || '',
      category: document.getElementById('org-category')?.value.trim() || '',
      phone: document.getElementById('org-phone')?.value.trim() || '',
      website: document.getElementById('org-website')?.value.trim() || '',
      address: document.getElementById('org-address')?.value.trim() || '',
      hours: document.getElementById('org-hours')?.value.trim() || '',
      serviceArea: document.getElementById('org-area')?.value.trim() || '',
      description: document.getElementById('org-description')?.value.trim() || ''
    },
    submitter: {
      name: document.getElementById('submitter-name')?.value.trim() || '',
      email: document.getElementById('submitter-email')?.value.trim() || '',
      role: document.getElementById('submitter-role')?.value.trim() || ''
    }
  };
}

function saveSubmission(payload) {
  const existing = JSON.parse(localStorage.getItem('clt-submissions') || '[]');
  existing.push(payload);
  localStorage.setItem('clt-submissions', JSON.stringify(existing));
}

function submitForm() {
  let valid = true;

  // Clear previous errors
  ['org-name','org-category','org-phone','submitter-name','org-description'].forEach(id => {
    const err = document.getElementById('err-' + id);
    const el = document.getElementById(id);
    if (err) err.textContent = '';
    if (el) el.classList.remove('input-error');
  });

  // Validate required fields
  const required = [
    { id: 'org-name',        err: 'err-org-name',        msg: 'Organization name is required.' },
    { id: 'org-category',    err: 'err-org-category',    msg: 'Please select a category.' },
    { id: 'org-phone',       err: 'err-org-phone',       msg: 'Phone number is required.' },
    { id: 'submitter-name',  err: 'err-submitter-name',  msg: 'Your name is required.' },
    { id: 'org-description', err: 'err-org-description', msg: 'A description is required.' }
  ];

  required.forEach(f => {
    const el = document.getElementById(f.id);
    const errEl = document.getElementById(f.err);
    if (!el || !el.value.trim()) {
      if (errEl) errEl.textContent = f.msg;
      if (el) el.classList.add('input-error');
      valid = false;
    }
  });

  // Phone format check
  const phone = document.getElementById('org-phone');
  if (phone && phone.value.trim() && !/^[\d\s\(\)\-\+\.]{7,}$/.test(phone.value.trim())) {
    const errPhone = document.getElementById('err-org-phone');
    if (errPhone) errPhone.textContent = 'Please enter a valid phone number.';
    phone.classList.add('input-error');
    valid = false;
  }

  if (!valid) {
    const firstError = document.querySelector('.input-error');
    if (firstError) firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
    return;
  }

  const payload = buildSubmissionPayload();
  saveSubmission(payload);
  lastSubmission = payload;

  // Success
  const form = document.getElementById('submit-form');
  const success = document.getElementById('success-message');
  form.classList.add('hidden');
  success.classList.remove('hidden');
  window.scrollTo({
    top: success.getBoundingClientRect().top + window.scrollY - 120,
    behavior: 'smooth'
  });
}

function downloadLastSubmission() {
  if (!lastSubmission) return;
  const blob = new Blob([JSON.stringify(lastSubmission, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const name = (lastSubmission.organization.name || 'resource-submission')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  a.href = url;
  a.download = `${name || 'resource-submission'}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function resetForm() {
  const form = document.getElementById('submit-form');
  const success = document.getElementById('success-message');
  form.querySelectorAll('input, select, textarea').forEach(el => {
    el.value = '';
    el.classList.remove('input-error');
  });
  form.querySelectorAll('.error-msg').forEach(el => el.textContent = '');
  form.classList.remove('hidden');
  success.classList.add('hidden');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Live validation on blur
document.addEventListener('DOMContentLoaded', function() {
  ['org-name','org-category','org-phone','submitter-name','org-description'].forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    el.addEventListener('blur', function() {
      if (this.value.trim()) {
        this.classList.remove('input-error');
        const err = document.getElementById('err-' + id);
        if (err) err.textContent = '';
      }
    });
  });
});