"use client";

import { useState } from "react";
import EventMessageComposer from "@/components/EventMessageComposer";
import contents from "@/data/contents.json";
import { getEventHref, messageTypes } from "@/utils/eventMessages";
import styles from "./Calendar.module.css";

const weekdays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function dateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getEventDate(value) {
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(year, month - 1, day);

  if (dateKey(date) !== value) {
    throw new Error(`Invalid event date: ${value}`);
  }

  return date;
}

function addDays(date, days) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function getCalendarItems(events) {
  const itemsByDate = new Map();

  function addItem(date, item) {
    const key = dateKey(date);
    const items = itemsByDate.get(key) ?? [];
    items.push(item);
    itemsByDate.set(key, items);
  }

  events.forEach((event) => {
    const eventDate = getEventDate(event.date);
    addItem(eventDate, { event, kind: "event" });
    addItem(addDays(eventDate, -10), { event, kind: "reminder-10" });
    addItem(addDays(eventDate, -2), { event, kind: "reminder-2" });
  });

  return itemsByDate;
}

function EventItem({ item }) {
  const { event, kind } = item;
  const isEvent = kind === "event";
  const reminder = kind === "reminder-10" ? "10 days before" : "2 days before";
  const messageKeys = {
    "reminder-10": ["announcement10"],
    "reminder-2": ["announcement2"],
    event: ["invitation", "personalReminder"],
  }[kind];
  const availableMessages = messageTypes.filter((message) => messageKeys.includes(message.key));

  return (
    <div className={`${styles.eventItem} ${isEvent ? styles.eventItemMain : styles.eventItemReminder}`}>
      {isEvent ? (
        <>
          <a className={styles.eventName} href={getEventHref(event.link)} target="_blank" rel="noreferrer">
            {event.name}
          </a>
          <span>{event.time}</span>
          <span>{event.location}</span>
        </>
      ) : (
        <>
          <span className={styles.reminderLabel}>{reminder}</span>
          <span>{event.name}</span>
        </>
      )}
      <EventMessageComposer event={event} availableMessages={availableMessages} />
    </div>
  );
}

function CalendarMonth({ month, itemsByDate }) {
  const firstDay = new Date(month.getFullYear(), month.getMonth(), 1);
  const mondayOffset = (firstDay.getDay() + 6) % 7;
  const gridStart = addDays(firstDay, -mondayOffset);
  const days = Array.from({ length: 42 }, (_, index) => addDays(gridStart, index));

  return (
    <div className={styles.calendarGrid} role="grid" aria-label="Calendar dates">
      {weekdays.map((weekday) => (
        <div className={styles.weekday} role="columnheader" key={weekday}>
          {weekday}
        </div>
      ))}
      {days.map((date) => {
        const items = itemsByDate.get(dateKey(date)) ?? [];
        const relevant = items.length > 0;
        const isCurrentMonth = date.getMonth() === month.getMonth();
        const hasEvent = items.some((item) => item.kind === "event");
        const cellClassNames = [
          styles.day,
          !isCurrentMonth && styles.outsideMonth,
          !relevant && styles.irrelevant,
          relevant && (hasEvent ? styles.eventDay : styles.reminderDay),
        ]
          .filter(Boolean)
          .join(" ");

        return (
          <div className={cellClassNames} role="gridcell" key={dateKey(date)}>
            <div className={styles.dayHeading}>
              <span className={styles.mobileWeekday}>
                {new Intl.DateTimeFormat("en", { weekday: "short" }).format(date)}
              </span>
              <time dateTime={dateKey(date)}>{date.getDate()}</time>
            </div>
            <div className={styles.dayItems}>
              {items.map((item, index) => (
                <EventItem item={item} key={`${item.event.name}-${item.kind}-${index}`} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function Calendar() {
  const [month, setMonth] = useState(() => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), 1);
  });
  const itemsByDate = getCalendarItems(contents.events);
  const label = new Intl.DateTimeFormat("en", { month: "long", year: "numeric" }).format(month);

  function changeMonth(offset) {
    setMonth((current) => new Date(current.getFullYear(), current.getMonth() + offset, 1));
  }

  return (
    <main className={styles.main}>
      <section className={styles.calendar} aria-label="Events calendar">
        <div className={styles.calendarHeader}>
          <div>
            <p className={styles.eyebrow}>Open Circle Yoga</p>
            <h2>Events calendar</h2>
          </div>
          <div className={styles.monthControls}>
            <button type="button" onClick={() => changeMonth(-1)} aria-label="Previous month">
              &larr;
            </button>
            <h3 aria-live="polite">{label}</h3>
            <button type="button" onClick={() => changeMonth(1)} aria-label="Next month">
              &rarr;
            </button>
          </div>
        </div>

        <div className={styles.legend} aria-label="Calendar legend">
          <span><i className={styles.eventLegend} /> Event</span>
          <span><i className={styles.reminderLegend} /> Reminder</span>
        </div>

        <CalendarMonth month={month} itemsByDate={itemsByDate} />
        {contents.events.length === 0 && (
          <p className={styles.emptyState}>No events have been added yet.</p>
        )}
      </section>
    </main>
  );
}
