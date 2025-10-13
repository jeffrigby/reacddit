/**
 * Legacy selector exports for backward compatibility
 * These now use the new listings slice selectors
 */
export {
  selectListingData as listingData,
  selectListingStatus as listingStatus,
  selectUiState as listingState,
} from '../slices/listingsSlice';
