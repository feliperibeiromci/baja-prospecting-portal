(() => {
  const count = document.getElementById('companyCount');
  const form = document.getElementById('researchForm');
  const button = document.getElementById('submitButton');
  const result = document.getElementById('submissionResult');
  const min = 1, max = 3;

  function clamp(n) { return Math.min(max, Math.max(min, n)); }
  function updateCount(n) { count.value = String(clamp(n)); }

  document.getElementById('decrease').addEventListener('click', () => updateCount((Number(count.value) || min) - 1));
  document.getElementById('increase').addEventListener('click', () => updateCount((Number(count.value) || min) + 1));
  count.addEventListener('change', () => {
    if (Number.isInteger(Number(count.value))) updateCount(Number(count.value));
  });

  function feedback(message, kind) {
    result.textContent = message;
    result.className = `submission-result ${kind}`;
    result.hidden = false;
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const companyCount = Number(count.value);
    if (!Number.isInteger(companyCount) || companyCount < min || companyCount > max) {
      feedback('Please choose a whole number between 1 and 3.', 'error');
      return;
    }
    button.disabled = true;
    button.firstChild.textContent = 'Submitting research… ';
    result.hidden = true;
    try {
      const response = await fetch('/api/research', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({company_count: companyCount})
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data.ok) throw new Error(data.error || 'The request could not be accepted.');
      feedback(data.message || 'Request accepted. Check n8n executions for progress.', 'success');
    } catch (error) {
      feedback(error.message || 'Could not reach the research workflow.', 'error');
    } finally {
      button.disabled = false;
      button.firstChild.textContent = 'Start research ';
    }
  });

  const navLinks = document.querySelectorAll('.nav-link');
  navLinks.forEach(link => link.addEventListener('click', () => {
    navLinks.forEach(n => n.classList.remove('active'));
    link.classList.add('active');
  }));
})();
