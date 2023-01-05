import { useEffect, useState } from 'react';
import { Button, Modal, ModalBody, ModalFooter, ModalHeader } from 'reactstrap';

import { VISITED_KEY } from './Constants';

export default function IntroModal() {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (!JSON.parse(localStorage.getItem(VISITED_KEY))) {
      setOpen(true);
    }
  }, []);

  const acknowledge = () => {
    localStorage.setItem(VISITED_KEY, true);
    setOpen(false);
  };

  return (
    <Modal isOpen={open}>
      <ModalHeader>👋 Welcome!</ModalHeader>
      <ModalBody>
        <p>Character.AI lets you create Characters and talk to them.</p>

        <p>Things to remember:</p>
        <ul style={{ listStyle: 'none' }}>
          <li>
            🤥 &nbsp; Everything Characters say is <b>made up!</b> Don't trust
            everything they say or take them too seriously.
          </li>
          <br />
          <li>
            🤬 &nbsp; Characters may mistakenly be <b>offensive</b> - please
            rate these messages one star.
          </li>
          <br />
          <li>
            🥳 &nbsp; Characters can be <b>anything</b>. Our breakthrough AI
            technology can bring all of your ideas to life.
          </li>
        </ul>
        <br />
        <p>
          We hope you have a lot of fun bringing your imagination to life and we
          can't wait to talk with the Characters you create!
        </p>
      </ModalBody>
      <ModalFooter>
        <Button color="primary" onClick={acknowledge}>
          I understand
        </Button>
      </ModalFooter>
    </Modal>
  );
}
