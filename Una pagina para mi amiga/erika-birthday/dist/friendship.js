(() => {
  // The offset fixes the start to Paraguay time, wherever the visitor is.
  const start = new Date(document.querySelector('#friendship-start').dateTime).getTime();
  const fields = ['days', 'hours', 'minutes', 'seconds'].map(unit =>
    document.querySelector(`#friendship-${unit}`)
  );

  function updateFriendship() {
    const elapsed = Math.max(0, Math.floor((Date.now() - start) / 1000));
    const values = [
      Math.floor(elapsed / 86400),
      Math.floor(elapsed / 3600) % 24,
      Math.floor(elapsed / 60) % 60,
      elapsed % 60
    ];
    fields.forEach((field, index) => {
      const text = String(values[index]).padStart(2, '0');
      if (field.textContent !== text) field.textContent = text;
    });
  }

  let timer;
  function synchronize() {
    clearInterval(timer);
    updateFriendship();
    if (!document.hidden) timer = setInterval(updateFriendship, 1000);
  }
  document.addEventListener('visibilitychange', synchronize);
  synchronize();
})();
