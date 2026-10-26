"use client";

import { useId, useRef, useState } from "react";
import Image from "next/image";
import announcement10Icon from "../../public/svg/10th.svg";
import announcement2Icon from "../../public/svg/2nd.svg";
import invitationIcon from "../../public/svg/invite.svg";
import personalReminderIcon from "../../public/svg/personal.svg";
import {
  generateEventMessage,
  messageTypes,
  titleIcons,
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
  const messageInputRef = useRef(null);
  const headingId = useId();
  const [selectedType, setSelectedType] = useState(null);
  const [generatedMessage, setGeneratedMessage] = useState("");
  const [copyStatus, setCopyStatus] = useState("");

  function openComposer(type) {
    setSelectedType(type.key);
    setGeneratedMessage(generateEventMessage(type.key, event));
    setCopyStatus("");
    dialogRef.current?.showModal();
  }

  function insertIcon(icon) {
    const input = messageInputRef.current;
    if (!input) return;

    const start = input.selectionStart;
    const end = input.selectionEnd;
    const nextValue = `${generatedMessage.slice(0, start)}${icon}${generatedMessage.slice(end)}`;
    setGeneratedMessage(nextValue);
    setCopyStatus("");
    requestAnimationFrame(() => {
      input.focus();
      const caretPosition = start + icon.length;
      input.setSelectionRange(caretPosition, caretPosition);
    });
  }

  async function copyMessage() {
    try {
      await navigator.clipboard.writeText(generatedMessage);
      dialogRef.current?.close();
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
          setGeneratedMessage("");
          setCopyStatus("");
        }}
        aria-labelledby={headingId}
      >
        {selectedType && (
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
                    setGeneratedMessage(generateEventMessage(type.key, event));
                    setCopyStatus("");
                  }}
                >
                  {type.label}
                </button>
              ))}
            </div>

            <div className={styles.iconPicker} aria-label="Insert an icon into the message">
              <span>Insert icon at cursor:</span>
              <div>
                {titleIcons.map((icon) => (
                  <button
                    key={icon.value}
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => insertIcon(icon.value)}
                    aria-label={`Insert ${icon.value}`}
                    title={`Insert ${icon.value}`}
                  >
                    {icon.value}
                  </button>
                ))}
              </div>
            </div>
            <label className={styles.messageField}>
              Generated message
              <textarea
                className={styles.preview}
                ref={messageInputRef}
                rows={20}
                value={generatedMessage}
                onChange={(e) => {
                  setGeneratedMessage(e.target.value);
                  setCopyStatus("");
                }}
              />
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
