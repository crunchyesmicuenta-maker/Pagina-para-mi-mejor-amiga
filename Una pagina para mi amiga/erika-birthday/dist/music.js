(() => {
  const songs = {
    ohayou: {title: 'Ohayou', artist: 'Keno · Hunter × Hunter (1999)', video: 'lH5u3X6Aol4'},
    engel: {title: 'Engel', artist: 'Rammstein', spotify: '4L58FgCh0T0WNG0UIqxK4E'}
  };
  const dialog = document.querySelector('#music-dialog');
  const player = document.querySelector('#music-player');
  let trigger;

  document.querySelectorAll('[data-song]').forEach(button => {
    button.addEventListener('click', () => {
      const song = songs[button.dataset.song];
      if (!song) return;
      trigger = button;
      document.querySelector('#music-title').textContent = song.title;
      document.querySelector('#music-artist').textContent = song.artist;
      const external = document.querySelector('#music-external');
      external.href = song.spotify ? `https://open.spotify.com/track/${song.spotify}` : `https://www.youtube.com/watch?v=${song.video}`;
      external.textContent = song.spotify ? 'Escuchar en Spotify ↗' : 'Escuchar en YouTube ↗';
      document.querySelector('#music-note').textContent = song.spotify
        ? 'Aquí puedes escuchar una muestra. Spotify puede pedirte iniciar sesión para la canción completa.'
        : 'Un ratito para escuchar lo que te encanta ♡';
      const iframe = document.createElement('iframe');
      iframe.title = `Escuchar ${song.title} — ${song.artist}`;
      iframe.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
      iframe.allowFullscreen = true;
      iframe.referrerPolicy = 'strict-origin-when-cross-origin';
      // The player is loaded only after pressing Escuchar. Closing removes it,
      // stopping playback and ensuring two songs can never play together.
      const url = new URL(song.spotify ? `https://open.spotify.com/embed/track/${song.spotify}` : `https://www.youtube-nocookie.com/embed/${song.video}`);
      url.search = new URLSearchParams(song.spotify ? {theme: '0'} : {autoplay: '1', rel: '0', playsinline: '1', origin: location.origin});
      iframe.src = url.href;
      player.classList.toggle('is-spotify', Boolean(song.spotify));
      player.replaceChildren(iframe);
      dialog.showModal();
      document.body.classList.add('music-open');
    });
  });
  document.querySelector('#music-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => {
    const rect = dialog.getBoundingClientRect();
    if (event.target === dialog && (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom)) dialog.close();
  });
  dialog.addEventListener('close', () => {
    player.replaceChildren();
    document.body.classList.remove('music-open');
    trigger?.focus({preventScroll: true});
  });
})();
