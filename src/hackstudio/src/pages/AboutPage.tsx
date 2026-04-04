import './AboutPage.css'

export function AboutPage() {
  return (
    <div className="about-page">
      <section className="about-hero">
        <h1>AI Hackathon for Teens</h1>
        <p className="about-subtitle">by Families ERG</p>
        <p>
          A fun and collaborative in-person session where students explore real-world
          problems, create solutions with AI, and strengthen teamwork and critical thinking.
        </p>
        <div className="about-badges">
          <span className="badge badge-blue">2 hours</span>
          <span className="badge badge-purple">Labs &amp; Quiz</span>
          <span className="badge badge-green">In person</span>
        </div>
      </section>

      <div className="about-content">
        <section className="about-section">
          <p><strong>Speakers:</strong> Daniel Fang, Mo Hazem</p>
          <p><strong>Organisers:</strong> Vik Verma, Anke Vromans, Paloma Kralic</p>
        </section>

      </div>
    </div>
  )
}
