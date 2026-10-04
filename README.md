# Liverr

A Fiverr-style freelance marketplace built with the **MERN** stack (MongoDB, Express, React, Node).
Buyers find gigs, order a package, pay with Razorpay, chat with the seller, request revisions and leave reviews. Sellers publish gigs, deliver work and track earnings.

## Features

| Area | What you get |
|---|---|
| **Auth** | Email OTP signup, login (JWT), forgot/reset password via OTP, buyer and seller roles, "Become a seller" |
| **Gigs** | Create / edit / pause / delete, 3 packages (Basic, Standard, Premium), cover image, tags |
| **Browse** | Category pages, search, price + delivery filters, sorting, pagination |
| **Orders** | Full lifecycle with role-based rules: awaiting payment → in progress → delivered → revision / completed (or cancelled) |
| **Payments** | Razorpay checkout with server-side signature verification tied to the exact order. Built-in **test mode** when keys are dummy |
| **Messaging** | Buyer ↔ seller chat with unread badges (auto-refreshes every few seconds) |
| **Reviews** | One review per completed order, only by the buyer; gig and seller ratings update automatically |
| **Dashboards** | Seller earnings (net of a 20% fee), active orders, seller level. Buyer spending and orders |
| **Extras** | Saved gigs (favourites), public profiles, profile editing with avatar, 404 page |

## Tech stack

- **Frontend:** React 18, Vite, Tailwind CSS, React Router, Axios
- **Backend:** Node.js (18+), Express, Mongoose, JWT, bcrypt, helmet, rate limiting
- **Database:** MongoDB (local or Atlas)
- **Email:** Resend (HTTP API) or SMTP
- **Payments:** Razorpay (INR)

## Project structure

```
Liverr/
├── client/                 React app (deploy to Vercel)
│   ├── src/pages/          Home, Gigs, GigDetail, Orders, Inbox, Dashboard ...
│   ├── src/components/     Navbar, Footer, GigCard, OTPInput ...
│   └── vercel.json         SPA rewrite so page refreshes work
├── server/                 Express API (deploy to Render)
│   ├── controllers/  models/  routes/  middleware/  utils/
│   ├── seed.js             demo data
│   ├── .env.example        copy to .env
│   └── index.js
├── render.yaml             optional Render blueprint
└── package.json            root scripts (run both apps together)
```

---

## Run locally

### Prerequisites
- **Node.js 18 or newer** (`node -v`)
- **MongoDB**: either installed locally (`mongodb://127.0.0.1:27017`) or a free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster

### Steps

```bash
# 1. install everything (root + server + client)
npm run install:all

# 2. create your env file
cp server/.env.example server/.env
#    then edit server/.env  (at minimum set MONGO_URI and JWT_SECRET)

# 3. (optional) load demo users and gigs
npm run seed

# 4. start API (port 5000) and website (port 5173) together
npm run dev
```

Open **http://localhost:5173**.

> Prefer two terminals? `cd server && npm run dev` and `cd client && npm run dev`.

### Demo accounts (after `npm run seed`)
Password for all: `Password@123`

| Role | Email |
|---|---|
| Seller | `aarav@liverr.test`, `priya@liverr.test`, `rohan@liverr.test` |
| Buyer | `buyer@liverr.test`, `neha@liverr.test` |

### Local dev behaviour (no real keys needed)
- **OTP / email:** with no email provider configured, the OTP is printed in the server console and (because `ALLOW_DEV_OTP=true`) shown on the signup page.
- **Payments:** with dummy Razorpay keys, checkout shows a **"Simulate payment"** button. The order moves to *in progress* exactly as a real payment would.
- To test real emails or payments, add real values to `server/.env` and restart the server. No code change needed.

### Try the full flow
1. Sign in as `buyer@liverr.test`, open a gig, pick a package, **Continue**, then **Simulate payment**.
2. Sign out, sign in as that gig's seller (e.g. `aarav@liverr.test`), open **Orders**, then **Deliver work** with a note.
3. Back as the buyer: **Accept & complete**, then **Leave a review**.

---

## Environment variables (`server/.env`)

**Never commit `.env`.** It is listed in `.gitignore`. Only `.env.example` (no secrets) is committed.

| Variable | Required | Description |
|---|---|---|
| `MONGO_URI` | yes | MongoDB connection string |
| `JWT_SECRET` | yes | Long random string. Generate: `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"` |
| `CLIENT_URL` | yes | Frontend URL(s) allowed by CORS, comma separated, no trailing slash |
| `PORT` | no | Defaults to 5000 (Render sets this itself) |
| `NODE_ENV` | no | `development` locally, `production` on Render |
| `RESEND_API_KEY`, `EMAIL_FROM` | for email | Email via Resend (works on Render free tier) |
| `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_USER`, `EMAIL_PASS` | for email | Alternative: SMTP (e.g. Gmail app password). Best for local use |
| `ALLOW_DEV_OTP` | no | `true` shows the OTP on screen when no email provider is set. **Demo only** |
| `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET` | for real payments | From the Razorpay dashboard (use *test* keys first) |
| `ALLOW_MOCK_PAYMENTS` | no | `true` allows the fake payment button on a production server. **Demo only** |

**Client** (`client/.env`, only needed for production builds): `VITE_API_URL=https://<your-render-app>.onrender.com/api`

---

## Push to GitHub safely

Use the **git command line** (it respects `.gitignore`). Do **not** drag-and-drop folders into the GitHub website, because that ignores `.gitignore` and can upload `server/.env`.

```bash
# In your existing repo folder: remove the old files, copy the new project in (keep the .git folder)
git rm -r --cached . -q            # forget old tracked files
# ...copy the new Liverr files here...
git add -A
git status                         # CHECK: server/.env must NOT appear in this list
git commit -m "Liverr: complete marketplace rebuild"
git push origin main
```

Check with `git ls-files | grep .env` — only `server/.env.example` and `client/.env.example` should appear.

### If a real `.env` was pushed before
Deleting the file does **not** remove it from git history, and anyone can still find it. Do this:
1. **Rotate every secret that was in it** (this is the important step): MongoDB password, `JWT_SECRET`, email password / API key, Razorpay keys.
2. Optionally purge history with [git-filter-repo](https://github.com/newren/git-filter-repo) (`git filter-repo --path server/.env --invert-paths`), then force-push.

---

## Deploy for free: MongoDB Atlas + Render + Vercel

Do it in this order (each step needs the URL from the previous one).

### 1) Database: MongoDB Atlas
1. Create a free **M0** cluster at [mongodb.com/atlas](https://www.mongodb.com/atlas).
2. **Database Access:** create a user + password.
3. **Network Access:** add `0.0.0.0/0` (Render's IPs change on the free plan).
4. **Connect → Drivers:** copy the URI and put your database name in it:
   `mongodb+srv://USER:PASSWORD@cluster0.xxxxx.mongodb.net/liverr?retryWrites=true&w=majority`

(Optional) seed it once from your computer: put the Atlas URI in `server/.env`, run `npm run seed`, then switch `.env` back.

### 2) Backend: Render
1. Push your repo to GitHub.
2. On [render.com](https://render.com): **New → Web Service** → pick the repo.
3. Settings:
   - **Root Directory:** `server`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Instance type:** Free
   - **Health Check Path:** `/api/health`
4. **Environment** → add the variables:

   | Key | Value |
   |---|---|
   | `NODE_ENV` | `production` |
   | `MONGO_URI` | your Atlas URI |
   | `JWT_SECRET` | a new long random string (not your local one) |
   | `CLIENT_URL` | *(set after step 3)* your Vercel URL |
   | `RESEND_API_KEY` / `EMAIL_FROM` | see the email note below |
   | `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` | real *test* keys, or leave dummy and set `ALLOW_MOCK_PAYMENTS=true` for a demo |

5. Deploy and copy the URL, e.g. `https://liverr-api.onrender.com`. Visiting `/api/health` should show `{"success":true,"status":"ok"}`.

(`render.yaml` in the repo root can create this service for you via **New → Blueprint**.)

### 3) Frontend: Vercel
1. On [vercel.com](https://vercel.com): **Add New → Project** → import the repo.
2. Settings:
   - **Root Directory:** `client`
   - **Framework Preset:** Vite (build `npm run build`, output `dist`)
3. **Environment Variables:** `VITE_API_URL` = `https://liverr-api.onrender.com/api` (your Render URL + `/api`).
4. Deploy and copy your URL, e.g. `https://liverr.vercel.app`.

### 4) Connect them
Go back to Render → **Environment** → set `CLIENT_URL` to your Vercel URL (no trailing slash) → it redeploys. CORS now allows your site.
If you change `VITE_API_URL` later, **redeploy** the Vercel project (Vite bakes it in at build time).

### Production notes
- **Cold starts:** Render's free service sleeps after ~15 minutes idle; the first request afterwards can take ~30-60 seconds. This is normal on the free tier.
- **Email on Render free:** Render's free tier has restricted outbound SMTP, so use the **Resend** HTTP API (`RESEND_API_KEY`). Without a verified domain, Resend only delivers to your own account email (fine for testing; verify a domain to email anyone). Check Render's current policy if SMTP matters to you.
- **Demo without email:** set `ALLOW_DEV_OTP=true` and the OTP appears on the signup page. Anyone can then register with any email, so turn it off for a real launch.
- **Real payments:** use Razorpay *test* keys first, then live keys once your Razorpay account is activated. Remove `ALLOW_MOCK_PAYMENTS`.
- **Images** are stored in MongoDB (resized in the browser), because free hosts wipe local disks. Fine for a demo; use S3/Cloudinary for heavy traffic.

---

## API overview

| Prefix | Routes |
|---|---|
| `/api/auth` | `POST send-otp, verify-otp, register, login, forgot-password, reset-password` · `GET me` |
| `/api/gigs` | `GET /` (filters: `search, category, min, max, delivery, sort, page`) · `GET /:id` · `GET /my-gigs` · `POST /` · `PUT /:id` · `DELETE /:id` |
| `/api/orders` | `POST /` · `GET /buyer, /seller, /:id` · `PUT /:id/status` |
| `/api/payments` | `POST create-order, verify` · `GET history` |
| `/api/reviews` | `POST /` · `GET /gig/:gigId` |
| `/api/users` | `GET /:id` · `PUT profile/update, become-seller` · `GET me/stats, favorites/list` · `POST favorites/:gigId` |
| `/api/messages` | `GET conversations, unread, /:convId` · `POST conversations, /:convId` |

## Troubleshooting

| Problem | Fix |
|---|---|
| `MongoDB connection failed` | Start local MongoDB, or check the Atlas URI, password (URL-encode special characters) and Network Access |
| Blank site / "Network Error" on Vercel | `VITE_API_URL` missing or wrong (must end in `/api`). Redeploy after changing it |
| `CORS: origin ... not allowed` | `CLIENT_URL` on Render must exactly match your Vercel URL (no trailing slash) |
| Page 404s on refresh (Vercel) | Make sure `client/vercel.json` is committed and Root Directory is `client` |
| OTP never arrives | Local: read the server console. Production: set `RESEND_API_KEY`, or `ALLOW_DEV_OTP=true` for a demo |
| "Payments are not configured" | Add real Razorpay keys, or set `ALLOW_MOCK_PAYMENTS=true` for a demo |
| Port 5000 busy (macOS) | Change `PORT` in `server/.env` and the proxy target in `client/vite.config.js` |

## License
MIT. Free to use and modify.
