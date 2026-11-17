# OCDesk

A small helper app to remind me of task at work.

The calendar, event, and planner content is managed in `src/data/contents.json`.
Planner tasks are in `planner.tasks`; each task has an `id`, `title`,
`description`, `details`, `dueDate` (`YYYY-MM-DD`), `dueTime` (`HH:mm`), and a
`status` matching an entry in `planner.statuses`. Task dots appear in a separate
column on their date card; hover, focus, or tap a dot to view its details.
