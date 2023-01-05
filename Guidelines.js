import React from 'react';
import Faq from 'react-faq-component';
import { MdKeyboardArrowDown } from 'react-icons/md';
import { Link } from 'react-router-dom';

import './Common.css';

const Guidelines = (props) => {
  const data = {
    title: '',
    rows: [
      {
        title: 'Age Requirement',
        content:
          'Use of Character.AI including the Community section requires users to be at least 16 years old.',
      },
      {
        title: 'Community Standards',
        content: (
          <>
            We expect users of our Community to have discussions without
            resorting to personal attacks towards other users or the development
            team.
            <br /> <br />
            Moderators have the discretion to act as they see fit in order to
            foster a community free from harassment, bullying or dysfunctional
            behavior.'
            <br /> <br />
            These guidelines are not an all-inclusive list, and are also
            supplemented by the{' '}
            <Link className="" state="/community" to="/tos">
              Terms of Service
            </Link>{' '}
            and <a href="/privacy">Privacy Policy</a> specifically including,
            but not limited to the Conditions of Use clause.
            <br /> <br />
            Content prohibited under those policies is also prohibited from
            being posted here.
          </>
        ),
      },
      {
        title: 'Disallowed Content',
        content: (
          <>
            Repeated posts of very similar feedback or content (spamming) makes
            the site hard for everyone to use, and is not allowed.
            <br />
            <br />
            Posts asking for changes to the system that have already been
            addressed in Announcements or the FAQ will be removed.
            <br />
            <br />
            This includes discussion of NSFW content (please see the FAQ for our
            statement on NSFW content).
            <br />
            <br />
            External links are not allowed in comments or posts.
          </>
        ),
      },
      /*      {
              title: 'Not Safe For Work (NSFW) Posts',
              content : ['NSFW posts are allowed, but mark any and all potential NSFW conversations as such, adding NSFW in the post title. This includes but is not limited to language, violence, and sexual content.',
              <br/>,<br/>,
              'Prohibited topics include but are not limited to:  anything that is unlawful, harmful, threatening, abusive, suggestive of rape, harassing, excessively or graphically violent, defamatory, vulgar, obscene, pornographic, suggestive of pedophilia or underage sexual encounters, incest, bestiality, is libellous, invasive of another’s privacy, hateful racially, discriminatory or otherwise objectionable.',
              <br/>,<br/>,
              'What qualifies for removal may vary, and will be up to the discretion of the moderators.']

            },*/
      {
        title: 'Off Topic Posts',
        content: (
          <>
            Posts must be relevant to Character.AI. Any self-promotion or
            promotion of other tools or services is not allowed. However,
            comparisons with other chat tools or discussions of other AI
            technologies may be allowed if they are clearly constructive to this
            site.
          </>
        ),
      },
      {
        title: 'Reporting Quality Problems',
        content:
          'When reporting a Character problem (change or question about behavior), please follow the instructions in the FAQ to include an unlisted example conversation that demonstrates the problem.',
      },
      {
        title: 'Security',
        content: (
          <>
            This forum is intended to support using Character.AI as intended and
            as outlined in our Terms of Service. Do not post questions about or
            suggestions for how to misuse or circumvent site or product
            controls.
            <br />
            <br />
            Do not solicit or offer Character.AI login, password or account
            information.,
          </>
        ),
      },
      {
        title: 'Rule Enforcement and Communication',
        content: (
          <>
            Do not attempt to police the community yourself.
            <br />
            <br />
            You can flag content that you think violates these rules and/or
            email information to
            <a className="ps-1" href="mailto:support@character.ai">
              support@character.ai
            </a>
          </>
        ),
      },
    ],
  };

  const context_styles = {
    page: {
      rowContentTextSize: '14px',
      rowTitleTextSize: '16px',
      titleTextSize: '24px',
      descriptionTextSize: '16px',
    },
    sidebar: {
      rowContentTextSize: '12px',
      rowTitleTextSize: '14px',
      titleTextSize: '18px',
      descriptionTextSize: '12px',
    },
    compact: {
      rowContentTextSize: '12px',
      rowTitleTextSize: '14px',
      titleTextSize: '18px',
      descriptionTextSize: '12px',
    },
  };

  const styles = {
    // bgColor: 'white',
    titleTextColor: '#138eed',
    rowTitleColor: '#138eed',
    rowContentTextSize: context_styles[props.context].rowContentTextSize,
    rowTitleTextSize: context_styles[props.context].rowTitleTextSize,
    // rowContentColor: 'grey',
    // arrowColor: "red",
  };

  const config = {
    // animate: true,
    // arrowIcon: "V",
    // tabFocus: true
  };

  return (
    <div className="row">
      <div className="col">
        <span
          style={{
            fontSize: context_styles[props.context].titleTextSize,
            fontWeight: '600',
          }}
        >
          Community Guidelines{' '}
          {props.context === 'compact' && <MdKeyboardArrowDown />}
        </span>

        {(props.context !== 'compact' || isOpen) && (
          <div>
            <span
              style={{
                fontSize: context_styles[props.context].descriptionTextSize,
                fontWeight: '500',
              }}
            >
              <p>
                We want our community to become a key part of the experience, a
                place to ask questions, share tips, provide feedback to the
                development team and together explore what we can build with AI.
              </p>

              <p>
                We ask that everyone abide by the both letter and spirit of
                these guidelines.
              </p>

              <div>
                <Faq data={data} styles={styles} config={config} />
              </div>
              <br></br>

              <p>
                Your use of Character.AI is bound by our{' '}
                <Link className="" state="/community" to="/tos">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link className="" state="/community" to="/privacy">
                  Privacy Policy
                </Link>
                .
              </p>
              <div className="p-4 mb-1">
                <span></span>
              </div>
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default Guidelines;
