# Send Apple Watch sleep to the Wellness app

Your Apple Watch saves your sleep in the iPhone **Health** app. A free iPhone **Shortcut** reads last night's
sleep and sends it to the Wellness app every morning. You build it once (about 10 minutes).

## 1. One-time database step (on your computer)

1. Open your project on [supabase.com](https://supabase.com) and click **SQL Editor** in the left menu.
2. Click **New query**.
3. Open [`supabase/sleep.sql`](../supabase/sleep.sql), copy everything, and paste it in.
4. Click **Run**. You should see "Success".

## 2. Get your three values

In the Wellness app, open the **More** tab and find **Apple Watch sleep**. You'll see three rows:
**Your code**, **Web address** and **Key**. Tapping a row copies it. Keep **Your code** private, like a password.

> Tip: do the next part on your iPhone so you can copy and paste straight from the app.

## 3. Build the Shortcut (on your iPhone)

1. Open the **Shortcuts** app and tap **+** (top right). Rename it **Send Sleep to Wellness**.
2. Tap **Add Action**, search **Find Health Samples**, and add it.
   - Set **Type** to **Sleep Analysis**.
   - Tap **Add Filter**, pick **Start Date**, then **is in the last** → **18 hours**.
   - Set **Sort by** to **Start Date**, **Oldest First**.
3. Add the action **Repeat with Each**. It should say *Repeat with each item in Health Samples*.
4. Inside the repeat (between *Repeat* and *End Repeat*), add a **Text** action and fill it like this,
   with a `|` (vertical bar) between the three parts and no spaces:

   `Repeat Item › Value` `|` `Repeat Item › Start Date` `|` `Repeat Item › End Date`

   - To insert one: tap in the text box, tap **Repeat Item** above the keyboard, then tap the blue
     **Repeat Item** you inserted and choose **Value** (or **Start Date** / **End Date**).
   - For **Start Date** and **End Date**: tap the blue date, set **Date Format** to **ISO 8601**,
     and turn on **Include ISO 8601 Time**.
5. Below **End Repeat**, add **Combine Text**. Set it to combine **Repeat Results** with **New Lines**.
6. Add **Get Contents of URL**.
   - Tap **URL** and paste the **Web address**.
   - Tap the arrow (›) to show more options. Set **Method** to **POST**.
   - Under **Headers**, tap **Add new header** twice:
     - `apikey` → paste the **Key**
     - `Authorization` → type `Bearer ` (with a space), then paste the **Key**
   - Set **Request Body** to **JSON** and tap **Add new field** → **Text** twice:
     - `p_token` → paste **Your code**
     - `p_samples` → tap the value box and pick **Combined Text** above the keyboard
7. Add **Show Notification** and set its text to **Contents of URL**. This tells you if it worked.
8. Tap **Done**.

### Try it

Tap the Shortcut once. The first time, iPhone asks to read your **Sleep** data from Health and to
connect to **supabase.co**. Tap **Allow** for both. You should see **"Saved last night's sleep."**
Then open the **Progress** tab in the app (pull down to refresh) to see your score.

## 4. Run it every morning automatically

1. In Shortcuts, tap **Automation** at the bottom, then **+** (or **New Automation**).
2. Choose **Time of Day**, pick a time after you usually wake up (for example **10:00 AM**), and **Daily**.
3. Choose **Run Immediately** and turn off **Notify When Run**. Tap **Next**.
4. Pick **Send Sleep to Wellness**.

Running it more than once a day is fine: it just updates that night.

## If something goes wrong

| Message | What to do |
| --- | --- |
| *Unknown code* | Copy **Your code** again from the More tab and paste it into `p_token`. |
| *No sleep found in the last day* | Wear your watch to bed with sleep tracking on (Health › Sleep). Check the Start Date filter says 18 hours. |
| Nothing new in the app | Pull down on the Progress tab, or tap **Check for new sleep data** in More. |
| The automation didn't run | iPhone can block Health data while it's locked. Pick a time you're usually using your phone, or tap the Shortcut by hand. |

## How the score works (out of 100)

- **Duration (50):** full marks for 7 to 9 hours asleep.
- **Deep + REM (25):** full marks when deep and REM sleep are at least 40% of your sleep.
- **Restful (15):** full marks with 20 minutes or less awake.
- **Routine (10):** full marks when you went to bed within 30 minutes of your usual time.
