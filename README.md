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

## Three dashboards, same data

| Dashboard | URL | What it shows |
| --- | --- | --- |
| Company | `#/company` | Vendors, riders, units received / delivered & paid / left / with riders / awaiting payment, live activity with photos, deliveries, open orders, stock received, rider messages, ADA |
| Vendor portal | `#/vendor/<vendor id>` | The vendor's own products and money, every delivery with time, rider, photo and payment, and a form to request deliveries |
| Rider app | `#/rider/<rider id>` | On/off duty, today's drops in order, allocation used, call and directions, photo + payment to confirm a drop, "couldn't deliver" reasons, inbox from dispatch and ADA |

Open them in separate tabs: a change in one shows in the others straight away.

### How the numbers work (`frontend/src/delivery/store.js`)

- **Received**: everything a vendor handed over (`intake`).
- **Delivered**: units on deliveries the rider has confirmed (photo, who received it, amount collected). Only then do they leave "left".
- **Payment to verify**: delivered, but the money isn't verified in the company account yet. The office verifies it with one tap. This is money tracking; it doesn't hold units back.
- **With riders**: units on deliveries that are assigned or picked up.
- **Left** = received − delivered. **In warehouse** = left − with riders.
- A delivery that fails goes back to the warehouse count.

## ADA

`frontend/src/delivery/ada.js` understands the usual requests in the browser for free: stock drop-offs with prices,
"dispatch today's orders", one-off deliveries ("Deliver 2 power banks to Ada Eze, 5 Ajao Road, Ikeja by 4pm"),
messages to riders and questions ("How many serums are left?", "Who hasn't paid?", "How is Tunde doing?").

When `REACT_APP_BACKEND_URL` points at the backend, ADA asks Claude instead (`backend/server.py`, structured output)
and falls back to the browser if the server can't answer. Either way the answer is only a draft in names; the browser
matches it to real vendors, products and riders, checks stock and each rider's daily allocation, and shows the plan.

## Run it

```sh
cd frontend
yarn install
yarn start            # http://localhost:3000
```

Data is kept in the browser (localStorage) and shared between tabs. "Reset demo" on the home page starts over.

Optional backend for ADA:

```sh
cd backend
pip install -r requirements.txt
export ANTHROPIC_API_KEY=...        # ADA_MODEL defaults to claude-opus-5-5
uvicorn server:app --port 8001
# then start the frontend with REACT_APP_BACKEND_URL=http://localhost:8001
```

## What's next

The browser store is the stand-in for a real database. To run this for a company, the next steps are a backend store
(Postgres) with accounts for office staff, vendors and riders, real-time sync over websockets, photo uploads to object
storage, payment confirmation from the bank or POS provider, and SMS to customers with a tracking link.
See [docs/RESEARCH.md](docs/RESEARCH.md) for what the leading delivery platforms do and what we took from them.
