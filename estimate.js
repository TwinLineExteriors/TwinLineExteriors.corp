(() => {
  'use strict';
  const form = document.getElementById('quoteForm');
  const photos = document.getElementById('photos');
  const list = document.getElementById('photoList');
  const status = document.getElementById('formStatus');
  const button = document.getElementById('sendEstimate');
  let sending = false;
  button.disabled = false;
  const requested = new URLSearchParams(location.search).get('service');
  if ([...form.elements.service.options].some(o => o.value === requested)) form.elements.service.value = requested;
  function validatePhotos() {
    const files = [...photos.files];
    let error = '';
    if (files.length > 5) error = 'Please select no more than 5 photos.';
    else if (files.some(f => !['image/jpeg', 'image/png', 'image/webp'].includes(f.type))) error = 'Please use JPG, PNG or WebP photos.';
    else if (files.reduce((total, f) => total + f.size, 0) > 9 * 1024 * 1024) error = 'Your photos exceed 9 MB. Please select smaller or fewer photos.';
    photos.setCustomValidity(error);
    list.textContent = error || (files.length ? files.map(f => `${f.name} (${(f.size / 1024 / 1024).toFixed(1)} MB)`).join(' · ') : 'No photos selected.');
    return !error;
  }
  photos.addEventListener('change', validatePhotos);
  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (sending || !validatePhotos() || !form.reportValidity()) return;
    if (form.elements._honey.value) return;
    const data = new FormData(form);
    const service = form.elements.service.selectedOptions[0].textContent;
    data.set('service', service);
    data.set('_subject', 'TwinLine estimate request — ' + service);
    data.set('_template', 'table');
    data.set('_captcha', 'false');
    data.set('_url', 'https://twinlinepro.com/free-estimate.html');
    [...photos.files].forEach((file, i) => data.append('attachment' + (i + 1), file, file.name));
    const controls = [...form.querySelectorAll('input, select, textarea, button')];
    sending = true;
    controls.forEach(control => { control.disabled = true; });
    form.setAttribute('aria-busy', 'true');
    button.textContent = 'Sending…';
    status.dataset.state = 'pending';
    status.textContent = 'Sending your request and photos. Please keep this page open.';
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 90000);
    try {
      const response = await fetch('https://formsubmit.co/ajax/' + encodeURIComponent(SITE_CONFIG.email), {
        method: 'POST', body: data, headers: { Accept: 'application/json' }, signal: controller.signal
      });
      const result = await response.json();
      if (!response.ok || ![true, 'true'].includes(result.success) || /activat|confirm.*email/i.test(result.message || '')) throw new Error('Not confirmed');
      status.dataset.state = 'success';
      status.textContent = 'Thank you! Your request has been submitted. TwinLine will contact you using the details you provided.';
      form.reset();
      validatePhotos();
    } catch (error) {
      status.dataset.state = 'error';
      status.textContent = 'We could not confirm your submission. Your information is still here. Please try again later or email us directly with your photos. If you already received a reply from us, no need to resend.';
    } finally {
      clearTimeout(timeout);
      sending = false;
      controls.forEach(control => { control.disabled = false; });
      form.removeAttribute('aria-busy');
      button.textContent = 'Send Request';
      status.focus();
    }
  });
})();
