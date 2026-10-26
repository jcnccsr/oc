"use client";

import EventMessageComposer from "@/components/EventMessageComposer";
import contents from "@/data/contents.json";
import { getEventHref, messageTypes } from "@/utils/eventMessages";
import styles from "./Calendar.module.css";

const { weekdays, reminders, eventMessageTypes } = contents.calendar;

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
    reminders.forEach((reminder) => {
      addItem(addDays(eventDate, -reminder.daysBefore), {
        event,
        kind: reminder.kind,
      });
    });
  });

  return itemsByDate;
}

function EventItem({ item }) {
  const { event, kind } = item;
  const isEvent = kind === "event";
  const reminder = reminders.find((item) => item.kind === kind);
  const messageKeys = isEvent ? eventMessageTypes : [reminder.messageType];
  const reminderLabel = reminder?.label;
  const availableMessages = messageTypes.filter((message) => messageKeys.includes(message.key));

  return (
    <div className={`${styles.eventItem} ${isEvent ? styles.eventItemMain : styles.eventItemReminder}`}>
      {isEvent ? (
        <>
          <a className={styles.eventName} href={getEventHref(event.link, event.resourceType)} target="_blank" rel="noreferrer">
            {event.name}
          </a>
          <span>{event.time}</span>
          <span>{event.location}</span>
        </>
      ) : (
        <>
          <span className={styles.reminderLabel}>{reminderLabel}</span>
          <span>{event.name}</span>
        </>
      )}
      <EventMessageComposer event={event} availableMessages={availableMessages} />
    </div>
  );
}

function CalendarMonth({ month, itemsByDate, isCurrentMonth }) {
  const firstDay = new Date(month.getFullYear(), month.getMonth(), 1);
  const startDay = contents.calendar.weekStartsOn % 7;
  const startOffset = (firstDay.getDay() - startDay + 7) % 7;
  const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const cellCount = Math.ceil((startOffset + daysInMonth) / 7) * 7;
  const days = Array.from({ length: cellCount }, (_, index) => {
    const day = index - startOffset + 1;
    return day < 1 || day > daysInMonth
      ? null
      : new Date(month.getFullYear(), month.getMonth(), day);
  });
  const label = new Intl.DateTimeFormat("en", { month: "long", year: "numeric" }).format(month);

  return (
    <section className={styles.month} aria-label={label}>
      <h3 className={isCurrentMonth ? styles.currentMonthLabel : styles.monthLabel}>{label}</h3>
      <div className={styles.calendarGrid} role="grid" aria-label={`${label} calendar dates`}>
        {weekdays.map((weekday) => (
          <div className={styles.weekday} role="columnheader" key={weekday}>
            {weekday}
          </div>
        ))}
        {days.map((date, index) => {
          if (!date) {
            return (
              <div
                className={styles.emptyDay}
                aria-hidden="true"
                key={`empty-${month.getMonth()}-${index}`}
              />
            );
          }

          const items = itemsByDate.get(dateKey(date)) ?? [];
          const relevant = items.length > 0;
          const hasEvent = items.some((item) => item.kind === "event");
          const cellClassNames = [
            styles.day,
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
    </section>
  );
}

export default function Calendar() {
  const today = new Date();
  const year = today.getFullYear();
  const calendarEntries = [
    ...contents.events.map((event) => ({ ...event, resourceType: "event" })),
    ...contents.retreats.map((retreat) => ({ ...retreat, resourceType: "retreat" })),
  ];
  const itemsByDate = getCalendarItems(calendarEntries);
  const months = Array.from({ length: 12 }, (_, index) => new Date(year, index, 1)).filter((month) => {
    const monthPrefix = `${year}-${String(month.getMonth() + 1).padStart(2, "0")}-`;
    return Array.from(itemsByDate.keys()).some((key) => key.startsWith(monthPrefix));
  });
  const { title, eyebrow, emptyMessage } = contents.calendar;

  return (
    <main className={styles.main}>
      <section className={styles.calendar} aria-label="Events calendar">
        <div className={styles.calendarHeader}>
          <div>
            <p className={styles.eyebrow}>{eyebrow}</p>
            <h2>{title}</h2>
          </div>
        </div>

        <div className={styles.months}>
          {months.map((visibleMonth) => (
            <CalendarMonth
              key={dateKey(visibleMonth)}
              month={visibleMonth}
              itemsByDate={itemsByDate}
              isCurrentMonth={
                visibleMonth.getFullYear() === today.getFullYear()
                && visibleMonth.getMonth() === today.getMonth()
              }
            />
          ))}
        </div>
        {months.length === 0 && (
          <p className={styles.emptyState}>{emptyMessage}</p>
        )}
      </section>
    </main>
  );
}
