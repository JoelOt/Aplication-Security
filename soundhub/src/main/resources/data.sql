INSERT INTO users (name, surname, username, password, role)
SELECT 'Admin','One','admin1','sha256$alwhp8wucgor9up9w0u5p904umrup094utmp0q9','ADMIN'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE username='admin1');

INSERT INTO users (name, surname, username, password, role)
SELECT 'Ana','García','ana_artist','sha256$k29d8f02nq9s8dzm2p0q9m2p0q9m2p0q9m2p0q9','ARTIST'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE username='ana_artist');

INSERT INTO users (name, surname, username, password, role)
SELECT 'Luis','Ruiz','luis_beats','sha256$88c2a0f3b77c19f2dbb7e22e0099aa3381ff77c','ARTIST'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE username='luis_beats');

INSERT INTO users (name, surname, username, password, role)
SELECT 'Berta','Navarro','berta_user','sha256$1a2b3c4d5e6f7a8b9c0d1122334455667788990','USER'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE username='berta_user');

INSERT INTO users (name, surname, username, password, role)
SELECT 'Mario','Pérez','mario_user','sha256$0f9e8d7c6b5a4a3b2c1d00112233445566778899','USER'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE username='mario_user');

INSERT INTO audio_post (user_id, genre, cover_path, audio_path, title, description)
SELECT  (SELECT id FROM users WHERE username='ana_artist'),
        'Pop','covers/samples/seed1.jpg','audio/samples/seed1.mp3',
        'Luna','Single debut pop alegre'
WHERE NOT EXISTS (
  SELECT 1 FROM audio_post
  WHERE user_id=(SELECT id FROM users WHERE username='ana_artist') AND title='Luna'
);

INSERT INTO audio_post (user_id, genre, cover_path, audio_path, title, description)
SELECT  (SELECT id FROM users WHERE username='ana_artist'),
        'Indie','covers/samples/seed2.jpg','audio/samples/seed2.mp3',
        'Montaña','Indie suave con guitarras'
WHERE NOT EXISTS (
  SELECT 1 FROM audio_post
  WHERE user_id=(SELECT id FROM users WHERE username='ana_artist') AND title='Montaña'
);

INSERT INTO audio_post (user_id, genre, cover_path, audio_path, title, description)
SELECT  (SELECT id FROM users WHERE username='luis_beats'),
        'HipHop','covers/samples/seed3.jpg','audio/samples/seed3.mp3',
        'Bajo 808','Beat oscuro 90 BPM'
WHERE NOT EXISTS (
  SELECT 1 FROM audio_post
  WHERE user_id=(SELECT id FROM users WHERE username='luis_beats') AND title='Bajo 808'
);

INSERT INTO audio_post (user_id, genre, cover_path, audio_path, title, description)
SELECT  (SELECT id FROM users WHERE username='luis_beats'),
        'EDM','covers/samples/seed4.jpg','audio/samples/seed4.mp3',
        'Sunrise','House melódico 124 BPM'
WHERE NOT EXISTS (
  SELECT 1 FROM audio_post
  WHERE user_id=(SELECT id FROM users WHERE username='luis_beats') AND title='Sunrise'
);

INSERT INTO download_log (user_id, audio_post_id, downloaded_at)
SELECT (SELECT id FROM users WHERE username='berta_user'),
       (SELECT id FROM audio_post WHERE title='Luna' AND user_id=(SELECT id FROM users WHERE username='ana_artist')),
       NOW() - INTERVAL 2 DAY
WHERE NOT EXISTS (
  SELECT 1 FROM download_log dl
  WHERE dl.user_id=(SELECT id FROM users WHERE username='berta_user')
    AND dl.audio_post_id=(SELECT id FROM audio_post WHERE title='Luna' AND user_id=(SELECT id FROM users WHERE username='ana_artist'))
);

INSERT INTO download_log (user_id, audio_post_id, downloaded_at)
SELECT (SELECT id FROM users WHERE username='berta_user'),
       (SELECT id FROM audio_post WHERE title='Montaña' AND user_id=(SELECT id FROM users WHERE username='ana_artist')),
       NOW() - INTERVAL 1 DAY
WHERE NOT EXISTS (
  SELECT 1 FROM download_log dl
  WHERE dl.user_id=(SELECT id FROM users WHERE username='berta_user')
    AND dl.audio_post_id=(SELECT id FROM audio_post WHERE title='Montaña' AND user_id=(SELECT id FROM users WHERE username='ana_artist'))
);

INSERT INTO download_log (user_id, audio_post_id, downloaded_at)
SELECT (SELECT id FROM users WHERE username='mario_user'),
       (SELECT id FROM audio_post WHERE title='Bajo 808' AND user_id=(SELECT id FROM users WHERE username='luis_beats')),
       NOW() - INTERVAL 1 DAY
WHERE NOT EXISTS (
  SELECT 1 FROM download_log dl
  WHERE dl.user_id=(SELECT id FROM users WHERE username='mario_user')
    AND dl.audio_post_id=(SELECT id FROM audio_post WHERE title='Bajo 808' AND user_id=(SELECT id FROM users WHERE username='luis_beats'))
);

INSERT INTO download_log (user_id, audio_post_id, downloaded_at)
SELECT (SELECT id FROM users WHERE username='admin1'),
       (SELECT id FROM audio_post WHERE title='Sunrise' AND user_id=(SELECT id FROM users WHERE username='luis_beats')),
       NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM download_log dl
  WHERE dl.user_id=(SELECT id FROM users WHERE username='admin1')
    AND dl.audio_post_id=(SELECT id FROM audio_post WHERE title='Sunrise' AND user_id=(SELECT id FROM users WHERE username='luis_beats'))
);
