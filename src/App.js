import React, { useState, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import ical from "ical.js";
import axios from "axios";

const propertyConfig = [
  {
    id: "property1",
    name: "Airbnb Beach House",
    color: "#ff6b6b",
    icalUrl: "https://www.airbnb.co.in/calendar/ical/24141820.ics"
  },
  {
    id: "property2",
    name: "Booking.com Villa",
    color: "#1dd1a1",
    icalUrl: "https://www.airbnb.co.in/calendar/ical/24141820.ics"
  }
];

const fetchICalEvents = async (url, color) => {
  try {
    const response = await axios.get(url);
    const jcalData = ical.parse(response.data);
    const comp = new ical.Component(jcalData);
    const events = comp.getAllSubcomponents("vevent");

    return events.map((event) => {
      const vevent = new ical.Event(event);
      return {
        title: "Blocked",
        start: vevent.startDate.toString(),
        end: vevent.endDate.toString(),
        backgroundColor: color,
        borderColor: color,
        display: "block"
      };
    });
  } catch (error) {
    console.error("Error fetching iCal:", url, error);
    return [];
  }
};

const App = () => {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    const loadAllEvents = async () => {
      let allEvents = [];
      for (const property of propertyConfig) {
        const propEvents = await fetchICalEvents(property.icalUrl, property.color);
        allEvents = allEvents.concat(propEvents);
      }
      setEvents(allEvents);
    };

    loadAllEvents();
    const interval = setInterval(loadAllEvents, 15 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Unified Booking Calendar</h1>
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
