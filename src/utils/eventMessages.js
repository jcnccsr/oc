const eventUrl = "https://www.opencircleyoga.org/event/";

export const messageTypes = [
  {
    key: "announcement10",
    label: "Pre-10-Day",
    title: "🌿 Save the date",
    message: (name) => `Our ${name} is coming up in 10 days. We'd love to have you join us.`,
  },
  {
    key: "announcement2",
    label: "Pre-2-Day",
    title: "🌅 A little reminder",
    message: (name, weekday) => `Our ${name} is happening this ${weekday}.`,
  },
  {
    key: "invitation",
    label: "Invitation",
    title: "💌 You're invited",
    message: (name) => `Hi! I'd love to invite you to ${name}. It would be wonderful to have you there!`,
  },
  {
    key: "personalReminder",
    label: "Personal Message",
    title: "💛 A note for you",
    message: (name) => `Hi! Just a personal reminder about ${name}. I hope you can make it.`,
  },
];

export const locationOptions = {
  Studio: {
    label: "Studio",
    name: "Open Circle Yoga Studio",
    map: "https://maps.app.goo.gl/iLQmYwap9vKjbR3v5",
  },
  NHMAD: {
    label: "NHMAD",
    name: "Natural History Museum Abu Dhabi",
    map: "https://maps.app.goo.gl/jkDh6ZsuFBzSN1xU9",
  },
  custom: {
    label: "Other location",
  },
};

export function getEventHref(link) {
  const path = link
    .replace(/^https:\/\/www\.opencircleyoga\.org\/event\//, "")
    .replace(/^\/+/, "");
  return `${eventUrl}${path}`;
}

export function isValidEventDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split("-").map(Number);
  return formatDateInput(new Date(year, month - 1, day)) === value;
}

export function getMessageDraft(event, messageType) {
  const type = messageTypes.find((item) => item.key === messageType);
  if (!type) {
    throw new Error(`Unknown event message type: ${messageType}`);
  }

  const [year, month, day] = event.date.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  if (formatDateInput(date) !== event.date) {
    throw new Error(`Invalid event date: ${event.date}`);
  }
  const weekday = new Intl.DateTimeFormat("en", { weekday: "long" }).format(date);

  return {
    title: type.title,
    message: type.message(event.name, weekday),
    name: event.name,
    date: event.date,
    time: event.time,
    locationType: Object.hasOwn(locationOptions, event.location) ? event.location : "custom",
    location: event.location,
    additionalDetails: event.details ?? "",
    link: getEventHref(event.link),
    signature: "From Sundar & Elena",
  };
}

export function generateEventMessage(messageType, fields) {
  const type = messageTypes.find((item) => item.key === messageType);
  if (!type) {
    throw new Error(`Unknown event message type: ${messageType}`);
  }

  const [year, month, day] = fields.date.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  if (formatDateInput(date) !== fields.date) {
    throw new Error(`Invalid event date: ${fields.date}`);
  }
  const formattedDate = new Intl.DateTimeFormat("en", {
    weekday: "long",
    month: "long",
    day: "numeric",
  }).format(date);
  const location = locationOptions[fields.locationType];
  if (!location) {
    throw new Error(`Unknown event location type: ${fields.locationType}`);
  }
  const locationName = fields.locationType === "custom" ? fields.location : location.name;
  const href = getEventHref(fields.link);
  const details = [
    fields.name.trim(),
    `📅 ${formattedDate}`,
    `🕔 ${fields.time.trim()}`,
    `📍 ${locationName.trim()}`,
    location.map,
    fields.additionalDetails.trim(),
  ].filter(Boolean);

  return [
    fields.title.trim(),
    "",
    fields.message.trim(),
    "",
    details.join("\n"),
    "",
    "🔗 Reserve your spot here:",
    "",
    href,
    "",
    fields.signature.trim(),
  ].join("\n");
}

function formatDateInput(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
