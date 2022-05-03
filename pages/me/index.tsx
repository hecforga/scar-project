import { useEffect, useState } from 'react';
import { GetServerSideProps, NextPage } from 'next';
import { useSession, signOut, getSession } from 'next-auth/react';
import {
  Genre,
  GenresOnItems,
  Item,
  Neighborhood,
  Preference,
  Rating,
  User,
} from '@prisma/client';
import { Button, Col, Row } from 'antd';

import { getRatings } from '../api/rating';
import { getPreferences } from '../api/preference';
import { getNeighborhood } from '../api/neighborhood';

type ServerSideProps = {
  ratings: (Rating & {
    item: Item & {
      genres: string[];
    };
  })[];
  preferences: (Preference & {
    genre: Genre;
  })[];
  neighbours: (Neighborhood & {
    rightUser: User & {
      ratings: (Rating & {
        item: Item & {
          genres: string[];
        };
      })[];
    };
  })[];
};

type Props = ServerSideProps;

const MePage: NextPage<Props> = ({ ratings, preferences, neighbours }) => {
  const { data } = useSession();

  const [recommendedItems, setRecommendedItems] = useState<
    (Item & {
      rating: number;
    })[]
  >([]);

  useEffect(() => {
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
          !ratings
            .map((rating) => rating.itemId)
            .includes(neighbourRating.itemId)
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
    setRecommendedItems(
      [...itemsWithRating].sort((a, b) => b.rating - a.rating).slice(0, 5)
    );
  }, [ratings, neighbours]);

  return (
    <div>
      <Row>
        <Col span={12}>
          <pre>
            {JSON.stringify(
              {
                ...data,
                myPreferences: preferences,
              },
              null,
              2
            )}
          </pre>
        </Col>
        <Col span={12}>
          <pre>{JSON.stringify(recommendedItems, null, 2)}</pre>
        </Col>
      </Row>
      <Button type="primary" onClick={() => signOut()}>
        Cerrar sesión
      </Button>
    </div>
  );
};

const convertGenresToString = (
  ratings: (Rating & {
    item: Item & {
      genres: (GenresOnItems & {
        genre: Genre;
      })[];
    };
  })[]
) => {
  return ratings.map((rating) => ({
    ...rating,
    item: {
      id: rating.item.id,
      title: rating.item.title,
      genres: rating.item.genres.map((genre) => genre.genre.name),
    },
  }));
};

export const getServerSideProps: GetServerSideProps<ServerSideProps> = async ({
  req,
  res,
}) => {
  const session = await getSession({ req });
  let ratings: (Rating & {
    item: Item & {
      genres: string[];
    };
  })[] = [];
  let preferences: (Preference & {
    genre: Genre;
  })[] = [];
  let neighbours: (Neighborhood & {
    rightUser: User & {
      ratings: (Rating & {
        item: Item & {
          genres: string[];
        };
      })[];
    };
  })[] = [];

  if (session) {
    ratings = convertGenresToString(await getRatings(session.user.id));
    preferences = await getPreferences(session.user.id);
    neighbours = (await getNeighborhood(session.user.id)).map((neighbour) => ({
      ...neighbour,
      rightUser: {
        ...neighbour.rightUser,
        ratings: convertGenresToString(neighbour.rightUser.ratings),
      },
    }));
  } else {
    res.statusCode = 403;
  }

  return {
    props: { ratings, preferences, neighbours },
  };
};

export default MePage;
