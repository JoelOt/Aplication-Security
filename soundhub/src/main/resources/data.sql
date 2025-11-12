-- ===== USERS (key = username) =====
-- Admin
INSERT INTO users (name, surname, username, email, dni, age, password, role)
SELECT 'Admin','One','admin1','admin1@example.com','ID-ADM-0001', 34, '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8','REGULAR'
    WHERE NOT EXISTS (SELECT 1 FROM users WHERE username='admin1');

-- Coldplay
INSERT INTO users (name, surname, username, email, dni, age, password, role)
SELECT 'Coldplay','Band','coldplay','coldplay@example.com','ID-CLDP-0002', 26, 'a3f1c4e9b28d7f6a5c0e1d2b3a4f59687c9d0e1f2a3b4c5d6e7f8091a2b3c4d5','ARTIST'
    WHERE NOT EXISTS (SELECT 1 FROM users WHERE username='coldplay');

-- The Beatles
INSERT INTO users (name, surname, username, email, dni, age, password, role)
SELECT 'The Beatles','Band','beatles','beatles@example.com','ID-BTLS-0003', 28, 'c1d2e3f40516273849a5b6c7d8e9f0a1b2c3d4e5f60718293a4b5c6d7e8f9012','ARTIST'
    WHERE NOT EXISTS (SELECT 1 FROM users WHERE username='beatles');

-- Twenty One Pilots
INSERT INTO users (name, surname, username, email, dni, age, password, role)
SELECT 'Twenty One','Pilots','twentyonepilots','twentyonepilots@example.com','ID-TOP-0004', 27, '9f8e7d6c5b4a39281706f5e4d3c2b1a0ffeeddccbbaa99887766554433221100','ARTIST'
    WHERE NOT EXISTS (SELECT 1 FROM users WHERE username='twentyonepilots');

-- Alice
INSERT INTO users (name, surname, username, email, dni, age, password, role)
SELECT 'Alice','Doe','alice_user','alice@example.com','ID-ALC-0005', 22, '8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918','REGULAR'
    WHERE NOT EXISTS (SELECT 1 FROM users WHERE username='alice_user');

-- Bob
INSERT INTO users (name, surname, username, email, dni, age, password, role)
SELECT 'Bob','Doe','bob_user','bob@example.com','ID-BOB-0006', 24, '3c7a3e4b0fd4b9c2a17f861e72fe3a5c5e2d1b4a6978c3d5f0a1b2c3d4e5f607','REGULAR'
    WHERE NOT EXISTS (SELECT 1 FROM users WHERE username='bob_user');

-- ===== AUDIO_POST (key = user_id + title) =====
-- 1) Coldplay - Yellow
INSERT INTO audio_post (user_id, genre, cover_path, audio_path, title, description)
SELECT (SELECT id FROM users WHERE username='coldplay'),
       'Alternative','covers/1.jpg','audio/1.mp3',
       'Yellow','Coldplay single'
    WHERE NOT EXISTS (
  SELECT 1 FROM audio_post
  WHERE user_id=(SELECT id FROM users WHERE username='coldplay') AND title='Yellow'
);

-- 2) Coldplay - Fly O
INSERT INTO audio_post (user_id, genre, cover_path, audio_path, title, description)
SELECT (SELECT id FROM users WHERE username='coldplay'),
       'Alternative','covers/2.jpg','audio/2.mp3',
       'Fly O','Coldplay track'
    WHERE NOT EXISTS (
  SELECT 1 FROM audio_post
  WHERE user_id=(SELECT id FROM users WHERE username='coldplay') AND title='Fly O'
);

-- 3) The Beatles - Here Comes the Sun
INSERT INTO audio_post (user_id, genre, cover_path, audio_path, title, description)
SELECT (SELECT id FROM users WHERE username='beatles'),
       'Rock','covers/3.jpg','audio/3.mp3',
       'Here Comes the Sun','The Beatles classic'
    WHERE NOT EXISTS (
  SELECT 1 FROM audio_post
  WHERE user_id=(SELECT id FROM users WHERE username='beatles') AND title='Here Comes the Sun'
);

-- 4) Twenty One Pilots - Car Radio
INSERT INTO audio_post (user_id, genre, cover_path, audio_path, title, description)
SELECT (SELECT id FROM users WHERE username='twentyonepilots'),
       'Alternative','covers/4.jpg','audio/4.mp3',
       'Car Radio','Twenty One Pilots'
    WHERE NOT EXISTS (
  SELECT 1 FROM audio_post
  WHERE user_id=(SELECT id FROM users WHERE username='twentyonepilots') AND title='Car Radio'
);

-- ===== DOWNLOAD_LOG (idempotent seed) =====
INSERT INTO download_log (user_id, audio_post_id, downloaded_at)
SELECT (SELECT id FROM users WHERE username='alice_user'),
       (SELECT id FROM audio_post WHERE title='Yellow' AND user_id=(SELECT id FROM users WHERE username='coldplay')),
       NOW() - INTERVAL 2 DAY
WHERE NOT EXISTS (
    SELECT 1 FROM download_log dl
    WHERE dl.user_id=(SELECT id FROM users WHERE username='alice_user')
  AND dl.audio_post_id=(SELECT id FROM audio_post WHERE title='Yellow' AND user_id=(SELECT id FROM users WHERE username='coldplay'))
    );

INSERT INTO download_log (user_id, audio_post_id, downloaded_at)
SELECT (SELECT id FROM users WHERE username='bob_user'),
       (SELECT id FROM audio_post WHERE title='Here Comes the Sun' AND user_id=(SELECT id FROM users WHERE username='beatles')),
       NOW() - INTERVAL 1 DAY
WHERE NOT EXISTS (
    SELECT 1 FROM download_log dl
    WHERE dl.user_id=(SELECT id FROM users WHERE username='bob_user')
  AND dl.audio_post_id=(SELECT id FROM audio_post WHERE title='Here Comes the Sun' AND user_id=(SELECT id FROM users WHERE username='beatles'))
    );