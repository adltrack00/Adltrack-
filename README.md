# Delivery

One live ledger for a delivery company, its vendors and its bike riders, with **ADA**, the AI dispatch assistant.

Vendors hand the company products, each with an exact unit price. The company gives each rider a daily allocation of
units and a list of customers. When a rider confirms a delivery with a photo at the door and the amount collected, the units
move from **left** to **delivered**, and the company, the vendor and the rider all see it at the same moment.
Whether the money the rider collected has reached the company account is checked separately.

The company doesn't type any of that up. It tells ADA what came in ("GlowSkin dropped 40 serums at ₦12,500 each.
Dispatch today's orders.") and ADA adds the stock, matches the open orders, assigns riders by area and remaining
allocation, works out what each rider collects and drafts their messages. Nothing is saved until someone taps
**Approve & send**.

## Accounts and dashboards

Delivery is a normal web app with a landing page, sign up and sign in. Everyone has their own login and lands on their
own dashboard; the phone app is the same app (see `mobile/`).

| Who | How they get in | Their dashboard |
| --- | --- | --- |
| Delivery company | Signs up at `/signup/company`, then a short setup | `/company`: **Today** (what needs you), overview, deliveries, stock, riders, messages with riders and vendors, **Team** (invites and logins) and ADA |
| Vendor | The company adds them under Team and sends an invite code or link (`/join/<code>`) | `/vendor`: their own products, units given / delivered / left, every delivery with time, rider, photo and payment, request deliveries (form or pasted WhatsApp text), messages with the office |
| Rider | Same: invite from the company's Team page | `/rider`: today's drops one at a time, collect at the office, photo + amount to confirm, report a problem, inbox |
| Office teammate | "Invite a teammate" on the Team page | Same as the company |

Sign in is with email or phone number and a password. A forgotten password is reset by sending that person a new
invite (it replaces their old login). The landing page also opens a shared **demo** as company, vendor or rider.

### How the dashboards send and receive information

All three read the same company workspace on the server, each through a filter (`backend/access.py`):

- **Vendor sends** orders and messages. **Gets** each of their drops as it is picked up, delivered (photo, time,
  amount, method) or fails, and when the office verifies the payment.
- **Company sends** stock received, ADA's approved plan (deliveries for each rider), messages, payment verifications.
  **Gets** new vendor orders, every delivery and failure, and messages from riders and vendors.
- **Rider sends** pick-ups, deliveries (photo, amount, method, who received it), problems and messages. **Gets** new
  drops and messages from the office or ADA.

Every change is pushed to every open page at once (Server-Sent Events) and pops up as a live alert, and as a phone
notification when the app is in the background and notifications are on.

A vendor sees only their own products, orders, deliveries and messages; a rider only their own drops and messages.
When a vendor or rider saves, the server accepts only the changes their role allows (a rider can confirm their own
drops but can't change stock, prices or another rider's drops). Delivery photos are stored on the server
(`/api/photos/<id>`) and only people in that company can open them.

### How the numbers work (`frontend/src/delivery/store.js`)

- **Received**: everything a vendor handed over (`intake`).
- **Delivered**: units on deliveries the rider has confirmed (photo, who received it, amount collected). Only then do they leave "left".
- **Payment to verify**: delivered, but the money isn't verified in the company account yet. The office verifies it with one tap. This is money tracking; it doesn't hold units back.
- **With riders**: units on deliveries that are assigned or picked up.
- **Left** = received − delivered. **In warehouse** = left − with riders.
- A delivery that fails goes back to the warehouse count.

## WhatsApp orders (`frontend/src/delivery/intake.js`)

Vendors send orders as WhatsApp messages in many layouts: labelled lines, one line with commas, numbered lists, several
orders at once. Paste the message on "Needs you", in the vendor portal or straight into ADA. Each order is read
(name, phone and a second phone, address, landmark, products with free units, amount to collect, urgent, date and
window) and checked. Nothing is guessed: a missing phone, an address that is really a phone number, an unknown product
or a missing amount keeps the order aside under "Orders to fix" until someone corrects it. A repeat order, a price
different from the list price, or not enough stock is shown as something to check.

## ADA

`frontend/src/delivery/ada.js` understands the usual requests in the browser for free: stock drop-offs with prices,
"dispatch today's orders", one-off deliveries ("Deliver 2 power banks to Ada Eze, 5 Ajao Road, Ikeja by 4pm"),
messages to riders and questions ("How many serums are left?", "Who hasn't paid?", "How is Tunde doing?").

When `REACT_APP_BACKEND_URL` points at the backend, ADA asks Claude instead (`backend/server.py`, structured output)
and falls back to the browser if the server can't answer. Either way the answer is only a draft in names; the browser
matches it to real vendors, products and riders, checks stock and each rider's daily allocation, and shows the plan.

## Run it

```sh
# 1. the server (accounts and data; SQLite in backend/data/ when DATABASE_URL isn't set)
cd backend
pip install -r requirements.txt
export ANTHROPIC_API_KEY=...        # optional; ADA_MODEL defaults to claude-opus-5-5
uvicorn server:app --port 8001

# 2. the web app, in another terminal (calls the server through the dev proxy)
cd frontend
yarn install
REACT_APP_BACKEND_URL=/ yarn start            # http://localhost:3000
```

## What's next

Payment confirmation straight from the bank or POS provider, SMS to customers with a tracking link, password reset
by email, and store releases of the phone app. See [docs/RESEARCH.md](docs/RESEARCH.md) for what the leading
delivery platforms do and what we took from them.

## Hosting on Render

`render.yaml` and `Dockerfile` run the whole app as one Render web service: the Docker build makes the web app,
and the FastAPI server (`backend/server.py`) serves it, the accounts, the data and ADA from the same address.
The Blueprint also creates the Postgres database (`delivery-db`) and passes it to the app as `DATABASE_URL`.

1. In Render: **New > Blueprint**, connect this repository and pick the branch.
2. When asked, paste an `ANTHROPIC_API_KEY` (optional: without it ADA uses the simpler assistant built into the app).
3. **Apply**. Open `https://<service>.onrender.com`, sign up your company, add riders and vendors under **Team** and
   send them their invites.

Tables (created on first start): `workspace` (one row per company), `users`, `sessions`, `invites`, `photos`.
The demo uses workspace 1, so data from before accounts existed becomes the demo.


## WhatsApp

ADA talks to riders and vendors on WhatsApp (backend/whatsapp.py, wa_providers.py; company page "WhatsApp").

- Riders get each new batch with Accept / Can't take it, then reply COLLECTED, ARRIVED, DELIVERED 25000 CASH, PROBLEM,
  NEXT, EARNINGS, PAID IN. ARRIVED answers with a one-tap link that signs them in and opens the photo and payment step.
  A photo sent on WhatsApp is attached to the drop. Pidgin works for the common replies; with ANTHROPIC_API_KEY set,
  ADA uses Claude for anything the rules don't catch.
- Vendors send orders (any layout) or stock ("Sending 40 serum"), and ask BALANCE or TODAY. They hear when a drop is
  delivered or failed, when stock is counted in, and when a payout is made.
- Everything the office sends in the app also goes to WhatsApp. Staff can Step in on a chat; ADA goes quiet there.
- Without credentials the app uses a test line: nothing leaves the server and the phone simulator shows each chat.

Connect a real number (Meta Cloud API): verify a WhatsApp Business number in Meta Business Manager, set WHATSAPP_TOKEN,
WHATSAPP_PHONE_NUMBER_ID, WHATSAPP_VERIFY_TOKEN, WHATSAPP_APP_SECRET and WHATSAPP_DISPLAY_NUMBER, and point the webhook
at `https://<your site>/api/whatsapp/webhook` (fields: messages). Create an approved template named `ada_update`
(language en) with one body field, e.g. "Delivery update from ADA: {{1}}": WhatsApp only lets a business start a chat,
or write after 24 hours of silence, with a template. Twilio works too: TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN,
TWILIO_WHATSAPP_FROM (and TWILIO_CONTENT_SID for the template), webhook `https://<your site>/api/whatsapp/twilio`.
Riders and vendors are matched by the phone number on their profile.

### ADA understands, reads pictures, calls and joins groups

- **Claude reads every message** (backend/brain.py) when ANTHROPIC_API_KEY is set, with the last 8 lines of that
  person's chat and what ADA knows right now (their drops, orders, cash). Follow-ups work ("and the one for Bola?",
  "she don collect am"), and questions get answered from the workspace ("what's the next address?"). Anything that
  changes stock, money or deliveries still goes through the usual steps, with Approve first for the office. Without
  the key the word rules read messages as before.
- **Pictures**: a rider's transfer receipt is recorded as PAID IN with the reference, the receipt kept and the amount
  checked against the cash they hold; a receipt sent by the office finds whose cash it is and asks to verify; a
  handwritten or screenshotted order list (from a vendor or the office) is typed out and read in as orders; a customer's
  photo of a damaged item goes into their problem report. Same ANTHROPIC_API_KEY.
- **Phone calls** (backend/calls.py, Twilio Voice): "CALL TUNDE: are you taking the drops?" (approved first), or ADA
  rings a rider who still hasn't answered new drops (setting "ADA phones riders who don't answer"). What they say is
  acted on like a WhatsApp message and the answer is spoken; the office gets a summary when the call ends. Set
  TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_VOICE_FROM and point the number's incoming-call webhook at
  `https://<your site>/api/voice/incoming`. Without them calls are simulated in the phone simulator (📞 button).
- **Team groups** (backend/groups.py, Meta Groups API): "make a team group" (approved first) creates a WhatsApp group
  and sends the invite link. In the group ADA answers messages that start with "ADA", as whoever wrote them, and the
  office can "tell the group: ...". Needs the official business account (blue tick) and allows up to 8 people;
  subscribe the webhook to the group_lifecycle_update field too.

Tests: `for t in test_brain test_customers test_office test_whatsapp test_api test_intake; do python3 backend/tests/$t.py; done`
