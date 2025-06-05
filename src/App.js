
import React, { useState, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import { parseICS } from "ical.js";
import axios from "axios";

const App = () => {
  const [properties, setProperties] = useState(() => {
    const stored = localStorage.getItem("calendar-properties");
    return stored ? JSON.parse(stored) : [];
  });
  const [events, setEvents] = useState([]);
  const [form, setForm] = useState({ name: "", color: "#3498db", url: "" });

  useEffect(() => {
    localStorage.setItem("calendar-properties", JSON.stringify(properties));
    fetchAllEvents();
  }, [properties]);

  const fetchAllEvents = async () => {
    const allEvents = [];
    for (const prop of properties) {
      try {
        const res = await axios.get(
          `https://corsproxy.io/?${encodeURIComponent(prop.url)}`
        );
        const parsed = parseICS(res.data);
        for (const key in parsed) {
          const evt = parsed[key];
          if (evt.type === "VEVENT") {
            allEvents.push({
              title: prop.name,
              start: evt.startDate.toJSDate(),
              end: evt.endDate.toJSDate(),
              color: prop.color
            });
          }
        }
      } catch (err) {
        console.error(`Error fetching ${prop.name}`, err);
      }
    }
    setEvents(allEvents);
  };

  const handleAddProperty = () => {
    if (!form.name || !form.url) return;
    setProperties([...properties, { ...form, id: Date.now() }]);
    setForm({ name: "", color: "#3498db", url: "" });
  };

  const handleDeleteProperty = (id) => {
    setProperties(properties.filter((p) => p.id !== id));
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Unified Booking Calendar</h1>

      <div className="mb-6 p-4 border rounded-lg">
        <h2 className="text-lg font-semibold mb-2">Add Property iCal Link</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input
            type="text"
            placeholder="Property Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="border p-2 rounded"
          />
          <input
            type="color"
            value={form.color}
            onChange={(e) => setForm({ ...form, color: e.target.value })}
            className="border p-2 rounded"
          />
          <input
            type="text"
            placeholder="iCal URL"
            value={form.url}
            onChange={(e) => setForm({ ...form, url: e.target.value })}
            className="border p-2 rounded"
          />
        </div>
        <button
          onClick={handleAddProperty}
          className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Add Property
        </button>
      </div>

      <div className="mb-6">
        <h2 className="font-semibold mb-2">Properties Added:</h2>
        <ul className="list-disc pl-6">
          {properties.map((p) => (
            <li key={p.id} className="mb-1 flex justify-between items-center">
              <span>
                <span
                  className="inline-block w-4 h-4 mr-2"
                  style={{ backgroundColor: p.color }}
                ></span>
                {p.name}
              </span>
              <button
                onClick={() => handleDeleteProperty(p.id)}
                className="text-red-600 hover:underline"
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      </div>

      <FullCalendar
        plugins={[dayGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        events={events}
        height="auto"
      />
    </div>
  );
};

export default App;
