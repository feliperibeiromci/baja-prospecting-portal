
(() => {
  const form = document.getElementById('researchForm');
  const button = document.getElementById('submitButton');
  const result = document.getElementById('submissionResult');
  const fields = [1, 2, 3].map(i => ({ key: `icp${i}_count`, input: document.getElementById(`icp${i}Count`) }));
  fields.forEach(({ input }, index) => {
    const i = index + 1;
    const update = delta => {
      const current = Number(input.value);
      input.value = String(Math.min(5, Math.max(0, (Number.isInteger(current) ? current : 0) + delta)));
    };
    document.getElementById(`decrease${i}`).addEventListener('click', () => update(-1));
    document.getElementById(`increase${i}`).addEventListener('click', () => update(1));
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

    const counts = Object.fromEntries(fields.map(({ key, input }) => [key, Number(input.value)]));
    const total = Object.values(counts).reduce((sum, count) => sum + count, 0);
    if (fields.some(({ key, input }) => input.value.trim() === '' || !Number.isInteger(counts[key]) || counts[key] < 0 || counts[key] > 5) || total === 0) {
      feedback('Choose a whole number from 0 to 5 for each ICP, with at least one company in total.', 'error');
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
        body: JSON.stringify(counts)
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok || data.status !== 'accepted') {
        throw new Error(
          data.error || data.message ||
          'The research request could not be accepted.'
        );
      }

      feedback(
        `Research started! ICP 1: ${counts.icp1_count}, ICP 2: ${counts.icp2_count}, ICP 3: ${counts.icp3_count} — up to ${total} companies. Duplicate checks and qualification may reduce the final results. Check HubSpot for progress.`,
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
