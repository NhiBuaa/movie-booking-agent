import React from 'react';
import { HeroBanner } from './HeroBanner';
import { SearchBar } from './SearchBar';
import { QuickBookingBar } from './QuickBookingBar';
import { AgentStrip } from './AgentStrip';
import { MovieGallery } from './MovieGallery';
import { FeaturedCinemas } from './FeaturedCinemas';
import { ExclusiveVouchers } from './ExclusiveVouchers';
import { CommunityReviews } from './CommunityReviews';
import {
  MOVIES_FIXTURE,
  CINEMAS_FIXTURE,
  VOUCHERS_FIXTURE,
  REVIEWS_FIXTURE,
} from '../model/discovery-fixtures';
import styles from '../styles/discovery-view.module.css';

export const DiscoveryView: React.FC = () => {
  const heroMovie = MOVIES_FIXTURE.find((m) => m.isHero) || MOVIES_FIXTURE[0];

  return (
    <main className={styles.discoveryView} id="main-content">
      {/* 1. Hero Spotlight */}
      <HeroBanner movie={heroMovie} />

      {/* 2. Quick Search */}
      <SearchBar />

      {/* 3. Quick Booking Band */}
      <QuickBookingBar />

      {/* 4. AI Assistant Strip */}
      <AgentStrip />

      {/* 5. Movie Browser Gallery */}
      <MovieGallery movies={MOVIES_FIXTURE} />

      {/* 6. Featured Cinemas */}
      <FeaturedCinemas cinemas={CINEMAS_FIXTURE} />

      {/* 7. Exclusive Vouchers */}
      <ExclusiveVouchers vouchers={VOUCHERS_FIXTURE} />

      {/* 8. Community Reviews */}
      <CommunityReviews reviews={REVIEWS_FIXTURE} />
    </main>
  );
};
