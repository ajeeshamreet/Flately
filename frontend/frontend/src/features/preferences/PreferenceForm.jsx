import { useState } from "react";

export default function PreferenceForm({ onSubmit }) {
  const [prefs, setPrefs] = useState({
    genderPreference: "any",
    minBudget: 5000,
    maxBudget: 15000,
    city: "",

    cleanliness: 3,
    sleepSchedule: 3,
    smoking: false,
    drinking: false,
    pets: false,
    socialLevel: 3,

    weightCleanliness: 30,
    weightSleep: 25,
    weightHabits: 25,
    weightSocial: 20
  });

  function change(e) {
    const { name, value, type, checked } = e.target;
    setPrefs({
      ...prefs,
      [name]: type === "checkbox" ? checked : Number(value) || value
    });
  }

  const weightTotal =
    prefs.weightCleanliness +
    prefs.weightSleep +
    prefs.weightHabits +
    prefs.weightSocial;

  return (
    <form onSubmit={e => {
      e.preventDefault();
      onSubmit(prefs);
    }}>
      <h3>Lifestyle</h3>

      <label>Cleanliness</label>
      <input type="range" min="1" max="5" name="cleanliness" onChange={change} />

      <label>Sleep Schedule</label>
      <input type="range" min="1" max="5" name="sleepSchedule" onChange={change} />

      <label>
        <input type="checkbox" name="smoking" onChange={change} /> Smoking
      </label>

      <label>
        <input type="checkbox" name="drinking" onChange={change} /> Drinking
      </label>

      <h3>What matters more?</h3>

      <input name="weightCleanliness" type="number" onChange={change} />
      <input name="weightSleep" type="number" onChange={change} />
      <input name="weightHabits" type="number" onChange={change} />
      <input name="weightSocial" type="number" onChange={change} />

      <p>Weight total: {weightTotal}</p>
      {weightTotal !== 100 && <p>Weights must sum to 100</p>}

      <button disabled={weightTotal !== 100}>
        Save Preferences
      </button>
    </form>
  );
}
