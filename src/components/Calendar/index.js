"use client";

import { useEffect, useState } from "react";
import EventMessageComposer from "@/components/EventMessageComposer";
import contents from "@/data/contents.json";
import { getEventHref, messageTypes } from "@/utils/eventMessages";
import styles from "./Calendar.module.css";

const { weekdays, reminders, eventMessageTypes } = contents.calendar;
const { statuses: taskStatuses, tasks } = contents.planner;

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

function formatTaskDue(task) {
  const [year, month, day] = task.dueDate.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  const [hours, minutes] = task.dueTime.split(":").map(Number);
  const time = new Intl.DateTimeFormat("en", {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(year, month - 1, day, hours, minutes));

  return `${new Intl.DateTimeFormat("en", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(date)} at ${time}`;
}

function TaskDot({ task, isOpen, onToggle, tooltipAlignment, mobileTooltipAlignment }) {
  const statusLabel = taskStatuses.find((status) => status.value === task.status)?.label
    ?? task.status;
  const tooltipId = `task-tooltip-${task.id}`;

  return (
    <span
      className={`${styles.taskDotGroup} ${styles[tooltipAlignment]} ${styles[mobileTooltipAlignment]} ${isOpen ? styles.taskDotOpen : ""}`}
    >
      <button
        className={`${styles.taskDot} ${styles[`taskStatus-${task.status}`] ?? ""}`}
        type="button"
        aria-label={`${task.title}, ${statusLabel}. Show task details.`}
        aria-describedby={tooltipId}
        aria-controls={tooltipId}
        aria-expanded={isOpen}
        onClick={onToggle}
      >
        {task.status === "completed" ? <span aria-hidden="true">✓</span> : null}
      </button>
      <span className={styles.taskTooltip} id={tooltipId} role="tooltip">
        <span className={styles.taskTooltipStatus}>{statusLabel}</span>
        <strong className={styles.taskTooltipTitle}>{task.title}</strong>
        <span className={styles.taskTooltipDue}>{formatTaskDue(task)}</span>
        <span className={styles.taskTooltipText}>{task.description}</span>
        {task.details ? (
          <span className={styles.taskTooltipDetails}>{task.details}</span>
        ) : null}
      </span>
    </span>
  );
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

function CalendarMonth({
  month,
  itemsByDate,
  tasksByDate,
  openTaskId,
  onToggleTask,
  isCurrentMonth,
  todayKey,
}) {
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
          const dayTasks = tasksByDate.get(dateKey(date)) ?? [];
          const relevant = items.length > 0 || dayTasks.length > 0;
          const isToday = dateKey(date) === todayKey;
          const column = index % 7;
          const hasEvent = items.some((item) => item.kind === "event");
          const hasReminder = items.some((item) => item.kind !== "event");
          const cellClassNames = [
            styles.day,
            !relevant && styles.irrelevant,
            hasEvent && styles.eventDay,
            !hasEvent && hasReminder && styles.reminderDay,
            !hasEvent && !hasReminder && dayTasks.length > 0 && styles.taskDay,
            isToday && styles.today,
          ]
            .filter(Boolean)
            .join(" ");

          return (
            <div
              className={cellClassNames}
              role="gridcell"
              aria-current={isToday ? "date" : undefined}
              key={dateKey(date)}
            >
              <div className={styles.dayHeading}>
                <span className={styles.mobileWeekday}>
                  {new Intl.DateTimeFormat("en", { weekday: "short" }).format(date)}
                </span>
                <time dateTime={dateKey(date)}>{date.getDate()}</time>
              </div>
              <div
                className={`${styles.dayContent} ${dayTasks.length ? styles.dayContentWithTasks : ""}`}
              >
                <div className={styles.dayItems}>
                  {items.map((item, index) => (
                    <EventItem item={item} key={`${item.event.name}-${item.kind}-${index}`} />
                  ))}
                </div>
                {dayTasks.length > 0 ? (
                  <div
                    className={styles.taskDotColumn}
                    role="group"
                    aria-label={`${dayTasks.length} tasks`}
                  >
                    {dayTasks.map((task) => (
                      <TaskDot
                        key={task.id}
                        task={task}
                        isOpen={openTaskId === task.id}
                        tooltipAlignment={column < 3 ? "taskTooltipRight" : "taskTooltipLeft"}
                        mobileTooltipAlignment={
                          date.getDate() % 2 === 1
                            ? "mobileTooltipRight"
                            : "mobileTooltipLeft"
                        }
                        onToggle={() =>
                          onToggleTask(openTaskId === task.id ? null : task.id)
                        }
                      />
                    ))}
                  </div>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default function Calendar() {
  const [today, setToday] = useState(null);
  const [openTaskId, setOpenTaskId] = useState(null);
  useEffect(() => {
    setToday(new Date());
  }, []);

  const calendarEntries = [
    ...contents.events.map((event) => ({ ...event, resourceType: "event" })),
    ...contents.retreats.map((retreat) => ({ ...retreat, resourceType: "retreat" })),
  ];
  const itemsByDate = getCalendarItems(calendarEntries);
  const tasksByDate = new Map();
  tasks.forEach((task) => {
    const dailyTasks = tasksByDate.get(task.dueDate) ?? [];
    dailyTasks.push(task);
    tasksByDate.set(task.dueDate, dailyTasks);
  });
  const itemDates = [...itemsByDate.keys(), ...tasksByDate.keys()];
  const monthKeys = new Set(itemDates.map((key) => key.slice(0, 7)));
  if (today) {
    monthKeys.add(dateKey(today).slice(0, 7));
  }
  const months = [...monthKeys]
    .map((key) => {
      const [year, month] = key.split("-").map(Number);
      return new Date(year, month - 1, 1);
    })
    .sort((first, second) => first - second);
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
              tasksByDate={tasksByDate}
              openTaskId={openTaskId}
              onToggleTask={setOpenTaskId}
              todayKey={today ? dateKey(today) : undefined}
              isCurrentMonth={
                today !== null
                && visibleMonth.getFullYear() === today.getFullYear()
                && visibleMonth.getMonth() === today.getMonth()
              }
            />
          ))}
        </div>
        {tasks.length > 0 ? (
          <ul className={styles.taskLegend} aria-label="Task status legend">
            {taskStatuses.map((status) => (
              <li key={status.value}>
                <span
                  className={`${styles.taskLegendDot} ${styles[`taskStatus-${status.value}`] ?? ""}`}
                  aria-hidden="true"
                />
                {status.label}
              </li>
            ))}
          </ul>
        ) : null}
        {months.length === 0 && (
          <p className={styles.emptyState}>{emptyMessage}</p>
        )}
      </section>
    </main>
  );
}
