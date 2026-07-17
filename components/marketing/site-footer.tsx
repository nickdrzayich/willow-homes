const LINKS = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
] as const;

export function SiteFooter({ current }: { current: "/" | "/about" | "/contact" | null }) {
  return (
    <div className="footer">
      <div className="footer-centre">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/WH-Logo-White.png"
          width={397}
          sizes="(max-width: 479px) 83vw, 397px"
          srcSet="/images/WH-Logo-White-p-500.png 500w, /images/WH-Logo-White-p-800.png 800w, /images/WH-Logo-White-p-1080.png 1080w, /images/WH-Logo-White.png 1500w"
          alt=""
          className="logo-2"
        />
        <p className="paragraph-light">Let&#x27;s Build Something Different.</p>
        <div className="footer-link-wrap">
          {LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              aria-current={current === link.href ? "page" : undefined}
              className={`footer-link-white${current === link.href ? " w--current" : ""}`}
            >
              {link.label}
            </a>
          ))}
          <a href="/admin/login" className="footer-link-white">
            Admin
          </a>
        </div>
        <div className="footer-wrapper">
          <a
            href="https://www.instagram.com/willowhomesco/"
            target="_blank"
            rel="noreferrer"
            className="social-link w-inline-block"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/004-instagram.svg" alt="" />
          </a>
        </div>
      </div>
    </div>
  );
}
