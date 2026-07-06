import { site } from "../content/site";
import { projects } from "../content/projects";

/**
 * The whole site as a plain semantic document, visually hidden but fully
 * available to screen readers and crawlers. Single-sourced from the same
 * content model as the 3D scene.
 */
export function SrDocument() {
  return (
    <main className="sr-document">
      <h1>{site.name}</h1>
      <p>
        {site.tagline} — {site.location}
      </p>

      <section aria-label="Selected work">
        <h2>Selected work</h2>
        <ul>
          {projects.map((p) => (
            <li key={p.id}>
              <h3>{p.name}</h3>
              <p>{p.blurb}</p>
              <p>{p.tags.join(", ")}</p>
              {p.repo && <a href={p.repo}>Source code for {p.name}</a>}
              {p.demo && <a href={p.demo}>Live demo of {p.name}</a>}
            </li>
          ))}
        </ul>
      </section>

      <section aria-label="About">
        <h2>{site.about.heading}</h2>
        {site.about.body.map((p) => (
          <p key={p.slice(0, 24)}>{p}</p>
        ))}
        <h3>{site.experience.heading}</h3>
        <p>({site.experience.note})</p>
        <ul>
          {site.experience.items.map((item) => (
            <li key={item.title}>
              <h4>{item.title}</h4>
              <p>{item.blurb}</p>
              <p>{item.tags.join(", ")}</p>
            </li>
          ))}
        </ul>
      </section>

      <section aria-label="Skills">
        <h2>Skills</h2>
        <ul>
          {site.skills.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ul>
      </section>

      <section aria-label="Contact">
        <h2>{site.contact.heading}</h2>
        <ul>
          {site.contact.links.map((l) => (
            <li key={l.label}>
              <a href={l.href}>{l.label}</a>
            </li>
          ))}
        </ul>
      </section>

      <footer>
        <p>{site.footer.copyright}</p>
        <p>{site.footer.disclaimer}</p>
      </footer>
    </main>
  );
}
