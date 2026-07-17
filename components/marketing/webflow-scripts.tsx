"use client";

import { useState } from "react";
import Script from "next/script";

// webflow.js reads window.jQuery at load time -- both scripts previously used
// strategy="afterInteractive" with no ordering guarantee between them, and jQuery
// (external CDN, slower) could easily finish loading after webflow.js (same-origin,
// faster), so webflow.js would silently fail to bind the nav toggle. Chaining webflow.js
// off jQuery's onLoad guarantees jQuery is defined first.
export function WebflowScripts() {
  const [jqueryLoaded, setJqueryLoaded] = useState(false);

  return (
    <>
      <Script
        src="https://d3e54v103j8qbb.cloudfront.net/js/jquery-3.5.1.min.dc5e7f18c8.js?site=627d3f8f015ad44d1986164e"
        integrity="sha256-9/aliU8dGd2tb6OSsuzixeV4y/faTqgFtohetphbbj0="
        crossOrigin="anonymous"
        strategy="afterInteractive"
        onLoad={() => setJqueryLoaded(true)}
      />
      {jqueryLoaded && <Script src="/webflow.js" strategy="afterInteractive" />}
    </>
  );
}
