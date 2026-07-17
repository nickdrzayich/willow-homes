const LINKS = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
] as const;

export function SiteNav({ current }: { current: "/" | "/about" | "/contact" | null }) {
  return (
    <div
      data-collapse="medium"
      data-animation="default"
      data-duration="400"
      data-easing="ease-out"
      data-easing2="ease-out"
      role="banner"
      className="navigation w-nav"
    >
      <div className="navigation-container">
        {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- intentional full page load, see WebflowScripts */}
        <a
          href="/"
          aria-current={current === "/" ? "page" : undefined}
          className={`logo w-inline-block${current === "/" ? " w--current" : ""}`}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/1.png"
            width={347}
            sizes="(max-width: 479px) 56vw, 347px"
            srcSet="/images/1-p-500.png 500w, /images/1-p-800.png 800w, /images/1-p-1080.png 1080w, /images/1.png 1500w"
            alt=""
            className="image-6"
          />
        </a>
        <nav role="navigation" className="nav-menu w-nav-menu">
          {LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              aria-current={current === link.href ? "page" : undefined}
              className={`nav-link w-nav-link${current === link.href ? " w--current" : ""}`}
            >
              {link.label}
            </a>
          ))}
          <div className="bullet" />
          <a href="tel:208-484-3120" className="navigation-button w-button">
            208-484-3120
          </a>
        </nav>
        <div className="menu-button w-nav-button">
          <div className="icon-2 w-icon-nav-menu" />
        </div>
      </div>
    </div>
  );
}
