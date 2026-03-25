// @ts-nocheck
import { useState } from "react";

export default function ProfileForm({ onSubmit }) {
  const [form, setForm] = useState({
    age: "",
    gender: "",
    occupation: "",
    city: "",
    hasRoom: false
  });

  function change(e) {
    const { name, value, type, checked } = e.target;
    setForm({
      ...form,
      [name]: type === "checkbox" ? checked : value
    });
  }

  return (
    <form onSubmit={e => {
      e.preventDefault();
      onSubmit(form);
    }}>
      <input name="age" type="number" placeholder="Age" onChange={change} />
      <select name="gender" onChange={change}>
        <option value="">Gender</option>
        <option value="male">Male</option>
        <option value="female">Female</option>
      </select>
      <input name="occupation" placeholder="Occupation" onChange={change} />
      <input name="city" placeholder="City" onChange={change} />

      <label>
        <input type="checkbox" name="hasRoom" onChange={change} />
        I already have a room
      </label>

      <button>Continue</button>
    </form>
  );
}
