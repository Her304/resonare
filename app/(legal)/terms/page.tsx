import type { Metadata } from "next";
import Link from "next/link";
import { LEGAL, POLICY_EFFECTIVE, POLICY_VERSION, MIN_AGE } from "@/lib/legal";

export const metadata: Metadata = {
  title: "Terms of Service — Resonare",
  description: "The agreement between you and Resonare covering use of the service.",
};

const P = ({ children }: { children: React.ReactNode }) => (
  <span className="legal-doc__placeholder">{children}</span>
);

export default function TermsPage() {
  return (
    <article>
      <h1>Terms of Service</h1>
      <p className="legal-doc__meta">
        Version {POLICY_VERSION} · Effective {POLICY_EFFECTIVE}
      </p>

      <div className="legal-doc__summary">
        <strong>In short</strong>
        Resonare is a personal diary for concerts you have attended. Your entries stay private to your
        account unless you choose to share them. You keep ownership of everything you upload. Do not
        upload things you have no right to upload, and do not use Resonare to harm other people.
      </div>

      <p>
        These Terms of Service (the &ldquo;Terms&rdquo;) form a binding agreement between you and{" "}
        <P>{LEGAL.entity}</P> (&ldquo;Resonare&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;) governing your
        access to and use of the Resonare website and application (the &ldquo;Service&rdquo;). By creating
        an account or using the Service, you agree to these Terms. If you do not agree, do not use the
        Service.
      </p>

      <h2 id="eligibility">1. Eligibility</h2>
      <p>
        You must be at least {MIN_AGE} years old to hold an account. If the law where you live sets a
        higher minimum age for consenting to online services without parental authorisation — for example
        16 in parts of the European Economic Area — you must meet that higher age instead. By creating an
        account you represent that you meet these requirements and that you are not barred from using the
        Service under any applicable law.
      </p>

      <h2 id="account">2. Your account</h2>
      <p>
        You must provide an accurate email address and choose a password. You are responsible for keeping
        your credentials confidential and for all activity that occurs under your account. Tell us
        promptly at <P>{LEGAL.contactEmail}</P> if you believe your account has been accessed without your
        authorisation.
      </p>
      <p>
        Usernames are unique and are allocated on a first-come basis. We may reclaim, reassign or require
        you to change a username that impersonates another person or organisation, infringes a trademark,
        is used to mislead, or is inactive and sought in good faith by someone with a legitimate claim to
        it. A username gives you no ownership right in that name.
      </p>

      <h2 id="your-content">3. Your content</h2>
      <p>
        &ldquo;Your Content&rdquo; means everything you add to the Service: ticket images, photographs,
        captions, written notes, artist, venue and event details, and links you save.
      </p>
      <p>
        <strong>You keep ownership of Your Content.</strong> We claim no ownership in it. You grant us a
        worldwide, non-exclusive, royalty-free licence to host, store, reproduce, resize and transmit Your
        Content strictly for the purpose of operating and improving the Service for you — for example,
        storing a photograph so we can display it back to you, or generating a thumbnail. This licence
        exists only so that we can run the Service. It ends when you delete the content or your account,
        subject to the retention periods in our <Link href="/privacy">Privacy Policy</Link>.
      </p>
      <p>
        If you later choose to make any part of Your Content visible to other users through a sharing or
        social feature, you additionally grant those users the ability to view it in accordance with the
        visibility setting you selected. We will not make Your Content public without an action by you.
      </p>
      <p>You represent and warrant that, for all of Your Content:</p>
      <ul>
        <li>you own it or have the necessary rights and permissions to upload it;</li>
        <li>
          uploading it does not infringe any copyright, trademark, privacy, publicity or other right of a
          third party; and
        </li>
        <li>it does not breach these Terms or our <Link href="/community-guidelines">Community Guidelines</Link>.</li>
      </ul>
      <p>
        Photographs taken at live events may be subject to the venue&rsquo;s or performer&rsquo;s own terms.
        You are responsible for ensuring you are entitled to keep and upload such images.
      </p>

      <h2 id="acceptable-use">4. Acceptable use</h2>
      <p>
        Your use of the Service is subject to our{" "}
        <Link href="/community-guidelines">Community Guidelines</Link>, which are incorporated into these
        Terms by reference. In addition, you agree not to:
      </p>
      <ul>
        <li>
          access the Service by automated means, or scrape, crawl or bulk-download content, except through
          an interface we provide for that purpose;
        </li>
        <li>
          probe, scan or test the vulnerability of the Service, or breach or circumvent any security or
          authentication measure;
        </li>
        <li>
          attempt to access data or accounts that are not yours, including by exploiting a defect in the
          Service;
        </li>
        <li>
          upload malicious code, or impose an unreasonable or disproportionate load on our infrastructure;
        </li>
        <li>resell, sublicense or commercially exploit the Service without our written permission; or</li>
        <li>use the Service to violate any applicable law.</li>
      </ul>
      <p>
        If you discover a security vulnerability, we ask that you report it to <P>{LEGAL.contactEmail}</P>{" "}
        and give us a reasonable opportunity to remedy it before disclosing it publicly.
      </p>

      <h2 id="third-party">5. Third-party services and content</h2>
      <p>
        The Service integrates with third parties, including Spotify (for album and playlist metadata),
        OpenAI (for optional drafted notes), OpenStreetMap and its Nominatim service (for map locations),
        Supabase (for database, authentication and file storage) and Vercel (for hosting). Your use of
        features that depend on those services may also be subject to their own terms. We do not control
        and are not responsible for third-party services or the accuracy of data they return.
      </p>
      <p>
        Artist names, album artwork, cover images and similar material surfaced through these integrations
        remain the property of their respective owners and are made available for identification purposes.
      </p>

      <h2 id="ai">6. AI-drafted notes</h2>
      <p>
        The Service can generate a suggested written reflection from details you have entered. This output
        is produced by an automated model, is provided for your convenience only, and may be inaccurate or
        not reflect what actually happened. You are responsible for reviewing and editing any suggestion
        before keeping it. Details you submit for this purpose are transmitted to our AI provider as
        described in the <Link href="/privacy">Privacy Policy</Link>.
      </p>

      <h2 id="availability">7. Availability and changes to the Service</h2>
      <p>
        We may modify, suspend or discontinue any part of the Service at any time. We will make reasonable
        efforts to give notice of material changes that adversely affect you where practical. The Service
        is provided on an ongoing basis without any guaranteed level of availability, and may be
        unavailable during maintenance or due to failures outside our control.
      </p>
      <p>
        We strongly encourage you to use the export feature on your profile to keep your own copy of your
        data.
      </p>

      <h2 id="suspension">8. Suspension and termination</h2>
      <p>
        You may stop using the Service and delete your account at any time. Deleting your account removes
        your entries and uploaded files as described in the <Link href="/privacy">Privacy Policy</Link>.
      </p>
      <p>
        We may suspend or terminate your access if you materially breach these Terms or the Community
        Guidelines, if required by law, or if your conduct exposes us or other users to legal liability or
        risk of harm. Where the circumstances allow, we will give you notice and an opportunity to respond
        or to export your data first. For serious breaches — such as content that is unlawful or that
        threatens the safety of another person — suspension may be immediate.
      </p>

      <h2 id="ip">9. Our intellectual property</h2>
      <p>
        The Service itself, including its software, design, and the Resonare name and marks, belongs to us
        and our licensors. These Terms grant you a limited, personal, non-transferable, revocable licence
        to use the Service in accordance with them. No other rights are granted.
      </p>

      <h2 id="disclaimer">10. Disclaimers</h2>
      <p>
        To the fullest extent permitted by law, the Service is provided &ldquo;as is&rdquo; and &ldquo;as
        available&rdquo;, without warranties of any kind, whether express, implied or statutory, including
        implied warranties of merchantability, fitness for a particular purpose, and non-infringement. We
        do not warrant that the Service will be uninterrupted, secure or error-free, or that any content
        will be preserved without loss.
      </p>
      <p>
        Nothing in these Terms excludes or limits any liability that cannot lawfully be excluded or
        limited, including liability for death or personal injury caused by negligence, or for fraud.
        Consumers retain all rights granted to them by mandatory local law.
      </p>

      <h2 id="liability">11. Limitation of liability</h2>
      <p>
        To the fullest extent permitted by law, we will not be liable for any indirect, incidental,
        special, consequential or exemplary damages, or for any loss of profits, revenue, goodwill or
        data, arising out of or relating to your use of the Service, even if we have been advised of the
        possibility of such damages.
      </p>
      <p>
        Our total aggregate liability arising out of or relating to the Service will not exceed the greater
        of (a) the total amount you paid us for the Service in the twelve months before the event giving
        rise to the claim, or (b) <P>[e.g. USD 100]</P>.
      </p>

      <h2 id="indemnity">12. Indemnity</h2>
      <p>
        You agree to indemnify and hold harmless <P>{LEGAL.entity}</P> and its officers, employees and
        agents from any claim, demand, loss or expense (including reasonable legal fees) brought by a third
        party arising out of Your Content, your use of the Service, or your breach of these Terms. This
        does not apply to the extent the claim arises from our own negligence or wilful misconduct, and it
        does not apply where you are acting as a consumer and local law prohibits such an indemnity.
      </p>

      <h2 id="changes">13. Changes to these Terms</h2>
      <p>
        We may update these Terms. If a change is material, we will give reasonable advance notice — by
        email or an in-app notice — before it takes effect, and we will update the version number at the
        top of this page. Continuing to use the Service after a change takes effect means you accept the
        revised Terms. If you do not accept them, you should stop using the Service and may delete your
        account.
      </p>

      <h2 id="law">14. Governing law and disputes</h2>
      <p>
        These Terms are governed by the laws of <P>{LEGAL.jurisdiction}</P>, without regard to its conflict
        of law rules. The courts of <P>{LEGAL.jurisdiction}</P> will have exclusive jurisdiction, except
        that if you are a consumer resident elsewhere, you retain the benefit of any mandatory protections
        and the right to bring proceedings in the courts of your place of residence.
      </p>
      <p>
        We encourage you to contact us first at <P>{LEGAL.contactEmail}</P> so we can try to resolve any
        dispute informally.
      </p>

      <h2 id="general">15. General</h2>
      <p>
        These Terms, together with the <Link href="/privacy">Privacy Policy</Link> and the{" "}
        <Link href="/community-guidelines">Community Guidelines</Link>, are the entire agreement between
        you and us regarding the Service. If any provision is found unenforceable, the remainder continues
        in effect. Our failure to enforce a provision is not a waiver of it. You may not assign these Terms
        without our consent; we may assign them to an affiliate or in connection with a merger or sale of
        assets.
      </p>

      <h2 id="contact">16. Contact</h2>
      <p>
        <P>{LEGAL.entity}</P>
        <br />
        <P>{LEGAL.address}</P>
        <br />
        <P>{LEGAL.contactEmail}</P>
      </p>

      <div className="legal-doc__footer">
        Highlighted fields are placeholders that must be completed before launch. Resonare version{" "}
        {POLICY_VERSION}.
      </div>
    </article>
  );
}
