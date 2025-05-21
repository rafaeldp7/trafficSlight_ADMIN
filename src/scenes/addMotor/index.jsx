import React, { useState } from "react";

const AddMotor = () => {
  const [formData, setFormData] = useState({
    model: "",
    engineDisplacement: "",
    power: "",
    torque: "",
    fuelTank: "",
    fuelConsumption: "",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const {
      model,
      engineDisplacement,
      power,
      torque,
      fuelTank,
      fuelConsumption,
    } = formData;

    if (
      !model ||
      !engineDisplacement ||
      !power ||
      !torque ||
      !fuelTank ||
      !fuelConsumption
    ) {
      setMessage("❌ Please fill out all fields.");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const response = await fetch("http://localhost:5000/api/motorcycles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model,
          engineDisplacement: parseFloat(engineDisplacement),
          power,
          torque,
          fuelTank: parseFloat(fuelTank),
          fuelConsumption: parseFloat(fuelConsumption),
        }),
      });

      const data = await response.json();

      if (response.status === 201) {
        setMessage("✅ Motorcycle added successfully!");
        setFormData({
          model: "",
          engineDisplacement: "",
          power: "",
          torque: "",
          fuelTank: "",
          fuelConsumption: "",
        });
      } else {
        setMessage(data?.msg || "❌ Failed to add motorcycle.");
      }
    } catch (error) {
      console.error("Submit error:", error);
      setMessage("❌ Failed to connect to server.");
    }

    setLoading(false);
  };

  return (
    <div className="max-w-xl mx-auto mt-10 p-5 border rounded shadow">
      <h2 className="text-2xl font-bold mb-5">➕ Add Motorcycle (Admin)</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          name="model"
          placeholder="Model (e.g. Honda TMX125 Alpha)"
          value={formData.model}
          onChange={handleChange}
          className="w-full border px-4 py-2 rounded"
        />
        <input
          type="number"
          name="engineDisplacement"
          placeholder="Engine Displacement (cc)"
          value={formData.engineDisplacement}
          onChange={handleChange}
          className="w-full border px-4 py-2 rounded"
        />
        <input
          type="text"
          name="power"
          placeholder="Power (e.g. 7.16hp @ 8,000rpm)"
          value={formData.power}
          onChange={handleChange}
          className="w-full border px-4 py-2 rounded"
        />
        <input
          type="text"
          name="torque"
          placeholder="Torque (e.g. 9.1Nm @ 6,500rpm)"
          value={formData.torque}
          onChange={handleChange}
          className="w-full border px-4 py-2 rounded"
        />
        <input
          type="number"
          step="0.1"
          name="fuelTank"
          placeholder="Fuel Tank Capacity (Liters)"
          value={formData.fuelTank}
          onChange={handleChange}
          className="w-full border px-4 py-2 rounded"
        />
        <input
          type="number"
          step="0.01"
          name="fuelConsumption"
          placeholder="Fuel Consumption (km/L)"
          value={formData.fuelConsumption}
          onChange={handleChange}
          className="w-full border px-4 py-2 rounded"
        />

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded mt-2 hover:bg-blue-700 transition"
          disabled={loading}
        >
          {loading ? "Saving..." : "Add Motorcycle"}
        </button>
      </form>

      {message && (
        <div className="mt-4 text-center text-sm font-medium">
          {message}
        </div>
      )}
    </div>
  );
};

export default AddMotor;
