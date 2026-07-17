import type { Metadata } from "next";
import { SiteNav } from "@/components/marketing/site-nav";
import { SiteFooter } from "@/components/marketing/site-footer";

export const metadata: Metadata = {
  title: "About Willow Homes",
  description: "Idaho home builder Willow Homes | About Us",
  openGraph: {
    title: "About Willow Homes",
    description: "Idaho home builder Willow Homes | About Us",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "About Willow Homes",
    description: "Idaho home builder Willow Homes | About Us",
  },
};

export default function AboutPage() {
  return (
    <>
      <SiteNav current="/about" />
      <div className="header-inner cc-header-extra">
        <div className="container">
          <div className="header-inner-content" />
        </div>
      </div>
      <div className="header-banner" />
      <div className="about-intro">
        <div className="container cc-center">
          <div className="h2-container cc-center">
            <h2 className="h2 cc-center">
              <span className="text-span">
                We were born here. We were raised here. We live here. <br />
                &#x200D;
              </span>{" "}
              Idaho is, and always has been, home for us. Our family loves everything this great state has to offer
              and it&#x27;s our passion to bring more beautiful, intentionally designed homes to the Treasure
              Valley. Our mission is simple - treat other people the way we want to be treated.{" "}
            </h2>
          </div>
        </div>
      </div>
      <div className="separator">
        <div className="container">
          <div className="line-color" />
        </div>
      </div>
      <div className="team">
        <div className="container">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/nick-and-jess.jpg"
            loading="lazy"
            width={138}
            srcSet="/images/nick-and-jess-p-500.jpeg 500w, /images/nick-and-jess-p-800.jpeg 800w, /images/nick-and-jess-p-1080.jpeg 1080w, /images/nick-and-jess-p-1600.jpeg 1600w, /images/nick-and-jess-p-2000.jpeg 2000w, /images/nick-and-jess-p-2600.jpeg 2600w, /images/nick-and-jess-p-3200.jpeg 3200w, /images/nick-and-jess.jpg 4338w"
            alt="Nick and Jess | Willow Homes"
            sizes="138px"
            className="image-5"
          />
          <h5>Jessica &amp; Nick Drzayich</h5>
        </div>
      </div>
      <div className="separator">
        <div className="container">
          <div className="line-color" />
        </div>
      </div>
      <SiteFooter current="/about" />
    </>
  );
}
