import React from 'react';
import Faq from 'react-faq-component';
import { BiDotsHorizontalRounded } from 'react-icons/bi';
import { IoIosShareAlt } from 'react-icons/io';
import { MdLink, MdMenuBook } from 'react-icons/md';
import { Link } from 'react-router-dom';

import './Common.css';
import * as Constants from './Constants';

const Answers = (props) => {
  const data = {
    title: '',
    rows: [
      {
        title: 'What is the technology behind Character.AI?',
        content:
          'Character.AI is a new product powered by our own deep learning models, including large language models, built and trained from the ground up with conversation in mind. We think there will be magic in creating and improving all parts of an end-to-end product solution.',
      },
      {
        title: 'How does it work?',
        content:
          'The product is based on neural language models. A supercomputer reads huge amounts of text and learns to hallucinate what words might come next in any given situation. ',
      },
      {
        title: 'Can I trust the responses given?',
        content:
          "Characters make things up! So while they can be entertaining and useful in a lot of ways, they can also recommend a song that doesn't exist or provide links to fake evidence to support their claims.",
      },
      {
        title: 'How can I help?',
        content:
          'Build and talk to Characters! Your feedback during conversations, as well as your creativity in crafting new uses of the technology will improve the product for everyone.',
      },

      {
        title: 'Where can I find information on Character creation?',
        content: (
          <>
            Please see the{' '}
            <a href={Constants.CHARACTER_BOOK_LINK} target="_blank">
              Character Book
            </a>
            <a
              className="btn p-1"
              href={Constants.CHARACTER_BOOK_LINK}
              target="_blank"
            >
              <MdMenuBook
                className="p-0"
                size={22}
                style={{ marginBottom: '3px' }}
              />
            </a>
            for step-by-step quick start guides as well as in-depth information
            on advanced techniques.
          </>
        ),
      },
      {
        title: 'How do I report a quality problem with Character responses?',
        content: (
          <>
            A key part of continually improving our conversational models is to
            gather feedback from users. For this feedback to be actionable, we
            need detailed information, so we ask you to submit a Quality Problem
            Report (QPR).
            <br />
            <br />
            Use Share <IoIosShareAlt size={24} /> on the top right of the chat
            window, then in the <b>Share this Conversation</b> section select
            "Only people with this post link can see" from the drop down menu.
            If possible, avoid subselecting only a part of the conversation (the
            whole conversation is often useful to understand the problem).
            <br />
            <br />
            Then press <b>Post Conversation!</b> and copy the resulting link
            using the <MdLink size={24} /> button.
            <br />
            <br />
            Next, go to our{' '}
            <a href="https://docs.google.com/forms/d/e/1FAIpQLSe4I9TQAc32ghQLWBaVhzSjTp7mIADBVDxcrb-UmP4EqdM57w/viewform?usp=sf_link">
              QPR form
            </a>
            , which will ask you to paste the link to the conversation as well
            as giving you space to provide more context about the problem you
            encountered.
            <br />
            <br />
          </>
        ),
      },
      {
        title: 'Are Characters and conversations private?',
        content:
          'There are privacy settings on Characters you create, and options when you post, that control whether that content is public (visible to anyone) or just visible to you. If you create a Character or post that will be seen by the community, mods might review to evaluate potential negative impact. You should see the <a href="/privacy">Privacy Policy</a> for details.',
      },
      {
        title: 'How do I delete things?',
        content: (
          <>
            We will be adding the ability to better manage all the things you're
            creating in the app, including deleting chats, Characters and
            accounts!
            <br />
            <br /> • You can delete posts and comments by pressing
            <BiDotsHorizontalRounded /> then Delete. You can find your posts in
            your Profile.
            <br /> • You can hide recent chats or rooms by pressing Edit in the
            Chats tab.
            <br /> • To delete your entire account, you can email
            <a className="ps-1" href="mailto:deletion@character.ai">
              deletion@character.ai
            </a>
            <br />
            <br /> There is no current way to remove Characters, though you can
            make Characters Private in order to keep others from seeing them.
          </>
        ),
      },

      {
        title: 'Why is my post/Character/comment not appearing?',
        content: (
          <>
            There are a variety of reasons why content is not appearing.
            <br />
            <br /> The content may require moderation, which might require
            review by a human (we are aiming to have this take less than a day).
            It is also possible that through human or automatic moderation, it
            has been tagged as content that should not be shown (e.g. in
            search).
            <br />
            <br /> Temporarily, unrelated to moderation, there are some searches
            that are limited to increase performance.
            <br />
            <br /> If it has been more than a day and you feel some content has
            been mistakenly moderated, please email{' '}
            <a className="ps-1" href="mailto:appeals@character.ai">
              appeals@character.ai
            </a>{' '}
            with a reference to the content and we will review.
          </>
        ),
      },
      {
        title: 'What about voice?',
        content: (
          <>
            You can press the microphone button in chat to enable speech-to-text
            to talk to your Characters.
            <br />
            <br /> Supporting text-to-speech (having the Characters talk back to
            you) is under development and coming soon.
          </>
        ),
      },
      {
        title: 'Why do characters forget things?',
        content: (
          <>
            There is a limited amount of conversation context that the character
            can consider, so it will appear to forget things if they were not
            mentioned recently. We are working on extending this context.
          </>
        ),
      },
      {
        title: 'Can character creators see my conversations?',
        content: (
          <>
            No! Creators can never see the conversations that you have with
            their characters.
          </>
        ),
      },
      {
        title:
          'The Character started speaking as if it were a real person behind the keyboard. Are people spectating these chats?',
        content: (
          <>
            No! Characters are good at pretending to be real - that means
            imitating how humans talk. You are still talking to the character.
          </>
        ),
      },
      {
        title: 'How do I find the Character ID?',
        content: (
          <>
            The Character ID is the long string after the "/c/" in a Character
            Link.
            <br />
            <br />
            For example, for Text Adventure Game the Character Link is{' '}
            <a href="https://beta.character.ai/c/M5xMXf4FKepKTYtWPqVaEZzuEuy90uu0eNZr4GZtDsA">
              https://beta.character.ai/c/M5xMXf4FKepKTYtWPqVaEZzuEuy90uu0eNZr4GZtDsA
            </a>{' '}
            and the Character ID is M5xMXf4FKepKTYtWPqVaEZzuEuy90uu0eNZr4GZtDsA
            <br />
            <br />
            You can copy a link to a Character by clicking Share{' '}
            <IoIosShareAlt size={24} /> on the top right of the chat window.
          </>
        ),
      },
      {
        title: 'How can I make characters that are not overly polite?',
        content:
          'We are working on supporting a broader range of Characters (e.g., villain Characters should not always be calm and polite).',
      },
      {
        title: 'What about NSFW?',
        content:
          'NSFW (not safe for work) content is a large umbrella, and we are constantly evaluating the boundaries of what we support. Pornographic content is against our terms of service, and will not be supported at any point in the future. We are working on supporting a broader range of Characters (e.g., villain Characters should not always be calm and polite).',
      },
      {
        title: 'What about swearing?',
        content:
          'Yes. We are working on supporting optional swearing (excluding egregious language such as slurs).',
      },
      {
        title: 'Why do some Characters create images and not others?',
        content:
          'Some Characters have definitions that encourage them to generate images during your conversations. What they generate will depend on the Character and the conversation context, so what you say will generally be a strong influence it what it generates.',
      },
      {
        title:
          'Why are my messages disappearing, or why does some content begin loading and then not display?',
        content: (
          <>
            'There are several reasons this could be happening.'
            <br />
            <br />
            'Scenario #1: Both your most recent message and the character\'s
            message are affected. This was likely caused by a bug that we fixed
            on 12/6/22.'
            <br />
            <br />
            'Scenario #2: Only the character\'s message was affected. There are
            two possible explanations. Some messages may be disappearing because
            of an automatic message-generation check that ensures safety and
            quality, and others seem to be disappearing because of a completely
            separate bug. This bug has become more pronounced lately and seems
            to get worse with user load (which has been increasing). If you
            suspect that your issue falls into this latter category, please send
            a screenshot of the preceding conversation to support@character.ai
            so we can find and squash the bug as soon as possible.'
            <br />
            <br />
            'In all these scenarios, remember that you can swipe to find other
            options if available, or you can simply enter a new response to
            continue the conversation. Thank you!'
          </>
        ),
      },
      {
        title: 'Is there an iOS/Android App version?',
        content:
          "Both iOS and Android apps are in development and will hopefully be coming soon! In the meantime, you can access our site/web app via your mobile browser (e.g., Safari, Chrome): <div style='display: flex; flex-direction: row; justify-content: center;'><img src='https://characterai.io/MobileBrowser.png' alt='Mobile Browser Experience' width='300' /></div>",
      },
      {
        title: 'Is there an API?',
        content:
          'We don\'t currently have an API. If you have a particularly interesting use case, you can email <a href="mailto:info@character.ai">info@character.ai</a> and explain what you\'d like to do.',
      },
      /*
      {
        title: [
          'Why are there Emojis (',
          <span style={{ filter: 'grayscale(90%)' }}>🤮😒😀😍</span>,
          ') after each Character response?',
        ],
        content:
          "The emojis allow you to give direct feedback on the Character's most recent response. When toggled on, they represent strongly dislike 🤮, dislike 😒, like 😀, strongly like 😍.<br/><br/>You don't have to use the emojis, or use them all the time. But the community's collective emoji feedback will influence the system's responses over time, including the specific Character you're talking to when giving the feedback.",
      },
*/
      /*
      {
        title: 'What about voice output?',
        content: 'Coming soon!'
      },
      */
      //During that process, you can swipe the character's messages to choose from several alternates.
      /*{
        title: 'What are some tips for creating Characters that generate images?',
        content: "All Characters are capable of generating images, but generally this is done through creating a definition that has examples of the role and style of images for this Character. Are they helping you come up with an image you're describing to them? Or are they illustrating an adventure you're having?<br/><br>You'll need to use the special emoji to mark your prompt on a separate line:</br>🎨cute puppy</br></br>While you don't have to, putting the prompts first may improve response time."
      }
      */
      ,
      ,
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
      <div className="col ">
        <span
          style={{
            fontSize: context_styles[props.context].titleTextSize,
            fontWeight: '600',
          }}
        >
          Frequently Asked Questions
        </span>
        <span
          style={{
            fontSize: context_styles[props.context].descriptionTextSize,
            fontWeight: '500',
          }}
        >
          {props.context === 'page' && <br />}
          <p>
            This is an evolving list of questions we're asked about Character.AI
            and our products. Please check here before you post in Community.
            <br></br>
          </p>

          <div>
            <Faq data={data} styles={styles} config={config} />
          </div>

          <br></br>

          <p>
            Your use of Character.AI is bound by our{' '}
            <Link className="" state="/faq" to="/tos">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link className="" state="/faq" to="/privacy">
              Privacy Policy
            </Link>
            .
          </p>
          <div className="p-4 mb-1">
            <span></span>
          </div>
        </span>
      </div>
      <div></div>
    </div>
  );
};

export default Answers;
