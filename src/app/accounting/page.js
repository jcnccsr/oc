import styles from "./accounting.module.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import contents from "@/data/contents.json";

export default function Accounting() {
  return (
    <>
      <Header />
      <main className={styles.main}>
        <section className={styles.accounting}>
          <p className={styles.eyebrow}>Month-end checklist</p>
          <h2>Invoice portals</h2>
          <p className={styles.description}>
            Visit each company portal at the end of the month to download the invoice.
          </p>
          <ul className={styles.companyList}>
            {contents.companies.map((company) => (
              <li className={styles.company} key={company.name}>
                <span className={styles.icon} aria-hidden="true">
                  {company.icon}
                </span>
                <span className={styles.companyDetails}>
                  <span className={styles.companyName}>{company.name}</span>
                  {company.link ? (
                    <a href={company.link} target="_blank" rel="noreferrer">
                      Open portal
                    </a>
                  ) : (
                    <span className={styles.placeholder}>Portal link to be added</span>
                  )}
                </span>
              </li>
            ))}
          </ul>
        </section>
      </main>
      <Footer />
    </>
  );
}