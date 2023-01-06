import { useQuery } from '@tanstack/react-query';
import React, { useCallback, useEffect, useState } from 'react';
import { isMobile } from 'react-device-detect';
import InfiniteScroll from 'react-infinite-scroll-component';
import { Spinner } from 'reactstrap';

import AppWrapper from '../AppWrapper';
import { CATEGORIES_PER_PAGE, CHARACTER_SLIDE_WIDTH } from '../Constants';
import API from '../api/Api';
import Loading from '../components/Loading';
import {
  Category,
  Character,
  CharactersByCategory,
  Participant,
  TrendingScores,
} from '../types';
import { compareCharactersByReceivedMessages } from '../utils/character-utils';
import CategoryCarousel from './CategoryCarousel';
import CharacterPeek from './CharacterPeek';

type RenderedCharacterIdsMap = { [key: string]: boolean };

type Props = {
  featured: Character[];
  trendingCharacters: Character[];
  recommended: Character[];
  trendingScoresByCharId: TrendingScores;
  user: Participant;
  token: string;
  setLoginOpen: () => void;
  login: boolean;
  logout: () => void;
  handleServerError: () => void;
  waitlist: boolean;
  loaded: string[];
  categories: Category[];
  trendingCarouselIndex: number;
};

const DiscoverPage = (props: Props) => {
  const {
    user,
    token,
    setLoginOpen,
    login,
    waitlist,
    handleServerError,
    loaded,
    featured,
    recommended,
    categories,
    // Trending is currently hardcoded to be the first category, so this is unused. But it's here in case we want to make it dynamic quickly later.
    trendingCarouselIndex,
    trendingCharacters,
  } = props;
  const [loading, setLoading] = useState(true);
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(
    null,
  );
  const [displayedCategories, setDisplayedCategories] = useState<Category[]>(
    [],
  );
  const [pageIdx, setPageIdx] = useState(0);
  const [dedupedCategoryCharacters, setDedupedCategoryCharacters] =
    useState<CharactersByCategory>({});

  const { data: categoryCharacters, isLoading: loadingCategoryCharacters } =
    useQuery(['category-characters'], API.fetchCharactersByCategory);

  const {
    data: curatedCategoryCharacters,
    isLoading: loadingCuratedCategoryCharacters,
  } = useQuery(
    ['curated-category-characters'],
    API.fetchCharactersByCuratedCategory,
  );

  useEffect(() => {
    if (categories?.length) {
      setDisplayedCategories(categories.slice(0, CATEGORIES_PER_PAGE));
      setPageIdx(1);
    }
  }, [categories]);

  const [slidesPerView, setSlidesPerView] = useState(0);

  const calculateSlidesPerView = () => {
    const newSlidesPerView = isMobile
      ? Math.floor(window.innerWidth / CHARACTER_SLIDE_WIDTH)
      : Math.floor((window.innerWidth - 200) / CHARACTER_SLIDE_WIDTH);
    setSlidesPerView(newSlidesPerView);
  };

  useEffect(() => {
    if (
      loaded.includes('featured') &&
      loaded.includes('trending') &&
      loaded.includes('categories') &&
      !loadingCategoryCharacters &&
      !loadingCuratedCategoryCharacters
    ) {
      initializeDedupedCharactersByCategory();
    }
  }, [loaded, loadingCategoryCharacters, loadingCuratedCategoryCharacters]);

  useEffect(() => {
    calculateSlidesPerView();
    // TODO: Kishan fix horizontal scrolling after window resize
    // window.addEventListener('resize', calculateSlidesPerView);
    // return () => window.removeEventListener('resize', calculateSlidesPerView);
  }, []);

  const initializeDedupedCharactersByCategory = () => {
    const renderedIds: RenderedCharacterIdsMap = {};
    const newDedupedCategoryCharacters: CharactersByCategory = {};

    for (const c of [...featured, ...trendingCharacters]) {
      renderedIds[c.external_id] = true;
    }

    // TODO Kishan: potentially account for a character that has multiple Curated Categories
    for (const category in curatedCategoryCharacters) {
      const charsToRender = curatedCategoryCharacters[category];

      newDedupedCategoryCharacters[category] = charsToRender;
      for (const c of charsToRender) {
        renderedIds[c.external_id] = true;
      }
    }

    for (const category of categories) {
      const charsToRender =
        categoryCharacters &&
        category.value &&
        categoryCharacters[category.value]
          ? categoryCharacters[category.value]
              .filter((c) => !renderedIds[c.external_id])
              .sort((c1, c2) => compareCharactersByReceivedMessages(c1, c2))
          : [];

      newDedupedCategoryCharacters[category.value] =
        newDedupedCategoryCharacters[category.value]
          ? [...newDedupedCategoryCharacters[category.value], ...charsToRender]
          : charsToRender;

      for (const c of charsToRender) {
        renderedIds[c.external_id] = true;
      }
    }

    setDedupedCategoryCharacters(newDedupedCategoryCharacters);
    setLoading(false);
  };

  const showMoreCategories = () => {
    if (displayedCategories.length < categories.length) {
      const startIdx = CATEGORIES_PER_PAGE * pageIdx;
      const newDisplayedCategories = [
        ...displayedCategories,
        ...categories.slice(startIdx, startIdx + CATEGORIES_PER_PAGE),
      ];

      // Timeout is needed to display infinite scroll loading indicator
      setTimeout(() => {
        setPageIdx(pageIdx + 1);
        setDisplayedCategories(newDisplayedCategories);
      }, 1);
    }
  };

  const selectCharacter = useCallback((character: Character | null) => {
    setSelectedCharacter(character);
  }, []);

  const renderDisplayedCategoriesByIndex = (start: number, end?: number) =>
    displayedCategories
      .slice(start, end)
      .map((category) => (
        <CategoryCarousel
          key={category.value}
          name={category.value}
          characters={
            dedupedCategoryCharacters && category.value
              ? dedupedCategoryCharacters[category.value]
              : []
          }
          selectCharacter={selectCharacter}
          slidesPerView={slidesPerView}
          user={user}
        />
      ));

  const carousels = loading ? null : (
    <InfiniteScroll
      dataLength={displayedCategories.length}
      next={showMoreCategories}
      hasMore={displayedCategories.length < categories.length}
      loader={<Spinner />}
      onScroll={() => {
        setSelectedCharacter(null);
      }}
    >
      <CategoryCarousel
        name="Recommended"
        characters={recommended}
        selectCharacter={selectCharacter}
        slidesPerView={slidesPerView}
        user={user}
      />

      {trendingCharacters?.length > 0 && (
        <CategoryCarousel
          name="Discover"
          characters={trendingCharacters}
          selectCharacter={selectCharacter}
          slidesPerView={slidesPerView}
          user={user}
        />
      )}

      <CategoryCarousel
        name="Featured"
        characters={featured}
        selectCharacter={selectCharacter}
        slidesPerView={slidesPerView}
        user={user}
      />

      {renderDisplayedCategoriesByIndex(0)}
    </InfiniteScroll>
  );

  return (
    <AppWrapper
      user={user}
      setLoginOpen={setLoginOpen}
      login={login}
      waitlist={waitlist}
      handleServerError={handleServerError}
      style={{ paddingRight: 0 }}
    >
      <div style={{ overflowX: 'hidden' }}>
        {loading ? (
          <Loading />
        ) : (
          <div
            className={isMobile ? 'pt-1' : 'pt-3'}
            style={{
              marginRight: isMobile ? -15 : 10, // Intentional slide overflow to indicate there are more items
              paddingLeft: isMobile ? 0 : 10,
            }}
          >
            {carousels}

            <CharacterPeek
              character={selectedCharacter}
              selectCharacter={selectCharacter}
              numInteractions={selectedCharacter?.participant__num_interactions}
            />
          </div>
        )}
      </div>
    </AppWrapper>
  );
};

export default DiscoverPage;
