const eventUrl = "https://www.opencircleyoga.org/event/";
const locationDetails = {
  Studio: {
    name: "Open Circle Yoga Studio",
    map: "https://maps.app.goo.gl/iLQmYwap9vKjbR3v5",
  },
  NHMAD: {
    name: "Natural History Museum Abu Dhabi",
    map: "https://maps.app.goo.gl/jkDh6ZsuFBzSN1xU9",
  },
};

export function getEventHref(link) {
  const path = link
    .replace(/^https:\/\/www\.opencircleyoga\.org\/event\//, "")
    .replace(/^\/+/, "");
  return `${eventUrl}${path}`;
}

export function getEventMessages(event) {
  const [year, month, day] = event.date.split("-").map(Number);
  const formattedDate = new Intl.DateTimeFormat("en", {
    dateStyle: "long",
  }).format(new Date(year, month - 1, day));
  const location = locationDetails[event.location];
  const details = [
    `Event: ${event.name}`,
    `📅 ${formattedDate}`,
    `🕔 ${event.time}`,
    `📍 ${location?.name ?? event.location}`,
    ...(location ? [`${location.map}`] : event.map ? [event.map] : []),
    `🔗 ${getEventHref(event.link)}`,
  ].join("\n");

  return [
    {
      key: "announcement10",
      label: "10-day event announcement",
      text: `Join us in 10 days for ${event.name}!\n\n${details}`,
    },
    {
      key: "announcement2",
      label: "2-day event announcement",
      text: `${event.name} is just 2 days away! We hope you can join us.\n\n${details}`,
    },
    {
      key: "invitation",
      label: "personal event invitation",
      text: `Hi !\n\n I'd love to invite you to ${event.name}. It would be wonderful to have you there!\n\n${details}`,
    },
    {
      key: "personalReminder",
      label: "personal event reminder",
      text: `Hi !\n\n Just a reminder about the upcoming ${event.name}. I hope to see you there!\n\n${details}`,
    },
  ];
}
