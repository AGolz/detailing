/* Deliberately offline. Future networking belongs in a server-only adapter. */
window.FORM_INTEGRATIONS = Object.freeze({
  mode: 'demo',
  async submit() { return { mode: 'demo', sent: false }; },
  track(name, properties = {}) {
    const allowed = ['cta_click', 'goal_select', 'gallery_filter', 'form_step', 'demo_request_complete'];
    if (!allowed.includes(name)) return;
    // Explicit allowlist: never names, phones, comments, models, filenames or photos.
    const safe = {};
    for (const key of ['step', 'option', 'source', 'category']) {
      if (typeof properties[key] === 'number') safe[key] = properties[key];
      else if (typeof properties[key] === 'string' && /^[a-z0-9_-]{1,30}$/.test(properties[key])) safe[key] = properties[key];
    }
    window.dispatchEvent(new CustomEvent('form:analytics', { detail: { name, properties: safe, demo: true } }));
  }
});
