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
    // Native multipart POST uses FormSubmit's documented file-upload endpoint.
    // A same-origin receipt inside the frame confirms completion without leaving this page.
    const frame = document.getElementById('submissionFrame');
    const token = crypto.randomUUID();
    const postForm = document.createElement('form');
    postForm.method = 'POST';
    postForm.enctype = 'multipart/form-data';
    postForm.action = 'https://formsubmit.co/' + encodeURIComponent(SITE_CONFIG.email);
    postForm.target = frame.name;
    postForm.hidden = true;
    data.set('_next', location.origin + '/estimate-received.html#' + token);
    for (const [key, value] of data) {
      const input = document.createElement('input');
      input.name = key;
      if (value instanceof File) {
        input.type = 'file';
        const transfer = new DataTransfer();
        transfer.items.add(value);
        input.files = transfer.files;
      } else {
        input.type = 'hidden';
        input.value = value;
      }
      postForm.append(input);
    }
    document.body.append(postForm);
    frame.hidden = false;
    status.textContent = 'Sending your request. Please keep this page open.';
    let timeout;
    function finish(success) {
      clearTimeout(timeout);
      window.removeEventListener('message', onReceipt);
      postForm.remove();
      sending = false;
      controls.forEach(control => { control.disabled = false; });
      form.removeAttribute('aria-busy');
      button.textContent = 'Send Request';
      status.dataset.state = success ? 'success' : 'error';
      if (success) {
        frame.hidden = true;
        status.textContent = 'Thank you! Your request has been submitted. TwinLine will contact you using the details you provided.';
        form.reset();
        validatePhotos();
      } else {
        status.textContent = 'We could not confirm your submission. Your information is still here. Please check the message above, or email info@twinlinepro.com with your photos. Do not resend if you already received a reply.';
      }
      status.focus();
    }
    function onReceipt(event) {
      if (event.origin === location.origin && event.source === frame.contentWindow &&
          event.data?.type === 'twinline-estimate-received' && event.data.token === token) finish(true);
    }
    window.addEventListener('message', onReceipt);
    timeout = setTimeout(() => finish(false), 90000);
    try { postForm.submit(); } catch { finish(false); }
  });
})();
