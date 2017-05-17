export function listingsSort(state = 'hot', action) {
    switch (action.type) {
        case 'LISTINGS_SORT':
            return action.sort;

        default:
            return state;
    }
}

export function listingsSortTop(state = 'day', action) {
    switch (action.type) {
        case 'LISTINGS_SORT_TOP':
            return action.sortTop;

        default:
            return state;
    }
}

export function listingsTarget(state = 'mine', action) {
    switch (action.type) {
        case 'LISTINGS_TARGET':
            return action.target;

        default:
            return state;
    }
}

export function listingsListType(state = 'r', action) {
    switch (action.type) {
        case 'LISTINGS_LIST_TYPE':
            return action.listType;

        default:
            return state;
    }
}

