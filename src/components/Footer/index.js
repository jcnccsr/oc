import Link from "next/link";
import styles from "./Footer.module.css";
import contents from "@/data/config.json";
export default function Footer() {
  
  const ans = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <p><span>&copy;</span> {ans}. <Link href={contents.author.website} target="_blank" rel="noopener noreferrer">
        {contents.author.handle}.
      </Link> All rights reversed.</p>
    </footer>
  )
}