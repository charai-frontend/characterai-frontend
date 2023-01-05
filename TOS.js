import React from 'react';
import { MdArrowBackIosNew } from 'react-icons/md';
import { useLocation } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';

import './Common.css';

const TOS = (props) => {
  const location = useLocation();
  let from_location = location.state;

  const navigate = useNavigate();

  const handleBack = () => {
    let address = '/';
    if (props.back) {
      address = `${props.back}`;
    } else if (from_location) {
      address = `${from_location}`;
    }
    navigate(address);
  };

  return (
    <div className="container mt-3">
      <div className="col-xs-12 col-md-8 mb-3 ">
        <div className="row align-items-center">
          <div className="col-1 p-0 m-0">
            <button className={'btn '} role="button" onClick={handleBack}>
              <MdArrowBackIosNew size={24} />
            </button>
          </div>
          <div className="col-11 mt-2">
            <h1>Terms of Service</h1>
          </div>
        </div>
      </div>

      <div className="container">
        <p>Last updated December 19, 2022</p>
        <p>
          Hello and welcome! These Terms of Service (“Terms”) are an agreement
          formed between you (“You”) and Character Technologies Inc. (“Company,”
          “Character AI,” “we” or “us”) and cover the website available at
          character.ai (the “Website”), and the related applications (the “App”)
          operated on behalf of Character AI, and together with any content,
          tools, features and functionality offered on or through our Website
          and App (the “Services”).
        </p>
        <p>
          These Terms govern your access to and use of the Services. Please read
          them carefully, as they include important information about your legal
          rights. By accessing and/or using the Services, you’re agreeing to
          these Terms. If you don’t understand or agree to these Terms, please
          don’t use the Services.
        </p>
        <p>
          For purposes of these Terms, “you” and “your” means you as the user of
          the Services. If you use the Services on behalf of a company or other
          entity then “you” includes you and that entity, and you represent and
          warrant that (a) you are an authorized representative of the entity
          with the authority to bind the entity to these Terms, and (b) you
          agree to these Terms on the entity’s behalf.
        </p>
        <p>
          Note: these Terms contain an arbitration clause and class action
          waiver. By agreeing to these Terms, you agree (a) to resolve all
          disputes with us through binding individual arbitration, which means
          that you waive any right to have those disputes decided by a judge or
          jury, and (b) that you waive your right to participate in class
          actions, class arbitrations, or representative actions. You have the
          right to opt-out of arbitration as explained below.
        </p>
        <h3>Use of the Services</h3>
        <p>
          Your Registration Obligations. You may be required to submit a
          registration form in order to access and use certain features of the
          Services. If you choose to register, you agree to provide and maintain
          true, accurate, current and complete information about yourself as
          prompted by the Services’ registration form. Registration data and
          certain other information about you are governed by our Privacy
          Policy. If you are under 13 years old OR if you are an EU citizen or
          resident under 16 years old, you are not authorized to register to use
          the Services.
        </p>
        <p>
          Member Account, Password and Security. You are responsible for
          maintaining the confidentiality of your password and account, if any,
          and are fully responsible for any and all activities that occur under
          your password or account. You agree to (a) immediately notify
          Character AI of any unauthorized use of your password or account or
          any other breach of security, and (b) ensure that you exit from your
          account at the end of each session when accessing the Services.
          Character AI will not be liable for any loss or damage arising from
          your failure to comply with this paragraph.
        </p>
        <p>
          Modifications to Site. Character AI reserves the right to modify or
          discontinue, temporarily or permanently, the Services (or any part
          thereof) with or without notice. You agree that Character AI will not
          be liable to you or to any third party for any modification,
          suspension or discontinuance of the Services.
        </p>
        <p>
          General Practices Regarding Use and Storage. You acknowledge that
          Character AI may establish general practices and limits concerning use
          of the Services, including without limitation the maximum period of
          time that data or other content will be retained by the Services and
          the maximum storage space that will be allotted on Character AI’s
          servers on your behalf. You agree that Character AI has no
          responsibility or liability for the deletion or failure to store any
          data or other content maintained or uploaded to the Services. You
          acknowledge that Character AI reserves the right to terminate accounts
          that are inactive for an extended period of time. You further
          acknowledge that Character AI reserves the right to change these
          general practices and limits at any time, in its sole discretion, with
          or without notice.
        </p>
        <h3>Conditions Of Use</h3>
        <p>
          User Conduct. In addition to agreeing to comply with our Acceptable
          Use Policy (“AUP”), which is incorporated herein, you agree to comply
          with the following conditions in using the Services. You are solely
          responsible for all code, video, images, information, data, text,
          software, music, sound, photographs, graphics, messages or other
          materials (“Content”) that you upload, post, publish or display
          (hereinafter, “Upload”) or email or otherwise transmit via the
          Services. Your use of the Services may also be subject to license and
          use restrictions set forth in the CreativeML Open RAIL-M License. The
          following are examples of the kind of Content and/or use that is
          illegal or prohibited by Character AI. Character AI reserves the right
          to investigate and take appropriate legal action against anyone who,
          in Character AI’s sole discretion, violates this provision, including
          without limitation, removing the offending Content from the Website or
          Services, suspending or terminating the account of such violators and
          reporting them to applicable law enforcement authorities.
        </p>
        <p>You agree to not use the Website or Services to:</p>
        <ul>
          <li>
            upload or transmit any Content that: (i) infringes any intellectual
            property or other proprietary rights of any party; (ii) you do not
            have a right to upload under any law or under contractual or other
            relationships; (iii) contains software viruses or any other computer
            code, files or programs designed to interrupt, destroy or limit the
            functionality of any computer software or hardware or
            telecommunications equipment; (iv) poses or creates a privacy or
            security risk to any person; (v) constitutes unsolicited or
            unauthorized advertising, promotional materials, commercial
            activities and/or sales, “junk mail,” “spam,” “chain letters,”
            “pyramid schemes,” “contests,” “sweepstakes,” or any other form of
            solicitation; (vi) is unlawful, harmful, threatening, abusive,
            harassing, tortious, excessively violent, defamatory, vulgar,
            obscene, pornographic, libelous, invasive of another’s privacy,
            hateful racially, ethnically or otherwise objectionable; or (vii) in
            the sole judgment of Character AI, is objectionable or which
            restricts or inhibits any other person from using or enjoying the
            Website or Services, or which may expose Character AI or its users
            to any harm or liability of any type;
          </li>

          <li>
            interfere with or disrupt the Website or Services or servers or
            networks connected to the Website or Services, or disobey any
            requirements, procedures, policies or regulations of networks
            connected to the Website or Services;
          </li>

          <li>
            violate any applicable local, state, national or international law,
            or any regulations having the force of law;
          </li>

          <li>
            impersonate any person or entity, or falsely state or otherwise
            misrepresent your affiliation with a person or entity;
          </li>

          <li>solicit personal information from anyone under the age of 18;</li>

          <li>
            harvest or collect email addresses or other contact information of
            other users from the Website or Services by electronic or other
            means for the purposes of sending unsolicited emails or other
            unsolicited communications;
          </li>

          <li>
            advertise or offer to sell or buy any goods or services for any
            business purpose that is not specifically authorized;
          </li>

          <li>
            further or promote any criminal activity or enterprise or provide
            instructional information about illegal activities;
          </li>

          <li>
            obtain or attempt to access or otherwise obtain any materials or
            information through any means not intentionally made available or
            provided for through the Website or Services;
          </li>

          <li>lease, lend, sell or sublicense any part of the Services;</li>

          <li>
            try to get around any technological measure designed to protect the
            Services or any technology associated with the Services;
          </li>

          <li>
            reverse engineer, disassemble, decompile, decode, adapt, or
            otherwise attempt to derive or gain access to any Services source
            code, in whole or in part (unless a portion of code contained within
            the Services is released as open source and the open source license
            governing such code expressly permits reverse engineering, copying
            or other modification)
          </li>

          <li>
            use the Services to create malicious or abusive content (as
            determined by Character AI in its sole discretion) or any content
            that violates a Character AI policy; or use the Services (or any
            part thereof or any technology contained therein) in any manner that
            infringes, misappropriates, or otherwise violates any intellectual
            property right or other right of any person, or that violates any
            applicable laws.
          </li>
        </ul>
        <h3>Intellectual Property Rights</h3>
        <p>
          User Content Uploaded to the Site. With respect to the content or
          other materials you upload to or create using the Services
          (collectively, “User Content”), you represent and warrant that you own
          all right, title and interest in and to such User Content, including,
          without limitation, all copyrights and rights of publicity contained
          therein, or are otherwise permitted to use them for the applicable
          purposes, for example by license or legal exception or limitation. By
          creating or uploading any User Content you own or create using the
          Service, you retain all rights in it (to the extent you would
          otherwise hold such rights) and hereby grant and will grant Character
          AI to the fullest extent permitted under the law a nonexclusive,
          worldwide, royalty-free, fully paid up, transferable, sublicensable,
          perpetual, irrevocable license to copy, display, upload, perform,
          distribute, store, modify and otherwise use your User Content for any
          Character AI-related purpose in any form, medium or technology now
          known or later developed.
        </p>
        <p>
          Characters and Generations. For any automated AI character
          ("Character") that you create or upload using the Service, you own all
          rights in that Character (and to the extent you create derivative
          works, you own all rights you otherwise would own in them) and any
          text, images or video it generates ("Generations") that are elicited
          directly or indirectly by you, and grant to Character AI and to any
          Character AI user who elicits Generations from your Character to the
          fullest extent permitted under the law a nonexclusive, worldwide,
          royalty-free, fully paid up, transferable, sublicensable, perpetual,
          irrevocable license to copy, display, upload, perform, distribute,
          store, modify and otherwise use the Character you created and any
          related Generations for any purpose in any form, medium or technology
          now known or later developed. As to a user interacting with a
          Character created or uploaded by another user or created or uploaded
          by Character AI, the user who elicits the Generations from a Character
          owns all rights in those Generations and grants to both Character AI
          and the creator(s) of the applicable Character a nonexclusive,
          worldwide, royalty-free, fully paid up, transferable, sublicensable,
          perpetual, irrevocable license to copy, display, upload, perform,
          distribute, store, modify and otherwise use any Generations. For
          avoidance of doubt, violations of Character AI's Acceptable Use Policy
          unrelated to intellectual property issues does not affect the user's
          intellectual property rights in any Characters or their Generations.
        </p>
        <p>
          Website or Services Content, Software and Trademarks. You acknowledge
          and agree that the Website or Services may contain content or features
          (“Site Content”) that are protected by copyright, patent, trademark,
          trade secret or other proprietary rights and laws. In connection with
          your use of the Website or Services you will not engage in or use any
          data mining, robots, scraping or similar automated data gathering or
          extraction methods. If you are blocked by Character AI from accessing
          the Website or Services (including by blocking your IP address), you
          agree not to implement any measures to circumvent such blocking (e.g.,
          by masking your IP address or using a proxy IP address). Any use of
          the Website or Services, or the Site Content, other than as
          specifically authorized herein is strictly prohibited. Any rights not
          expressly granted herein are reserved by Character AI.
        </p>
        <p>
          The Character AI name and logos are trademarks of Character AI
          (collectively the “Character AI Trademarks”). Other trademarks used
          and displayed via the Website or Services may be trademarks of their
          respective owners who may or may not endorse or be affiliated with or
          connected to Character AI. Nothing in these Terms or the Website or
          Service should be construed as granting, by implication, estoppel, or
          otherwise, any license or right to use any of Character AI Trademarks
          without our prior written permission in each instance. All goodwill
          generated from the use of Character AI Trademarks will inure to our
          exclusive benefit.
        </p>
        <p>
          Third Party Material. Under no circumstances will Character AI be
          liable in any way for any content or materials of any third parties,
          including character bots created by third parties and any Generations
          resulting from such character bots, including, but not limited to
          infringement of intellectual property rights, for any errors or
          omissions in any content, or for any loss or damage of any kind
          incurred as a result of the use of any such content. You acknowledge
          that Character AI does not pre-screen content, but that Character AI
          and its designees will have the right (but not the obligation) in
          their sole discretion to refuse or remove any content that is
          available via the Website or Services. Without limiting the foregoing,
          Character AI and its designees will have the right to remove any
          content that violates these Terms, our AUP, or is deemed by Character
          AI, in its sole discretion, to be otherwise objectionable. You agree
          that you must evaluate, and bear all risks associated with, the use of
          any content, including any reliance on the accuracy, completeness, or
          usefulness of such content.
        </p>
        <p>
          You acknowledge and agree that any questions, comments, suggestions,
          ideas, feedback or other information about the Website or Services
          (“Submissions”) provided by you to Character AI are non-confidential
          and Character AI will be entitled to the unrestricted use and
          dissemination of these Submissions for any purpose, without
          acknowledgment of or compensation to you.
        </p>
        <p>
          Without limiting the foregoing, you acknowledge and agree that
          Character AI may preserve content and may also disclose content and/or
          metadata if required to do so by law or in the good faith belief that
          such preservation or disclosure is reasonably necessary to: (a) comply
          with legal process, applicable laws or government requests; (b)
          enforce these Terms; (c) respond to claims that any content violates
          the rights of third parties; or (d) protect the rights, property, or
          personal safety of Character AI, its users and the public. You
          understand that the technical processing and transmission of the
          Website and Services, including your content, may involve (a)
          transmissions over various networks; and (b) changes to conform and
          adapt to technical requirements of connecting networks or devices.
        </p>
        <p>
          Copyright Complaints. Character AI respects the intellectual property
          of others, and we ask our users to do the same. If you believe that
          your work has been copied in a way that constitutes copyright
          infringement, or that your intellectual property rights have been
          otherwise violated, you should notify Character AI of your
          infringement claim in accordance with the procedure set forth below.
        </p>
        <p>
          Character AI will process and investigate notices of alleged
          infringement and will take appropriate actions under the Digital
          Millennium Copyright Act (“DMCA”) and other applicable intellectual
          property laws with respect to any alleged or actual infringement. A
          written notification of claimed copyright infringement should be
          mailed to:
        </p>
        <p>
          Character Technologies, Inc.
          <br />
          #1152
          <br />
          700 El Camino Real Suite 120
          <br />
          Menlo Park, CA 94025
          <br />
          Attn: Legal
          <br />
          <a className="ps-1" href="mailto:support@character.ai">
            support@character.ai
          </a>
          <br />
        </p>
        <p>
          To be effective, the notification must be in writing and contain the
          following information: an electronic or physical signature of the
          person authorized to act on behalf of the owner of the copyright or
          other intellectual property interest; a description of the copyrighted
          work or other intellectual property that you claim has been infringed;
          a description of where the material that you claim is infringing is
          located on the Site, with enough detail that we may find it on the
          Site; your address, telephone number, and email address; a statement
          by you that you have a good faith belief that the disputed use is not
          authorized by the copyright or intellectual property owner, its agent,
          or the law; a statement by you, made under penalty of perjury, that
          the above information in your notice is accurate and that you are the
          copyright or intellectual property owner or authorized to act on the
          copyright or intellectual property owner’s behalf.
        </p>
        <p>
          Counter-Notice. If you believe that your User Content that was removed
          (or to which access was disabled) is not infringing, or that you have
          the authorization from the copyright owner, the copyright owner’s
          agent, or pursuant to the law, to upload and use the content in your
          User Content, you may send a written counter-notice containing the
          following information to the Copyright Agent: your physical or
          electronic signature; identification of the content that has been
          removed or to which access has been disabled and the location at which
          the content appeared before it was removed or disabled; a statement
          that you have a good faith belief that the content was removed or
          disabled as a result of mistake or a misidentification of the content;
          and your name, address, telephone number, and email address, a
          statement that you consent to the jurisdiction of the federal court
          located within the Northern District of California and a statement
          that you will accept service of process from the person who provided
          notification of the alleged infringement. If a counter-notice is
          received by the Copyright Agent, Character AI will send a copy of the
          counter-notice to the original complaining party informing that person
          that it may replace the removed content or cease disabling it in 10
          business days. Unless the copyright owner files an action seeking a
          court order against the content provider, member or user, the removed
          content may be replaced, or access to it restored, in 10 to 14
          business days or more after receipt of the counter-notice, at our sole
          discretion.
        </p>
        <p>
          Repeat Infringer Policy. In accordance with the DMCA and other
          applicable law, Character AI has adopted a policy of terminating, in
          appropriate circumstances and at Character AI’s sole discretion, users
          who are deemed to be repeat infringers. Character AI may also at its
          sole discretion limit access to the Services and/or terminate the
          registrations of any users who infringe any intellectual property
          rights of others, whether or not there is any repeat infringement.
        </p>
        <h3>Third Party Websites and Services</h3>
        <p>
          The Services may provide, or third parties may provide, links or other
          access to other sites and resources on the Internet or to third-party
          applications. Character AI has no control over such sites, resources
          or applications and Character AI is not responsible for and does not
          endorse such sites, resources or applications. You further acknowledge
          and agree that Character AI will not be responsible or liable,
          directly or indirectly, for any damage or loss caused or alleged to be
          caused by or in connection with use of or reliance on any content,
          events, goods or services available on or through any such sites,
          resources or applications. Any dealings you have with third parties
          found while using the Services are between you and the third party,
          and you agree that Character AI is not liable for any loss or claim
          that you may have against any such third party.
        </p>
        <h3>Indemnity and Release</h3>
        <p>
          You agree to release, indemnify and hold Character AI and its
          affiliates and their officers, employees, directors and agents
          harmless from any from any and all losses, damages, expenses,
          including reasonable attorneys’ fees, rights, claims, actions of any
          kind and injury (including death) arising out of or relating to your
          use of the Services or any related information, any User Content, your
          application(s) to Character AI or the results thereof, your violation
          of these Terms of Use or your violation of any rights of another.
        </p>
        <p>
          If you are a California resident, you waive California Civil Code
          Section 1542, which says:
        </p>
        <p>
          A general release does not extend to claims that the creditor or
          releasing party does not know or suspect to exist in his or her favor
          at the time of executing the release and that, if known by him or her,
          would have materially affected his or her settlement with the debtor
          or released party.
        </p>
        <p>
          If you are a resident of another jurisdiction, you waive any
          comparable statute or doctrine.
        </p>
        <h3>Disclaimer of Warranty</h3>
        <p>
          Your use of the Service is at your sole risk. The site is provided on
          an “AS IS” and “AS AVAILABLE” basis. Character AI expressly disclaims
          all warranties of any kind, whether express, implied or statutory,
          including, but not limited to the implied warranties of
          merchantability, fitness for a particular purpose, title and
          non-infringement. Character AI makes no warranty that (i) the Services
          will meet your requirements, (ii) the Services will be uninterrupted,
          timely, secure, or error-free, or (iii) the results that may be
          obtained from the use of the Services will be accurate or reliable.
        </p>
        <h3>Limitation of Liability</h3>
        <p>
          You expressly understand and agree that Character AI will not be
          liable for any indirect, incidental, special, consequential, exemplary
          damages, or damages for loss of profits including but not limited to,
          damages for loss of goodwill, use, data or other intangible losses
          (even if Character AI has been advised of the possibility of such
          damages), whether based on contract, tort, negligence, strict
          liability or otherwise, resulting from: (I) the use or the inability
          to use the Services or any related information; (ii) unauthorized
          access to or alteration of your transmissions or data; (iii)
          statements or conduct of any third party (including users) on the
          Services; or (iv) any other matter relating to the Services. In no
          event will Character AI’s total liability to you for all damages,
          losses or causes of action exceed one hundred dollars ($100).
        </p>
        <p>
          Some jurisdictions do not allow the exclusion of certain warranties or
          the limitation or exclusion of liability for incidental or
          consequential damages. Accordingly, some of the above limitations set
          forth above may not apply to you. If you are dissatisfied with any
          portion of the site or with these terms of use, your sole and
          exclusive remedy is to discontinue use of the Services.
        </p>
        <h3>Dispute Resolution By Binding Arbitration</h3>
        <p>This section affects your rights so please read it carefully.</p>
        <h4>Agreement to Arbitrate</h4>
        <p>
          This Dispute Resolution by Binding Arbitration section of the Terms is
          referred to in these Terms as the “Arbitration Agreement.” You agree
          that any and all disputes or claims that have arisen or may arise
          between you and Character AI, whether arising out of or relating to
          these Terms (including any alleged breach thereof), the Website or
          Services, any aspect of the relationship or transactions between us,
          shall be resolved exclusively through final and binding arbitration,
          rather than a court, in accordance with the terms of this Arbitration
          Agreement, except that you may assert individual claims in small
          claims court, if your claims qualify. Further, this Arbitration
          Agreement does not preclude you from bringing issues to the attention
          of federal, state, or local agencies, and such agencies can, if the
          law allows, seek relief against us on your behalf. You agree that, by
          entering into these Terms, you and Character AI are each waiving the
          right to a trial by jury or to participate in a class action. Your
          rights will be determined by a neutral arbitrator, not a judge or
          jury. The Federal Arbitration Act governs the interpretation and
          enforcement of this Arbitration Agreement.
        </p>
        <h4>
          Prohibition of Class and Representative Actions and Non-Individualized
          Relief
        </h4>
        <p>
          You and Character AI agree that each of us may bring claims against
          the other only on an individual basis and not as a plaintiff or class
          member in any purported class or representative action or proceeding.
          Unless both You and Character AI agree otherwise, the arbitrator may
          not consolidate or join more than one person’s or party’s claims and
          may not otherwise preside over any form of a consolidated,
          representative, or class proceeding. Also, the arbitrator may award
          relief (including monetary, injunctive, and declaratory relief) only
          in favor of the individual party seeking relief and only to the extent
          necessary to provide relief necessitated by that party’s individual
          claim(s).
        </p>
        <h4>Pre-Arbitration Dispute Resolution</h4>
        <p>
          Character AI is always interested in resolving disputes amicably and
          fairly, and so if you have concerns, we strongly encourage you to
          first email us about them at{' '}
          <a className="ps-1" href="mailto:support@character.ai">
            support@character.ai
          </a>
          . If such efforts prove unsuccessful, a party who intends to seek
          arbitration must first send to the other, by certified mail, a written
          Notice of Dispute (“Notice”). The Notice to Character AI should be
          sent to Character Technologies Inc. #1152 700 El Camino Real Suite 120
          Menlo Park CA 94025 (“Notice Address”). The Notice must (i) describe
          the nature and basis of the claim or dispute and (ii) set forth the
          specific relief sought. If Character AI and you do not resolve the
          claim within sixty (60) calendar days after the Notice is received,
          you or Character AI may commence an arbitration proceeding. During the
          arbitration, the amount of any settlement offer made by Character AI
          or you shall not be disclosed to the arbitrator until after the
          arbitrator determines the amount, if any, to which you or Character AI
          is entitled.
        </p>
        <h4>Arbitration Procedures</h4>
        <p>
          Arbitration will be conducted by a neutral arbitrator in accordance
          with JAMS’ (“JAMS”) Streamlined Arbitration Rules and Procedures
          (collectively, the “JAMS Rules”), as modified by this Arbitration
          Agreement. For information on JAMS, please visit its website,
          https://www.jamsadr.com/. If there is any inconsistency between any
          term of the JAMS Rules and any term of this Arbitration Agreement, the
          applicable terms of this Arbitration Agreement will control unless the
          arbitrator determines that the application of the inconsistent
          Arbitration Agreement terms would not result in a fundamentally fair
          arbitration. The arbitrator must also follow the provisions of these
          Terms as a court would. All issues are for the arbitrator to decide,
          including, but not limited to, issues relating to the scope,
          enforceability, and arbitrability of this Arbitration Agreement.
          Although arbitration proceedings are usually simpler and more
          streamlined than trials and other judicial proceedings, the arbitrator
          can award the same damages and relief on an individual basis that a
          court can award to an individual under the Terms and applicable law.
          Decisions by the arbitrator are enforceable in court and may be
          overturned by a court only for very limited reasons.
        </p>
        <p>
          Unless Character AI and you agree otherwise, any arbitration hearings
          will take place in San Francisco, CA. If the parties are unable to
          agree on a location, the determination shall be made by JAMS. If your
          claim is for $10,000 or less, Character AI agrees that you may choose
          whether the arbitration will be conducted solely on the basis of
          documents submitted to the arbitrator, through a telephonic or video
          conference hearing, or by an in-person hearing as established by the
          JAMS Rules. If your claim exceeds $10,000, the right to a hearing will
          be determined by the JAMS Rules. Regardless of the manner in which the
          arbitration is conducted, the arbitrator shall issue a reasoned
          written decision sufficient to explain the essential findings and
          conclusions on which the award is based.
        </p>
        <h4>Costs of Arbitration</h4>
        <p>
          Payment of all filing, administration, and arbitrator fees
          (collectively, the “Arbitration Fees”) will be governed by the JAMS
          Rules, unless otherwise provided in this Arbitration Agreement.
        </p>
        <h4>Confidentiality</h4>
        <p>
          All aspects of the arbitration proceeding, and any ruling, decision,
          or award by the arbitrator, will be strictly confidential for the
          benefit of all parties.
        </p>
        <h4>Severability</h4>
        <p>
          If a court or the arbitrator decides that any term or provision of
          this Arbitration Agreement (other than the subsection (b) titled
          “Prohibition of Class and Representative Actions and
          Non-Individualized Relief” above) is invalid or unenforceable, the
          parties agree to replace such term or provision with a term or
          provision that is valid and enforceable and that comes closest to
          expressing the intention of the invalid or unenforceable term or
          provision, and this Arbitration Agreement shall be enforceable as so
          modified. If a court or the arbitrator decides that any of the
          provisions of subsection (b) above titled “Prohibition of Class and
          Representative Actions and Non-Individualized Relief” are invalid or
          unenforceable, then the entirety of this Arbitration Agreement shall
          be null and void. The remainder of the Terms will continue to apply.
        </p>
        <h4>Future Changes to Arbitration Agreement</h4>
        <p>
          Notwithstanding any provision in this Terms of Use to the contrary,
          Character AI agrees that if it makes any future change to this
          Arbitration Agreement (other than a change to the Notice Address)
          while you are a user of the Services, you may reject any such change
          by sending Character AI written notice within thirty (30) calendar
          days of the change to the Notice Address provided above. By rejecting
          any future change, you are agreeing that you will arbitrate any
          dispute between us in accordance with the language of this Arbitration
          Agreement as of the date you first accepted these Terms (or accepted
          any subsequent changes to these Terms).
        </p>
        <h3>Termination</h3>
        <p>
          You agree that Character AI, in its sole discretion, may suspend or
          terminate your account (or any part thereof) or use of the Services
          and remove and discard any content within the Website or Services, for
          any reason, including, without limitation, for lack of use or if
          Character AI believes that you have violated or acted inconsistently
          with the letter or spirit of these Terms or Character AI’s Acceptable
          Use Policy. Character AI may also in its sole discretion and at any
          time discontinue providing the Services, or any part thereof, with or
          without notice. You agree that any termination of your access to the
          Services under any provision of these Terms or our AUP may be effected
          without prior notice, and acknowledge and agree that Character AI may
          (but has no obligation to) immediately deactivate or delete your
          account and all related information and files in your account and/or
          bar any further access to such files or the Services. Termination of
          your account or access to any component of the Services will not
          terminate Character AI’s rights to your User Content. Further, you
          agree that Character AI will not be liable to you or any third party
          for any termination of your access to the Services.
        </p>
        <h3>General</h3>
        <p>
          Entire Agreement. These Terms constitute the entire agreement between
          you and Character AI and govern your use of our Services, superseding
          any prior agreements between you and Character AI with respect to the
          Services.{' '}
        </p>
        <p>
          Choice of Law, Jurisdiction, Venue. These Terms are governed by the
          laws of the State of California without regard to its conflict of law
          provisions. With respect to any disputes or claims not subject to
          arbitration, as set forth above, you and Character AI agree to submit
          to the personal and exclusive jurisdiction of the state and federal
          courts located within Santa Clara County, California.{' '}
        </p>
        <p>
          Severance. If any provision of these Terms is found by a court of
          competent jurisdiction to be invalid, the parties nevertheless agree
          that the court should endeavor to give effect to the parties’
          intentions as reflected in the provision, and the other provisions of
          these Terms remain in full force and effect.{' '}
        </p>
        <p>
          No Waiver. Any failure of Character AI to exercise or enforce any
          right or provision of these Terms does not constitute a waiver of such
          right or provision.{' '}
        </p>
        <p>
          Expiration of Claims. You agree that regardless of any statute or law
          to the contrary, any claim or cause of action arising out of or
          related to use of the Site or these Terms of Use must be filed within
          one (1) year after such claim or cause of action arose or be forever
          barred.
        </p>
        <p>
          Admissibility. A printed version of this agreement and of any notice
          given in electronic form will be admissible in judicial or
          administrative proceedings based upon or relating to this agreement to
          the same extent and subject to the same conditions as other business
          documents and records originally generated and maintained in printed
          form.{' '}
        </p>
        <p>
          Assignment. You may not assign these Terms without the prior written
          consent of Character AI, but Character AI may assign or transfer these
          Terms of Use, in whole or in part, without restriction.{' '}
        </p>
        <p>
          Section Headings. The section titles in these Terms of Use are for
          convenience only and have no legal or contractual effect.{' '}
        </p>
        <p>
          Notice. Notices to you may be made via either email or regular mail.
          The Site may also provide notices to you of changes to these Terms or
          other matters by displaying notices or links to notices generally on
          the Website.
        </p>
        <h3>Changes to these Terms</h3>
        <p>
          We reserve the right, at our sole discretion, to change or modify
          portions of these Terms at any time. If we do this, we will post the
          changes on this page and will indicate at the top of this page the
          date these terms were last revised. Any such changes will become
          effective no earlier than fourteen (14) days after they are posted,
          except that changes addressing new functions of the Site or changes
          made for legal reasons will be effective immediately. Your continued
          use of the Site after the date any such changes become effective
          constitutes your acceptance of the new Terms.
        </p>
        <h3>Contact Us</h3>
        <p>
          If you have any questions about our Services, or to report any
          violations of these Terms or our Acceptable Use Policies, please
          contact us at{' '}
          <a className="ps-1" href="mailto:support@character.ai">
            support@character.ai
          </a>
          .
        </p>
      </div>

      <div className="p-5 mt-5"></div>
    </div>
  );
};

export default TOS;
