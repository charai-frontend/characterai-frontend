import React from 'react';
import { useEffect, useState } from 'react';
import ReactGA from 'react-ga';
import { useNavigate } from 'react-router-dom';

import './Common.css';
import Logo from './components/Logo';

const OnBoarding = (props) => {
  const navigate = useNavigate();

  const [step, setStep] = useState(0);

  const nextStep = () => {
    ReactGA.event({
      category: 'User',
      action: `Onboarding Step Click ${step}`,
    });

    if (step === 3) {
      // force a reload
      window.location.replace('/');
    } else {
      setStep(step + 1);
    }
  };

  const content = [
    {
      title: (
        <p>
          <b>3</b> Things to Remember
        </p>
      ),
      body: [
        <p>
          <br />
        </p>,
        <p>
          <br />
        </p>,
        <button
          className="btn border"
          style={{ fontSize: '24px' }}
          onClick={nextStep}
        >
          Ok, I'm listening
        </button>,
      ],
    },
    {
      title: (
        <p>
          Characters Make <b>Stuff</b> Up 🤥
        </p>
      ),
      body: [
        <p>Characters are playing roles, like an actor playing a doctor.</p>,
        <p>They will confidently invent 'facts' based on the context.</p>,
        <p>So if a Chef Character tells you it's safe to eat raw chicken...</p>,
        <p>...don't trust them.</p>,
        <p>&nbsp;</p>,
        <button
          className="btn border"
          style={{ fontSize: '24px' }}
          onClick={nextStep}
        >
          I won't trust them
        </button>,
      ],
    },
    {
      title: (
        <p>
          Characters <b>May</b> 😳🙊🤬
        </p>
      ),
      body: [
        <p>
          We are always working to improve safety and reduce the chance for bad
          content.
        </p>,
        <p>
          But depending on context, a character might say unfortunate things.
        </p>,
        <p>
          Please click the one star rating for offensive messages - your
          conversations will help Character learn!
        </p>,
        <button
          className="mt-4 btn border"
          style={{ fontSize: '24px' }}
          onClick={nextStep}
        >
          I understand
        </button>,
      ],
    },
    {
      title: (
        <p>
          Characters Are <b>Anything</b> 🥳
        </p>
      ),
      body: [
        <p>
          With just a few words, you can design Characters with creative
          personalities and exciting backstories, and we'll bring them to life
          with our breakthrough AI technology.
        </p>,
        <p>
          A chipmunk that's secretly an AI wanting to take over the world? A bus
          giving NYC sightseeing advice?
        </p>,
        <p>Anything you can imagine.</p>,
        <button
          className="mt-4 btn border"
          style={{ fontSize: '24px' }}
          onClick={nextStep}
        >
          I'm ready!
        </button>,
      ],
    },
  ];

  return (
    <div className="container vh-100">
      <div className="row">
        <div className="col text-center" style={{ marginTop: '30px' }}>
          <Logo />
        </div>
      </div>
      <div className="row mt-5 align-items-center mx-2 ">
        <div className="col-12 text-center ">
          <div className="onboard-large">{content[step].title}</div>
          <div className="text-muted onboard-small mt-5">
            {content[step].body}
          </div>
        </div>
        {/*<div className="col-1 p-0">
        <button
          className = "btn p-0"
          onClick = {nextStep}
          ><MdKeyboardArrowRight size={48} style={{"color": "#AAAAAA"}}/>
        </button>
        </div>*/}
      </div>
    </div>
  );
};
export default OnBoarding;
