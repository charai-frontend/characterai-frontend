import React from 'react';
import { MdArrowBackIosNew } from 'react-icons/md';
import { useLocation } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';

import './Common.css';

const Privacy = (props) => {
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
            <h1>Privacy Policy</h1>
          </div>
        </div>
      </div>
      <div className="container">
        <p>
          This Privacy Policy covers the services (including all services,
          software applications, and websites to which this Privacy Policy is
          posted, the “Services”) operated by Character Technologies Inc. and
          its affiliates (collectively, “Character,” “we”, “us” and/or “our”).
        </p>

        <p>
          This Privacy Policy explains what Personal Information (defined below)
          we collect, how we use and share that information, and your choices
          concerning our data practices. This Privacy Policy is incorporated
          into and is part of our Terms of Service.
        </p>

        <p>
          Before using the Services or submitting any Personal Information to
          Character, please review this Privacy Policy carefully. By using the
          Services, you agree to the practices described in this Privacy Policy.
          If you do not agree to this Privacy Policy, you may not access any of
          our Websites or otherwise use the Service.
        </p>

        <h3>1. Personal Information We Collect</h3>

        <p>
          We collect information that alone or in combination with other
          information in our possession could be used to identify you (“Personal
          Information”) as follows:
        </p>

        <p>
          Personal Information You Provide. We may collect Personal Information
          if you create an account or communicate with us as follows.
        </p>

        <p>
          Communication Information. If you otherwise communicate with us, we
          may collect your name, contact information, and the contents of any
          messages you send (“Communication Information”).
        </p>

        <p>
          Personal Information We Collect Through Our Social Media Pages. We
          have pages on social media sites like Instagram, Facebook, Medium,
          Twitter, YouTube and LinkedIn (“Social Media Pages”). When you
          interact with our Social Media Pages, we will collect Personal
          Information that you elect to provide to us, such as your contact
          details (“Social Information”). In addition, the companies that host
          our Social Media Pages may provide us with aggregate information and
          analytics regarding the use of our Social Media Pages, which may
          include information about your engagement with our social media sites.
        </p>

        <p>
          Personal Information We Receive Automatically From Your Use of the
          Service. When you visit, use, and interact with the Service, we may
          receive certain information about your visit, use, or interactions
          (“Technical Information”). For example, we may monitor the number of
          people that visit the Services, peak hours of visits, which page(s)
          are visited, the domains our visitors come from, and which browsers
          people use to access the Service (e.g., Chrome, Firefox, etc.), broad
          geographical information, and navigation pattern. In particular,
          Technical Information includes the following, which is created and
          automatically logged in our systems:
        </p>

        <p>
          Log data. Information that your browser automatically sends whenever
          you visit the Site (“log data”). Log data includes your Internet
          Protocol address, browser type and settings, the date and time of your
          request, and how you interacted with the Site. Cookies. Please see the
          “Cookies” section below to learn more about how we use cookies. Device
          information. Includes name of the device, operating system, and
          browser you are using. Information collected may depend on the type of
          device you use and its settings. Usage Information. We collect
          information about how you use our Service, such as the types of
          content that you view or engage with, the features you use, the
          actions you take, and the time, frequency, and duration of your
          activities.
        </p>

        <p>
          Cookies. We use cookies to operate and administer our Site, gather
          usage data on our Site, and improve your experience on it. A “cookie”
          is a piece of information sent to your browser by a website you visit.
          Cookies can be stored on your computer for different periods of time.
          Some cookies expire after a certain amount of time, or upon logging
          out (session cookies), others survive after your browser is closed
          until a defined expiration date set in the cookie (as determined by
          the third party placing it), and help recognize your computer when you
          open your browser and browse the Internet again (persistent cookies).
          For more details on cookies please visit All About Cookies.
        </p>

        <p>
          Analytics. We may use a variety of online analytics products (such as
          Google Analytics, whose data use practices are explained at
          www.google.com/policies/privacy/partners/) that use cookies to help us
          analyze how users use the Site and enhance your experience when you
          use the Site.
        </p>

        <p>
          Online Tracking and Do Not Track Signals. We and our third party
          service providers may use cookies or other tracking technologies to
          collect information about your browsing activities over time and
          across different websites following your use of the Site. Our Site
          currently does not respond to “Do Not Track” (“DNT”) signals and
          operates as described in this Privacy Policy whether or not a DNT
          signal is received.
        </p>

        <p>
          Your Choices. On most web browsers, you will find a “help” section on
          the toolbar. Please refer to this section for information on how to
          receive a notification when you are receiving a new cookie and how to
          turn cookies off.{' '}
        </p>

        <p>
          Please note that if you limit the ability of websites to set cookies,
          you may be unable to access certain aspects of the Services and you
          may not be able to benefit from the Services’ full functionality.
        </p>

        <p>
          Advertising networks may use cookies to collect Personal Information.
          Most advertising networks offer you a way to opt out of targeted
          advertising.
        </p>

        <p>
          When you enter content into the Services we may monitor what you write
          to check that it does not contain inappropriate content or Personal
          Information.
        </p>

        <h3>2. How We Use Personal Information</h3>

        <p>We may use Personal Information for the following purposes:</p>

        <p>
          To provide and administer access to the Services; To maintain, improve
          or repair any aspect of the Services, which may remain internal or may
          be shared with third parties if necessary; To inform you about
          features or aspects of the Services we believe might be of interest to
          you; To respond to your inquiries, comments, feedback, or questions;
          To send administrative information to you, for example, information
          regarding the Services or changes to our terms, conditions, and
          policies; To analyze how you interact with our Service; To develop new
          programs and services; To prevent fraud, criminal activity, or misuses
          of our Service, and to ensure the security of our IT systems,
          architecture, and networks; and To comply with legal obligations and
          legal process and to protect our rights, privacy, safety, or property,
          and/or that of our affiliates, you, or other third parties.
        </p>

        <p>
          Aggregated Information. We may aggregate Personal Information and use
          the aggregated information to analyze the effectiveness of our
          Services, to improve and add features to our Services, to conduct
          research (which may remain internal or may be shared with third
          parties as necessary) and for other similar purposes. In addition,
          from time to time, we may analyze the general behavior and
          characteristics of users of our Services and share aggregated
          information like general user statistics with third parties, publish
          such aggregated information or make such aggregated information
          generally available. We may collect aggregated information through the
          Service, through cookies, and through other means described in this
          Privacy Policy.
        </p>

        <h3>3. Sharing and Disclosure of Personal Information</h3>

        <p>
          In certain circumstances we may share your Personal Information with
          third parties without further notice to you, unless required by law,
          as set forth below:
        </p>

        <p>
          Vendors and Service Providers. To assist us in meeting business
          operations needs and to perform certain services and functions, we may
          share Personal Information with vendors and service providers,
          including providers of hosting services, cloud services, and other
          information technology services providers, email communication
          software and email newsletter services, advertising and marketing
          services, and web analytics services. Pursuant to our instructions,
          these parties will access, process, or store Personal Information in
          the course of performing their duties to us.
        </p>

        <p>
          Business Transfers. If we are involved in strategic transactions,
          reorganization, bankruptcy, receivership, or transition of service to
          another provider (collectively a “Transaction”), your Personal
          Information and other information may be shared in the diligence
          process with counterparties and others assisting with the Transaction
          and transferred to a successor or affiliate as part of that
          Transaction along with other assets.
        </p>

        <p>
          Legal Requirements. If required to do so by law or in the good faith
          belief that such action is necessary to (i) comply with a legal
          obligation, including to meet national security or law enforcement
          requirements, (ii) protect and defend our rights or property, (iii)
          prevent fraud, (iv) act in urgent circumstances to protect the
          personal safety of a person or group, or (v) protect against legal
          liability.
        </p>

        <p>
          Affiliates. We may share Personal Information with our affiliates,
          meaning an entity that controls, is controlled by, or is under common
          control with Character. Our affiliates may use the Personal
          Information we share in a manner consistent with this Privacy Policy.
        </p>

        <p>
          Other Users. Certain actions you take may be visible to other users of
          the Services or result in content that is made available to other
          users of the Services.
        </p>

        <h3>4. Update Your Information</h3>

        <p>
          Please contact us at support@character.ai if you need to change or
          correct your Personal Information.
        </p>

        <h3>5. Children Under 16 May Not Use Our Services</h3>

        <p>
          Our Services are not directed to children who are under the age of 16.
          Character does not knowingly collect Personal Information from
          children under the age of 16. If you have reason to believe that a
          child under the age of 16 has provided Personal Information to us
          through the Services, please email us at support@character.ai and we
          will take appropriate steps to investigate.
        </p>

        <h3>6. Links to Third Party Websites and Services</h3>

        <p>
          The Service may contain links to other websites not operated or
          controlled by us, including social media services (“Third Party
          Sites”). The information that you share with Third Party Sites will be
          governed by the specific privacy policies and terms of service of the
          Third Party Sites and not by this Privacy Policy. By providing links
          in the course of providing the Services, we do not imply that we
          endorse or have reviewed these sites. Please contact the applicable
          Third Party Site directly for information on their privacy practices
          and policies.
        </p>

        <h3>7. Security</h3>

        <p>
          You use the Services at your own risk. We implement commercially
          reasonable technical, administrative, and organizational measures to
          protect Personal Information both online and offline from loss,
          misuse, and unauthorized access, disclosure, alteration, or
          destruction. However, no Internet or e-mail transmission is ever fully
          secure or error free. In particular, e-mail sent to or from us may not
          be secure. Therefore, you should take special care in deciding what
          information you provide to us via the Services or e-mail. Please keep
          this in mind when disclosing any Personal Information to Character. In
          addition, we are not responsible for circumvention of any privacy
          settings or security measures contained on the Services, or Third
          Party Sites.
        </p>

        <h3>8. International Users</h3>

        <p>
          By using our Service, you understand and acknowledge that your
          Personal Information may be transferred from your location to our
          facilities and servers in the United States.
        </p>

        <h3>9. Information Provided by Choice</h3>

        <p>
          In certain circumstances providing Personal Information is optional.
          However, if you choose not to provide Personal Information that is
          needed to use some features of our Services, you may be unable to use
          those features. You can contact us at support@character.ai to ask us
          to update or correct your Personal Information.
        </p>

        <h3>10. California Privacy Rights</h3>

        <p>
          The following disclosures are intended to provide additional
          information about (1) the categories of Personal Information we
          collect (as defined above), (2) the source of the Personal
          Information, (3) how we use each category of Personal Information, and
          (4) how we disclose Personal Information. These disclosures do not
          limit our ability to use or disclose information as described in
          Sections 2 and 3.
        </p>

        <p>
          To the extent provided for by law and subject to applicable
          exceptions, California residents have the following privacy rights in
          relation to the Personal Information we collect:
        </p>

        <p>
          The right to know what Personal Information we have collected and how
          we have used and disclosed that Personal Information; The right to
          request deletion of your Personal Information; and The right to be
          free from discrimination relating to the exercise of any of your
          privacy rights.
        </p>

        <p>We do not and will not sell your Personal Information.</p>

        <p>
          Exercising Your Rights. California residents can exercise the above
          privacy rights by emailing us at: support@character.ai.
        </p>

        <p>
          Verification. In order to protect your Personal Information from
          unauthorized access or deletion, we may require you to verify your
          credentials before you can submit a request to know or delete Personal
          Information. If you do not have an account with us, or if we suspect
          fraudulent or malicious activity, we may ask you to provide additional
          Personal Information and proof of residency for verification. If we
          cannot verify your identity, we will not provide or delete your
          Personal Information as applicable.
        </p>

        <p>
          Authorized Agent. You may submit a request to know or a request to
          delete your Personal Information through an authorized agent. If you
          do so, the agent must present signed written permission to act on your
          behalf and you may also be required to independently verify your
          identity and submit proof of your residency.
        </p>

        <h3>11. Changes to This Privacy Policy</h3>

        <p>
          The Services, and/or our activities and businesses may change from
          time to time. As a result we may change this Privacy Policy at any
          time. When we do we will post an updated version on this page, unless
          another type of notice is required by applicable law. By continuing to
          use our Services or providing us with Personal Information after we
          have posted an updated Privacy Policy, or notified you by other means
          if applicable, you consent to the revised Privacy Policy and practices
          described in it. Please review this policy periodically.
        </p>

        <h3>12. Contact Us</h3>

        <p>
          If you have any questions about our Privacy Policy or information
          practices, please feel free to contact us at support@character.ai.
        </p>
      </div>
      <div className="p-5 mt-5"></div>
    </div>
  );
};

export default Privacy;
