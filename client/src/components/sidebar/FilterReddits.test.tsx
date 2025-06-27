import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import FilterReddits from './FilterReddits';

// Mock dependencies
vi.mock('@/common', () => ({
  hotkeyStatus: vi.fn().mockReturnValue(true),
}));

vi.mock('@/redux/actions/subreddits', () => ({
  subredditsFilter: vi.fn((filter) => ({
    type: 'SUBREDDITS_FILTER',
    filter,
  })),
}));

describe('FilterReddits', () => {
  const createTestStore = () => {
    return configureStore({
      reducer: {
        subredditsFilter: (
          state = { filterText: '', active: false, activeIndex: 0 }
        ) => state,
      },
    });
  };

  it('renders the filter input', () => {
    const store = createTestStore();

    render(
      <Provider store={store}>
        <MemoryRouter>
          <FilterReddits />
        </MemoryRouter>
      </Provider>
    );

    const input = screen.getByPlaceholderText('Filter');
    expect(input).toBeInTheDocument();
    expect(input).toHaveValue('');
  });
});
