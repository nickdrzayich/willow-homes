import type { Metadata } from "next";
import { SiteNav } from "@/components/marketing/site-nav";
import { SiteFooter } from "@/components/marketing/site-footer";

const DESCRIPTION =
  "This custom plan by Willow Homes is truly one of a kind! 5 beds, 4.5 baths, 4 car garage, main level game room and 1,800 square foot sport court. Nestled at the end of a cul-de-sac in north Eagle on a roomy 1.8 acre lot.";

export const metadata: Metadata = {
  title: "Eagle Concept Home",
  description: DESCRIPTION,
  openGraph: {
    title: "Eagle Concept Home",
    description: DESCRIPTION,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Eagle Concept Home",
    description: DESCRIPTION,
  },
};

const QUESTIONS = [
  {
    q: "Usu tractatos accommodare ei pri alii invidunt eu?",
    a: "Molestiae adolescens his cu, ius facete scripta ad, ea ferri fastidii iudicabit pri. Vim id soleat aliquip adipisci, at qui discere denique salutatus, no appareat abhorreant quo. ",
  },
  {
    q: "Mel nostro fabellas tractatos in?",
    a: "Eam soluta noluisse lobortis no, eos in nibh patrioque. Decore populo detracto eu has. Viderer prodesset expetendis ei mel. Graeco invidunt vel et, vis postea feugiat splendide at, velit voluptaria has ex. Suas numquam te cum. Eam eius democritum adipiscing te, wisi facilisi et qui.",
  },
  {
    q: "Mei ne eirmod omittam adipisci?",
    a: "Id sed labores dolorum veritus, falli aeque id vis. Aliquip aperiri facilisis ei eam, an eos agam vivendo platonem. Quo volumus scaevola te. Mei invenire erroribus ne, at sit diam docendi. Vix cu aeque molestiae, sed no persius nusquam postulant.",
  },
  {
    q: "No facilis molestie mei. Alia malis dolor nam ea?",
    a: "Viderer molestiae vim id, equidem oportere consulatu eu nam. Et solum verterem eleifend nam. Doming latine scriptorem ex nec, alii equidem vis eu. ",
  },
] as const;

export default function EagleConceptHomePage() {
  return (
    <>
      <SiteNav current={null} />
      <figure className="header-inner" />
      <h1 className="heading-2">Eagle Concept Home</h1>
      <div className="premium-intro">
        <div className="text-block-2">
          This custom plan by Willow Homes is truly one of a kind! 5 beds, 4.5 baths, 4 car garage, main level game
          room and 1,800 square foot sports court. Nestled at the end of a cul-de-sac in north Eagle on a roomy 1.8
          acre lot.
        </div>
        <h1>The Plan</h1>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/1st-Floor-Plan-Clean.jpg"
          loading="lazy"
          sizes="(max-width: 479px) 87vw, (max-width: 767px) 92vw, (max-width: 991px) 94vw, (max-width: 3085px) 98vw, 3024px"
          srcSet="/images/1st-Floor-Plan-Clean-p-500.jpg 500w, /images/1st-Floor-Plan-Clean-p-800.jpg 800w, /images/1st-Floor-Plan-Clean-p-1080.jpg 1080w, /images/1st-Floor-Plan-Clean-p-1600.jpg 1600w, /images/1st-Floor-Plan-Clean-p-2000.jpg 2000w, /images/1st-Floor-Plan-Clean-p-2600.jpg 2600w, /images/1st-Floor-Plan-Clean.jpg 3024w"
          alt=""
        />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/2nd-Floor-Plan-Clean.jpg"
          loading="lazy"
          sizes="(max-width: 479px) 87vw, (max-width: 767px) 92vw, (max-width: 991px) 94vw, (max-width: 3085px) 98vw, 3024px"
          srcSet="/images/2nd-Floor-Plan-Clean-p-500.jpg 500w, /images/2nd-Floor-Plan-Clean-p-800.jpg 800w, /images/2nd-Floor-Plan-Clean-p-1080.jpg 1080w, /images/2nd-Floor-Plan-Clean-p-1600.jpg 1600w, /images/2nd-Floor-Plan-Clean-p-2000.jpg 2000w, /images/2nd-Floor-Plan-Clean-p-2600.jpg 2600w, /images/2nd-Floor-Plan-Clean.jpg 3024w"
          alt=""
        />
        <h1 className="heading-2">Photos</h1>
      </div>
      <section>
        <div className="w-layout-blockcontainer container-3 w-container">
          <div id="w-node-_052d0723-291b-4cf9-8ae2-dbee82fd86e3-a8371a31" className="w-layout-layout wf-layout-layout">
            {[0, 1].map((i) => (
              <div key={i} className="w-layout-cell">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/images/Minimal-Paper-Coming-Soon-Instagram-Post-.png"
                  loading="lazy"
                  sizes="(max-width: 767px) 100vw, (max-width: 991px) 728px, 940px"
                  srcSet="/images/Minimal-Paper-Coming-Soon-Instagram-Post--p-500.png 500w, /images/Minimal-Paper-Coming-Soon-Instagram-Post--p-800.png 800w, /images/Minimal-Paper-Coming-Soon-Instagram-Post-.png 1080w"
                  alt=""
                />
              </div>
            ))}
          </div>
        </div>
      </section>
      <div className="faq">
        <h1 className="heading-3">Questions?</h1>
        <div className="container">
          <div className="h2-container cc-questions" />
          <a href="/contact" className="button w-button">
            Contact Us
          </a>
        </div>
        <div className="container">
          {/* Source repeats the same 4 questions across 4 containers (2 pairs, twice) -- ported as-is */}
          {[QUESTIONS.slice(0, 2), QUESTIONS.slice(2, 4), QUESTIONS.slice(0, 2), QUESTIONS.slice(2, 4)].map(
            (pair, row) => (
              <div className="container-questions" key={row}>
                {pair.map(({ q, a }) => (
                  <div className="question-block" key={`${row}-${q}`}>
                    <h3 className="h3">{q}</h3>
                    <p className="paragraph cc-gray">{a}</p>
                  </div>
                ))}
              </div>
            )
          )}
        </div>
      </div>
      <div className="separator cc-background-grey">
        <div className="container">
          <div className="line-color" />
        </div>
      </div>
      <SiteFooter current={null} />
    </>
  );
}
