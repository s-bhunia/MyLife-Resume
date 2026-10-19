import { useEffect, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { archive, education, experience, profile, projects, skills, socials, travel, work, type Showcase } from "@mylife/profile";
import "./quick.css";

function Banner({ symbol, title, index }: { symbol: string; title: string; index: string }) {
  return (
    <h2 className="j-banner">
      <span className="j-banner-plate">
        <span aria-hidden="true">{symbol}</span>
        {title}
      </span>
      <span className="j-hexnum">{index}</span>
    </h2>
  );
}

function Section({ id, symbol, title, index, children }: { id: string; symbol: string; title: string; index: string; children: ReactNode }) {
  return (
    <section id={id} className="j-section">
      <Banner symbol={symbol} title={title} index={index} />
      {children}
    </section>
  );
}

function Folder({ item }: { item: Showcase }) {
  return (
    <article className={`j-folder is-${item.kind}`}>
      <span className="j-folder-tab" aria-hidden="true">
        {item.symbol}
      </span>
      <h3>{item.title}</h3>
      <p className="j-folder-tag">{item.tagline}</p>
      <p>{item.summary}</p>
      <p className="j-stack">{item.stack.join(" · ")}</p>
      {(item.link || item.code) && (
        <footer>
          {item.link && (
            <a href={item.link} target="_blank" rel="noopener noreferrer">
              Try it ↗
            </a>
          )}
          {item.code && (
            <a href={item.code} target="_blank" rel="noopener noreferrer">
              Code ↗
            </a>
          )}
        </footer>
      )}
    </article>
  );
}

function Stamp() {
  const label = `${profile.role} · Speech AI · LLMs · Voice Agents · `;
  return (
    <div className="j-stamp" aria-hidden="true">
      <svg viewBox="0 0 200 200">
        <defs>
          <path id="j-stamp-path" d="M100,100 m-78,0 a78,78 0 1,1 156,0 a78,78 0 1,1 -156,0" />
        </defs>
        <text>
          <textPath href="#j-stamp-path">{label.toUpperCase()}</textPath>
        </text>
      </svg>
      <img src="/logo.webp" alt="" width={86} height={86} />
    </div>
  );
}

export default function QuickView() {
  useEffect(() => {
    const previous = document.title;
    document.title = `${profile.name} · Quick view`;
    window.scrollTo(0, 0);
    return () => {
      document.title = previous;
    };
  }, []);

  const job = experience[0];

  return (
    <div className="journal">
      <header className="j-top">
        <Link to="/" className="j-brand">
          <img src="/logo.webp" alt="" width={40} height={40} />
          <span>
            my<b>Life</b>
          </span>
        </Link>
        <nav>
          <a href="#work">Work</a>
          <a href="#skills">Skills</a>
          <a href="#contact">Contact</a>
          <Link to="/" className="j-tag">
            Enter the house
          </Link>
        </nav>
      </header>

      <main className="j-page">
        <section className="j-hero">
          <figure className="j-arch">
            <span className="j-arch-ring" aria-hidden="true" />
            <span className="j-arch-back" aria-hidden="true" />
            <img src={profile.portrait} alt={`Portrait of ${profile.name}`} width={900} height={1200} />
            <figcaption>{profile.location.split(",")[0]}</figcaption>
          </figure>

          <div className="j-hero-text">
            <p className="j-entry">Entry no. 01 · who I am</p>
            <h1>{profile.name}</h1>
            <p className="j-role">
              {job?.role ?? profile.role}
              <i aria-hidden="true" />
              {profile.focus}
            </p>
            <p className="j-lead">{profile.headline}</p>
            <div className="j-actions">
              <Link to="/" className="j-btn">
                <span>Step inside my mind</span>
              </Link>
              <a className="j-tag" href={profile.resumeUrl} target="_blank" rel="noopener noreferrer">
                Résumé
              </a>
              <a className="j-tag is-light" href={`mailto:${profile.email}`}>
                Write to me
              </a>
            </div>
            <p className="j-status">
              <span aria-hidden="true" />
              {profile.status}
            </p>
          </div>

          <Stamp />
        </section>

        <Section id="about" symbol="👤" title="ABOUT ME" index="01">
          <div className="j-prose">
            {profile.about.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </Section>

        <Section id="experience" symbol="🛠️" title="RIGHT NOW" index="02">
          {experience.map((entry) => (
            <article key={entry.role} className="j-ticket">
              <div className="j-ticket-stub">
                <span>{entry.period}</span>
              </div>
              <div className="j-ticket-body">
                <h3>{entry.role}</h3>
                {entry.org && <p className="j-folder-tag">{entry.org}</p>}
                <ul>
                  {entry.points.map((point) => (
                    <li key={point}>{point}</li>
                  ))}
                </ul>
              </div>
            </article>
          ))}
        </Section>

        <Section id="work" symbol="💻" title="WORK & PROJECTS" index="03">
          <div className="j-folders">
            {[...work, ...projects].map((item) => (
              <Folder key={item.id} item={item} />
            ))}
          </div>
          <p className="j-archive">
            Earlier builds:{" "}
            {archive.map((item, i) => (
              <span key={item.id}>
                {i > 0 && " · "}
                <a href={item.link ?? item.code} target="_blank" rel="noopener noreferrer">
                  {item.title}
                </a>
              </span>
            ))}
          </p>
        </Section>

        <Section id="skills" symbol="⚡" title="SKILLS" index="04">
          <div className="j-comb">
            {skills.map((group) => (
              <div key={group.id} className="j-cell" tabIndex={0}>
                <div className="j-cell-face">
                  <span aria-hidden="true">{group.symbol}</span>
                  <strong>{group.title}</strong>
                  <small>{group.tagline}</small>
                </div>
                <ul className="j-cell-back">
                  {group.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </Section>

        <Section id="journeys" symbol="🌍" title="JOURNEYS" index="05">
          <ol className="j-route">
            <li className="is-home">{travel.origin.label}</li>
            {travel.destinations.map((place) => (
              <li key={place.label}>{place.label}</li>
            ))}
          </ol>
          {education.map((entry) => (
            <p key={entry.org} className="j-edu">
              🎓 <strong>{entry.degree}</strong> · {entry.org} · {entry.period} · {entry.note}
            </p>
          ))}
        </Section>

        <Section id="contact" symbol="✉️" title="WRITE TO ME" index="06">
          <div className="j-postcard">
            <div className="j-postcard-note">
              <p>Dear reader,</p>
              <p>If you are building something with voice, language or learning machines, I would love to hear about it.</p>
              <p className="j-sign">— {profile.firstName}</p>
            </div>
            <div className="j-postcard-address">
              <img className="j-postage" src="/logo.webp" alt="" width={64} height={64} />
              <a href={`mailto:${profile.email}`}>{profile.email}</a>
              <ul>
                {socials.map((social) => (
                  <li key={social.id}>
                    <a href={social.url} target="_blank" rel="noopener noreferrer" className="j-seal" title={social.label}>
                      <img src={social.icon} alt="" width={18} height={18} />
                      <span>{social.label}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Section>
      </main>

      <footer className="j-foot">
        <span>
          © {new Date().getFullYear()} {profile.name}
        </span>
        <Link to="/">← back to the house</Link>
      </footer>
    </div>
  );
}
