# World Domination Duel — Arcade Fighter

A browser-based, local two-player parody fighting game with arcade-inspired mechanics.

## Play
Open `index.html` in a modern desktop browser, or serve the folder locally:

```bash
python -m http.server 8000
```

Then visit `http://localhost:8000`.

## Controls

| Action | Player 1 | Player 2 |
|---|---|---|
| Move | A / D | Left / Right arrows |
| Jump | W | Up arrow |
| Crouch | S | Down arrow |
| Guard | R | Right Shift |
| Jab | F | J |
| Heavy attack | G | K |
| Special | H | L |

Special moves consume 40 super meter. Hold guard to block; crouch to duck under high jabs. Heavy attacks are slower but hit harder. Land consecutive hits to build combos. First to two rounds wins the match. Touch controls are shown on smaller screens.

## Netlify
This is a static site: no build command, backend, API key, or environment variables are needed. Import the GitHub repository into Netlify with production branch `main`, blank build command, and publish directory `.`.

## Disclaimer
Fighters and catchlines are fictional comedic parodies. They are not actual quotes, endorsements, or representations of any person's real actions.