import React, { useEffect, useState } from 'react';
import { MdPlayArrow } from 'react-icons/md';
import Select from 'react-select';
import { Button, Spinner } from 'reactstrap';

import '../Common.css';
import API from '../api/Api';
import { Voice } from '../types';

type VoiceSelectProps = {
  onChange: (voiceId: string) => void;
  selectedVoiceId?: number;
  sampleText: string;
};

const voiceToOption = (v: Voice | undefined) =>
  v
    ? {
        value: v.id,
        label: `${v.name} (${v.lang_code}-${v.country_code})`,
      }
    : null;

const DEFAULT_VOICE_PREVIEW_SAMPLE_TEXT = 'Hello world how are you doing today';
let ttsAudio: HTMLAudioElement | null = null;

const VoiceSelect = ({
  onChange,
  selectedVoiceId,
  sampleText,
}: VoiceSelectProps) => {
  const [voices, setVoices] = useState<Voice[]>([]);
  const [loadingPreview, setLoadingPreview] = useState(false);

  useEffect(() => {
    const loadVoices = async () => {
      const voiceResponse = await API.fetchVoices();
      setVoices(voiceResponse);
    };
    loadVoices();

    return () => {
      if (ttsAudio) {
        ttsAudio.pause();
      }
    };
  }, []);

  const previewVoice = async () => {
    if (!selectedVoiceId) {
      return;
    }

    setLoadingPreview(true);
    const speech = await API.previewVoice(
      selectedVoiceId,
      sampleText || DEFAULT_VOICE_PREVIEW_SAMPLE_TEXT,
    );
    playTTS(speech);
    setLoadingPreview(false);
  };

  const playTTS = async (audioString: string) => {
    // @ts-expect-error webkitAudioContext unrecognized
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (ttsAudio) {
      ttsAudio.pause();
    }
    ttsAudio = new Audio('data:audio/wav;base64,' + audioString);
    const source = audioCtx.createMediaElementSource(ttsAudio);
    const gainNode = audioCtx.createGain();
    gainNode.gain.value = 2;
    source.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    // @ts-expect-error type error
    let resolveAudioEnded: (v?: unknown) => void | null = null;
    const audioEnded = new Promise((resolve) => {
      resolveAudioEnded = resolve;
    });
    ttsAudio.addEventListener(
      'ended',
      () => {
        resolveAudioEnded();
      },
      false,
    );
    ttsAudio.play();
    return audioEnded;
  };

  return (
    <div className="d-flex">
      <Select
        id="voice-select"
        // @ts-expect-error: type error
        options={voices.map(voiceToOption)}
        // @ts-expect-error: type error
        onChange={(newVoice) => onChange(newVoice?.value || '')}
        value={
          selectedVoiceId &&
          voiceToOption(voices.find((v) => v.id === selectedVoiceId))
        }
        isClearable
      />
      <Button
        onClick={previewVoice}
        disabled={!selectedVoiceId}
        style={{ marginLeft: 10 }}
        color="primary"
      >
        {loadingPreview ? (
          <Spinner style={{ width: 20, height: 20 }} />
        ) : (
          <MdPlayArrow />
        )}
      </Button>
    </div>
  );
};

export default VoiceSelect;
