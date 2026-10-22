
(() => {
  const count = document.getElementById('companyCount');
  const form = document.getElementById('researchForm');
  const button = document.getElementById('submitButton');
  const result = document.getElementById('submissionResult');

  const min = 1;
  const max = 8;

  // Company counter
  function clamp(n) {
    return Math.min(max, Math.max(min, n));
  }

  function updateCount(n) {
    count.value = String(clamp(n));
  }

  document.getElementById('decrease').addEventListener('click', () => {
    updateCount((Number(count.value) || min) - 1);
  });

  document.getElementById('increase').addEventListener('click', () => {
    updateCount((Number(count.value) || min) + 1);
  });

  count.addEventListener('change', () => {
    const value = Number(count.value);

    if (count.value.trim() !== '' && Number.isInteger(value)) {
      updateCount(value);
    }
  });

  // Feedback messages
  function feedback(message, kind) {
    result.textContent = message;
    result.className = `submission-result ${kind}`;
    result.hidden = false;
  }

  // Start prospecting
  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const companyCount = Number(count.value);

    if (
      count.value.trim() === '' ||
      !Number.isInteger(companyCount) ||
      companyCount < min ||
      companyCount > max
    ) {
      feedback(
        'Please choose a whole number between 1 and 8.',
        'error'
      );
      return;
    }

    button.disabled = true;
    button.firstChild.textContent = 'Starting research… ';
    result.hidden = true;

    try {
      const response = await fetch('/api/prospect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          company_count: companyCount
        })
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok || data.status !== 'accepted') {
        throw new Error(
          data.error || data.message ||
          'The research request could not be accepted.'
        );
      }

      feedback(
        `Research started successfully! Up to ${companyCount} companies will be researched. Check Hubspot for progress. It will take 5 minutes.`,
        'success'
      );

    } catch (error) {
      feedback(
        error.message || 'Could not reach the research workflow.',
        'error'
      );

    } finally {
      button.disabled = false;
      button.firstChild.textContent = 'Start research ';
    }
  });

  // Sidebar navigation
  const navLinks = document.querySelectorAll('.nav-link');

  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      navLinks.forEach(n => n.classList.remove('active'));
      link.classList.add('active');
    });
  });
})();
