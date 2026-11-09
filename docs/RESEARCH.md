# How leading delivery platforms work, and what we took

A short look at last-mile delivery software (Onfleet, Shipday, Tookan, Track-POD, Route4Me) and at e-commerce
logistics companies in Nigeria (Kwik, GIG Logistics, Sendbox, Gokada), plus 3PL "client portals" for merchants.

## What they all have

| Practice | Who does it | In this build |
| --- | --- | --- |
| **Proof of delivery**: photo at the door, name of who received it, timestamp, sometimes a signature or barcode scan | Onfleet, Shipday, Track-POD, Route4Me | Rider must take a photo to confirm; name and time are saved and shown to the office and the vendor |
| **Cash on delivery collected and reconciled**, then paid out (remitted) to the merchant | Kwik, GIG, Sendbox | Rider records cash / transfer / POS and the amount; transfers can stay "awaiting payment" until the office confirms; vendor sees sales in naira |
| **Merchant / vendor portal** with live order status and stock levels | GIG e-commerce fulfilment, 3PL client portals (Deposco, Mintsoft, CartonCloud) | Vendor portal with given / delivered / left per product and every delivery as it happens |
| **Automatic dispatch** by area, driver capacity and time window | Onfleet auto-dispatch, Tookan, Shipday | ADA assigns by zone, each rider's daily unit allocation and the order's time window, and warns when stock or allocation runs out |
| **Driver app**: ordered task list, call the customer, navigation, status updates | All of them | Rider app with drops in order, Call and Directions buttons, Picked up → Delivered |
| **Failed delivery reasons** so returns are tracked | Onfleet, Track-POD | "Couldn't deliver" with a reason; units go back to the warehouse count |
| **Real-time updates** for dispatch and merchants | All of them | One shared store; every open dashboard updates at once |

## Worth adding next

- **Customer SMS / WhatsApp with a tracking link** and ETA when the rider picks up (Onfleet, Shipday, Kwik).
- **Delivery OTP**: the customer reads a 4-digit code to the rider, which is stronger proof than a photo.
- **Rider cash remittance**: end-of-day count of cash each rider owes the office, and vendor payout statements.
- **Route ordering** across a rider's drops (Route4Me, Onfleet).
- **Live rider location** on a map for the office.
- **Ratings and delivery-time stats** per rider.

## Sources

- [Onfleet: proof of delivery](https://onfleet.com/proof-of-delivery)
- [Shipday: proof of delivery software](https://www.shipday.com/post/proof-of-delivery-software)
- [Track-POD: proof of delivery apps compared](https://www.track-pod.com/blog/proof-of-delivery-apps/)
- [Upper: best delivery management software 2026](https://www.upperinc.com/blog/best-delivery-management-software/)
- [TechCrunch: Kwik adds financial services to last-mile delivery](https://techcrunch.com/2022/03/24/nigerias-kwik-gets-2m-to-add-financial-services-to-its-last-mile-delivery-offerings)
- [GIG Logistics: e-commerce](https://giglogistics.com/e-commerce/)
- [The Condia: GIGGO, Gokada, Kwik, Sendbox compared](https://thecondia.com/best-logistics-giggo-gokada-kwik-sendbox/)
- [Racklify: what is a 3PL portal](https://racklify.com/encyclopedia/what-is-a-3pl-portal-how-merchants-use-customer-portals-with-third-party-logistics/)
- [Mintsoft: 3PL client portal](https://www.mintsoft.com/3pl-third-party-logistics/3pl-client-portal/)
