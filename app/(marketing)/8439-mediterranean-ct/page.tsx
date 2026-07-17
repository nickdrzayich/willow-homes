import type { Metadata } from "next";
import { SiteNav } from "@/components/marketing/site-nav";
import { SiteFooter } from "@/components/marketing/site-footer";

const DESCRIPTION =
  "This custom plan by Willow Homes includes 3 beds, 2 baths, tandem 3 car garage, dining area and huge covered back patio. Upgraded finishes and thoughtful design make this home unlike any other in the area. The peaceful, quiet community is close to everything and located on a cul-de-sac street with only 8 other homes. No front neighbors and no direct back door neighbors. Estimated completion is March 2023.";

export const metadata: Metadata = {
  title: "8439 W Mediterranean Ct Boise, ID 83709",
  description: DESCRIPTION,
  openGraph: {
    title: "8439 W Mediterranean Ct Boise, ID 83709",
    description: DESCRIPTION,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "8439 W Mediterranean Ct Boise, ID 83709",
    description: DESCRIPTION,
  },
};

const GALLERY_IMAGES = [
  { file: "8439-Mediterranean_2332", id: "w-node-_052d0723-291b-4cf9-8ae2-dbee82fd86e4-4a861662", sizes: "(max-width: 767px) 100vw, (max-width: 991px) 728px, 940px" },
  { file: "8439-Mediterranean_2315", id: "w-node-_052d0723-291b-4cf9-8ae2-dbee82fd86e5-4a861662", sizes: "(max-width: 767px) 100vw, (max-width: 991px) 728px, 940px" },
  { file: "8439-Mediterranean_2314", id: "w-node-_9ec207fd-34ba-9bb3-fc30-132254ec81bb-4a861662", sizes: "100vw" },
  { file: "8439-Mediterranean_2308", id: "w-node-ca61c42c-b89c-fd1b-a5a6-2d854e4284d7-4a861662", sizes: "100vw" },
  { file: "8439-Mediterranean_2316", id: "w-node-_527a15ec-fed0-3fe7-d9b9-9d3ed8db839a-4a861662", sizes: "100vw" },
  { file: "8439-Mediterranean_2310", id: "w-node-_34a13317-74a8-bb23-17b8-96c8847f4918-4a861662", sizes: "100vw" },
  { file: "8439-Mediterranean_2305", id: "w-node-_0ba14fc7-8413-afe7-6bcf-5341491e9797-4a861662", sizes: "100vw" },
  { file: "8439-Mediterranean_2324", id: "w-node-_88182837-bf68-c880-c223-ba8b051a3afa-4a861662", sizes: "100vw" },
  { file: "8439-Mediterranean_2323", id: "w-node-_039cdb99-fed9-3c7a-8800-17c0f86578bc-4a861662", sizes: "100vw" },
  { file: "8439-Mediterranean_2303", id: "w-node-_86cb59de-f96e-6e93-a315-7e5b2c9cfce8-4a861662", sizes: "100vw" },
  { file: "8439-Mediterranean_2311", id: "w-node-b8c76784-603b-4ca8-685d-211aa56ea96d-4a861662", sizes: "100vw" },
  { file: "8439-Mediterranean_2313", id: "w-node-_248af6a9-f21f-cb65-d20c-bf0de678a9a2-4a861662", sizes: "100vw" },
] as const;

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

export default function MediterraneanCtPage() {
  return (
    <>
      <SiteNav current={null} />
      <div className="header-inner _8439">
        <div className="container">
          <div className="header-inner-content" />
        </div>
      </div>
      <h1 className="heading-2">8439 Mediterranean Ct.</h1>
      <div className="premium-intro">
        <div className="text-block-2">
          This move in ready custom plan includes 3 beds, 2 baths, tandem 3 car garage, dining area and huge covered
          back patio. Upgraded finishes and thoughtful design make this home unlike any other in the area. The
          peaceful, quiet community is close to everything and located on a cul-de-sac street with only 8 other
          homes. No front neighbors and no direct backdoor neighbors.{" "}
        </div>
        <h1>The Plan</h1>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/Screen-Shot-2022-08-23-at-2.39.23-PM.png"
          loading="lazy"
          sizes="(max-width: 479px) 87vw, (max-width: 767px) 92vw, (max-width: 991px) 94vw, (max-width: 1246px) 95vw, 1184px"
          srcSet="/images/Screen-Shot-2022-08-23-at-2.39.23-PM-p-500.png 500w, /images/Screen-Shot-2022-08-23-at-2.39.23-PM-p-800.png 800w, /images/Screen-Shot-2022-08-23-at-2.39.23-PM-p-1080.png 1080w, /images/Screen-Shot-2022-08-23-at-2.39.23-PM.png 1184w"
          alt=""
        />
        <h1 className="heading-2">Photos</h1>
      </div>
      <section>
        <div className="w-layout-blockcontainer container-3 w-container">
          <div id="w-node-_052d0723-291b-4cf9-8ae2-dbee82fd86e3-4a861662" className="w-layout-layout wf-layout-layout">
            {GALLERY_IMAGES.map(({ file, id, sizes }) => (
              <div key={id} id={id} className="w-layout-cell">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`/images/${file}.jpg`}
                  loading="lazy"
                  sizes={sizes}
                  srcSet={`/images/${file}-p-500.jpg 500w, /images/${file}-p-800.jpg 800w, /images/${file}-p-1080.jpg 1080w, /images/${file}-p-1600.jpg 1600w, /images/${file}-p-2000.jpg 2000w, /images/${file}-p-2600.jpg 2600w, /images/${file}-p-3200.jpg 3200w, /images/${file}.jpg 3861w`}
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
