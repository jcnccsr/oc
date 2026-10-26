import contents from "@/data/contents.json";

const calendar = contents.calendar;
export const messageTypes = calendar.messageTypes;
export const titleIcons = calendar.titleIcons;
export const titleOptions = calendar.titleOptions;
export const locationOptions = calendar.locations;

function formatDateInput(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getEventDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new Error(`Invalid event date: ${value}`);
  }
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  if (formatDateInput(date) !== value) {
    throw new Error(`Invalid event date: ${value}`);
  }
  return date;
}

function interpolate(template, values) {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => values[key] ?? "");
}

export function getEventHref(link, resourceType = "event") {
  const route = resourceType === "retreat" ? calendar.retreatUrl : calendar.eventUrl;
  const path = link
    .replace(/^https:\/\/www\.opencircleyoga\.org\/(?:event|retreat)\//, "")
    .replace(/^\/?(?:event|retreat)\//, "")
    .replace(/^\/+/, "");
  return `${route}${path}`;
}

export function isValidEventDate(value) {
  try {
    getEventDate(value);
    return true;
  } catch {
    return false;
  }
}

function getFallbackTemplate(event, messageType) {
  const type = messageTypes.find((item) => item.key === messageType);
  if (!type) {
    throw new Error(`Unknown event message type: ${messageType}`);
  }
  const titleOption = titleOptions.find((item) => item.defaultFor === messageType);
  if (!titleOption) {
    throw new Error(`Missing default message title for: ${messageType}`);
  }
  const locationType = Object.hasOwn(locationOptions, event.location)
    ? event.location
    : "custom";
  const location = locationOptions[locationType];

  return {
    title: titleOption.value,
    details: calendar.messageDetails.join("\n"),
    additionalMessage: type.defaultMessage,
    signature: event.facilitator
      ? `From ${event.facilitator}`
      : calendar.defaultSignature,
    locationType,
    additionalLocationDetails:
      location.defaultAdditionalDetailsByMessageType?.[messageType]
      ?? location.defaultAdditionalDetails
      ?? "",
  };
}

export function generateEventMessage(messageType, event) {
  const date = getEventDate(event.date);
  const type = messageTypes.find((item) => item.key === messageType);
  if (!type) {
    throw new Error(`Unknown event message type: ${messageType}`);
  }
  const locationType = Object.hasOwn(locationOptions, event.location)
    ? event.location
    : "custom";
  const location = locationOptions[locationType];
  const eventType = event.eventType ? contents.eventTypes[event.eventType] : null;
  if (event.eventType && !eventType) {
    throw new Error(`Unknown event type: ${event.eventType}`);
  }
  const template = eventType?.messages?.[messageType]
    ?? getFallbackTemplate(event, messageType);
  const formattedDate = new Intl.DateTimeFormat("en", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(date);
  const dateWithoutYear = new Intl.DateTimeFormat("en", {
    weekday: "long",
    month: "long",
    day: "numeric",
  }).format(date);
  const monthDay = new Intl.DateTimeFormat("en", {
    month: "long",
    day: "numeric",
  }).format(date);
  const locationName = locationType === "custom" ? event.location : location.name;
  const eventHref = getEventHref(event.link, event.resourceType);
  const values = {
    name: event.messageName ?? event.name,
    date: formattedDate,
    shortDate: dateWithoutYear,
    monthDay,
    weekday: new Intl.DateTimeFormat("en", { weekday: "long" }).format(date),
    time: event.time,
    location: locationName.trim(),
    map: location.map ?? "",
    link: eventHref,
    facilitator: event.facilitator || calendar.defaultSignature.replace(/^From\s+/, ""),
  };
  if (Array.isArray(template.body)) {
    return interpolate(template.body.join("\n"), values).trim();
  }
  if (typeof template.body === "string") {
    return interpolate(template.body, values).trim();
  }
  const details = interpolate(template.details, values).replace(/\n{3,}/g, "\n\n").trim();
  const additionalMessage = interpolate(template.additionalMessage, values).trim();
  const extraLocationDetails = template.additionalLocationDetails
    ? interpolate(template.additionalLocationDetails, values).trim()
    : "";
  const signature = interpolate(template.signature, values).trim();
  const sections = [
    interpolate(template.title, values).trim(),
    additionalMessage,
    [details, extraLocationDetails].filter(Boolean).join("\n\n"),
  ].filter(Boolean);

  if (messageType !== "personalReminder") {
    sections.push(calendar.reservationPrompt, eventHref);
  }

  if (signature) {
    sections.push(signature);
  }

  return sections.join("\n\n");
}

export function getMessageDraft(event, messageType) {
  return generateEventMessage(messageType, event);
}
