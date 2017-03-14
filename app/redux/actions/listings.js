export function listingsSort(sort) {
    return {
        type: 'LISTINGS_SORT',
        sort
    };
}

export function listingsSortTop(sortTop) {
    return {
        type: 'LISTINGS_SORT_TOP',
        sortTop
    };
}

export function listingsTarget(target) {
    return {
        type: 'LISTINGS_TARGET',
        target
    };
}

export function listingsListType(listType) {
    return {
        type: 'LISTINGS_LIST_TYPE',
        listType
    };
}
