import axios from 'axios';
import { toast } from 'react-toastify';

export const reportCharacter = async (character, header) => {
  const confirmed = window.confirm(
    'Are you sure you want to report this character?',
  );
  if (confirmed) {
    axios
      .post(
        '/chat/character/report/',
        {
          external_id: character?.external_id,
        },
        header,
      )
      .then((response) => {
        toast('The character has been reported to our team.');
      })
      .catch((err) => {
        alert(err);
        return false;
      });
  }
};
