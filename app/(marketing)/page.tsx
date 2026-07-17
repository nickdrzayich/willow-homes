import type { Metadata } from "next";
import { SiteNav } from "@/components/marketing/site-nav";
import { SiteFooter } from "@/components/marketing/site-footer";

export const metadata: Metadata = {
  title: "Home Builder In Idaho | Willow Homes",
  description: "Building beautiful and functional homes in Idaho.",
};

export default function HomePage() {
  return (
    <>
      <div className="navigation" />
      <SiteNav current="/" />
      <div className="header">
        <div className="header-content">
          <a href="/contact" className="button w-button">
            Contact Us
          </a>
        </div>
      </div>
      <div className="features">
        <div className="container">
          <h1 className="heading">Let&#x27;s Build Something Different</h1>
          <div className="line-color" />
          <div className="w-row">
            <div className="column w-col w-col-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/441-Rio-Colinas_2230-ZF-4347-84602-1-001-031.jpg"
                loading="lazy"
                sizes="(max-width: 479px) 83vw, (max-width: 767px) 90vw, 29vw"
                srcSet="/images/441-Rio-Colinas_2230-ZF-4347-84602-1-001-031-p-500.jpeg 500w, /images/441-Rio-Colinas_2230-ZF-4347-84602-1-001-031-p-800.jpeg 800w, /images/441-Rio-Colinas_2230-ZF-4347-84602-1-001-031-p-1080.jpeg 1080w, /images/441-Rio-Colinas_2230-ZF-4347-84602-1-001-031-p-1600.jpeg 1600w, /images/441-Rio-Colinas_2230-ZF-4347-84602-1-001-031-p-2000.jpeg 2000w, /images/441-Rio-Colinas_2230-ZF-4347-84602-1-001-031-p-2600.jpeg 2600w, /images/441-Rio-Colinas_2230-ZF-4347-84602-1-001-031-p-3200.jpeg 3200w, /images/441-Rio-Colinas_2230-ZF-4347-84602-1-001-031.jpg 3861w"
                alt=""
                className="image-3"
              />
            </div>
            <div className="column-2 w-col w-col-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/441-Rio-Colinas_2220-ZF-4347-84602-1-001-020-1.jpg"
                loading="lazy"
                sizes="(max-width: 479px) 83vw, (max-width: 767px) 90vw, 29vw"
                srcSet="/images/441-Rio-Colinas_2220-ZF-4347-84602-1-001-020-1-p-500.jpeg 500w, /images/441-Rio-Colinas_2220-ZF-4347-84602-1-001-020-1-p-800.jpeg 800w, /images/441-Rio-Colinas_2220-ZF-4347-84602-1-001-020-1-p-1080.jpeg 1080w, /images/441-Rio-Colinas_2220-ZF-4347-84602-1-001-020-1-p-1600.jpeg 1600w, /images/441-Rio-Colinas_2220-ZF-4347-84602-1-001-020-1-p-2000.jpeg 2000w, /images/441-Rio-Colinas_2220-ZF-4347-84602-1-001-020-1-p-2600.jpeg 2600w, /images/441-Rio-Colinas_2220-ZF-4347-84602-1-001-020-1-p-3200.jpeg 3200w, /images/441-Rio-Colinas_2220-ZF-4347-84602-1-001-020-1.jpg 3861w"
                alt=""
                className="image-3"
              />
            </div>
            <div className="column-3 w-col w-col-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/441-Rio-Colinas_2224-ZF-4347-84602-1-001-025.jpg"
                loading="lazy"
                sizes="(max-width: 479px) 83vw, (max-width: 767px) 90vw, 29vw"
                srcSet="/images/441-Rio-Colinas_2224-ZF-4347-84602-1-001-025-p-500.jpeg 500w, /images/441-Rio-Colinas_2224-ZF-4347-84602-1-001-025-p-800.jpeg 800w, /images/441-Rio-Colinas_2224-ZF-4347-84602-1-001-025-p-1080.jpeg 1080w, /images/441-Rio-Colinas_2224-ZF-4347-84602-1-001-025-p-1600.jpeg 1600w, /images/441-Rio-Colinas_2224-ZF-4347-84602-1-001-025-p-2000.jpeg 2000w, /images/441-Rio-Colinas_2224-ZF-4347-84602-1-001-025-p-2600.jpeg 2600w, /images/441-Rio-Colinas_2224-ZF-4347-84602-1-001-025-p-3200.jpeg 3200w, /images/441-Rio-Colinas_2224-ZF-4347-84602-1-001-025.jpg 3861w"
                alt=""
                className="image-3"
              />
            </div>
          </div>
        </div>
      </div>
      <div className="about">
        <div className="container cc-center">
          <div className="h2-container cc-center">
            <h2 className="h2 cc-center">
              <span className="text-span">Unique to you. </span> Your home should be as unique as you are. We
              couple unique and intentional design with quality construction to build homes that are beautiful,
              functional and one of a kind.
            </h2>
            <a href="/about" className="link">
              More About Us
            </a>
          </div>
        </div>
      </div>
      <div className="separator cc-background-grey" />
      <div className="premium">
        <div className="container">
          <div className="row">
            <div className="_2-row-image cc-row-spacing">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/441-Rio-Colinas_2249-ZF-4347-84602-1-001-050.jpg"
                srcSet="/images/441-Rio-Colinas_2249-ZF-4347-84602-1-001-050-p-500.jpeg 500w, /images/441-Rio-Colinas_2249-ZF-4347-84602-1-001-050-p-800.jpeg 800w, /images/441-Rio-Colinas_2249-ZF-4347-84602-1-001-050-p-1080.jpeg 1080w, /images/441-Rio-Colinas_2249-ZF-4347-84602-1-001-050-p-1600.jpeg 1600w, /images/441-Rio-Colinas_2249-ZF-4347-84602-1-001-050-p-2000.jpeg 2000w, /images/441-Rio-Colinas_2249-ZF-4347-84602-1-001-050-p-2600.jpeg 2600w, /images/441-Rio-Colinas_2249-ZF-4347-84602-1-001-050-p-3200.jpeg 3200w, /images/441-Rio-Colinas_2249-ZF-4347-84602-1-001-050.jpg 3860w"
                sizes="(max-width: 479px) 87vw, (max-width: 767px) 92vw, (max-width: 991px) 47vw, 44vw"
                width={867}
                alt=""
              />
            </div>
            <div className="_2-row-text">
              <h2 className="h2 cc-2-rows">
                <span className="text-span">Beautiful Design.</span> Your home should be a home like no other.
              </h2>
            </div>
          </div>
          <div className="row cc-bottom">
            <div className="_2-row-image cc-bottom">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/441-Rio-Colinas_2209-ZF-4347-84602-1-001-010.jpg"
                width={498}
                sizes="(max-width: 479px) 87vw, (max-width: 767px) 88vw, 47vw"
                srcSet="/images/441-Rio-Colinas_2209-ZF-4347-84602-1-001-010-p-500.jpeg 500w, /images/441-Rio-Colinas_2209-ZF-4347-84602-1-001-010-p-800.jpeg 800w, /images/441-Rio-Colinas_2209-ZF-4347-84602-1-001-010-p-1080.jpeg 1080w, /images/441-Rio-Colinas_2209-ZF-4347-84602-1-001-010-p-1600.jpeg 1600w, /images/441-Rio-Colinas_2209-ZF-4347-84602-1-001-010-p-2000.jpeg 2000w, /images/441-Rio-Colinas_2209-ZF-4347-84602-1-001-010-p-2600.jpeg 2600w, /images/441-Rio-Colinas_2209-ZF-4347-84602-1-001-010-p-3200.jpeg 3200w, /images/441-Rio-Colinas_2209-ZF-4347-84602-1-001-010.jpg 3861w"
                alt=""
              />
            </div>
            <div className="_2-row-text cc-bottom">
              <h2 className="h2 cc-2-rows">
                <span className="text-span">Quality Construction.</span> Only the best materials, trades and
                processes.
              </h2>
            </div>
          </div>
        </div>
      </div>
      <div className="separator cc-background-grey" />
      <h1 className="heading">Recent Projects</h1>
      <div className="w-row">
        <div className="column w-col w-col-4">
          <a href="/8439-mediterranean-ct" target="_blank" className="w-inline-block">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/_Mitera-3_1-Rendering-copy.jpg"
              loading="lazy"
              srcSet="/images/_Mitera-3_1-Rendering-copy-p-500.jpg 500w, /images/_Mitera-3_1-Rendering-copy-p-800.jpg 800w, /images/_Mitera-3_1-Rendering-copy-p-1080.jpg 1080w, /images/_Mitera-3_1-Rendering-copy-p-1600.jpg 1600w, /images/_Mitera-3_1-Rendering-copy-p-2000.jpg 2000w, /images/_Mitera-3_1-Rendering-copy.jpg 2000w"
              sizes="(max-width: 479px) 96vw, (max-width: 767px) 97vw, (max-width: 991px) 31vw, (max-width: 6250px) 32vw, 2000px"
              alt=""
              className="image-3"
            />
          </a>
        </div>
        <div className="column-2 w-col w-col-4">
          <a href="#" className="w-inline-block">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/_West-Highlands-3_6-Rendering-1-copy.jpg"
              loading="lazy"
              srcSet="/images/_West-Highlands-3_6-Rendering-1-copy-p-500.jpg 500w, /images/_West-Highlands-3_6-Rendering-1-copy-p-800.jpg 800w, /images/_West-Highlands-3_6-Rendering-1-copy-p-1080.jpg 1080w, /images/_West-Highlands-3_6-Rendering-1-copy-p-1600.jpg 1600w, /images/_West-Highlands-3_6-Rendering-1-copy-p-2000.jpg 2000w, /images/_West-Highlands-3_6-Rendering-1-copy.jpg 2000w"
              sizes="(max-width: 479px) 96vw, (max-width: 767px) 97vw, (max-width: 991px) 31vw, (max-width: 6250px) 32vw, 2000px"
              alt=""
              className="image-3"
            />
          </a>
        </div>
        <div className="column-3 w-col w-col-4">
          <a href="/eagle-concept-home" className="w-inline-block">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/Pescara-8-1-Rendering-1.jpeg"
              loading="lazy"
              sizes="(max-width: 479px) 92vw, (max-width: 767px) 394px, 31vw"
              width={394}
              alt=""
              srcSet="/images/Pescara-8-1-Rendering-1-p-500.jpeg 500w, /images/Pescara-8-1-Rendering-1-p-800.jpeg 800w, /images/Pescara-8-1-Rendering-1-p-1080.jpeg 1080w, /images/Pescara-8-1-Rendering-1-p-1600.jpeg 1600w, /images/Pescara-8-1-Rendering-1-p-2000.jpeg 2000w, /images/Pescara-8-1-Rendering-1-p-2600.jpeg 2600w, /images/Pescara-8-1-Rendering-1.jpeg 3000w"
              className="image-3"
            />
          </a>
        </div>
      </div>
      <SiteFooter current="/" />
    </>
  );
}
