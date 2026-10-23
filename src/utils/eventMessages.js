import contents from "@/data/contents.json";

const calendar = contents.calendar;
const eventUrl = calendar.eventUrl;
export const messageTypes = calendar.messageTypes;
export const titleIcons = calendar.titleIcons;
export const titleOptions = calendar.titleOptions;
export const locationOptions = calendar.locations;

function getDefaultTitle(messageType) {
  const option = titleOptions.find((item) => item.defaultFor === messageType);
  if (!option) {
    throw new Error(`Missing default message title for: ${messageType}`);
  }
  return option.value;
}

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
  const message = type.defaultMessage
    .replaceAll("{{name}}", event.name)
    .replaceAll("{{weekday}}", weekday);

  return {
    icon: type.defaultIcon,
    title: getDefaultTitle(messageType),
    message,
    name: event.name,
    date: event.date,
    time: event.time,
    locationType: Object.hasOwn(locationOptions, event.location) ? event.location : "custom",
    location: event.location,
    additionalDetails: event.details ?? "",
    link: getEventHref(event.link),
    signature: calendar.defaultSignature,
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
  const replacements = {
    name: fields.name.trim(),
    date: formattedDate,
    time: fields.time.trim(),
    location: locationName.trim(),
  };
  const details = calendar.messageDetails
    .map((line) => line.replace(/\{\{(\w+)\}\}/g, (_, key) => replacements[key] ?? ""))
    .concat(location.map ?? "", fields.additionalDetails.trim())
    .filter(Boolean);
  const title = [fields.icon, fields.title.trim()].filter(Boolean).join(" ");

  return [
    title,
    "",
    fields.message.trim(),
    "",
    details.join("\n"),
    "",
    calendar.reservationPrompt,
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
