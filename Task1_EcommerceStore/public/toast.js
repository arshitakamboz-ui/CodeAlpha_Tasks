(function() {
  const params = new URLSearchParams(window.location.search);
  const added = params.get('added');
  if (added) {
    const toast = document.createElement('div');
    toast.className = 'toast-notification';
    toast.textContent = '✅ ' + decodeURIComponent(added) + ' added to cart!';
    document.body.appendChild(toast);
    setTimeout(() => toast.classList.add('show'), 50);
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    }, 2500);

    params.delete('added');
    const newUrl = window.location.pathname + (params.toString() ? '?' + params.toString() : '');
    window.history.replaceState({}, '', newUrl);
  }
})();