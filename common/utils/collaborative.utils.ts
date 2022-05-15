import { RecommendedItem } from '../model/item.model';
import { MyRating, MyRatingWithGenreAsString } from '../model/rating.model';
import { MyNeighborhood } from '../model/neighborhood.model';
import { Item } from '@prisma/client';

export const convertGenresToString = (ratings: MyRating[]) => {
  return ratings.map((rating) => ({
    ...rating,
    item: {
      id: rating.item.id,
      title: rating.item.title,
      genres: rating.item.genres.map((genre) => genre.genre.name),
    },
  }));
};

export const computeRecommendedItems = (
  ratings: MyRatingWithGenreAsString[],
  neighbours: MyNeighborhood[]
): RecommendedItem[] => {
  const neighboursRatings = neighbours
    .map((neighbour) =>
      neighbour.rightUser.ratings.map((rating) => ({
        ...rating,
        distance: neighbour.distance,
      }))
    )
    .reduce(
      (previousValue, currentValue) => [
        ...previousValue,
        ...currentValue.map((rating) => ({
          ...rating,
          rating: rating.rating * rating.distance,
        })),
      ],
      []
    )
    .filter(
      (neighbourRating) =>
        !ratings.map((rating) => rating.itemId).includes(neighbourRating.itemId)
    );
  const itemsWithRating: (Item & {
    genres: string[];
    rating: number;
  })[] = [];
  for (let neighbourRating of neighboursRatings) {
    const itemWithRating = itemsWithRating.find(
      (item) => item.id === neighbourRating.itemId
    ) || { ...neighbourRating.item, rating: 0 };
    if (itemWithRating.rating === 0) {
      itemsWithRating.push(itemWithRating);
    }
    itemWithRating.rating += neighbourRating.rating;
  }
  return [...itemsWithRating].sort((a, b) => b.rating - a.rating).slice(0, 6);
};
