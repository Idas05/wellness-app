# Send Apple Watch activity to Fitness Track

Your Apple Watch saves your steps, calories, exercise and heart data in the iPhone **Health** app. A free iPhone
**Shortcut** reads today's numbers and sends them to the **Fitness Track** tab. You build it once (about 15 minutes).

## 1. One-time database step (on your computer)

1. Open your project on [supabase.com](https://supabase.com) and click **SQL Editor** in the left menu.
2. Click **New query**.
3. Open [`supabase/fitness.sql`](../supabase/fitness.sql), copy everything, and paste it in.
4. Click **Run**. You should see "Success". (Running it again later is harmless.)

## 2. Get your three values

In the Wellness app, open **Fitness Track** and find **Connect Apple Watch** (sign in first if asked). You'll see three rows:
**Your code**, **Web address** and **Key**. Tapping a row copies it. Keep **Your code** private, like a password.
It's the same code the sleep Shortcut uses.

> Tip: do the next part on your iPhone so you can copy and paste straight from the app.

## 3. Build the Shortcut (on your iPhone)

Open **Shortcuts**, tap **+** (top right) and rename it **Send Fitness to Wellness**.

### Today's date

1. Add **Date** (it says *Current Date*).
2. Add **Format Date**. Set **Date Format** to **ISO 8601** and turn **Include ISO 8601 Time** off.

### Steps, active calories and exercise minutes (totals for today)

Do these three actions once for each row of the table:

1. Add **Find Health Samples**. Set **Type** (see the table), then add the filter **Start Date** → **is today**.
   Tap **Allow Access** and turn the type on if asked.
2. Add **Calculate Statistics**. Set it to **Sum** of **Health Samples**.
3. Add **Set Variable** and give it the name in the table.

| Type | Variable name |
| --- | --- |
| Steps | `Steps` |
| Active Energy | `Calories` |
| Exercise Minutes | `Exercise` |

### Optional extras

Add any of these the same way (skip them if you like, the app shows "–"):

| Type | How | Variable name |
| --- | --- | --- |
| Walking + Running Distance | Start Date **is today**, **Sum** | `Distance` |
| Flights Climbed | Start Date **is today**, **Sum** | `Flights` |
| Resting Heart Rate | Start Date **is in the last 1 day**, **Average** | `RestingHR` |
| Heart Rate Variability | Start Date **is in the last 1 day**, **Average** | `HRV` |
| VO2 Max | Start Date **is in the last 30 days**, **Average** | `VO2` |

If a type isn't listed with exactly that name, search the Type list for it (VO2 Max is called *Cardio Fitness*
in the Health app).

### Send it

1. Add **Get Contents of URL**.
   - If Shortcuts pre-filled a variable as the address, tap it and choose **Clear Variable** first.
   - Tap **URL** and paste the **Web address**.
   - Tap the arrow (›) to show more options. Set **Method** to **POST**.
   - Under **Headers**, tap **Add new header**: `apikey` → paste the **Key**
   - Set **Request Body** to **JSON** and tap **Add new field** → **Text** for each of these:
     - `p_token` → paste **Your code**
     - `p_day` → pick **Formatted Date** above the keyboard
     - `p_steps` → pick the **Steps** variable
     - `p_active_cal` → **Calories**
     - `p_exercise_min` → **Exercise**
     - Only for extras you added: `p_distance` → **Distance**, `p_flights` → **Flights**,
       `p_resting_hr` → **RestingHR**, `p_hrv` → **HRV**, `p_vo2max` → **VO2**
2. Add **Show Notification**. It fills in **Contents of URL** by itself, so you can see if it worked.
3. Tap **Done**.

### Try it

Tap the Shortcut once. The first time, iPhone asks to read your Health data and to connect to **supabase.co**.
Tap **Allow**. You should see something like **"Saved activity for Nov 17: 8,432 steps."** Then open
**Fitness Track** in the app and pull down to refresh.

## 4. Run it automatically

1. In Shortcuts, tap **Automation**, then **+** (or **New Automation**).
2. Choose **Time of Day**, pick an evening time (for example **9:00 PM**) and **Daily**.
3. Choose **Run Immediately** and turn off **Notify When Run**. Tap **Next** and pick **Send Fitness to Wellness**.

Running it more than once a day is fine: it just updates today. Tap it by hand any time for an update.

## If something goes wrong

| Message | What to do |
| --- | --- |
| *Unknown code* | Copy **Your code** again from Fitness Track and paste it into `p_token`. |
| *p_day should be the date* | In **Format Date**, choose **ISO 8601** with **Include ISO 8601 Time** off. |
| *Could not find the function* | Run `supabase/fitness.sql` in Supabase (step 1). |
| A number shows "–" | That field wasn't sent, or Health had no data for it today. |
| The automation didn't run | iPhone can block Health data while it's locked. Pick a time you're usually using your phone, or tap the Shortcut by hand. |
