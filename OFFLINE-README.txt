AURELIA — running it offline, free, forever
===========================================

WHY IT ASKED FOR INTERNET
-------------------------
Adding a page to the iOS home screen does NOT save the page. Safari just saves
a bookmark, so every launch re-downloads it from GitHub Pages — and with no
signal you get the "no internet" screen. The fix is a service worker: a small
file that tells Safari to keep a copy on the phone. That is what sw.js does.

WHAT TO UPLOAD TO GITHUB PAGES
------------------------------
Put all of these in the same folder (the repo root, or /docs — whichever your
Pages site serves):

    index.html              <- the app
    sw.js                   <- the offline cache
    manifest.webmanifest    <- name, colours, icons
    icon-192.png
    icon-512.png
    icon-180.png            <- the iOS home-screen icon

That is the whole thing. No build step, no npm, no server code, no account.

THEN, ON THE iPHONE
-------------------
1. Open your Pages URL in SAFARI (not Chrome — only Safari can install to the
   home screen on iOS).
2. Let it load fully once, WITH signal. That first load is what fills the cache.
3. Share button -> "Add to Home Screen".
4. Turn on Airplane Mode and open it from the icon. It should start normally.

If it still asks for internet: you probably added it to the home screen before
the first successful load, or before sw.js was uploaded. Delete the icon, open
the URL in Safari again, wait for it to finish, then re-add it.

WHEN YOU UPLOAD A NEW VERSION
-----------------------------
Upload index.html AND sw.js together, and bump the version line in sw.js:

    const CACHE="aurelia-v3";   ->   const CACHE="aurelia-v4";

From this version on, the app checks the network first (with a 2.5 second
timeout) before falling back to its stored copy, so a new upload is picked up
as soon as you open it with a signal — you should not get stuck on an old
build again. If you ever suspect you are:

    Settings -> Data -> "Clear cache and reload"

That deletes the stored copy, unregisters the worker and fetches everything
fresh. Your solves are untouched. The same panel shows the Build date, so you
can confirm which version the phone is actually running.

IF THE SOUND EVER MISBEHAVES
----------------------------
The speaker button in the top bar is a hard master switch — it mutes music,
ambience, cues and the metronome, and suspends the audio engine entirely.
Keyboard shortcut: M. It works no matter what else is going on.

NO GITHUB AT ALL?
-----------------
The app is one self-contained file. You can also:
  - Save index.html into the iOS Files app and open it from there in Safari.
    Works with no signal. (iOS will not let you add a file:// page to the home
    screen, so there is no icon — that limitation is Apple's, not the app's.)
  - Email it to yourself and open the attachment.
  - Put it on any static host: Netlify Drop, Cloudflare Pages, a USB stick.

A NOTE ON THE FONT
------------------
The page links one optional webfont. Offline it simply does not load and the
app falls back to your system serif — everything still works, it just looks
very slightly different. Nothing else in the app touches the network. No
tracking, no analytics, no accounts, no server. Your solves live only on your
device.

BACKING UP YOUR SOLVES
----------------------
Settings -> Data -> "Export everything" writes a .json you can keep anywhere.
"Import a backup" reads it back. Do this before clearing Safari data — the
browser can evict app storage if the phone runs short on space.
