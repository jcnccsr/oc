"use client";

import { useId, useState } from "react";
import Image from "next/image";
import styles from "./CopyMessageButton.module.css";

import announcement10Icon from "../../public/svg/10th.svg";
import announcement2Icon from "../../public/svg/2nd.svg";
import invitationIcon from "../../public/svg/invite.svg";
import personalReminderIcon from "../../public/svg/personal.svg";

const messageIcons = {
  announcement10: announcement10Icon,
  announcement2: announcement2Icon,
  invitation: invitationIcon,
  personalReminder: personalReminderIcon,
};

export default function CopyMessageButton({ iconKey, label, text }) {
  const [status, setStatus] = useState("");
  const previewId = useId();

  async function copyMessage() {
    try {
      await navigator.clipboard.writeText(text);
      setStatus("Copied");
    } catch {
      setStatus("Copy failed. Check clipboard permissions.");
    }
  }

  return (
    <span className={styles.copyAction}>
      <button
        className={styles.copyButton}
        type="button"
        onClick={copyMessage}
        aria-label={`Copy ${label}`}
        aria-describedby={previewId}
        title={`Copy ${label}`}
      >
        <Image src={messageIcons[iconKey]} alt="" width={32} height={32} />
      </button>
      <span className={styles.preview} id={previewId} role="tooltip">
        {text}
      </span>
      <span className={styles.status} aria-live="polite">
        {status}
      </span>
    </span>
  );
}
