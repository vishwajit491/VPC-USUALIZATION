# vpc-visual

An animated, beginner-friendly diagram that explains an **AWS 3-tier architecture** as a gated housing society owned by a shop owner named Ravi. Click through 9 steps; the diagram grows piece by piece, and every technical term comes with a plain-language analogy. Pure HTML, CSS and JavaScript: no build step, no dependencies.

## Moving objects

| Packet | Meaning |
|---|---|
| ✉️ Envelope | A visitor request |
| 💾 Floppy disk | Data moving web → app → database |
| 🔁 Repeat arrows | Database replication between zones |
| 📦 Package | A software update leaving through the NAT Gateway |
| 😈 Devil | An intruder, stopped by the security layers |
| 🔒 Lock | Office traffic through the VPN tunnel |
| 🤝 Handshake | Traffic across VPC peering to the partner |

## The 9 steps

1. **VPC**: the walled plot of land inside the AWS Cloud.
2. **Availability Zones**: two separate buildings.
3. **Subnets**: public lobbies (gold) and private flats (purple).
4. **Internet Gateway**: the main gate, the Internet, visitors and the route table.
5. **Load balancer**: the receptionist shares visitors between web servers.
6. **App servers and database**: data flows web → app → database, with a live copy in zone B.
7. **NAT Gateway**: a one-way hatch for software updates.
8. **Security**: SG guards, NACL guards and a blocked intruder.
9. **VPN and VPC peering**: the office tunnel and a partner VPC.

## Run locally

```bash
cd vpc-visual
python3 -m http.server 8000
# open http://localhost:8000
```

## Host on GitHub Pages

1. Create a new repository on GitHub and upload all files of this folder (keep `index.html` in the repository root).
2. Go to **Settings > Pages**.
3. Under **Build and deployment**, choose **Deploy from a branch**.
4. Select branch **main** and folder **/ (root)**, then click **Save**.
5. Wait a minute; your site appears at `https://<your-username>.github.io/<repo-name>/`.

## Project structure

```
vpc-visual/
  index.html      page structure only
  css/style.css   page theme (light/dark) and diagram colours
  js/app.js       builds the SVG, holds the step text and caption copy
  .nojekyll       tells GitHub Pages to serve files as they are
  LICENSE         MIT (replace YOUR NAME)
  README.md
```

## Customise

- **Text**: edit the `STEPS` array at the top of `js/app.js` (`t` title, `s` subtitle, `plain`, `tech`, `watch`) and the `LEGEND` array.
- **Colours**: change the CSS variables at the top of `css/style.css` for the page, and the classes under `/* svg */` (`.vpc`, `.pub`, `.prv`, `.sec`, ...) for the diagram.
- **Diagram pieces**: each helper call in `app.js` (`area`, `box`, `wire`, `tag`, `pk`) starts with the step number in which the piece appears.
- **Timing**: auto-play interval is `5000` ms in the `play` function.
