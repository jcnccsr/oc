"use client";

import { useId, useRef, useState } from "react";
import Image from "next/image";
import announcement10Icon from "../../public/svg/10th.svg";
import announcement2Icon from "../../public/svg/2nd.svg";
import invitationIcon from "../../public/svg/invite.svg";
import personalReminderIcon from "../../public/svg/personal.svg";
import {
  generateEventMessage,
  getMessageDraft,
  isValidEventDate,
  locationOptions,
  messageTypes,
} from "@/utils/eventMessages";
import styles from "./EventMessageComposer.module.css";

const messageIcons = {
  announcement10: announcement10Icon,
  announcement2: announcement2Icon,
  invitation: invitationIcon,
  personalReminder: personalReminderIcon,
};

export default function EventMessageComposer({ event, availableMessages }) {
  const dialogRef = useRef(null);
  const headingId = useId();
  const [selectedType, setSelectedType] = useState(null);
  const [fields, setFields] = useState(null);
  const [copyStatus, setCopyStatus] = useState("");
  const hasValidDate = fields?.date && isValidEventDate(fields.date);
  const generatedMessage = selectedType && hasValidDate
    ? generateEventMessage(selectedType, fields)
    : "";

  function openComposer(type) {
    setSelectedType(type.key);
    setFields(getMessageDraft(event, type.key));
    setCopyStatus("");
    dialogRef.current?.showModal();
  }

  function updateField(field, value) {
    setFields((current) => ({ ...current, [field]: value }));
  }

  async function copyMessage() {
    try {
      await navigator.clipboard.writeText(generatedMessage);
      setCopyStatus("Message copied.");
    } catch {
      setCopyStatus("Copy failed. Check clipboard permissions.");
    }
  }

  return (
    <>
      <span className={styles.messageButtons} aria-label={`Create messages for ${event.name}`}>
        {availableMessages.map((type) => (
          <button
            className={styles.messageButton}
            key={type.key}
            type="button"
            onClick={() => openComposer(type)}
            aria-label={`Edit ${type.label} for ${event.name}`}
            title={`Edit ${type.label}`}
          >
            <Image src={messageIcons[type.key]} alt="" width={32} height={32} />
          </button>
        ))}
      </span>

      <dialog
        className={styles.dialog}
        ref={dialogRef}
        onClose={() => {
          setSelectedType(null);
          setFields(null);
          setCopyStatus("");
        }}
        aria-labelledby={headingId}
      >
        {selectedType && fields && (
          <section className={styles.composer}>
            <div className={styles.dialogHeader}>
              <div>
                <p className={styles.eyebrow}>Message composer</p>
                <h2 id={headingId}>
                  {messageTypes.find((type) => type.key === selectedType)?.label}
                </h2>
              </div>
              <button
                className={styles.closeButton}
                type="button"
                onClick={() => dialogRef.current?.close()}
                aria-label="Close message composer"
              >
                ×
              </button>
            </div>

            <div className={styles.typeButtons} aria-label="Message type">
              {messageTypes.map((type) => (
                <button
                  className={selectedType === type.key ? styles.selectedType : ""}
                  key={type.key}
                  type="button"
                  onClick={() => {
                    setSelectedType(type.key);
                    setFields(getMessageDraft(event, type.key));
                    setCopyStatus("");
                  }}
                >
                  {type.label}
                </button>
              ))}
            </div>

            <div className={styles.form}>
              <label>
                Title
                <input value={fields.title} onChange={(e) => updateField("title", e.target.value)} />
              </label>
              <label>
                Message
                <textarea
                  rows={3}
                  value={fields.message}
                  onChange={(e) => updateField("message", e.target.value)}
                />
              </label>
              <div className={styles.fieldRow}>
                <label>
                  Event name
                  <input value={fields.name} onChange={(e) => updateField("name", e.target.value)} />
                </label>
                <label>
                  Date
                  <input
                    type="date"
                    value={fields.date}
                    onChange={(e) => updateField("date", e.target.value)}
                  />
                </label>
              </div>
              <div className={styles.fieldRow}>
                <label>
                  Time
                  <input value={fields.time} onChange={(e) => updateField("time", e.target.value)} />
                </label>
                <label>
                  Location type
                  <select
                    value={fields.locationType}
                    onChange={(e) => updateField("locationType", e.target.value)}
                  >
                    {Object.entries(locationOptions).map(([value, option]) => (
                      <option key={value} value={value}>{option.label}</option>
                    ))}
                  </select>
                </label>
              </div>
              {fields.locationType === "custom" && (
                <label>
                  Location name
                  <input
                    value={fields.location}
                    onChange={(e) => updateField("location", e.target.value)}
                  />
                </label>
              )}
              <label>
                Additional details
                <textarea
                  rows={3}
                  placeholder="Price, hosts, transport notes, or other event details"
                  value={fields.additionalDetails}
                  onChange={(e) => updateField("additionalDetails", e.target.value)}
                />
              </label>
              <label>
                Event link or slug
                <input value={fields.link} onChange={(e) => updateField("link", e.target.value)} />
              </label>
              <label>
                Signature
                <input
                  value={fields.signature}
                  onChange={(e) => updateField("signature", e.target.value)}
                />
              </label>
            </div>

            <label className={styles.previewLabel}>
              Generated message
              {generatedMessage ? (
                <textarea className={styles.preview} rows={12} readOnly value={generatedMessage} />
              ) : (
                <span className={styles.validationMessage}>Enter a valid event date to generate the message.</span>
              )}
            </label>
            <div className={styles.actions}>
              <span aria-live="polite">{copyStatus}</span>
              <button
                className={styles.copyButton}
                type="button"
                onClick={copyMessage}
                disabled={!generatedMessage}
              >
                Copy message
              </button>
            </div>
          </section>
        )}
      </dialog>
    </>
  );
}
