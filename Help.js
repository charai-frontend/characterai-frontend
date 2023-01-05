import React from 'react';
import { MdArrowBackIosNew } from 'react-icons/md';
import { useLocation } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';

import './Common.css';
import Logo from './components/Logo';

const Help = (props) => {
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
    //console.log(address)
    navigate(address);
  };

  return (
    <div className="row mt-4 me-3" style={{ maxWidth: '800px' }}>
      <div className="col-1 mb-5">
        <button className={'btn mt-2'} role="button" onClick={handleBack}>
          <MdArrowBackIosNew size={24} />
        </button>
      </div>
      <div className="col container m-2">
        <div className="row mb-5">
          <div className="col text-left">
            <Logo />
          </div>
        </div>

        <h2>About us</h2>
        <p>
          Character.AI is bringing to life the science-fiction dream of
          open-ended conversations and collaborations with computers.
        </p>
        <p>
          We are building the next generation of dialog agents&mdash;with a
          long-tail of applications spanning entertainment, education, general
          question-answering and others.
        </p>
        <p>
          Our dialog agents are powered by our own proprietary technology based
          on large language models, built and trained from the ground up with
          conversation in mind.
        </p>
        <h4>How does the Character.AI beta work?</h4>
        <p>
          The Character.AI beta is based on neural language models. A
          supercomputer reads huge amounts of text and learns to hallucinate
          what words might come next in any given situation. Models like these
          have many uses including auto-complete and machine translation.
        </p>

        <p>
          At Character.AI, you collaborate with the computer to write a dialog -
          you write one character's lines, and the computer creates the other
          character's lines, giving you the illusion that you are talking with
          the other character.
        </p>
        <p>
          Needless to say, a hallucinating supercomputer is not a source of
          reliable information. Still, we hope that you find Character.AI a
          useful tool for imagination, brainstorming, language learning, and a
          host of other purposes we have ourselves not yet imagined :)
        </p>

        <h4>Contact us</h4>
        <p>
          If you have a question, and don't see it answered in our{' '}
          <Link className="" state="/help" to="/faq">
            Frequently Asked Questions
          </Link>
          , please ask for help or report any issues in
          <a href="/community">
            <span className="ps-1">Community</span>
          </a>
          . Please check that your issue hasn't been reported already before
          posting a new issue, and be sure to follow our  <Link className="" state="/help" to="/guidelines">Community Guidelines</Link>.
        </p>

        <p>
          For other support-related requests, reach us at
          <a className="ps-1" href="mailto:support@character.ai">
            support@character.ai
          </a>
          .
        </p>

        <p>
          For information, partnerships or anything else, reach us at
          <a className="ps-1" href="mailto:info@character.ai">
            info@character.ai
          </a>
          .
        </p>

        <h4>Community</h4>
        <p>
          Find us on <a href="https://twitter.com/character_ai">Twitter</a>,{' '}
          <a href="https://www.reddit.com/r/CharacterAI/">Reddit</a>,{' '}
          <a href="https://discord.gg/yRdsCgXX8S">Discord</a>,{' '}
          <a href="https://www.facebook.com/CharacterAI/">Facebook</a> and{' '}
          <a href="https://www.instagram.com/characterai/">Instagram</a>.
        </p>

        <h4>Work with us</h4>
        <p>
          We are actively recruiting, come{' '}
          <a href="https://www.google.com/url?q=https%3A%2F%2Fjobs.lever.co%2Fcharacter&sa=D&sntz=1&usg=AOvVaw2TSbBAzdB1bWKasBcFkdF_">
            work with us
          </a>
          .
        </p>
        {/* <h4>Report an issue</h4>
        <p>
          {' '}
          Feel free to report any issues at our
          <a href="/posts?topic=zje25meEOvU6x_yTq2vhPrxN-FV69R_w6oIcoS2VfG4">
            <span className="ps-1">community channel</span>
          </a>
          .
        </p>
        <p>
          Please check in the Community channel if your issue hasn't been
          reported already before posting a new issue.
        </p>

        <p>
          If you prefer email, our address is
          <a className="ps-1" href="mailto:support@character.ai">
            support@character.ai
          </a>
          .
        </p>
        <h4>Work with us</h4>
        <p>
          We are actively recruiting, come{' '}
          <a href="https://www.google.com/url?q=https%3A%2F%2Fjobs.lever.co%2Fcharacter&sa=D&sntz=1&usg=AOvVaw2TSbBAzdB1bWKasBcFkdF_">
            work with us
          </a>
          .
        </p> */}
        <br />
        <p>
          Your use of Character.AI is bound by our{' '}
          <Link className="" state="/help" to="/tos">
            Terms of Service
          </Link>{' '}
          and{' '}
          <Link className="" state="/help" to="/privacy">
            Privacy Policy
          </Link>
          .
        </p>
        <div className="p-4 mb-1">
          <span></span>
        </div>
      </div>
      <div></div>
    </div>
  );
};

export default Help;
