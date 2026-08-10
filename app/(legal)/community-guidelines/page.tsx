import type { Metadata } from "next";
import Link from "next/link";
import { LEGAL, POLICY_EFFECTIVE, POLICY_VERSION } from "@/lib/legal";

export const metadata: Metadata = {
  title: "Community Guidelines — Resonare",
  description: "The standards expected of everyone using Resonare, and how we enforce them.",
};

const P = ({ children }: { children: React.ReactNode }) => (
  <span className="legal-doc__placeholder">{children}</span>
);

export default function CommunityGuidelinesPage() {
  return (
    <article>
      <h1>Community Guidelines</h1>
      <p className="legal-doc__meta">
        Version {POLICY_VERSION} · Effective {POLICY_EFFECTIVE}
      </p>

      <div className="legal-doc__summary">
        <strong>In short</strong>
        Resonare exists so people can keep and share the memory of a night at a show. Treat other people
        the way you would want to be treated in the crowd. Do not post things that are illegal, that
        target or endanger someone, or that you have no right to post.
      </div>

      <p>
        These Guidelines apply to everything on Resonare: usernames, display names, profile details,
        captions, notes, and images. They apply to private entries as well as anything shared, and they
        form part of our <Link href="/terms">Terms of Service</Link>. Breaking them can result in content
        removal or loss of your account.
      </p>
      <p>
        Some rules below concern features that are not live yet, such as following other users and sharing
        entries publicly. We are setting the standard now so that it is in place before those features
        arrive.
      </p>

      <h2 id="respect">1. Treat people with respect</h2>
      <p>Do not use Resonare to:</p>
      <ul>
        <li>
          harass, bully, threaten or intimidate anyone, including through repeated unwanted contact or
          coordinated pile-ons;
        </li>
        <li>
          attack or demean people on the basis of race, ethnicity, national origin, religion, caste, sexual
          orientation, sex, gender identity or expression, disability, or serious disease, or promote
          hateful ideologies;
        </li>
        <li>
          incite or glorify violence against any person or group, or celebrate violence that has occurred;
          or
        </li>
        <li>encourage self-harm, suicide or disordered eating.</li>
      </ul>
      <p>
        Disagreement about a band, a set list or a performance is fine. Aiming contempt at a person is not.
      </p>

      <h2 id="privacy">2. Respect other people&rsquo;s privacy</h2>
      <p>
        Concert photographs frequently include strangers. Be thoughtful about what you upload and,
        especially, about what you choose to share beyond your own account.
      </p>
      <ul>
        <li>
          Do not publish someone&rsquo;s private information — home address, phone number, workplace,
          financial or identity documents, or private messages — without their consent.
        </li>
        <li>
          Do not share intimate or sexual images of anyone without their explicit consent. Doing so is
          grounds for immediate and permanent removal, and may be a criminal offence.
        </li>
        <li>
          If someone asks you to take down an image in which they appear, and they are identifiable in it,
          take it seriously.
        </li>
        <li>Do not upload images of children other than your own, or share them beyond your account.</li>
      </ul>

      <h2 id="authenticity">3. Be yourself</h2>
      <ul>
        <li>
          Do not impersonate another person, artist, venue, brand, or Resonare itself, including through
          your username, display name or profile details.
        </li>
        <li>
          Do not run accounts designed to deceive, and do not operate networks of accounts to inflate
          engagement or evade enforcement.
        </li>
        <li>
          Parody and fan accounts are welcome provided they are clearly identifiable as such and do not
          claim to be the real person or organisation.
        </li>
        <li>Do not sell, buy, or transfer accounts or usernames.</li>
      </ul>

      <h2 id="content">4. Content that is not allowed</h2>
      <ul>
        <li>
          <strong>Illegal content</strong> — anything unlawful where you or your audience are, including
          child sexual abuse material, which we report to the relevant authorities without exception.
        </li>
        <li>
          <strong>Sexual content</strong> — pornography and sexually explicit imagery. Resonare is not the
          place for it.
        </li>
        <li>
          <strong>Graphic violence</strong> — gratuitously violent or gory imagery, including of real
          injury or death.
        </li>
        <li>
          <strong>Regulated goods</strong> — offers to sell drugs, weapons, or other controlled items.
        </li>
        <li>
          <strong>Ticket fraud and touting</strong> — using Resonare to sell, resell or advertise tickets,
          particularly counterfeit tickets or resale in breach of the terms of the original sale.
        </li>
        <li>
          <strong>Spam</strong> — bulk, repetitive or unsolicited promotional content, engagement bait,
          link schemes, or automated posting.
        </li>
        <li>
          <strong>Scams</strong> — phishing, fake giveaways, cryptocurrency schemes, or anything designed
          to obtain money or credentials by deception.
        </li>
        <li>
          <strong>Malware</strong> — links or files intended to compromise a device or account.
        </li>
      </ul>

      <h2 id="ip">5. Respect copyright and the artists</h2>
      <p>
        Upload photographs you took, or that you otherwise have the right to use. Do not pass off
        someone else&rsquo;s photography as your own.
      </p>
      <p>
        Many venues and performers restrict professional recording. Bootleg audio and full-length video
        recordings distributed without permission are not permitted. Nor is anything that circumvents a
        technical protection measure.
      </p>
      <p>
        If you believe content on Resonare infringes your copyright, send a notice to{" "}
        <P>{LEGAL.contactEmail}</P> identifying the work, the location of the material, your contact
        details, and a statement that you have a good-faith belief the use is unauthorised and that your
        notice is accurate. We will remove infringing material and may terminate repeat infringers.
      </p>

      <h2 id="security">6. Do not attack the service</h2>
      <p>
        Do not attempt to access accounts or data that are not yours, disrupt the Service, or circumvent
        rate limits, authentication or security controls. Good-faith security research is welcome —
        report findings to <P>{LEGAL.contactEmail}</P> and give us a reasonable window to fix the issue
        before disclosing it.
      </p>

      <h2 id="enforcement">7. How we enforce this</h2>
      <p>
        Enforcement is proportionate to the severity of the breach, whether it appears deliberate, and
        whether it is repeated. In broad terms:
      </p>
      <ol>
        <li>
          <strong>Removal or restriction.</strong> We remove the offending content or limit its visibility,
          and tell you why.
        </li>
        <li>
          <strong>Warning.</strong> A recorded warning against the account for a repeated or more serious
          breach.
        </li>
        <li>
          <strong>Temporary suspension.</strong> Access is withdrawn for a period.
        </li>
        <li>
          <strong>Permanent termination.</strong> For severe breaches, or a pattern of them.
        </li>
      </ol>
      <p>
        Some conduct skips straight to permanent termination: child sexual abuse material, credible threats
        of violence, non-consensual intimate imagery, and coordinated attacks on another person. We may
        also preserve and disclose relevant records to law enforcement where the law requires it or where
        there is a risk to someone&rsquo;s safety.
      </p>

      <h2 id="reporting">8. Reporting and appeals</h2>
      <p>
        In-app reporting will arrive alongside the sharing features. Until then, report anything that
        breaches these Guidelines to <P>{LEGAL.contactEmail}</P>, including a link or username and a short
        description. If someone is in immediate danger, contact your local emergency services first.
      </p>
      <p>
        If we act against your content or account and you believe we got it wrong, you may appeal to{" "}
        <P>{LEGAL.contactEmail}</P>. Tell us what was removed and why you think the decision was mistaken.
        A different reviewer will look at it where that is practical, and we will tell you the outcome.
      </p>

      <h2 id="changes">9. Changes</h2>
      <p>
        We will update these Guidelines as Resonare grows, particularly as social features launch. Material
        changes will be announced before they take effect and the version number above will change.
      </p>

      <div className="legal-doc__footer">
        Highlighted fields are placeholders that must be completed before launch. Resonare version{" "}
        {POLICY_VERSION}. See also our <Link href="/terms">Terms of Service</Link> and{" "}
        <Link href="/privacy">Privacy Policy</Link>.
      </div>
    </article>
  );
}
