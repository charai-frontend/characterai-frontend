import React from 'react';
import { isMobile } from 'react-device-detect';
import { Navigation, Virtual } from 'swiper';
import 'swiper/css';
import 'swiper/css/navigation';
import { Swiper, SwiperSlide } from 'swiper/react';

import { Character, Participant } from '../types';
import CharacterSlide from './CharacterSlide';

type CategoryCarouselProps = {
  name: string;
  characters: Character[];
  selectCharacter: (character: Character) => void;
  slidesPerView: number;
  user: Participant;
};

const CategoryCarousel = ({
  name,
  characters,
  selectCharacter,
  slidesPerView,
  user,
}: CategoryCarouselProps) => {
  if (!characters.length) {
    return null;
  }

  return (
    <div style={{ marginBottom: isMobile ? 1 : 5 }}>
      <h6 style={{ marginBottom: 0 }}>{name}</h6>
      <Swiper
        spaceBetween={5}
        cssMode
        slidesPerView={slidesPerView}
        slidesPerGroup={slidesPerView - 1}
        navigation={!isMobile}
        modules={isMobile ? [Virtual] : [Navigation, Virtual]}
        virtual={{
          enabled: true,
          cache: true,
          addSlidesBefore: slidesPerView * 5,
          addSlidesAfter: slidesPerView * 3,
        }}
      >
        {characters.map((c) => (
          <SwiperSlide key={c.external_id}>
            <CharacterSlide
              character={c}
              selectCharacter={selectCharacter}
              numInteractions={c.participant__num_interactions}
              user={user}
            />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default CategoryCarousel;
