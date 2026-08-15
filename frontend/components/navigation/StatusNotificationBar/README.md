# Status Notification Bar

> **Scope:** The permanent bottom-level feedback surface for operational outcomes, product and configuration alerts, and unexpected client-side code failures.
>
> **Canonical name:** `StatusNotificationBar`
>
> **Shell level:** Global
>
> **Persistence:** Permanent bar with a browsable in-session history of the latest 100 notifications.

## Purpose

`StatusNotificationBar` is the single, non-blocking feedback surface for the application shell. It replaces transient floating feedback with a compact status summary and a manually browsable notification center. The active item is visible in the bottom bar; selecting it opens the center without interrupting the current business flow.

The component deliberately separates **data**, **presentation**, **runtime capture**, and **legacy compatibility**. `useNotificationStore.ts` owns typed state and history; `content.ts` owns the Arabic and English interface copy; `StatusNotificationBar.tsx` renders and navigates the history; `StatusNotificationBar.module.css` contains isolated styles; and `NotificationRuntimeBridge.tsx` captures otherwise unhandled client runtime failures.

## Semantic notification channels

| Channel | Colour | Intended use | Typical source |
| --- | --- | --- | --- |
| **Operational and accounting** | Amber / yellow | Validation feedback, accounting operations, server responses, and workflow outcomes. | Existing `showToast(...)` calls and shared CRUD stores. |
| **Code errors** | Red | Unhandled client runtime errors and rejected promises that need technical inspection. | `NotificationRuntimeBridge` and `useErrorStore`. |
| **Product and setup** | Blue | Low stock, products nearing expiry, operating-context preparation, and financial periods nearing their end. | Global dashboard, operating-context readiness, and fiscal-period screen. |

The legacy `showToast` API remains compatible but now writes a retained **operational** notification rather than producing a floating toast. This lets existing pages transition safely without a broad, high-risk rewrite.

## Interaction model

The bottom bar always displays the most recent active notification, including its semantic colour and unread count. Clicking the summary opens the notification center. The center supports an explicit filter for every channel, a selectable chronological list, full-message details, source metadata, and protected technical details for code errors.

Manual navigation is always deliberate. Users select an item from the list or use the **previous** and **next** controls to move through the currently filtered sequence. Selecting an item marks it as read. An item can be dismissed without deleting the surrounding history; dismissed entries can later be cleaned from the retained history. Where an event supplies an application route, the center shows a direct link to the relevant screen.

## Data contract

Every entry in the store follows `AppNotification`:

| Field | Description |
| --- | --- |
| `category` | One of `operational`, `code`, or `product`; it determines the semantic colour and filter. |
| `severity` | Additional business severity: `info`, `success`, `warning`, `error`, or `critical`. |
| `message` | The user-facing summary shown in the bar and list. |
| `source` | The feature, runtime location, or service that produced the event. |
| `details` | Optional extended context, including stack details for code errors where available. |
| `action` | Optional internal route and link label for manual navigation to a related screen. |
| `dedupeKey` | Optional stable key that updates an existing active item rather than adding duplicate rows. |

Use the focused publishing helpers rather than modifying the store directly:

```ts
publishOperationalNotification({ message, source, severity: "warning" });
publishCodeError({ message, source, details });
publishProductNotification({ message, source, action, dedupeKey });
```

## Accessibility and responsive behaviour

The center uses a labelled dialog, accessible state for category filters, keyboard-focusable controls, readable colour contrast, and semantic timestamps. Its detail drawer opens upward from the fixed bottom bar, avoiding overlap with the workspace. On narrow screens, the list and detail areas stack vertically while the bottom status summary remains compact.

## Maintenance rules

New interface labels belong in `content.ts`; new store fields and publishing rules belong in `useNotificationStore.ts`; visual changes belong in `StatusNotificationBar.module.css`; and rendering changes belong in `StatusNotificationBar.tsx`. Do not reintroduce temporary floating feedback for global operational results. Feature pages should call `showToast` for ordinary operation feedback or one of the dedicated publishing helpers when they know the semantic channel.
