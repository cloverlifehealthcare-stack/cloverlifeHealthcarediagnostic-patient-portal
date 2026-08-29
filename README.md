# Clover Life Healthcare Diagnostic Clinic — Patient Portal

A small, separate website where **patients** can create their own login,
request an appointment, and check whether the clinic has confirmed it.

This is **not** the staff app. The staff management system
(`clover-life-diagnostics`) is a different website with its own address and
its own GitHub repository. The two apps share one thing on purpose: the
**same Supabase database**. That's how a request a patient sends here shows
up on the clinic's **Requests** page a moment later.

```
Patient portal (this project)          Staff app (clover-life-diagnostics)
   patient signs up, sends  ─────►  same Supabase database  ◄─────  staff
   a booking request                                                reviews &
                                                                    confirms it
```

## What patients can and cannot see here

This matters, so it's worth being blunt about it.

**They can:** create their own login, send booking requests, see the status
of every request they've sent, and see the date and time of appointments the
clinic has confirmed for them.

**They cannot:** see anyone else's information at all, and they cannot see
their own diagnoses, consultation notes, laboratory or imaging results,
prescriptions, or bills. None of that is available through this portal in
this version — it stays staff-only. This isn't just hidden in the page; the
database itself refuses to hand that data to a patient login.

## Setup — do these in order

### 1. FIRST: run the database migration in the staff app's project ⚠️

**This portal will not work at all until this is done.** Nothing here can be
skipped or done later.

In the **staff app's** folder there's a file called
`supabase/add-patient-portal.sql`. Open your Supabase project →
**SQL Editor → New query**, paste that whole file in, and click **Run**.

That one file creates the two tables this portal writes to
(`patient_profiles` and `appointment_requests`) and — just as importantly —
tightens the clinic's security rules so that a patient who signs up here can
*only* reach their own booking information, and never any patient's medical
records.

Read the comment at the top of that file before running it. Unlike the
clinic's earlier database updates, that one **changes permission rules on
tables you already have** (it doesn't delete or alter any of your data, and
your staff keep exactly the access they have today). It's worth
understanding what it does before you run it.

If you're setting up a brand-new Supabase project from scratch instead, the
staff app's `supabase/schema.sql` already includes all of this — you don't
need the migration file as well.

### 2. Check `config.js`

Open `config.js` in this folder. It should already contain the **same**
Project URL and anon key as the staff app's `config.js` — that's deliberate,
and it's what makes the two apps share one database. If you ever move the
clinic to a different Supabase project, both files have to be updated
together.

(Both values are meant to be public; Supabase's security model expects the
anon key to be visible in the page. The real protection is the database's
Row Level Security rules. Never put the `service_role` key in either file.)

### 3. Try it locally (optional but recommended)

This is just static files, so any local web server works:

```bash
cd clover-life-patient-portal
python3 -m http.server 8081
```

Open **http://localhost:8081**, create a test account, and send a booking
request. Then open the staff app, go to **Requests**, and confirm you can
see it. (Use port 8081 rather than 8080 so you can run both apps at once.)

### 4. Put it in its own new GitHub repository

This portal needs a **separate repository** from the staff app — they're
deployed to two different web addresses, and you don't want the clinic's
internal app and the public-facing portal in the same place.

1. Go to [github.com](https://github.com) and click **New repository**.
2. Give it a clearly different name from the staff app's repo — e.g.
   `clover-life-patient-portal`.
3. On the new empty repo's page, click **uploading an existing file**, and
   drag in the three files from this folder (`index.html`, `config.js`,
   `README.md`). No command line needed.

### 5. Deploy it as its own new Vercel project

1. Sign in at [vercel.com](https://vercel.com) (using your GitHub account
   makes this one click), click **Add New → Project**.
2. Import the **new** repository you just created — not the staff app's one.
   You'll end up with two Vercel projects, which is what you want.
3. Vercel detects this as a static site; no build settings are needed. Click
   **Deploy**.
4. Within about a minute you'll have a `https://….vercel.app` address. That's
   the link you give to patients — put it on the clinic's Facebook page,
   printed slips, wherever patients will find it.

Keep the two addresses straight: the staff app's link is for staff only and
should never be handed out to patients.

## How a booking actually flows

1. A patient signs up here with their email, a password, and their name.
2. They fill in the booking form — preferred date, preferred time, reason for
   the visit — and send it.
3. The request lands on the staff app's **Requests** page, with a badge
   showing how many are waiting.
4. A staff member opens it and either **Confirms** it — picking the patient's
   existing chart or creating a new patient record on the spot, then setting
   the real date, time and doctor — or **Declines** it, optionally with a
   short note explaining why.
5. The patient sees the outcome here the next time they open the portal.

A request is only ever a *request*. Nothing a patient does here puts an
appointment into the clinic's schedule by itself — a staff member always
reviews it first.

## A note on confirmation emails

By default, Supabase asks new sign-ups to click a confirmation link in an
email before they can log in. If that's on, a patient who signs up will see
"check your email for a confirmation link" and won't be able to log in until
they do.

Supabase's built-in email sending is **rate-limited** (a small number of
messages per hour), which is fine for testing but will frustrate real
patients as soon as a few sign up at once. For real use, connect a proper
SMTP provider under **Project Settings → Auth → SMTP Settings** in Supabase —
the same caveat the staff app's README mentions for password reset emails.

You can also turn confirmation off entirely under **Authentication →
Providers → Email** if you'd rather patients could book immediately. That's a
trade-off: it's more convenient, but it means anyone can create an account
with an email address that isn't theirs.

## Adding this to the clinic's routine

The **Requests** page in the staff app shows a red badge with the number of
pending requests, next to Appointments in the sidebar. Whoever handles the
clinic's phone bookings should check it at the same times they'd check
voicemail — patients are waiting on a reply.

## Project layout

```
index.html   the entire portal (single page, no build step)
config.js    Supabase project URL + anon key — same project as the staff app
README.md    this file
```

## Security, briefly

Every rule about who can see what is enforced by the database itself (Row
Level Security), not by this page. A patient login is a fundamentally
different kind of account from a staff login: staff accounts live in one
table, patient portal accounts in another, and the clinic's data is only ever
opened to the first kind. Even a modified copy of this portal, or someone
using the anon key directly, cannot read another patient's records.

That said, this is a lightweight tool for a small clinic, not a certified
healthcare system — there's no audit log of who viewed what, and no
compliance certification. Worth knowing before scaling up.
