import type { Metadata } from "next";
import { SiteNav } from "@/components/marketing/site-nav";
import { SiteFooter } from "@/components/marketing/site-footer";

export const metadata: Metadata = {
  title: "Contact Willow Homes",
  description: "Idaho Home Builder Willow Homes | Contact Us",
  openGraph: {
    title: "Contact Willow Homes",
    description: "Idaho Home Builder Willow Homes | Contact Us",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Contact Willow Homes",
    description: "Idaho Home Builder Willow Homes | Contact Us",
  },
};

export default function ContactPage() {
  return (
    <>
      <SiteNav current="/contact" />
      <div className="header-inner">
        <div className="container">
          <div className="header-inner-content">
            <h1 className="h1">
              <br />
              <br />
              Get in Touch!{" "}
            </h1>
          </div>
        </div>
      </div>
      <div className="contact-intro">
        <div className="container cc-contact">
          <div className="form-input">
            <div className="w-form">
              <form
                id="email-form"
                name="email-form"
                data-name="Email Form"
                method="get"
                className="form"
                data-wf-page-id="627d3f8f015ad478d686165a"
                data-wf-element-id="caeca9a1-ca8c-d039-beed-681203654bc4"
              >
                <input
                  className="text-field w-input"
                  maxLength={256}
                  name="name"
                  data-name="Name"
                  placeholder="Name"
                  type="text"
                  id="name"
                  required
                />
                <input
                  className="text-field w-input"
                  maxLength={256}
                  name="email"
                  data-name="Email"
                  placeholder="Email"
                  type="email"
                  id="email"
                  required
                />
                <input
                  className="text-field w-input"
                  maxLength={256}
                  name="message"
                  data-name="message"
                  placeholder="Tell us all about it!"
                  type="text"
                  id="message"
                  required
                />
                <input type="submit" data-wait="Please wait..." className="button w-button" value="Send!" />
              </form>
              <div className="w-form-done">
                <div>Thanks! We&#x27;ll be in touch!</div>
              </div>
              <div className="w-form-fail">
                <div>Uh oh! Something went wrong... try again.</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <SiteFooter current="/contact" />
    </>
  );
}
