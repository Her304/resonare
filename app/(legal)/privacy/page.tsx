import type { Metadata } from "next";
import Link from "next/link";
import { LEGAL, POLICY_EFFECTIVE, POLICY_VERSION, MIN_AGE } from "@/lib/legal";

export const metadata: Metadata = {
  title: "Privacy Policy — Resonare",
  description: "What data Resonare collects, why, who processes it, and the rights you have over it.",
};

const P = ({ children }: { children: React.ReactNode }) => (
  <span className="legal-doc__placeholder">{children}</span>
);

export default function PrivacyPage() {
  return (
    <article>
      <h1>Privacy Policy</h1>
      <p className="legal-doc__meta">
        Version {POLICY_VERSION} · Effective {POLICY_EFFECTIVE}
      </p>

      <div className="legal-doc__summary">
        <strong>In short</strong>
        We collect what is needed to run your concert diary: your email, your username, and the entries
        you create. Your entries are private to your account by default. We do not sell your data and we
        do not run advertising. You can export or delete everything at any time.
      </div>

      <p>
        This policy explains what personal data <P>{LEGAL.entity}</P> (&ldquo;Resonare&rdquo;,
        &ldquo;we&rdquo;, &ldquo;us&rdquo;) collects when you use the Resonare service, why we collect it,
        who else processes it, and what rights you have. For the purposes of the UK GDPR and EU GDPR, we
        are the data controller.
      </p>

      <h2 id="what-we-collect">1. What we collect</h2>

      <h3>Account data</h3>
      <table>
        <thead>
          <tr>
            <th>Data</th>
            <th>Why we hold it</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Email address</td>
            <td>To identify your account, sign you in, and send password resets.</td>
          </tr>
          <tr>
            <td>Password</td>
            <td>
              Stored only as a salted bcrypt hash by our authentication provider. We never see, store or
              have any means of recovering your plaintext password.
            </td>
          </tr>
          <tr>
            <td>Username and display name</td>
            <td>To identify you in the app and, if you use future sharing features, to other users.</td>
          </tr>
          <tr>
            <td>Record of policy acceptance</td>
            <td>
              The date and policy version you accepted at sign-up, so we can demonstrate valid consent and
              tell who needs to review an updated policy.
            </td>
          </tr>
        </tbody>
      </table>

      <h3>Content you create</h3>
      <p>
        The substance of your diary: artist and event names, venue text, dates, written notes, favourite
        markers, your personal shows goal, links to albums or playlists you save, and the images you
        upload — ticket photographs and up to ten concert photographs per entry, together with any
        captions.
      </p>
      <p>
        Photographs may contain other people, and image files can carry embedded metadata such as the time
        and GPS location of capture. Please consider this before uploading, particularly where images
        include people who have not agreed to appear.
      </p>

      <h3>Data derived from your content</h3>
      <p>
        We derive a city from the venue text you type in order to place a pin on your personal map. The
        resulting coordinates are cached in your browser&rsquo;s local storage and are not written back to
        our database.
      </p>

      <h3>Technical data</h3>
      <p>
        Our hosting and database providers process standard server log data, including IP address, browser
        user agent, and timestamps of requests, for security, abuse prevention and diagnostics. We set a
        cookie containing your authentication session so you stay signed in. We do not use advertising or
        cross-site tracking cookies.
      </p>

      <h2 id="why">2. Why we process it, and on what legal basis</h2>
      <table>
        <thead>
          <tr>
            <th>Purpose</th>
            <th>Legal basis (UK/EU GDPR)</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Providing the Service — storing and showing you your entries</td>
            <td>Performance of our contract with you</td>
          </tr>
          <tr>
            <td>Authentication, password reset, service emails</td>
            <td>Performance of our contract with you</td>
          </tr>
          <tr>
            <td>Generating a draft note when you ask for one</td>
            <td>Performance of our contract with you, at your request</td>
          </tr>
          <tr>
            <td>Security, fraud and abuse prevention, service diagnostics</td>
            <td>Our legitimate interests in operating a safe and reliable service</td>
          </tr>
          <tr>
            <td>Keeping a record of your acceptance of these policies</td>
            <td>Compliance with a legal obligation, and our legitimate interest in demonstrating consent</td>
          </tr>
          <tr>
            <td>Responding to legal claims or lawful requests</td>
            <td>Compliance with a legal obligation</td>
          </tr>
        </tbody>
      </table>

      <h2 id="processors">3. Who else processes your data</h2>
      <p>
        We use the following sub-processors. Each acts on our instructions under a data processing
        agreement. We do not sell your personal data, and we do not share it with advertisers or data
        brokers.
      </p>
      <table>
        <thead>
          <tr>
            <th>Provider</th>
            <th>What it handles</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Supabase</td>
            <td>
              Database, authentication and file storage. Holds your account record, your entries and your
              uploaded images.
            </td>
          </tr>
          <tr>
            <td>Vercel</td>
            <td>Application hosting and content delivery. Processes request logs.</td>
          </tr>
          <tr>
            <td>Spotify</td>
            <td>
              Receives the search text you type when looking for an album or playlist. Requests are made
              from our server using our own credentials; your identity is not passed to Spotify, and we do
              not connect to your Spotify account.
            </td>
          </tr>
          <tr>
            <td>OpenAI</td>
            <td>
              Only when you ask for a drafted note. Receives the show details and captions for that one
              entry in order to return suggested text. Not used to train models on business API data under
              our provider&rsquo;s terms.
            </td>
          </tr>
          <tr>
            <td>OpenStreetMap / Nominatim</td>
            <td>
              Receives the city name derived from your venue text in order to return map coordinates. The
              request is made from your browser, so your IP address is visible to that service.
            </td>
          </tr>
        </tbody>
      </table>
      <p>
        These providers may process data outside your country, including in the United States. Where data
        leaves the UK or EEA, transfers are made under an approved mechanism such as the UK International
        Data Transfer Agreement or the EU Standard Contractual Clauses.
      </p>
      <p>
        We may also disclose data where we are legally required to do so, or where it is necessary to
        establish, exercise or defend legal claims. If we are ever involved in a merger or acquisition,
        your data may transfer to the successor entity under this policy.
      </p>

      <h2 id="visibility">4. Who can see your entries</h2>
      <p>
        Your entries are private to your account. Access is enforced at the database level using row-level
        security, so a request authenticated as one user cannot read another user&rsquo;s rows.
      </p>
      <p>
        A concert detail page has a shareable URL. Anyone you send that URL to who is not signed in as you
        will not be able to load the entry.
      </p>
      <p>
        Usernames, display names and profile details are readable by other signed-in users, because they
        are the basis of the sharing and social features we intend to add. If and when those features
        launch, sharing will be opt-in per entry, we will describe the change here first, and we will not
        retroactively make existing private entries visible to anyone.
      </p>

      <h2 id="retention">5. How long we keep it</h2>
      <ul>
        <li>
          <strong>While your account is open:</strong> we keep your account data and entries so the Service
          works.
        </li>
        <li>
          <strong>When you delete an entry or image:</strong> the record is removed from the database and
          the file is removed from storage. Residual copies may persist in provider backups for up to{" "}
          <P>[e.g. 30]</P> days before being overwritten.
        </li>
        <li>
          <strong>When you delete your account:</strong> your account, entries and uploaded files are
          deleted, subject to the same backup window. We may retain a minimal record of the deletion and
          of policy acceptance where needed to comply with legal obligations or defend claims.
        </li>
        <li>
          <strong>Server logs:</strong> retained by our hosting providers for a short period, typically no
          more than <P>[e.g. 30]</P> days.
        </li>
      </ul>

      <h2 id="rights">6. Your rights</h2>
      <p>
        Depending on where you live, you may have the right to access your data, correct it, delete it,
        export it in a portable format, restrict or object to certain processing, and withdraw consent
        where processing is based on consent. You will not be treated differently for exercising these
        rights.
      </p>
      <p>
        Two of these are built into the app: your profile page offers a full data export, and account
        deletion removes your content. For anything else, contact <P>{LEGAL.privacyEmail}</P>. We will
        respond within one month, and will tell you if we need longer because a request is complex.
      </p>
      <p>
        If you are in the UK or EEA and believe we have handled your data improperly, you may complain to
        your local supervisory authority — in the UK, the Information Commissioner&rsquo;s Office at
        ico.org.uk. We would appreciate the chance to address your concern first.
      </p>
      <p>
        If you are a California resident, we do not sell or share personal information as those terms are
        defined under the CCPA/CPRA, and we have not done so in the preceding twelve months.
      </p>

      <h2 id="security">7. Security</h2>
      <p>
        Data is encrypted in transit using TLS and at rest by our infrastructure providers. Passwords are
        stored only as bcrypt hashes. Access to your rows is enforced by database row-level security rather
        than by application code alone. API credentials for third-party services are held server-side and
        are never exposed to the browser.
      </p>
      <p>
        No service can promise perfect security. If a breach occurs that is likely to result in a risk to
        your rights and freedoms, we will notify the relevant supervisory authority within 72 hours where
        required, and will notify you without undue delay where the risk is high.
      </p>

      <h2 id="children">8. Children</h2>
      <p>
        The Service is not directed at children under {MIN_AGE}, and we do not knowingly collect their
        personal data. If you believe a child has provided us with personal data, contact{" "}
        <P>{LEGAL.privacyEmail}</P> and we will delete it.
      </p>

      <h2 id="changes">9. Changes to this policy</h2>
      <p>
        We will post any changes here and update the version number. If a change materially affects how we
        use your data, we will give you notice by email or in the app before it takes effect, and where
        the law requires it we will ask for your consent.
      </p>

      <h2 id="contact">10. Contact</h2>
      <p>
        <P>{LEGAL.entity}</P>
        <br />
        <P>{LEGAL.address}</P>
        <br />
        <P>{LEGAL.privacyEmail}</P>
      </p>
      <p>
        See also our <Link href="/terms">Terms of Service</Link> and{" "}
        <Link href="/community-guidelines">Community Guidelines</Link>.
      </p>

      <div className="legal-doc__footer">
        Highlighted fields are placeholders that must be completed before launch. Resonare version{" "}
        {POLICY_VERSION}.
      </div>
    </article>
  );
}
