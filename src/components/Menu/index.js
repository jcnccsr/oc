import styles from "./Menu.module.css";
export default function Menu() {

  const links = [
    { name: "Home", href: "/" },
    { name: "Calendar", href: "/calendar" },
    { name: "Accounting", href: "/accounting" },
  ];
  return (
    <nav className={styles.menu}>
      <ul>
        {links.map((link) => (
          <li key={link.href}>
            <a href={link.href}>{link.name}</a>
          </li>
        ))}
      </ul>
    </nav>
  );
}