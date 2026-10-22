import contents from "@/data/config.json";
import Menu from "../Menu";
import styles from "./Header.module.css";
export default function Header() {
  return (
    <header className={styles.header}>
      <Menu />
      <h1>{contents.website.name}</h1>
    </header>
  );
}