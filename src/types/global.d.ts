type PostExtended = TPost & {
  featuredUsers: { image: string | null; name: string | null }[];
};
