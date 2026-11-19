# World Domination Duel — Arcade Fighter

A browser-based, local two-player arcade fighting game starring fictionalized parody fighters inspired by public figures. The combat uses familiar 2D fighting-game concepts: footsies, guarding, attack startup/active/recovery, hit-stun, knockback, meter, specials, combos and best-of-three rounds.

## Play locally
Open `index.html` in a modern browser, or serve the folder:
```bash
python -m http.server 8000
```
Then visit `http://localhost:8000`.

## Controls

| Action | Player 1 | Player 2 |
|---|---|---|
| Move | A / D | Left / Right |
| Jump | W | Up |
| Crouch | S | Down |
| Block | Q | I |
| Light attack | F | J |
| Heavy attack | G | K |
| Special | H | L |

Special moves cost 50 meter. Build meter by landing hits or guarding. Heavy attacks hit harder but have more recovery; a blocked or missed heavy can be punished. Land a hit and cancel into another move to extend a combo. Low attacks are best guarded while crouching.

## Match
- Local two-player versus.
- First to two round wins takes the match.
- 99-second rounds; the higher remaining health wins on timeout.
- Three arenas: Emergency Summit, Neon Capital and Orbital Boardroom.
- Mobile touch controls are included.

## Deploy to Netlify
This is a static site; no build command, server, API keys or environment variables are needed.
1. In Netlify, choose **Add new site → Import an existing project**.
2. Connect this GitHub repository.
3. Production branch: `main`.
4. Build command: leave blank.
5. Publish directory: `.`.

## Notes
All character names, appearances, catchlines and descriptions are fictionalized parody. They are not real quotes, endorsements or claims. The game uses original canvas-drawn characters and does not use official portraits or logos.
